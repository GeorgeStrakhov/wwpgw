#!/usr/bin/env python3
"""
LLM-powered scraper for Paul Graham's essays
Using Groq to convert HTML content to Markdown
"""

import os
import re
import time
import json
import sys
import signal
import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin
from dotenv import load_dotenv
from groq import Groq
import time


# Load environment variables
load_dotenv()

# Global variables for tracking progress
PROGRESS_FILE = "scraper_progress.json"
current_article_index = 0
article_links = []
processed_count = 0


def signal_handler(sig, frame):
    """Handle interrupt signals by saving progress"""
    print("\nInterrupted. Saving progress...")
    save_progress()
    sys.exit(0)


def save_progress():
    """Save current progress to a file"""
    global current_article_index, article_links
    
    progress = {
        "current_index": current_article_index,
        "processed_count": processed_count,
        "total_count": len(article_links)
    }
    
    with open(PROGRESS_FILE, 'w', encoding='utf-8') as f:
        json.dump(progress, f)
    
    print(f"Progress saved: {processed_count}/{len(article_links)} articles processed")


def load_progress():
    """Load progress from the progress file"""
    if os.path.exists(PROGRESS_FILE):
        with open(PROGRESS_FILE, 'r', encoding='utf-8') as f:
            try:
                return json.load(f)
            except json.JSONDecodeError:
                return None
    return None


