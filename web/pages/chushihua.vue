<template>
  <Layout>
    <div class="chushihua-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>系统初始化</span>
          </div>
        </template>

        <el-alert
          title="警告：初始化操作将清空所有数据"
          type="warning"
          description="此操作会删除所有订单、司机、乘客、财务记录等数据，请谨慎操作！"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />

        <el-row :gutter="20">
          <!-- 全部初始化 -->
          <el-col :span="8">
            <el-card class="init-card" shadow="hover">
              <template #header>
                <div class="init-header">
                  <el-icon><Delete /></el-icon>
                  <span>全部初始化</span>
                </div>
              </template>
              <div class="init-content">
                <p>清空所有数据，包括：</p>
                <ul>
                  <li>所有订单数据</li>
                  <li>司机信息</li>
                  <li>乘客信息</li>
                  <li>财务记录</li>
                  <li>打卡记录</li>
                  <li>定位记录</li>
                  <li>拒绝记录</li>
                  <li>异常上报</li>
                  <li>紧急事件</li>
                  <li>操作日志</li>
                  <li>系统配置</li>
                </ul>
                <el-button type="danger" @click="confirm_init('all')" style="width: 100%;">
                  全部清空
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 订单数据初始化 -->
          <el-col :span="8">
            <el-card class="init-card" shadow="hover">
              <template #header>
                <div class="init-header">
                  <el-icon><DocumentDelete /></el-icon>
                  <span>订单数据初始化</span>
                </div>
              </template>
              <div class="init-content">
                <p>仅清空订单相关数据：</p>
                <ul>
                  <li>所有订单</li>
                  <li>订单操作日志</li>
                  <li>打卡记录</li>
                  <li>定位记录</li>
                </ul>
                <el-button type="warning" @click="confirm_init('orders')" style="width: 100%;">
                  清空订单数据
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 业务数据初始化 -->
          <el-col :span="8">
            <el-card class="init-card" shadow="hover">
              <template #header>
                <div class="init-header">
                  <el-icon><FolderDelete /></el-icon>
                  <span>业务数据初始化</span>
                </div>
              </template>
              <div class="init-content">
                <p>清空业务相关数据：</p>
                <ul>
                  <li>财务记录</li>
                  <li>拒绝记录</li>
                  <li>异常上报</li>
                  <li>紧急事件</li>
                  <li>对账单</li>
                </ul>
                <el-button type="warning" @click="confirm_init('business')" style="width: 100%;">
                  清空业务数据
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 数据备份提示 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>数据备份建议</span>
          </template>
          <el-steps :active="3" simple>
            <el-step title="导出数据" icon="Download">
              <template #description>
                使用"数据导出"功能备份重要数据
              </template>
            </el-step>
            <el-step title="确认清空" icon="Warning">
              <template #description>
                仔细确认要清空的数据范围
              </template>
            </el-step>
            <el-step title="执行初始化" icon="Delete">
              <template #description>
                执行初始化操作，数据将无法恢复
              </template>
            </el-step>
          </el-steps>
        </el-card>

        <!-- 当前数据概览 -->
        <el-card style="margin-top: 20px;">
          <template #header>
            <span>当前数据概览</span>
          </template>
          <el-descriptions :column="4" border>
            <el-descriptions-item label="订单数量">{{ data_stats.orders }} 条</el-descriptions-item>
            <el-descriptions-item label="司机数量">{{ data_stats.siji }} 条</el-descriptions-item>
            <el-descriptions-item label="乘客数量">{{ data_stats.chengke }} 条</el-descriptions-item>
            <el-descriptions-item label="财务记录">{{ data_stats.caiwu }} 条</el-descriptions-item>
            <el-descriptions-item label="打卡记录">{{ data_stats.daka }} 条</el-descriptions-item>
            <el-descriptions-item label="定位记录">{{ data_stats.dingwei }} 条</el-descriptions-item>
            <el-descriptions-item label="拒绝记录">{{ data_stats.jujue }} 条</el-descriptions-item>
            <el-descriptions-item label="异常上报">{{ data_stats.yichang }} 条</el-descriptions-item>
            <el-descriptions-item label="紧急事件">{{ data_stats.jinji }} 条</el-descriptions-item>
            <el-descriptions-item label="操作日志">{{ data_stats.logs }} 条</el-descriptions-item>
            <el-descriptions-item label="系统配置">{{ data_stats.config }} 项</el-descriptions-item>
            <el-descriptions-item label="总存储大小">{{ data_stats.size }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="primary" @click="refresh_stats" style="margin-top: 15px;">
            <el-icon><Refresh /></el-icon> 刷新统计
          </el-button>
        </el-card>
      </el-card>

      <!-- 确认初始化弹窗 -->
      <el-dialog
        title="确认初始化"
        v-model="confirm_dialog_visible"
        width="500px"
        :close-on-click-modal="false"
      >
        <el-alert
          :title="`确定要执行【${init_type_label}】操作吗？`"
          type="error"
          description="此操作不可撤销，所有数据将被永久删除！"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />
        <el-form :model="confirm_form" label-width="120px">
          <el-form-item label="验证密码">
            <el-input
              v-model="confirm_form.password"
              type="password"
              placeholder="请输入管理员密码"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认操作">
            <el-checkbox v-model="confirm_form.confirmed">
              我已了解此操作的风险，确认执行
            </el-checkbox>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="confirm_dialog_visible = false">取消</el-button>
          <el-button type="danger" @click="execute_init" :disabled="!can_execute">
            确认执行
          </el-button>
        </template>
      </el-dialog>

      <!-- 初始化进度弹窗 -->
      <el-dialog
        title="初始化进度"
        v-model="progress_dialog_visible"
        width="400px"
        :close-on-click-modal="false"
        :show-close="false"
      >
        <div class="progress-content">
          <el-progress
            :percentage="progress_percentage"
            :status="progress_status"
            :stroke-width="20"
            striped
            striped-flow
          />
          <p class="progress-text">{{ progress_text }}</p>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, DocumentDelete, FolderDelete, Refresh } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { log_chushihua_action } from '~/utils/caozuo-log'

