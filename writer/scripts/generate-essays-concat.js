const fs = require('fs');
const path = require('path');

// Path to the sources directory
const sourcesDir = path.resolve(__dirname, '../../sources');
// Path to where we want to save the concatenated content
const outputFile = path.resolve(__dirname, '../src/essays-data.ts');

// Function to concatenate all essays
async function concatenateEssays() {
  try {
    // Read all files in the sources directory
    const files = fs.readdirSync(sourcesDir);
    
    // Filter for markdown files
    const essayFiles = files.filter(file => file.endsWith('.md'));
    
    let allContent = '';
    
    // Process each file
    for (const file of essayFiles) {
      const filePath = path.join(sourcesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      // Add a separator between essays with the title (derived from filename)
      const title = file.replace('.md', '').replace(/-/g, ' ');
      allContent += `\n\n--- Essay: ${title} ---\n\n${content}`;
    }
    
    // Create the TypeScript file with the concatenated content
    const tsContent = `// Auto-generated file containing all concatenated essays\nexport const ESSAYS_CONTENT = ${JSON.stringify(allContent)};\n`;
    
    // Write to the output file
    fs.writeFileSync(outputFile, tsContent);
    
    console.log(`Successfully concatenated ${essayFiles.length} essays to ${outputFile}`);
  } catch (error) {
    console.error('Error concatenating essays:', error);
    process.exit(1);
  }
}

// Run the function
concatenateEssays();