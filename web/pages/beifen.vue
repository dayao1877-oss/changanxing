<template>
  <Layout>
    <div class="beifen-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>数据备份管理</span>
            <div class="header-actions">
              <el-button type="primary" @click="open_auto_backup_dialog">
                <el-icon><Setting /></el-icon> 自动备份设置
              </el-button>
              <el-button type="success" @click="manual_backup">
                <el-icon><Download /></el-icon> 立即备份
              </el-button>
            </div>
          </div>
        </template>

        <!-- 备份统计 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ backup_stats.total }}</div>
              <div class="stat-label">备份总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ backup_stats.size }}</div>
              <div class="stat-label">总大小</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ backup_stats.last_backup }}</div>
              <div class="stat-label">上次备份</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card">
              <div class="stat-value">{{ auto_backup_enabled ? '已开启' : '未开启' }}</div>
              <div class="stat-label">自动备份</div>
            </div>
          </el-col>
        </el-row>

        <!-- 备份列表 -->
        <el-divider content-position="left">备份历史记录</el-divider>
        <el-table :data="backup_list" style="width: 100%;" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="name" label="备份名称" />
          <el-table-column prop="type" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.type === 'auto' ? 'success' : 'primary'">
                {{ row.type === 'auto' ? '自动' : '手动' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="size" label="大小" width="100" />
          <el-table-column prop="shijian" label="备份时间" width="170" />
          <el-table-column prop="beizhu" label="备注" show-overflow-tooltip />
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="download_backup(row)">下载</el-button>
              <el-button size="small" type="warning" @click="restore_backup(row)">恢复</el-button>
              <el-button size="small" type="danger" @click="delete_backup(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="backup_list.length === 0" description="暂无备份记录" />
      </el-card>

      <!-- 自动备份设置弹窗 -->
      <el-dialog title="自动备份设置" v-model="auto_backup_dialog_visible" width="500px">
        <el-form :model="auto_backup_config" label-width="150px">
          <el-form-item label="启用自动备份">
            <el-switch v-model="auto_backup_config.enabled" />
          </el-form-item>
          <el-form-item label="备份周期" v-if="auto_backup_config.enabled">
            <el-radio-group v-model="auto_backup_config.zhouqi">
              <el-radio-button label="daily">每天</el-radio-button>
              <el-radio-button label="weekly">每周</el-radio-button>
              <el-radio-button label="monthly">每月</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="备份时间" v-if="auto_backup_config.enabled">
            <el-time-picker v-model="auto_backup_config.shijian" format="HH:mm" placeholder="选择时间" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="保留数量" v-if="auto_backup_config.enabled">
            <el-slider v-model="auto_backup_config.baoliu_shu" :max="30" :min="1" show-stops show-input />
            <div class="tip-text">超过此数量的旧备份将自动删除</div>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="auto_backup_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_auto_backup_config">保存</el-button>
        </template>
      </el-dialog>

      <!-- 手动备份弹窗 -->
      <el-dialog title="手动备份" v-model="manual_backup_dialog_visible" width="500px">
        <el-form :model="manual_backup_form" label-width="100px">
          <el-form-item label="备份名称">
            <el-input v-model="manual_backup_form.name" placeholder="请输入备份名称" />
          </el-form-item>
          <el-form-item label="备份内容">
            <el-checkbox-group v-model="manual_backup_form.content">
              <el-checkbox label="orders">订单数据</el-checkbox>
              <el-checkbox label="users">用户数据</el-checkbox>
              <el-checkbox label="caiwu">财务数据</el-checkbox>
              <el-checkbox label="config">系统配置</el-checkbox>
              <el-checkbox label="logs">操作日志</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="manual_backup_form.beizhu" type="textarea" placeholder="请输入备注（选填）" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="manual_backup_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="execute_manual_backup" :loading="backup_loading">开始备份</el-button>
        </template>
      </el-dialog>

      <!-- 恢复确认弹窗 -->
      <el-dialog title="确认恢复数据" v-model="restore_dialog_visible" width="500px">
        <el-alert
          title="警告：数据恢复将覆盖当前数据"
          type="error"
          description="恢复操作将用备份数据替换当前数据，此操作不可撤销！"
          show-icon
          :closable="false"
          style="margin-bottom: 20px;"
        />
        <el-descriptions :column="1" border v-if="current_backup.id">
          <el-descriptions-item label="备份ID">{{ current_backup.id }}</el-descriptions-item>
          <el-descriptions-item label="备份名称">{{ current_backup.name }}</el-descriptions-item>
          <el-descriptions-item label="备份时间">{{ current_backup.shijian }}</el-descriptions-item>
          <el-descriptions-item label="备份大小">{{ current_backup.size }}</el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="restore_dialog_visible = false">取消</el-button>
          <el-button type="danger" @click="execute_restore">确认恢复</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Setting, Refresh } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { add_caozuo_log } from '~/utils/caozuo-log'

const loading = ref(false)
const backup_loading = ref(false)
const auto_backup_dialog_visible = ref(false)
const manual_backup_dialog_visible = ref(false)
const restore_dialog_visible = ref(false)
const current_backup = ref<any>({})

const backup_list = ref<any[]>([])
const auto_backup_enabled = ref(false)

const auto_backup_config = ref({
  enabled: false,
  zhouqi: 'daily',
  shijian: new Date(2024, 0, 1, 2, 0),
  baoliu_shu: 7
})

const manual_backup_form = ref({
  name: '',
  content: ['orders', 'users', 'caiwu', 'config', 'logs'],
  beizhu: ''
})

const backup_stats = computed(() => {
  const total = backup_list.value.length
  let size = 0
  backup_list.value.forEach(b => {
    const match = b.size.match(/([\d.]+)\s*(KB|MB|GB)/)
    if (match) {
      const num = parseFloat(match[1])
      const unit = match[2]
      if (unit === 'KB') size += num / 1024
      else if (unit === 'MB') size += num
      else if (unit === 'GB') size += num * 1024
    }
  })
  
  const size_str = size > 1024 ? (size / 1024).toFixed(2) + ' GB' : size.toFixed(2) + ' MB'
  
  const last = backup_list.value.length > 0 ? backup_list.value[0].shijian.split(' ')[0] : '无'
  
  return {
    total,
    size: size_str,
    last_backup: last
  }
})

// 加载备份列表
function load_backup_list() {
  const saved = localStorage.getItem('backup_list')
  if (saved) {
    backup_list.value = JSON.parse(saved)
  }
  
  const auto_config = localStorage.getItem('auto_backup_config')
  if (auto_config) {
    const config = JSON.parse(auto_config)
    auto_backup_config.value = config
    auto_backup_enabled.value = config.enabled
  }
}

// 打开自动备份设置
function open_auto_backup_dialog() {
  auto_backup_dialog_visible.value = true
}

// 保存自动备份配置
function save_auto_backup_config() {
  localStorage.setItem('auto_backup_config', JSON.stringify(auto_backup_config.value))
  auto_backup_enabled.value = auto_backup_config.value.enabled
  auto_backup_dialog_visible.value = false
  ElMessage.success('自动备份设置已保存')
  
  // 记录操作日志
  add_caozuo_log({
    caozuoren: '管理员',
    mokuai: '数据备份',
    type: 'other',
    biaoti: '设置自动备份',
    neirong: `自动备份${auto_backup_config.value.enabled ? '开启' : '关闭'}，周期：${auto_backup_config.value.zhouqi}`
  })
}

// 手动备份
function manual_backup() {
  const now = new Date()
  manual_backup_form.value = {
    name: `手动备份_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`,
    content: ['orders', 'users', 'caiwu', 'config', 'logs'],
    beizhu: ''
  }
  manual_backup_dialog_visible.value = true
}

// 执行手动备份
async function execute_manual_backup() {
  if (!manual_backup_form.value.name) {
    ElMessage.warning('请输入备份名称')
    return
  }
  
  backup_loading.value = true
  
  // 模拟备份过程
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 收集备份数据
  const backup_data: any = {}
  let total_size = 0
  
  if (manual_backup_form.value.content.includes('orders')) {
    backup_data.orders = localStorage.getItem('order_list') || '[]'
    total_size += backup_data.orders.length
  }
  if (manual_backup_form.value.content.includes('users')) {
    backup_data.siji = localStorage.getItem('siji_list') || '[]'
    backup_data.chengke = localStorage.getItem('chengke_list') || '[]'
    total_size += backup_data.siji.length + backup_data.chengke.length
  }
  if (manual_backup_form.value.content.includes('caiwu')) {
    backup_data.caiwu = localStorage.getItem('caiwu_list') || '[]'
    total_size += backup_data.caiwu.length
  }
  if (manual_backup_form.value.content.includes('config')) {
    backup_data.jifei_config = localStorage.getItem('jifei_config') || '{}'
    backup_data.xitong_config = localStorage.getItem('xitong_config') || '{}'
    total_size += backup_data.jifei_config.length + backup_data.xitong_config.length
  }
  if (manual_backup_form.value.content.includes('logs')) {
    backup_data.caozuo_logs = localStorage.getItem('caozuo_logs') || '[]'
    total_size += backup_data.caozuo_logs.length
  }
  
  // 创建备份记录
  const backup = {
    id: Date.now(),
    name: manual_backup_form.value.name,
    type: 'manual',
    content: manual_backup_form.value.content,
    data: backup_data,
    size: format_size(total_size * 2),
    shijian: new Date().toLocaleString(),
    beizhu: manual_backup_form.value.beizhu
  }
  
  backup_list.value.unshift(backup)
  localStorage.setItem('backup_list', JSON.stringify(backup_list.value))
  
  backup_loading.value = false
  manual_backup_dialog_visible.value = false
  ElMessage.success('备份完成')
  
  // 记录操作日志
  add_caozuo_log({
    caozuoren: '管理员',
    mokuai: '数据备份',
    type: 'other',
    biaoti: '手动备份数据',
    neirong: `备份名称：${backup.name}，大小：${backup.size}，内容：${backup.content.join('、')}`
  })
}

// 下载备份
function download_backup(row: any) {
  const data_str = JSON.stringify(row.data, null, 2)
  const blob = new Blob([data_str], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${row.name}.json`
  link.click()
  URL.revokeObjectURL(url)
  
  ElMessage.success('备份文件下载已开始')
}

// 恢复备份
function restore_backup(row: any) {
  current_backup.value = row
  restore_dialog_visible.value = true
}

// 执行恢复
async function execute_restore() {
  restore_dialog_visible.value = false
  
  const backup = current_backup.value
  
  // 恢复数据
  if (backup.data.orders) localStorage.setItem('order_list', backup.data.orders)
  if (backup.data.siji) localStorage.setItem('siji_list', backup.data.siji)
  if (backup.data.chengke) localStorage.setItem('chengke_list', backup.data.chengke)
  if (backup.data.caiwu) localStorage.setItem('caiwu_list', backup.data.caiwu)
  if (backup.data.jifei_config) localStorage.setItem('jifei_config', backup.data.jifei_config)
  if (backup.data.xitong_config) localStorage.setItem('xitong_config', backup.data.xitong_config)
  if (backup.data.caozuo_logs) localStorage.setItem('caozuo_logs', backup.data.caozuo_logs)
  
  ElMessage.success('数据恢复成功')
  
  // 记录操作日志
  add_caozuo_log({
    caozuoren: '管理员',
    mokuai: '数据备份',
    type: 'other',
    biaoti: '恢复备份数据',
    neirong: `恢复备份：${backup.name}，时间：${backup.shijian}`
  })
}

// 删除备份
async function delete_backup(row: any) {
  try {
    await ElMessageBox.confirm(
      `确定要删除备份 "${row.name}" 吗？`,
      '确认删除',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const index = backup_list.value.findIndex(b => b.id === row.id)
    if (index > -1) {
      backup_list.value.splice(index, 1)
      localStorage.setItem('backup_list', JSON.stringify(backup_list.value))
      ElMessage.success('备份已删除')
      
      // 记录操作日志
      add_caozuo_log({
        caozuoren: '管理员',
        mokuai: '数据备份',
        type: 'other',
        biaoti: '删除备份',
        neirong: `删除备份：${row.name}`
      })
    }
  } catch {
    // 用户取消
  }
}

function format_size(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  load_backup_list()
})
</script>

<style scoped>
.beifen-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}
</style>
