<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Essay } from '../../types'
import { useRouter } from '#imports'
import { useUserSession } from '#imports'

const router = useRouter()
const { loggedIn: isLoggedIn } = useUserSession()

const { data: essays, pending, error, refresh } = await useFetch<Essay[]>('/api/essays', {
  lazy: true
})

const searchQuery = ref('')
const sortOption = ref<'newest' | 'oldest' | 'highest-rating'>('newest')

const formatDate = (dateString?: string | number | Date) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', month: 'long', day: 'numeric', 
    hour: '2-digit', minute: '2-digit'
  })
}

const getAvatarUrl = (githubId: string | number) => {
  return `https://avatars.githubusercontent.com/u/${githubId}?v=4&s=40`;
}

const getContentPreview = (content?: string | null) => {
  if (!content) return '';
  
  // Split by sentence endings and get first two sentences
  const sentences = content.split(/(?<=[.!?])\s+/);
  const preview = sentences.slice(0, 2).join(' ');
  
  // If preview is too long, truncate it
  if (preview.length > 180) {
    return preview.substring(0, 180).trim() + '...';
  }
  
  return preview;
}

const filteredAndSortedEssays = computed(() => {
  if (!essays.value) return []
  
  let filtered = essays.value
  if (searchQuery.value.trim()) {
    const lowerSearchQuery = searchQuery.value.toLowerCase()
    filtered = filtered.filter(essay => {
      const titleMatch = essay.title.toLowerCase().includes(lowerSearchQuery)
      const contentMatch = essay.content && essay.content.toLowerCase().includes(lowerSearchQuery)
      return titleMatch || contentMatch
    })
  }

  return filtered.sort((a, b) => {
    switch (sortOption.value) {
      case 'newest':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      case 'highest-rating':
        return (b.averageRating || 0) - (a.averageRating || 0)
      default:
        return 0
    }
  })
})
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header with logo and introduction -->
    <div class="flex flex-col items-center text-center mb-6 mt-6">
      <img src="/icon.png" alt="WWPGW Logo" class="w-32 h-32 mb-4" />
      <h1 class="text-3xl font-bold">
        What Would Paul Graham Write?
      </h1>
      <p class="text-lg text-gray-600 dark:text-gray-400 mt-2 mb-2">
        An experiment in synthetic personality extension.
      </p>
      <div class="flex flex-col md:flex-row gap-3 mb-0">
        <NuxtLink to="/about" class="text-blue-600 dark:text-blue-400 hover:underline">
          Learn more about this project
        </NuxtLink>
        <NuxtLink 
          href="https://github.com/georgestrakhov/wwpgw" 
          target="_blank" 
          class="text-blue-600 dark:text-blue-400 hover:underline"
        >
          View source code on GitHub
        </NuxtLink>
      </div>
    </div>

    <!-- Generate button - large and centered -->
    <div class="flex justify-center mb-2">
      <UButton 
        v-if="isLoggedIn" 
        to="/generate" 
        size="xl" 
        icon="i-lucide-sparkles" 
        color="primary"
      >
        Generate A New PG Essay
      </UButton>
      <UButton 
        v-else 
        to="/api/auth/github" 
        size="xl" 
        icon="i-simple-icons-github" 
        color="primary"
        external
      >
        Login to Generate PG Essays
      </UButton>
    </div>

    <div class="flex flex-col md:flex-row gap-4 mb-4 mt-4">
      <UInput
        v-model="searchQuery"
        icon="i-lucide-search"
        size="lg"
        placeholder="Search previously generated essays..."
        class="w-full md:flex-1"
      />
      <USelect
        v-model="sortOption"
        :items="[
          { label: 'Newest First', value: 'newest', icon: 'i-lucide-arrow-down-a-z' },
          { label: 'Oldest First', value: 'oldest', icon: 'i-lucide-arrow-up-a-z' },
          { label: 'Highest Rated', value: 'highest-rating', icon: 'i-lucide-star' }
        ]"
        size="lg"
        class="w-full md:w-48"
        color="primary"
        variant="soft"
        placeholder="Sort by..."
        arrow
      />
    </div>

    <div v-if="pending" class="flex justify-center items-center py-10">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-4xl" />
    </div>
    <div v-else-if="error" class="p-4 bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 rounded-md text-red-700 dark:text-red-300">
      <p class="font-semibold">Error loading essays:</p>
      <p>{{ error.message || 'Could not fetch the list of essays.' }}</p>
      <UButton @click="() => refresh()" color="primary" variant="outline" class="mt-2">Try again</UButton>
    </div>
    <div v-else-if="filteredAndSortedEssays && filteredAndSortedEssays.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <UCard v-for="essay in filteredAndSortedEssays" :key="essay.id" class="hover:shadow-lg transition-shadow flex flex-col hover:cursor-pointer" @click="() => router.push(`/essays/${essay.slug}`)">
        <template #header>
          <h3 class="text-xl font-semibold">{{ essay.title }}</h3>
          <div class="text-xs text-gray-500 dark:text-gray-400 mb-2 space-y-1 mt-3">
            <div v-if="essay.author && essay.author.githubHandle" class="flex items-center space-x-1.5">
              <img :src="getAvatarUrl(essay.author.githubId)" :alt="essay.author.githubHandle" class="w-4 h-4 rounded-full">
              <span>Prompted by {{ essay.author.githubHandle }}</span>
            </div>
            <div>
              <span>{{ formatDate(essay.createdAt) }}</span>
            </div>
          </div>
        </template>
        
        <div>
          <p class="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">
            {{ getContentPreview(essay.content) }}
          </p>
        </div>

        <div class="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-auto pt-2 ">
          <UIcon name="i-lucide-star" class="w-3.5 h-3.5 text-yellow-400 mr-1" /> 
          <span>
            {{ essay.averageRating ? essay.averageRating.toFixed(1) : 'N/A' }} 
            ({{ essay.totalRatings }} {{ essay.totalRatings === 1 ? 'rating' : 'ratings' }})
          </span>
        </div>
      </UCard>
    </div>
    <div v-else-if="searchQuery.trim() && (!filteredAndSortedEssays || filteredAndSortedEssays.length === 0)" class="text-center py-10">
      <p class="text-xl text-gray-500 dark:text-gray-400">No essays found matching your search.</p>
      <p class="mt-2 text-gray-400 dark:text-gray-500">Try a different keyword or clear the search.</p>
    </div>
    <div v-else class="text-center py-10">
      <p class="text-xl text-gray-500 dark:text-gray-400">No essays have been generated yet.</p>
      <p class="mt-2 text-gray-400 dark:text-gray-500">Be the first to create one!</p>
      <UButton to="/generate" icon="i-lucide-sparkles" class="mt-4">Generate New Essay</UButton>
    </div>
  </div>
</template>
