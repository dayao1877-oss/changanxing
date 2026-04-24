export default defineEventHandler(() => {
  return {
    sj_status: 'ok',
    sj_message: '长安行API服务正常运行',
    sj_timestamp: new Date().toISOString()
  }
})
