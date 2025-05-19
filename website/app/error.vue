<template>
  <NuxtLayout>
    <UCard>
      <template v-if="error.statusCode === 404">
        <h1 class="text-2xl font-semibold mb-2 w-full text-center">404 - Page Not Found</h1>
        <p class="text-neutral-600 dark:text-neutral-400 w-full text-center">
          Sorry, the page you're looking for doesn't exist.
        </p>
      </template>
      <template v-else>
        <h1 class="text-2xl font-semibold mb-2 w-full text-center">Oops! Something went wrong</h1>
        <p class="text-neutral-600 dark:text-neutral-400 w-full text-center">
          <strong>{{ error.message }}</strong>
        </p>
        <p class="text-neutral-600 dark:text-neutral-400 w-full text-center">
          We apologize for the inconvenience.
        </p>
      </template>
      <template #footer>
        <div class="flex justify-center my-4">
          <UButton
            color="neutral"
            @click="handleError"
            icon="i-lucide-home"
            class="cursor-pointer"
          >
            Return to Home
          </UButton>
        </div>
      </template>
    </UCard>
  </NuxtLayout>
</template>

<script setup>
const error = useError();

const handleError = () => {
  clearError({
    redirect: '/'
  });
};
</script>