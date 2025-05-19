<script setup lang="ts">
import type { DropdownMenuItem } from '#ui/types'

const { loggedIn, user, clear } = useUserSession()
const colorMode = useColorMode()

watch(loggedIn, () => {
  if (!loggedIn.value) {
    navigateTo('/')
  }
})

const isDarkMode = computed({
  get: () => colorMode.preference === 'dark',
  set: () =>
    (colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark')
})

const darkModeIcon = computed(() => 
  colorMode.preference === 'dark' ? 'i-lucide-moon' : 'i-lucide-sun'
)

const items = [
  [
    {
      label: 'Logout',
      icon: 'i-lucide-log-out',
      onSelect: clear
    }
  ]
] satisfies DropdownMenuItem[][]
</script>

<template>
  <UContainer class="min-h-screen flex flex-col my-4">
    <div class="mb-2 flex justify-between items-center gap-2">
      <UButton
        to="/"
        icon="i-lucide-home"
        color="neutral"
        variant="ghost"
        size="xs"
      />
      <div class="flex items-center gap-2">
        <template v-if="!loggedIn">
          <UButton
            to="/api/auth/github"
            icon="i-simple-icons-github"
            label="Login"
            color="neutral"
            size="xs"
            external
          />
        </template>
        <template v-else>
          <UButton
            to="/generate"
            icon="i-lucide-sparkles"
            label="Generate"
            :color="$route.path === '/generate' ? 'primary' : 'neutral'"
            variant="ghost"
            size="xs"
          />
          <UDropdownMenu
            v-if="user"
            :items="items"
          >
            <UButton
              color="neutral"
              variant="ghost"
              trailing-icon="i-lucide-chevron-down"
              size="xs"
            >
              <UAvatar
                :src="`https://github.com/${user.login}.png`"
                :alt="user.login"
                size="3xs"
              />
              {{ user.login }}
            </UButton>
          </UDropdownMenu>
        </template>
        <ClientOnly>
          <UButton
            square
            variant="ghost"
            color="neutral"
            :icon="darkModeIcon"
            @click="isDarkMode = !isDarkMode"
          />
        </ClientOnly>
      </div>
    </div>

    <UCard variant="subtle">
      <slot />
    </UCard>

    <footer class="text-center space-y-2 mt-6">
      <div class="text-sm text-neutral-500">
        <NuxtLink
          href="https://github.com/georgestrakhov/wwpgw"
          target="_blank"
          class="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Source Code on GitHub | 
        </NuxtLink>
        <span>
          {{ new Date().getFullYear() }} | George Strakhov
        </span>
      </div>
      <div class="space-x-4">
        <NuxtLink
          to="/privacy"
          class="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Privacy Policy
        </NuxtLink>
        <NuxtLink
          to="/terms"
          class="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Terms of Service
        </NuxtLink>

      </div>
    </footer>
  </UContainer>
</template>

<style lang="postcss">
body {
  @apply font-sans text-neutral-950 bg-neutral-50 dark:bg-neutral-950 dark:text-neutral-50;
}
</style>
