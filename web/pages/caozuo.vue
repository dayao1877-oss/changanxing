<template>
  <Layout>
    <div class="caozuo-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>操作日志</span>
            <el-button type="danger" size="small" @click="clear_logs">
              <el-icon><Delete /></el-icon> 清空日志
            </el-button>
          </div>
        </template>
        
        <div class="table-toolbar">
          <div class="filters">
            <el-select v-model="filter_type" placeholder="操作类型" clearable style="width: 150px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="订单管理" value="order" />
              <el-option label="用户管理" value="user" />
              <el-option label="车辆管理" value="vehicle" />
              <el-option label="财务管理" value="caiwu" />
              <el-option label="计费规则" value="jifei" />
              <el-option label="提成设置" value="ticheng" />
              <el-option label="系统配置" value="xitong" />
              <el-option label="数据导出" value="daochu" />
              <el-option label="系统初始化" value="chushihua" />
              <el-option label="系统登录" value="login" />
            </el-select>
            <el-date-picker 
              v-model="date_range" 
              type="daterange" 
              placeholder="选择日期范围" 
              clearable 
              style="width: 360px; margin-right: 10px;" 
            />
            <el-button type="primary" @click="refresh_logs">
              <el-icon><Refresh /></el-icon> 刷新
            </el-button>
          </div>
        </div>
        
        <el-table :data="filtered_logs" style="width: 100%; margin-top: 20px;" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="shijian" label="时间" width="170" sortable />
          <el-table-column prop="caozuoren" label="操作人" width="120" />
          <el-table-column prop="mokuai" label="模块" width="120">
            <template #default="{ row }">
              <el-tag :type="get_type_color(row.type)" size="small">
                {{ row.mokuai }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="biaoti" label="操作" width="150" />
          <el-table-column prop="neirong" label="内容" show-overflow-tooltip />
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button size="small" type="primary" link @click="view_detail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <el-empty v-if="filtered_logs.length === 0" description="暂无操作日志" />
      </el-card>

      <!-- 日志详情弹窗 -->
      <el-dialog title="操作详情" v-model="detail_visible" width="600px">
        <el-descriptions :column="1" border v-if="current_log.id">
          <el-descriptions-item label="日志ID">{{ current_log.id }}</el-descriptions-item>
          <el-descriptions-item label="操作时间">{{ current_log.shijian }}</el-descriptions-item>
          <el-descriptions-item label="操作人">{{ current_log.caozuoren }}</el-descriptions-item>
          <el-descriptions-item label="操作模块">{{ current_log.mokuai }}</el-descriptions-item>
          <el-descriptions-item label="操作类型">{{ current_log.biaoti }}</el-descriptions-item>
          <el-descriptions-item label="操作内容">{{ current_log.neirong }}</el-descriptions-item>
          <el-descriptions-item label="详细数据" v-if="current_log.detail">
            <pre class="detail-json">{{ JSON.stringify(current_log.detail, null, 2) }}</pre>
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="detail_visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Delete, Refresh } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { get_caozuo_logs, type CaozuoType, type CaozuoLog } from '~/utils/caozuo-log'

const loading = ref(false)
const filter_type = ref<string>('')
const date_range = ref<[Date, Date] | null>(null)
const detail_visible = ref(false)
const current_log = ref<Partial<CaozuoLog>>({})

const logs = ref<CaozuoLog[]>([])

// 过滤后的日志
const filtered_logs = computed(() => {
  let result = logs.value

  // 按类型过滤
  if (filter_type.value && filter_type.value !== '') {
    result = result.filter(log => log.type === filter_type.value)
  }

  // 按日期过滤
  if (date_range.value && date_range.value[0] && date_range.value[1]) {
    const start = date_range.value[0].getTime()
    const end = date_range.value[1].getTime()
    result = result.filter(log => {
      try {
        const log_time = new Date(log.shijian).getTime()
        return log_time >= start && log_time <= end
      } catch {
        return false
      }
    })
  }

  return result
})

// 获取类型颜色
function get_type_color(type: CaozuoType): 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined {
  const colors: Record<CaozuoType, 'primary' | 'success' | 'info' | 'warning' | 'danger' | undefined> = {
    'order': 'primary',
    'user': 'success',
    'vehicle': 'info',
    'caiwu': 'warning',
    'jifei': 'danger',
    'ticheng': 'success',
    'xitong': 'danger',
    'daochu': 'primary',
    'chushihua': 'danger',
    'login': 'info',
    'other': undefined
  }
  return colors[type] || undefined
}

// 刷新日志
function refresh_logs() {
  loading.value = true
  setTimeout(() => {
    logs.value = get_caozuo_logs(undefined, 1000)
    loading.value = false
  }, 500)
}

// 查看详情
function view_detail(row: CaozuoLog) {
  current_log.value = { ...row }
  detail_visible.value = true
}

// 清空日志
async function clear_logs() {
  try {
    await ElMessageBox.confirm(
      '确定要清空所有操作日志吗？此操作不可恢复！',
      '警告',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    localStorage.removeItem('caozuo_logs')
    logs.value = []
    ElMessage.success('操作日志已清空')
  } catch {
    // 用户取消
  }
}

onMounted(() => {
  refresh_logs()
})
</script>

<style scoped>
.caozuo-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-toolbar {
  display: flex;
  justify-content: flex-end;
}

.filters {
  display: flex;
}

.detail-json {
  background: #f5f7fa;
  padding: 10px;
  border-radius: 4px;
  font-size: 12px;
  max-height: 300px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
