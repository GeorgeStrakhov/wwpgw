<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue'
import { useRoute, useRouter } from '#imports'
import type { Essay, EssayRatingStats, CommentWithUser, HierarchicalComment } from '../../../types'
import CommentItem from '~/components/CommentItem.vue'
import { parseMarkdown } from '@nuxtjs/mdc/runtime'

const { loggedIn: isLoggedIn, user: sessionUser } = useUserSession()

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const essay = ref<Essay | null>(null)
const ratingStats = ref<EssayRatingStats | null>(null)
const userRating = ref<number | null>(null)
const hoverRating = ref<number | null>(null)
const comments = ref<HierarchicalComment[]>([])
const newCommentText = ref('')
const parsedContent = ref<any>(null)

const isLoading = ref(true)
const isLoadingRatings = ref(true)
const isLoadingComments = ref(true)
const isPostingComment = ref(false)

const errorMsg = ref<string | null>(null)
const is404NotFound = ref(false)
const potentialTitleFromSlug = ref('')

const ratingErrorMsg = ref<string | null>(null)
const commentErrorMsg = ref<string | null>(null)
const pollingErrorMsg = ref<string | null>(null)

let pollInterval: NodeJS.Timeout | null = null

const unslugify = (slug: string): string => {
  if (!slug) return ''
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

const fetchEssayAndRelatedData = async () => {
  if (!slug.value) return
  isLoading.value = true
  is404NotFound.value = false
  isLoadingRatings.value = true
  isLoadingComments.value = true
  errorMsg.value = null
  ratingErrorMsg.value = null
  commentErrorMsg.value = null

  try {
    const essayData = await $fetch<Essay>(`/api/essays/${slug.value}`)
    essay.value = essayData

    if (essayData.status === 'completed' && essayData.content) {
      parsedContent.value = await parseMarkdown(essayData.content)
    }

    if (essayData.status === 'pending' || essayData.status === 'generating') {
      if (!pollInterval) startPolling()
    } else {
      stopPolling()
      if (essayData.id) {
          await fetchRatings(essayData.id)
          if (essayData.status === 'completed') {
            await fetchComments(essayData.id)
          }
      }
    }
  } catch (err: any) {
    console.error('Error fetching essay details:', err)
    if (err.statusCode === 404) {
      is404NotFound.value = true
      potentialTitleFromSlug.value = unslugify(slug.value)
      errorMsg.value = `The essay "${potentialTitleFromSlug.value}" has not been created yet.`
    } else {
      errorMsg.value = err.data?.statusMessage || err.message || 'Could not load the essay.'
    }
    essay.value = null
    ratingStats.value = null
    comments.value = []
    stopPolling()
  } finally {
    if (essay.value?.status === 'completed' || essay.value?.status === 'failed' || errorMsg.value) {
      isLoading.value = false
    }
  }
}

const fetchRatings = async (essayId: string) => {
  if (!essayId) return;
  isLoadingRatings.value = true;
  try {
    const stats = await $fetch<EssayRatingStats>(`/api/essays/${essayId}/ratings`)
    ratingStats.value = stats
    userRating.value = stats.currentUserRating
  } catch (err: any) {
    console.error('Error fetching ratings:', err)
    ratingErrorMsg.value = err.data?.statusMessage || 'Could not load ratings.'
    ratingStats.value = null
  } finally {
    isLoadingRatings.value = false
  }
}

const fetchComments = async (essayId: string) => {
  if (!essayId) return;
  isLoadingComments.value = true;
  try {
    const fetchedComments = await $fetch<HierarchicalComment[]>(`/api/essays/${essayId}/comments`)
    comments.value = fetchedComments
  } catch (err: any) {
    console.error('Error fetching comments:', err)
    commentErrorMsg.value = err.data?.statusMessage || 'Could not load comments.'
    comments.value = []
  } finally {
    isLoadingComments.value = false
  }
}

const startPolling = () => {
  if (pollInterval) return;
  isLoading.value = true; 
  pollingErrorMsg.value = null;
  pollInterval = setInterval(async () => {
    if (!slug.value) { stopPolling(); return; }
    try {
      const currentEssayData = await $fetch<Essay>(`/api/essays/${slug.value}`)
      pollingErrorMsg.value = null;

      essay.value = currentEssayData;

      if (currentEssayData.status === 'completed' || currentEssayData.status === 'failed') {
        stopPolling()
        isLoading.value = false
        if (currentEssayData.id) {
          await fetchRatings(currentEssayData.id)
          if (currentEssayData.status === 'completed') {
            await fetchComments(currentEssayData.id)
            if (currentEssayData.content) {
              try {
                parsedContent.value = await parseMarkdown(currentEssayData.content);
              } catch (e) {
                console.error("Error parsing markdown content:", e);
                parsedContent.value = null;
              }
            } else {
              parsedContent.value = null;
            }
          }
        }
      }
    } catch (err: any) { 
      console.error('Polling error:', err)
      pollingErrorMsg.value = err.data?.statusMessage || err.message || 'Error updating essay status. Retrying...';
    }
  }, 5000)
}

const stopPolling = () => {
  if (pollInterval) {
    clearInterval(pollInterval)
    pollInterval = null
  }
}

const handleRatingSubmit = async () => {
  if (userRating.value === null || !essay.value?.id) {
    return;
  }
  isLoadingRatings.value = true;
  ratingErrorMsg.value = null;
  try {
    await $fetch(`/api/essays/${essay.value.id}/ratings`, {
      method: 'POST',
      body: { rating: userRating.value }
    });
    await fetchRatings(essay.value.id);
    useToast().add({ title: 'Rating Submitted', description: 'Your rating has been saved.', color: 'primary' });
  } catch (err: any) {
    console.error('Error submitting rating:', err);
    const resolvedErrorMsg = err.data?.statusMessage || 'Failed to submit rating.';
    ratingErrorMsg.value = resolvedErrorMsg;
    useToast().add({ title: 'Rating Error', description: resolvedErrorMsg, color: 'error' });
  } finally {
    isLoadingRatings.value = false;
  }
};

const setRating = (rating: number) => {
  userRating.value = rating;
  handleRatingSubmit();
};

const setHoverRating = (rating: number | null) => {
  hoverRating.value = rating;
};

const handleCommentSubmit = async () => {
  if (!newCommentText.value.trim() || !essay.value?.id) return;
  isPostingComment.value = true;
  commentErrorMsg.value = null;
  try {
    await $fetch<CommentWithUser>(`/api/essays/${essay.value.id}/comments`, {
      method: 'POST',
      body: { content: newCommentText.value }
    });
    newCommentText.value = '';
    await fetchComments(essay.value.id);
    useToast().add({ title: 'Comment Posted', description: 'Your comment has been added.', color: 'primary' });
  } catch (err: any) {
    console.error('Error posting comment:', err);
    const message = err.data?.statusMessage || 'Failed to post comment.';
    commentErrorMsg.value = message;
    useToast().add({ title: 'Comment Error', description: message, color: 'error' });
  } finally {
    isPostingComment.value = false;
  }
};

const refreshCommentsAfterReply = () => {
    if (essay.value?.id) {
        fetchComments(essay.value.id);
    }
}

watch(() => essay.value?.id, (newId, oldId) => {
  if (newId && newId !== oldId && (essay.value?.status === 'completed' || essay.value?.status === 'failed')) {
    fetchRatings(newId);
    if (essay.value?.status === 'completed') {
        fetchComments(newId);
    }
  }
}, { immediate: false });

useHead(() => ({
  title: essay.value?.title || (isLoading.value ? 'Loading Essay...' : 'Essay')
}))

onMounted(async () => {
  await fetchEssayAndRelatedData()
})

onUnmounted(() => {
  stopPolling()
})

const formatDate = (dateString?: string | number | Date) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true // Optional: use 12-hour clock with AM/PM
  })
}

