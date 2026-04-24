export default defineNuxtConfig({
  devtools: { enabled: true },
  compatibilityDate: '2024-04-01',

  runtimeConfig: {
    databaseUrl: process.env.DATABASE_URL,
    jwtSecret: process.env.JWT_SECRET || 'sj-jwt-secret-key-for-development-only',
    public: {
      amapKey: process.env.AMAP_KEY || ''
    }
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
