<script setup lang="ts">
import { ref } from 'vue'
import type { HierarchicalComment } from '../../types' // Corrected path

const props = defineProps<{
  comment: HierarchicalComment
  essayId: string // Needed for posting replies
}>()

const emit = defineEmits(['replySubmitted'])

const { loggedIn: isLoggedIn } = useUserSession()
const toast = useToast()

const showReplyForm = ref(false)
const newReplyText = ref('')
const isPostingReply = ref(false)
const replyErrorMsg = ref<string | null>(null)

const formatDate = (dateString?: string | number | Date) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })
}

const toggleReplyForm = () => {
  showReplyForm.value = !showReplyForm.value
  newReplyText.value = '' // Clear text when toggling
  replyErrorMsg.value = null
}

const handleReplySubmit = async () => {
  if (!newReplyText.value.trim()) return;

  isPostingReply.value = true
  replyErrorMsg.value = null
  try {
    await $fetch(`/api/essays/${props.essayId}/comments`, {
      method: 'POST',
      body: {
        content: newReplyText.value,
        parentId: props.comment.id // This comment becomes the parent
      }
    })
    newReplyText.value = ''
    showReplyForm.value = false // Hide form after successful reply
    toast.add({ title: 'Reply Posted', description: 'Your reply has been added.', color: 'primary' })
    emit('replySubmitted') // Notify parent to refresh comments
  } catch (err: any) {
    console.error('Error posting reply:', err)
    const message = err.data?.statusMessage || 'Failed to post reply.'
    replyErrorMsg.value = message
    toast.add({ title: 'Reply Error', description: message, color: 'error' })
  } finally {
    isPostingReply.value = false
  }
}
</script>

<template>
  <div class="comment-item flex space-x-3 py-3">
    <UAvatar 
        :src="comment.user?.avatarUrl || undefined" 
        :alt="comment.user?.githubHandle || 'User'" 
        size="md"
    />
    <div class="flex-1">
        <div class="flex items-center justify-between">
            <span class="font-semibold text-gray-800 dark:text-gray-200">{{ comment.user?.githubHandle || 'Anonymous' }}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">{{ formatDate(comment.createdAt) }}</span>
        </div>
        <p class="mt-1 text-gray-700 dark:text-gray-300 whitespace-pre-line">{{ comment.content }}</p>
        
        <div class="mt-2 flex items-center space-x-3">
            <UButton 
                v-if="isLoggedIn" 
                size="xs" 
                variant="link" 
                icon="i-lucide-corner-down-left" 
                label="Reply"
                @click="toggleReplyForm"
                class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-0"
            />
            <!-- Add other actions like edit/delete later if needed -->
        </div>

        <!-- Reply Form -->
        <form 
            v-if="showReplyForm && isLoggedIn"
            @submit.prevent="handleReplySubmit" 
            class="mt-3 ml-6 pl-4 border-l border-gray-200 dark:border-gray-700"
        >
            <UTextarea 
                v-model="newReplyText" 
                placeholder="Write your reply..." 
                :rows="3" 
                :disabled="isPostingReply"
                class="w-full mb-2"
                autofocus
            />
            <div class="flex items-center justify-between">
                <UButton 
                    type="submit" 
                    label="Post Reply"
                    size="sm"
                    icon="i-lucide-send"
                    :loading="isPostingReply"
                    :disabled="!newReplyText.trim()"
                />
                <UButton 
                    label="Cancel"
                    size="sm"
                    variant="ghost"
                    color="neutral" 
                    @click="toggleReplyForm"
                    :disabled="isPostingReply"
                />
            </div>
            <p v-if="replyErrorMsg" class="mt-2 text-xs text-red-600 dark:text-red-400">{{ replyErrorMsg }}</p>
        </form>

        <!-- Recursive Replies -->
        <div v-if="comment.replies && comment.replies.length > 0" class="mt-3 ml-6 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-2">
            <CommentItem 
                v-for="reply in comment.replies" 
                :key="reply.id" 
                :comment="reply" 
                :essay-id="essayId"
                @reply-submitted="emit('replySubmitted')" />
        </div>
    </div>
  </div>
</template>

<style scoped>
/* Add any component-specific styles if needed */
.comment-item {
  /* Basic styling, can be enhanced */
}
</style> 