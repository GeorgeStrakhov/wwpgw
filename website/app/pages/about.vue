<template>
  <div class="container max-w-3xl mx-auto px-4 py-12">
    <h1 class="text-3xl font-bold mb-6">What is WWPGW?</h1>
    
    <section class="mb-8">
      <p class="mb-4">WWPGW (What Would Paul Graham Write?) is an experiment in synthetic personality extension.</p>
      <p class="mb-4">The research question is simple: <strong>How close are we to being able to extend a human personality and patterns of thought in a meaningful way?</strong></p>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Why Paul Graham?</h2>
      <p class="mb-4">Instead of using an average person with low signal-to-noise ratio sources like emails, this experiment works with a best-case scenario:</p>
      <ul class="list-disc ml-6 mb-4">
        <li>Someone who has been thinking and documenting their thought process for an extended period</li>
        <li>Someone with a developed and distinct thinking and writing style</li>
        <li>Someone who writes many short-form pieces rather than few long books</li>
        <li>Someone moderately famous online - well represented in LLM training data</li>
        <li>Someone still alive - who could potentially assess the quality of their extension</li>
        <li>Someone with an existing community - for independent evaluation</li>
      </ul>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">How It Works</h2>
      <p class="mb-4">The system:</p>
      <ol class="list-decimal ml-6 mb-4">
        <li>Uses all of <a href="https://paulgraham.com/articles.html" target="_blank" class="text-blue-600 dark:text-blue-400 hover:underline">Paul Graham's essays</a> as reference material</li>
        <li>Does RAG search of the reference material to provide the generator with the most relevant information in addition to the full corpus</li>
        <li>Employs a modern LLM with large context window to generate new essays in his style</li>
        <li>Allows users to generate essays by providing a title</li>
        <li>Collects ratings and comments on the generated essays</li>
      </ol>
    </section>

    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Research Purpose</h2>
      <p class="mb-4">This is for research and experimentation only. No offense or copyright violation is intended, and there is no commercial use.</p>
      <p>The results are always available for analysis, and the project will be open-sourced to allow others to experiment with different writers or their own writing.</p>
    </section>
    
    <section class="mb-8">
      <h2 class="text-2xl font-semibold mb-4">Data Access</h2>
      <p class="mb-4">All generated essay data is freely available for research and analysis.</p>
      <div class="flex flex-col sm:flex-row gap-3">
        <button
          @click="downloadData"
          class="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded flex items-center"
        >
          <span>Download Generated Essay Data (CSV)</span>
        </button>
        <a 
          href="https://github.com/georgestrakhov/wwpgw" 
          target="_blank"
          class="bg-gray-800 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded flex items-center"
        >
          <span>View Source Code on GitHub</span>
        </a>
      </div>
    </section>

    <div class="text-sm text-gray-600 mt-12">
      <p>Note: Should Mr. Graham himself find this amusing, or dare we say, even useful for drafting future essays - it would be a beautiful thing.</p>
    </div>
  </div>
</template>

<script setup>
useHead({
  title: 'About - WWPGW',
  meta: [
    { name: 'description', content: 'What Would Paul Graham Write? An experiment in personality extension using AI.' }
  ]
})

const downloadData = async () => {
  try {
    const response = await fetch('/api/essays/download')
    
    if (!response.ok) {
      throw new Error('Failed to download data')
    }
    
    // Get the response as a blob
    const blob = await response.blob()
    
    // Create a URL for the blob
    const url = window.URL.createObjectURL(blob)
    
    // Create a temporary anchor element to trigger download
    const a = document.createElement('a')
    a.href = url
    
    // Add datetime to filename
    const now = new Date()
    const dateStr = now.toISOString().replace(/[:.]/g, '-').slice(0, 19)
    a.download = `wwpgw-essays-data-${dateStr}.csv`
    document.body.appendChild(a)
    a.click()
    
    // Clean up
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
  } catch (error) {
    console.error('Error downloading data:', error)
    alert('Failed to download data. Please try again later.')
  }
}
</script>
