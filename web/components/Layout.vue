<template>
  <div class="layout">
    <el-container>
      <el-aside width="240px" class="sidebar">
        <div class="sidebar-header">
          <h2>长安行</h2>
          <p class="subtitle">后台管理系统</p>
        </div>
        
        <el-menu
          :default-active="route.path"
          router
          background-color="#1a1a2e"
          text-color="rgba(255,255,255,0.7)"
          active-text-color="white"
          class="nav-menu"
        >
          <el-menu-item v-for="item in menu_items" :key="item.path" :index="item.path">
            <span>{{ item.name }}</span>
          </el-menu-item>
        </el-menu>
        
        <div class="sidebar-footer">
          <div class="user-info">
            <span class="username">{{ authStore.user?.sj_xingming || '管理员' }}</span>
            <span class="role">{{ authStore.user?.sj_zhanghao || 'admin' }}</span>
          </div>
          <el-button type="danger" @click="handle_logout" size="small" style="width: 100%">
            退出登录
          </el-button>
        </div>
      </el-aside>
      
      <el-container class="main-container">
        <el-header class="page-header">
          <div class="header-left">
            <h1>{{ current_page_name }}</h1>
          </div>
          <div class="header-right">
            <el-dropdown @command="handle_command">
              <span class="user-dropdown">
                <el-icon><User /></el-icon>
                欢迎，{{ authStore.user?.sj_xingming || '管理员' }}
                <el-icon class="el-icon--right"><arrow-down /></el-icon>
              </span>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="logout">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </el-header>
        
        <el-main class="page-content">
          <slot></slot>
        </el-main>
        
        <el-footer class="page-footer">
          <div class="copyright">
            <span>© 2026 长安行 - 跑滴滴的大姚</span>
            <a href="https://github.com/dayao1877-oss/changanxing" target="_blank" rel="noopener noreferrer">
              <el-icon><Link /></el-icon> GitHub
            </a>
          </div>
        </el-footer>
      </el-container>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, ArrowDown, Link } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const menu_items = [
  { name: '数据概览', path: '/dashboard' },
  { name: '用户管理', path: '/users' },
  { name: '订单管理', path: '/orders' },
  { name: '车辆管理', path: '/vehicles' },
  { name: '打卡记录', path: '/daka' },
  { name: '定位记录', path: '/dingwei' },
  { name: '拒绝记录', path: '/jujue' },
  { name: '异常上报', path: '/yichang' },
  { name: '紧急事件', path: '/jinji' },
  { name: '财务记录', path: '/caiwu' },
  { name: '财务报表', path: '/baobiao' },
  { name: '计费规则', path: '/jifei' },
  { name: '司机绩效', path: '/siji-jixiao' },
  { name: '智能调度', path: '/zhineng' },
  { name: '数据导出', path: '/daochu' },
  { name: '数据备份', path: '/beifen' },
  { name: '消息推送', path: '/tuisong' },
  { name: '系统配置', path: '/xitong' },
  { name: '系统初始化', path: '/chushihua' },
  { name: '操作日志', path: '/caozuo' }
]

const current_page_name = computed(() => {
  const current = menu_items.find(item => item.path === route.path)
  return current?.name || '管理后台'
})

function check_auth() {
  authStore.init()
  if (!authStore.isLoggedIn) {
    router.push('/login')
  }
}

async function handle_logout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    authStore.logout()
    ElMessage.success('已退出登录')
    router.push('/login')
  } catch {}
}

function handle_command(command: string) {
  if (command === 'logout') {
    handle_logout()
  }
}

onMounted(() => {
  check_auth()
})
</script>

<style scoped>
.layout {
  min-height: 100vh;
}

.sidebar {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  height: 100vh;
  position: fixed;
  left: 0;
  top: 0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 30px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.sidebar-header h2 {
  margin: 0 0 5px;
  font-size: 22px;
  color: white;
}

.sidebar-header .subtitle {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
}

.nav-menu {
  border: none;
  flex: 1;
  overflow-y: auto;
}

.nav-menu .el-menu-item:hover {
  background: rgba(255, 255, 255, 0.1);
}

.nav-menu .el-menu-item.is-active {
  background: rgba(102, 126, 234, 0.3);
  color: white;
  border-left: 3px solid #667eea;
}

.sidebar-footer {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 20px;
}

.user-info {
  margin-bottom: 15px;
}

.username {
  display: block;
  font-weight: 500;
  font-size: 15px;
  color: white;
}

.role {
  display: block;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.6);
}

.main-container {
  margin-left: 240px;
  min-height: 100vh;
}

.page-header {
  background: white;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.header-left h1 {
  margin: 0;
  font-size: 22px;
  color: #303133;
}

.user-dropdown {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #606266;
  cursor: pointer;
}

.page-content {
  background: #f5f7fa;
  padding: 30px;
}

.page-footer {
  background: white;
  border-top: 1px solid #e4e7ed;
  padding: 15px 30px;
  height: auto;
}

.copyright {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  font-size: 13px;
  color: #909399;
}

.copyright a {
  color: #409eff;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 4px;
}

.copyright a:hover {
  color: #66b1ff;
}
</style>
