<template>
  <div class="login-container">
    <el-card class="login-box" shadow="hover">
      <div class="login-header">
        <h1 class="title">长安行</h1>
        <p class="subtitle">管理后台</p>
      </div>
      
      <el-form ref="loginFormRef" :model="form" :rules="rules" @submit.prevent="handle_login">
        <el-form-item prop="zhanghao">
          <el-input 
            v-model="form.zhanghao" 
            placeholder="请输入管理员账号" 
            size="large"
            prefix-icon="User"
          />
        </el-form-item>
        
        <el-form-item prop="mima">
          <el-input 
            v-model="form.mima" 
            type="password" 
            placeholder="请输入密码" 
            size="large"
            show-password
            prefix-icon="Lock"
            @keyup.enter="handle_login"
          />
        </el-form-item>
        
        <el-form-item>
          <el-button 
            type="primary" 
            size="large" 
            :loading="loading" 
            native-type="submit" 
            style="width: 100%"
          >
            {{ loading ? '登录中...' : '登 录' }}
          </el-button>
        </el-form-item>
      </el-form>
      
      <div class="demo-tip">
        <p>测试账号：admin</p>
        <p>测试密码：123456</p>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const form = reactive({
  zhanghao: '',
  mima: ''
})

const rules = reactive<FormRules>({
  zhanghao: [
    { required: true, message: '请输入管理员账号', trigger: 'blur' }
  ],
  mima: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' }
  ]
})

async function handle_login() {
  await loginFormRef.value?.validate(async (valid) => {
    if (!valid) return
    
    loading.value = true
    try {
      const result = await authStore.login(form.zhanghao, form.mima)
      
      if (result.success) {
        ElMessage.success('登录成功！')
        router.push('/dashboard')
      } else {
        ElMessage.error(result.message || '登录失败')
      }
    } catch (error) {
      ElMessage.error('登录异常，请重试')
    } finally {
      loading.value = false
    }
  })
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-box {
  width: 420px;
  border-radius: 12px;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-header .title {
  margin: 0 0 5px;
  font-size: 28px;
  color: #303133;
  font-weight: 600;
}

.login-header .subtitle {
  margin: 0;
  color: #909399;
  font-size: 15px;
}

.demo-tip {
  margin-top: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
  text-align: center;
  font-size: 13px;
  color: #909399;
}

.demo-tip p {
  margin: 5px 0;
}
</style>
