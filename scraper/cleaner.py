#!/usr/bin/env python3

import os
import re
import glob

def clean_markdown_file(file_path):
    """
    Clean a markdown file by removing:
    1. HTML tags
    2. Markdown links
    While preserving:
    1. Footnote references [1], [2], etc.
    2. Footnote definitions in the Notes section
    """
    try:
        # Read the file
        with open(file_path, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # Save original content for comparison
        original_content = content
        
        # Replace HTML footnote references with plain text versions
        # e.g., [<font color=#dddddd>1</font>] -> [1]
        content = re.sub(r'\[\s*<font[^>]*>([0-9]+)</font>\s*\]', r'[\1]', content)
        
        # Remove all remaining HTML tags
        content = re.sub(r'<[^>]+>', '', content)
        
        # Remove markdown links but keep the text
        # This matches [text](url) and replaces with just "text"
        content = re.sub(r'\[([^\]]+)\]\([^\)]+\)', r'\1', content)
        
        # Fix double spaces that might be left after removals
        content = re.sub(r'  +', ' ', content)
        
        # Fix empty brackets that might be left
        content = re.sub(r'\[\s*\]', '', content)
        
        # Fix empty lines (more than 2 consecutive newlines)
        content = re.sub(r'\n{3,}', '\n\n', content)
        
        # Only write back if changes were made
        if content != original_content:
            with open(file_path, 'w', encoding='utf-8') as file:
                file.write(content)
            print(f"Cleaned: {file_path}")
        else:
            print(f"No changes needed for: {file_path}")
            
    except Exception as e:
        print(f"Error processing {file_path}: {e}")

def main():
    # Path to the sources directory
    sources_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'sources')
    
    # Find all markdown files
    md_files = glob.glob(os.path.join(sources_dir, '*.md'))
    
    print(f"Found {len(md_files)} markdown files to process")
    
    # Process each file
    for file_path in md_files:
        clean_markdown_file(file_path)
    
    print("Processing complete")

if __name__ == "__main__":
    main()