def fetch_page(url, retries=3):
    """Fetch a page and return its content with retries"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    
    for attempt in range(retries):
        try:
            response = requests.get(url, headers=headers, timeout=10)
            response.raise_for_status()
            return response.text
        except (requests.RequestException, ConnectionError) as e:
            if attempt < retries - 1:
                sleep_time = 2 ** attempt  # Exponential backoff
                print(f"  Retry {attempt+1}/{retries} after {sleep_time}s due to: {e}")
                time.sleep(sleep_time)
            else:
                raise


def extract_article_links(html):
    """Extract all article links from the main page"""
    soup = BeautifulSoup(html, 'html.parser')
    links = []
    titles = []
    
    # Find all essay links - they are in a specific pattern:
    # <font size="2" face="verdana"><a href="essay.html">Title</a>
    for font_tag in soup.find_all('font', size="2", face="verdana"):
        if a_tag := font_tag.find('a'):
            href = a_tag.get('href')
            # Filter out external links and non-essay links
            if href and not href.startswith('http') and href.endswith('.html'):
                # Skip certain known non-essay pages
                if href not in ['index.html', 'articles.html', 'books.html', 'arc.html', 
                               'lisp.html', 'antispam.html', 'bio.html', 'faq.html', 'rss.html']:
                    links.append(href)
                    titles.append(a_tag.get_text())
    
    return list(zip(links, titles))


def extract_title_from_html(html):
    """Extract the title from the HTML content"""
    soup = BeautifulSoup(html, 'html.parser')
    
    # First try the title tag
    if soup.title:
        title = soup.title.string
        # Clean up common suffixes in title tags
        title = re.sub(r'\s*[|-]\s*Paul Graham$', '', title)
        return title.strip()
    
    # Try to find the title in large font size or header tags
    possible_title_elements = []
    
    # Check header tags
    for h_tag in soup.find_all(['h1', 'h2', 'h3']):
        text = h_tag.get_text().strip()
        if text and len(text) < 100:  # Avoid overly long text
            possible_title_elements.append(text)
    
    # Check font tags with larger size
    for font_tag in soup.find_all('font'):
        if font_tag.has_attr('size') and font_tag['size'] in ['4', '5', '6', '+1', '+2']:
            text = font_tag.get_text().strip()
            if text and len(text) < 100:
                possible_title_elements.append(text)
    
    # If we found any potential titles, return the first one
    if possible_title_elements:
        return possible_title_elements[0]
    
    # If all else fails, look for first substantial text
    for tag in soup.find_all(['b', 'strong', 'font']):
        text = tag.get_text().strip()
        if text and len(text) > 5 and len(text) < 100:
            return text
    
    # Default case - return None if no title found
    return None


def convert_html_to_markdown(html, title):
    """
    Use Groq's LLM to convert HTML content to well-formatted Markdown.
    This replaces the previous BeautifulSoup-based parsing approach.
    """
    # Initialize the Groq client
    client = Groq()
    
    try:
        # Create the completion request
        completion = client.chat.completions.create(
            model="meta-llama/llama-4-scout-17b-16e-instruct",
            messages=[
                {
                    "role": "system",
                    "content": "Extract the full text of the article, including footnotes. Return verbatim as well formatted markdown. No thank you notes, links or publish dates. Delete all the links inside the articles and don't turn footnotes into links either. Make sure to only use headings when appropriate and make sure they are short and stay on one line.Just well formatted text. Only return valid makdown and nothing else."
                },
                {
                    "role": "user",
                    "content": html
                }
            ],
            temperature=0.5,
            max_completion_tokens=8192,
            top_p=1,
            stream=False,
        )
        
        # Extract the markdown content from the response
        markdown_content = completion.choices[0].message.content
        
        # Check for empty content
        if not markdown_content or len(markdown_content.strip()) < 50:
            print(f"  Warning: LLM returned unusually short or empty content for {title}")
            return None
        
        return markdown_content
        
    except Exception as e:
        print(f"  Error using LLM API: {e}")
        # If API call fails, wait and retry once more
        time.sleep(10)
        try:
            completion = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=[
                    {
                        "role": "system",
                        "content": "Extract the full text of the article, including footnotes. Return verbatim as well formatted markdown. No thank you notes, links or publish dates."
                    },
                    {
                        "role": "user",
                        "content": html
                    }
                ],
                temperature=1,
                max_completion_tokens=8192,
                top_p=1,
                stream=False,
            )
            return completion.choices[0].message.content
        except Exception as retry_error:
            print(f"  Retry failed: {retry_error}")
            return None


def save_article(title, content, output_dir):
    """Save article to a markdown file"""
    # Create a filename from the title
    filename = re.sub(r'[^\w\s-]', '', title).strip().lower()
    filename = re.sub(r'[-\s]+', '-', filename)
    
    file_path = os.path.join(output_dir, f"{filename}.md")
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    return file_path


def get_processed_articles(output_dir):
    """Get a list of already processed article filenames"""
    processed = set()
    if os.path.exists(output_dir):
        for filename in os.listdir(output_dir):
            if filename.endswith('.md'):
                processed.add(filename)
    return processed


def test_single_article(article_url, title=None, output_dir=None):
    """Test scraping a single article"""
    print(f"Testing scraping of: {article_url}")
    
    try:
        article_html = fetch_page(article_url)
        
        # Extract title from HTML if not provided
        if not title:
            title = extract_title_from_html(article_html)
            if not title:
                article_name = article_url.split('/')[-1].split('.')[0]
                title = article_name.capitalize()
        
        print(f"Detected title: {title}")
        
        # Convert HTML to Markdown using LLM
        print("Converting HTML to Markdown using LLM...")
        content = convert_html_to_markdown(article_html, title)
        
        if not content:
            print(f"  Error: Could not extract content from {article_url}")
            return False
            
        if output_dir:
            file_path = save_article(title, content, output_dir)
            print(f"  Saved to {file_path}")
        else:
            # Print preview for inspection
            preview_lines = content.split('\n')[:20]
            preview = '\n'.join(preview_lines)
            print(f"\nPreview of extracted content:\n{'='*50}\n{preview}\n{'='*50}")
            
        return True
        
    except Exception as e:
        print(f"  Error processing {article_url}: {e}")
        return False


def process_articles(output_dir, restart=False):
    """Process articles and download them"""
    global current_article_index, article_links, processed_count
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Get already processed articles
    processed_files = get_processed_articles(output_dir)
    processed_count = len(processed_files)
    
    base_url = "https://www.paulgraham.com/articles.html"
    
    # Process the articles
    total = len(article_links)
    
    print(f"Processing articles from index {current_article_index}, {processed_count}/{total} already processed")
    
    for i in range(current_article_index, total):
        current_article_index = i
        article_path, title_from_link = article_links[i]
        
        # Generate the expected filename to check if already processed
        filename = re.sub(r'[^\w\s-]', '', title_from_link).strip().lower()
        filename = re.sub(r'[-\s]+', '-', filename)
        expected_file = f"{filename}.md"
        
        # Skip already processed articles
        if expected_file in processed_files:
            print(f"[{i+1}/{total}] Already processed: {title_from_link}")
            continue
            
        article_url = urljoin(base_url, article_path)
        print(f"[{i+1}/{total}] Downloading {title_from_link} ({article_url})")
        
        try:
            article_html = fetch_page(article_url)
            
            # Extract title from HTML for better accuracy
            title = extract_title_from_html(article_html)
            if not title:
                title = title_from_link
            
            print(f"  Converting to Markdown...")
            content = convert_html_to_markdown(article_html, title)
            
            if not content:
                print(f"  Warning: Could not extract content from {article_url}")
                continue
                
            file_path = save_article(title, content, output_dir)
            print(f"  Saved to {file_path}")
            processed_count += 1
            
            # Save progress periodically
            if i % 5 == 0:
                save_progress()
            
            # Be nice to the server and avoid rate limits for LLM
            time.sleep(5)
            
        except KeyboardInterrupt:
            print("\nInterrupted by user.")
            save_progress()
            sys.exit(0)
        except Exception as e:
            print(f"  Error processing {article_url}: {e}")
            # Save progress on error too
            save_progress()
    
    # Completed all articles
    if os.path.exists(PROGRESS_FILE):
        os.remove(PROGRESS_FILE)
        
    print("All essays successfully downloaded!")


def main():
    global current_article_index, article_links
    base_url = "https://www.paulgraham.com/articles.html"
    output_dir = "../sources"
    
    # Check for API key
    if not os.getenv("GROQ_API_KEY"):
        print("Error: GROQ_API_KEY not found in environment variables.")
        print("Please create a .env file with your GROQ_API_KEY or set it in your environment.")
        sys.exit(1)
    
    # Setup signal handler for graceful exit
    signal.signal(signal.SIGINT, signal_handler)
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Check for command line arguments
    if len(sys.argv) > 1 and sys.argv[1] == '--test':
        # Test with a specific article
        test_article_url = "https://www.paulgraham.com/avg.html"  # Default to Beating the Averages
        test_title = "Beating the Averages"
        
        if len(sys.argv) > 2:
            # Use the provided URL
            test_article_url = sys.argv[2]
            if not test_article_url.startswith('http'):
                test_article_url = f"https://www.paulgraham.com/{test_article_url}"
            
            # Extract title from filename
            article_name = test_article_url.split('/')[-1].split('.')[0]
            test_title = article_name.capitalize()
            
            print(f"Testing article: {test_article_url}")
        else:
            print(f"Testing default article: {test_article_url}")
        
        success = test_single_article(test_article_url, test_title, output_dir)
        if success:
            print("Test successful! Check the formatted output.")
        else:
            print("Test failed.")
        return
    
    if len(sys.argv) > 1 and sys.argv[1] == '--clean':
        # Clean the output directory
        if os.path.exists(output_dir):
            for filename in os.listdir(output_dir):
                if filename.endswith('.md'):
                    os.remove(os.path.join(output_dir, filename))
            print(f"Cleared all articles from {output_dir}")
        if os.path.exists(PROGRESS_FILE):
            os.remove(PROGRESS_FILE)
        return
    
    if len(sys.argv) > 1 and sys.argv[1] == '--help':
        print("LLM-powered Paul Graham Essay Scraper")
        print("------------------------------------")
        print("This script scrapes Paul Graham's essays and converts them to Markdown")
        print("using Groq's LLM.")
        print("\nUsage:")
        print("  python scraper.py             # Download all essays")
        print("  python scraper.py --test      # Test with 'Beating the Averages'")
        print("  python scraper.py --test URL  # Test with a specific essay URL")
        print("  python scraper.py --clean     # Clean output directory")
        print("\nRequires GROQ_API_KEY environment variable or .env file.")
        return
    
    # Check if we have a saved state
    progress = load_progress()
    restart = True
    
    if progress:
        # Resume from saved state
        print(f"Resuming from saved progress: {progress['processed_count']}/{progress['total_count']} articles processed")
        current_article_index = progress['current_index']
        
        # Fetch the article links again
        print(f"Fetching main page: {base_url}")
        try:
            main_page_html = fetch_page(base_url)
            article_links = extract_article_links(main_page_html)
            print(f"Found {len(article_links)} article links")
        except Exception as e:
            print(f"Error fetching main page: {e}")
            return
            
        restart = False
    else:
        # Start fresh
        print(f"Fetching main page: {base_url}")
        try:
            main_page_html = fetch_page(base_url)
            article_links = extract_article_links(main_page_html)
            print(f"Found {len(article_links)} article links")
        except Exception as e:
            print(f"Error fetching main page: {e}")
            return
    
    # Process the articles    
    process_articles(output_dir, restart)


if __name__ == "__main__":
    main()