const confirm_dialog_visible = ref(false)
const progress_dialog_visible = ref(false)
const init_type = ref<'all' | 'orders' | 'business'>('all')
const progress_percentage = ref(0)
const progress_status = ref('')
const progress_text = ref('准备中...')

const confirm_form = ref({
  password: '',
  confirmed: false
})

const data_stats = ref({
  orders: 0,
  siji: 0,
  chengke: 0,
  caiwu: 0,
  daka: 0,
  dingwei: 0,
  jujue: 0,
  yichang: 0,
  jinji: 0,
  logs: 0,
  config: 0,
  size: '0 KB'
})

const init_type_label = computed(() => {
  const labels: Record<string, string> = {
    'all': '全部初始化',
    'orders': '订单数据初始化',
    'business': '业务数据初始化'
  }
  return labels[init_type.value] || init_type.value
})

const can_execute = computed(() => {
  return confirm_form.value.password === 'admin123' && confirm_form.value.confirmed
})

// 刷新统计数据
function refresh_stats() {
  let orders = 0, siji = 0, chengke = 0, caiwu = 0, daka = 0, dingwei = 0
  let jujue = 0, yichang = 0, jinji = 0, logs = 0, config = 0

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (!key) continue

    const value = localStorage.getItem(key) || ''
    
    if (key === 'order_list') orders = JSON.parse(value).length
    else if (key === 'siji_list') siji = JSON.parse(value).length
    else if (key === 'chengke_list') chengke = JSON.parse(value).length
    else if (key === 'caiwu_list') caiwu = JSON.parse(value).length
    else if (key === 'daka_list') daka = JSON.parse(value).length
    else if (key === 'dingwei_list') dingwei = JSON.parse(value).length
    else if (key === 'jujue_list') jujue = JSON.parse(value).length
    else if (key === 'yichang_list') yichang = JSON.parse(value).length
    else if (key === 'jinji_list') jinji = JSON.parse(value).length
    else if (key.startsWith('order_logs_')) logs += JSON.parse(value).length
    else if (['jifei_config', 'xitong_config'].includes(key)) config++
  }

  // 计算存储大小
  let totalSize = 0
  for (let key in localStorage) {
    if (localStorage.hasOwnProperty(key)) {
      totalSize += localStorage[key].length * 2
    }
  }

  data_stats.value = {
    orders,
    siji,
    chengke,
    caiwu,
    daka,
    dingwei,
    jujue,
    yichang,
    jinji,
    logs,
    config,
    size: format_size(totalSize)
  }
}

function format_size(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function confirm_init(type: 'all' | 'orders' | 'business') {
  init_type.value = type
  confirm_form.value = { password: '', confirmed: false }
  confirm_dialog_visible.value = true
}

async function execute_init() {
  confirm_dialog_visible.value = false
  progress_dialog_visible.value = true
  progress_percentage.value = 0
  progress_status.value = ''
  progress_text.value = '开始初始化...'

  const keys_to_delete: string[] = []

  if (init_type.value === 'all') {
    // 全部初始化 - 删除所有数据
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !key.startsWith('auth_')) { // 保留登录信息
        keys_to_delete.push(key)
      }
    }
  } else if (init_type.value === 'orders') {
    // 订单数据初始化
    keys_to_delete.push(
      'order_list',
      'daka_list',
      'dingwei_list'
    )
    // 删除所有订单日志
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('order_logs_')) {
        keys_to_delete.push(key)
      }
    }
  } else if (init_type.value === 'business') {
    // 业务数据初始化
    keys_to_delete.push(
      'caiwu_list',
      'jujue_list',
      'yichang_list',
      'jinji_list',
      'duizhangdan_list'
    )
  }

  // 模拟进度
  const total = keys_to_delete.length
  for (let i = 0; i < total; i++) {
    await new Promise(resolve => setTimeout(resolve, 100))
    localStorage.removeItem(keys_to_delete[i])
    progress_percentage.value = Math.round(((i + 1) / total) * 100)
    progress_text.value = `正在删除: ${keys_to_delete[i]} (${i + 1}/${total})`
  }

  progress_status.value = 'success'
  progress_text.value = '初始化完成！'

  // 记录操作日志
  log_chushihua_action(init_type_label.value)

  setTimeout(() => {
    progress_dialog_visible.value = false
    ElMessage.success(`${init_type_label.value}完成！`)
    refresh_stats()
  }, 1000)
}

onMounted(() => {
  refresh_stats()
})
</script>

<style scoped>
.chushihua-page {
  padding: 0;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.init-card {
  height: 100%;
}

.init-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
}

.init-content {
  p {
    margin: 0 0 10px 0;
    color: #606266;
  }

  ul {
    margin: 0 0 20px 0;
    padding-left: 20px;
    color: #909399;
    font-size: 14px;
    max-height: 200px;
    overflow-y: auto;
  }

  li {
    margin-bottom: 5px;
  }
}

.progress-content {
  padding: 20px;
  text-align: center;
}

.progress-text {
  margin-top: 20px;
  color: #606266;
  font-size: 14px;
}
</style>
