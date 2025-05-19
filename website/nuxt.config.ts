export default defineNuxtConfig({
  modules: [
    '@nuxt/ui',
    '@nuxtjs/mdc',
    '@nuxt/eslint',
    '@nuxthub/core',
    'nuxt-auth-utils',
    '@pinia/nuxt',
    '@pinia/colada-nuxt'
  ],
  devtools: {
    enabled: true
  },
  css: ['~/assets/main.css'],
  future: { compatibilityVersion: 4 },
  compatibilityDate: '2025-04-02',
  hub: {
    database: true
  },
  runtimeConfig: {
    // Keys within public are also exposed client-side
    public: {},
    // Keys here are only available server-side and must be populated by runtime environment variables
    generateEssayEndpoint: '', // Nuxt will look for NUXT_GENERATE_ESSAY_ENDPOINT env var
    generateEssayApiKey: ''    // Nuxt will look for NUXT_GENERATE_ESSAY_API_KEY env var
  },
  // Development config
  eslint: {
    config: {
      stylistic: {
        quotes: 'single',
        commaDangle: 'never'
      }
    }
  }
})
