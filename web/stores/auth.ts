import { defineStore } from 'pinia'

export const useAuthStore = defineStore('sj-auth', {
  state: () => ({
    token: null as string | null,
    user: null as any,
    isLoggedIn: false
  }),

  actions: {
    init() {
      if (process.client) {
        const token = localStorage.getItem('sj_token')
        const user = localStorage.getItem('sj_guanliyuan')
        
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
          this.isLoggedIn = true
        }
      }
    },

    async login(zhanghao: string, mima: string) {
      try {
        const response = await $fetch('/api/sj-auth/login', {
          method: 'POST',
          body: { sj_zhanghao: zhanghao, sj_mima: mima }
        })

        if (response.sj_code === 200) {
          this.token = response.sj_data.sj_token
          this.user = response.sj_data.sj_guanliyuan
          this.isLoggedIn = true

          if (process.client) {
            localStorage.setItem('sj_token', this.token!)
            localStorage.setItem('sj_guanliyuan', JSON.stringify(this.user))
          }
          
          return { success: true }
        } else {
          return { success: false, message: response.sj_message }
        }
      } catch (error: any) {
        return { success: false, message: error.message || '登录失败' }
      }
    },

    logout() {
      this.token = null
      this.user = null
      this.isLoggedIn = false
      
      if (process.client) {
        localStorage.removeItem('sj_token')
        localStorage.removeItem('sj_guanliyuan')
      }
      
      $fetch('/api/sj-auth/logout', { method: 'POST' })
    }
  }
})