const handleStarHover = (event: MouseEvent) => {
  const containerRect = (event.currentTarget as HTMLElement).getBoundingClientRect();
  const containerWidth = containerRect.width;
  const relativeX = event.clientX - containerRect.left;
  const starIndex = Math.ceil(5 * (relativeX / containerWidth));
  setHoverRating(Math.max(1, Math.min(5, starIndex)));
};

const averageRatingDisplay = computed(() => {
    return ratingStats.value?.averageRating ? ratingStats.value.averageRating.toFixed(1) : 'N/A';
});

</script>

<template>
  <div class="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    <div v-if="isLoading && !essay && !is404NotFound" class="flex flex-col items-center justify-center min-h-[300px]">
      <UIcon name="i-lucide-loader-2" class="animate-spin text-6xl text-primary-500" />
      <p class="mt-4 text-xl text-gray-600 dark:text-gray-400">Loading essay...</p>
    </div>

    <div v-else-if="is404NotFound" class="p-6 bg-gray-50 dark:bg-gray-800 rounded-lg text-center">
      <UIcon name="i-lucide-file-question" class="text-4xl text-gray-500 dark:text-gray-400 mb-4 mx-auto" />
      <h2 class="text-xl font-medium text-gray-700 dark:text-gray-300 mb-3">Essay Not Found</h2>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        The essay titled "<span class="font-medium">{{ potentialTitleFromSlug }}</span>" has not been created yet.
      </p>
      <div v-if="isLoggedIn">
        <UButton 
          :to="`/generate?title=${encodeURIComponent(potentialTitleFromSlug)}`" 
          icon="i-lucide-plus-circle" 
          color="neutral"
          label="Create this Essay"
        />
      </div>
      <div v-else>
        <p class="text-gray-600 dark:text-gray-400 mb-3">Log in to generate this essay.</p>
        <UButton 
          to="/api/auth/github" 
          icon="i-simple-icons-github" 
          color="neutral"
          label="Login with GitHub to Generate"
          external 
        />
      </div>
       <UButton to="/" variant="link" color="neutral" class="mt-6">Go back to homepage</UButton>
    </div>

    <div v-else-if="errorMsg && !is404NotFound" class="p-6 bg-red-100 dark:bg-red-800 border border-red-400 dark:border-red-600 rounded-lg shadow-md">
      <div class="flex items-center mb-3">
        <UIcon name="i-lucide-x-circle" class="text-3xl text-red-500 dark:text-red-400 mr-3" />
        <h2 class="text-2xl font-semibold text-red-700 dark:text-red-300">Error Loading Essay</h2>
      </div>
      <p class="text-red-600 dark:text-red-400">{{ errorMsg }}</p>
      <UButton to="/" variant="link" class="mt-4">Go back to homepage</UButton>
    </div>

    <article v-else-if="essay" class="prose dark:prose-invert lg:prose-xl max-w-none">
      <header class="mb-8 border-b pb-6 border-gray-200 dark:border-gray-700">
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 mb-0 pb-0">
          {{ essay.title }}
        </h1>
        <div class="mt-2 text-base italic text-gray-600 dark:text-gray-400 border-l-4 border-gray-300 dark:border-gray-600 pl-3 py-1">
          This essay was <NuxtLink to="/about" class="hover:underline">automatically generated</NuxtLink> for research purposes, based on the <a href="https://www.paulgraham.com/articles.html" target="_blank" rel="noopener noreferrer" class="hover:underline">essays of Paul Graham</a>. 
        </div>
        <div class="mt-3 text-lg text-gray-500 dark:text-gray-400">
            <div v-if="essay.author && essay.author.githubHandle" class="flex items-center space-x-2">
              <img :src="`https://avatars.githubusercontent.com/u/${essay.author.githubId}?v=4&s=24`" :alt="`${essay.author.githubHandle}'s avatar`" class="w-6 h-6 rounded-full">
              <a :href="`https://github.com/${essay.author.githubHandle}`" target="_blank" rel="noopener noreferrer" class="hover:underline">
                Prompted by {{ essay.author.githubHandle }}
              </a>
            </div>
            <span>{{ formatDate(essay.createdAt) }}. Generated using {{ essay.modelUsed }}</span>
          </div>
          <div class="mt-3 text-lg text-gray-500 dark:text-gray-400">
            <div class="flex items-center mt-2 md:mt-0">
                <UIcon name="i-lucide-star" class="text-yellow-400 mr-1" /> 
                <span v-if="isLoadingRatings">Loading ratings...</span>
                <span v-else-if="ratingStats">
                    {{ averageRatingDisplay }} ({{ ratingStats.totalRatings }} ratings)
                </span>
                <span v-else-if="ratingErrorMsg" class="text-red-500 text-sm">Error loading ratings</span>
                <span v-else>No ratings yet.</span>
            </div>
        </div>
      </header>

      <div v-if="essay.status === 'pending' || essay.status === 'generating'" class="flex flex-col items-center justify-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg shadow">
        <UIcon name="i-lucide-hourglass" class="animate-spin text-5xl text-primary-500" />
        <p class="mt-4 text-xl font-medium text-gray-700 dark:text-gray-300">
          Essay generation is {{ essay.status === 'pending' ? 'queued' : 'in progress' }}...
        </p>
        <p v-if="pollingErrorMsg" class="mt-2 text-sm text-orange-500 dark:text-orange-400">{{ pollingErrorMsg }}</p>
        <p v-else class="mt-2 text-gray-500 dark:text-gray-400">This page will update automatically.</p>
      </div>
      
      <div v-else-if="essay.status === 'failed'" class="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md">
        <h3 class="text-xl font-semibold text-red-700 dark:text-red-200">Generation Failed</h3>
        <p class="mt-2 text-red-600 dark:text-red-300">
          We encountered an error while generating this essay.
        </p>
        <p v-if="essay.errorMessage" class="mt-1 text-sm text-red-500 dark:text-red-400">
          Error: {{ essay.errorMessage }}
        </p>
        <UButton to="/generate" variant="outline" class="mt-4">Try generating a new essay</UButton>
      </div>

      <div v-if="essay.status === 'completed' && essay.content" class="mt-8">
        <MDCRenderer v-if="parsedContent" :body="parsedContent.body" :data="parsedContent.data" class="essay-content" />
      </div>
      <div v-else-if="essay.status === 'completed' && !essay.content" class="text-center py-10 mt-8">
        <p class="text-xl text-gray-500 dark:text-gray-400">Essay marked as completed, but content is missing.</p>
      </div>

      <!-- Star Rating Section -->
      <h2 v-if="essay.status === 'completed' && isLoggedIn" class="mt-8 text-xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Rate this Essay</h2>
      <section v-if="essay.status === 'completed' && isLoggedIn" class="mt-8 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm bg-white dark:bg-gray-800/50">
        
        <div v-if="isLoggedIn">
          <div v-if="isLoadingRatings" class="text-center">
            <UIcon name="i-lucide-loader-2" class="animate-spin text-2xl" /> Loading your rating...
          </div>
          <div v-else class="flex flex-col items-center">
            <div 
              class="flex items-center space-x-1 mb-4 relative"
              @mouseleave="setHoverRating(null)"
              @mousemove="handleStarHover($event)"
            >
              <button 
                v-for="i in 5" 
                :key="i" 
                @click="setRating(i)" 
                class="text-3xl focus:outline-none"
                type="button"
              >
                <UIcon 
                  :name="(hoverRating !== null ? i <= hoverRating : i <= (userRating || 0)) ? 'i-heroicons-solid:star' : 'i-heroicons-outline:star'" 
                  class="text-yellow-400 cursor-pointer" 
                />
              </button>
            </div>
            <p v-if="ratingStats && ratingStats.currentUserRating !== null && !ratingErrorMsg" class="text-sm text-gray-600 dark:text-gray-400">
              Your current rating: {{ ratingStats.currentUserRating }} stars
            </p>
            <p v-if="ratingErrorMsg" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ ratingErrorMsg }}</p>
          </div>
        </div>
        <div v-else class="text-center">
          <p class="text-gray-600 dark:text-gray-400 mb-3">Log in to rate this essay</p>
          <UButton to="/api/auth/github" icon="i-simple-icons-github" label="Login with GitHub" external class="mt-2" />
        </div>
      </section>

      <section v-if="essay.status === 'completed'" class="mt-12 pt-4 border-t border-gray-200 dark:border-gray-700">
        <h2 class="text-2xl font-semibold mb-6 text-gray-800 dark:text-gray-200">Comments ({{ comments.length }})</h2>
        
        <form v-if="isLoggedIn" @submit.prevent="handleCommentSubmit" class="mb-8 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800/50 shadow-sm">
            <h3 class="text-lg font-medium mb-2 text-gray-700 dark:text-gray-300">Leave a Comment</h3>
            <UTextarea 
                v-model="newCommentText" 
                placeholder="Write your comment here..." 
                :rows="4" 
                :disabled="isPostingComment"
                class="w-full mb-4"
            />
            <UButton 
                type="submit" 
                label="Post Comment"
                icon="i-lucide-send"
                :loading="isPostingComment"
                :disabled="!newCommentText.trim()"
            />
            <p v-if="commentErrorMsg && isPostingComment" class="mt-2 text-sm text-red-600 dark:text-red-400">{{ commentErrorMsg }}</p>
        </form>
        <div v-else-if="!isLoggedIn && essay.status === 'completed'" class="mb-8 text-center p-4 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
            <p class="text-gray-600 dark:text-gray-400">You need to be logged in to leave a rating or post a comment.</p>
            <UButton to="/api/auth/github" icon="i-simple-icons-github" label="Login with GitHub" external class="mt-2 mb-4" />
        </div>

        <div v-if="isLoadingComments" class="flex items-center justify-center py-6">
            <UIcon name="i-lucide-loader-2" class="animate-spin text-3xl text-primary-500" />
            <p class="ml-2 text-gray-600 dark:text-gray-400">Loading comments...</p>
        </div>
        <div v-else-if="commentErrorMsg && !isPostingComment" class="p-4 bg-red-50 dark:bg-red-900 border border-red-300 dark:border-red-700 rounded-md text-red-600 dark:text-red-300">
            Error loading comments: {{ commentErrorMsg }}
        </div>
        <ul v-else-if="comments.length > 0" class="space-y-4">
            <CommentItem 
                v-for="comment in comments" 
                :key="comment.id" 
                :comment="comment" 
                :essay-id="essay.id" 
                @reply-submitted="refreshCommentsAfterReply" 
            />
        </ul>
        <div v-else class="text-center py-6">
            <p class="text-gray-500 dark:text-gray-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      </section>
    </article>
  </div>
</template>