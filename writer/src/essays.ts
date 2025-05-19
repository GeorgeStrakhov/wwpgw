import { promises as fs } from 'fs';
import path from 'path';

/**
 * Reads all essay files from the sources directory and concatenates them
 * @returns A string containing all essays concatenated together
 */
export async function getAllEssaysContent(): Promise<string> {
  try {
    const sourcesDir = path.resolve(process.cwd(), '../sources');
    const files = await fs.readdir(sourcesDir);
    
    const essayFiles = files.filter(file => file.endsWith('.md'));
    
    let allContent = '';
    
    for (const file of essayFiles) {
      const filePath = path.join(sourcesDir, file);
      const content = await fs.readFile(filePath, 'utf-8');
      
      // Add a separator between essays with the title (derived from filename)
      const title = file.replace('.md', '').replace(/-/g, ' ');
      allContent += `\n\n--- Essay: ${title} ---\n\n${content}`;
    }
    
    return allContent;
  } catch (error) {
    console.error('Error reading essay files:', error);
    throw new Error(`Failed to read essay files: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}