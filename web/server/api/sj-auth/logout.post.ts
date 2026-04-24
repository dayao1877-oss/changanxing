export default defineEventHandler(async (event) => {
  try {
    return {
      sj_code: 200,
      sj_message: '登出成功',
      sj_data: null
    }
  } catch (sj_error) {
    console.error('sj-auth logout error:', sj_error)
    setResponseStatus(event, 500)
    return {
      sj_code: 500,
      sj_message: '服务器内部错误',
      sj_error: 'SJ_INTERNAL_ERROR'
    }
  }
})
