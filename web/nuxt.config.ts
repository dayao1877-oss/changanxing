export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-01',

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    amapKey: process.env.AMAP_KEY || '1f94bda96c69813dbd213d3cb245206f',
    jwtSecret: process.env.JWT_SECRET || 'sj-jwt-secret-key-for-development-only',
    public: {}
  },

  modules: [
    '@element-plus/nuxt',
    '@pinia/nuxt'
  ],

  nitro: {
    experimental: {
      openAPI: true
    }
  }
})
