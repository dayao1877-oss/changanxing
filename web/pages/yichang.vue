<template>
  <Layout>
    <div class="yichang-page">
      <el-card>
        <el-table :data="yichang_list" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="dingdan" label="订单号" width="150" />
          <el-table-column prop="siji" label="司机" width="120" />
          <el-table-column prop="leixing" label="异常类型" width="150" />
          <el-table-column prop="miaoshu" label="描述" />
          <el-table-column prop="shijian" label="时间" width="170" />
          <el-table-column prop="zhuangtai" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.zhuangtai === 2 ? 'success' : (row.zhuangtai === 1 ? 'primary' : 'warning')">
                {{ row.zhuangtai === 2 ? '已处理' : (row.zhuangtai === 1 ? '处理中' : '未处理') }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" v-if="row.zhuangtai !== 2" @click="handle_yichang(row)">处理</el-button>
              <el-button size="small" @click="view_detail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 处理异常弹窗 -->
      <el-dialog title="处理异常上报" v-model="handle_dialog_visible" width="500px" :append-to-body="true" :z-index="2000">
        <el-form :model="handle_form" label-width="100px">
          <el-form-item label="订单号">
            <el-input v-model="handle_form.dingdan" disabled />
          </el-form-item>
          <el-form-item label="司机">
            <el-input v-model="handle_form.siji" disabled />
          </el-form-item>
          <el-form-item label="异常类型">
            <el-input v-model="handle_form.leixing" disabled />
          </el-form-item>
          <el-form-item label="异常描述">
            <el-input v-model="handle_form.miaoshu" type="textarea" disabled />
          </el-form-item>
          <el-form-item label="处理方式">
            <el-radio-group v-model="handle_form.fangshi">
              <el-radio label="dispatch">派遣救援</el-radio>
              <el-radio label="reassign">重新指派</el-radio>
              <el-radio label="cancel">取消订单</el-radio>
              <el-radio label="self">自行处理</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理说明">
            <el-input v-model="handle_form.shuoming" type="textarea" placeholder="请输入处理说明" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="handle_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="confirm_handle">确认处理</el-button>
        </template>
      </el-dialog>

      <!-- 确认处理弹窗 -->
      <el-dialog title="确认处理" v-model="confirm_dialog_visible" width="400px" :append-to-body="true" :z-index="3000">
        <div class="confirm-content">
          <el-icon class="warning-icon"><Warning /></el-icon>
          <p>{{ confirm_message }}</p>
        </div>
        <template #footer>
          <el-button @click="confirm_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="execute_handle">确定</el-button>
        </template>
      </el-dialog>

      <!-- 异常详情弹窗 -->
      <el-dialog title="异常详情" v-model="detail_dialog_visible" width="600px">
        <el-descriptions :column="1" border v-if="current_detail.id">
          <el-descriptions-item label="记录ID">{{ current_detail.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ current_detail.dingdan }}</el-descriptions-item>
          <el-descriptions-item label="司机">{{ current_detail.siji }}</el-descriptions-item>
          <el-descriptions-item label="异常类型">{{ current_detail.leixing }}</el-descriptions-item>
          <el-descriptions-item label="异常描述">{{ current_detail.miaoshu }}</el-descriptions-item>
          <el-descriptions-item label="上报时间">{{ current_detail.shijian }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="current_detail.zhuangtai === 2 ? 'success' : (current_detail.zhuangtai === 1 ? 'primary' : 'warning')">
              {{ current_detail.zhuangtai === 2 ? '已处理' : (current_detail.zhuangtai === 1 ? '处理中' : '未处理') }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理方式" v-if="current_detail.chuli_fangshi">
            {{ get_chuli_fangshi_label(current_detail.chuli_fangshi) }}
          </el-descriptions-item>
          <el-descriptions-item label="处理说明" v-if="current_detail.chuli_shuoming">
            {{ current_detail.chuli_shuoming }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="current_detail.chuli_shijian">
            {{ current_detail.chuli_shijian }}
          </el-descriptions-item>
        </el-descriptions>
        <template #footer>
          <el-button @click="detail_dialog_visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

// 默认异常数据
const default_yichang_list = [
  { 
    id: 1, 
    dingdan: 'DD20240424002', 
    siji: '赵师傅',
    siji_id: 2,
    leixing: '车辆故障', 
    miaoshu: '车辆爆胎，需要修理', 
    shijian: '2024-04-24 11:40:00', 
    zhuangtai: 0,
    chuli_fangshi: null,
    chuli_shuoming: null,
    chuli_shijian: null
  }
]

// 异常列表 - 从 localStorage 加载
const yichang_list = ref<any[]>([])

// 从 localStorage 加载数据
onMounted(() => {
  const saved = localStorage.getItem('yichang_list')
  if (saved) {
    yichang_list.value = JSON.parse(saved)
  } else {
    yichang_list.value = [...default_yichang_list]
    save_yichang_list()
  }
})

// 保存到 localStorage
function save_yichang_list() {
  localStorage.setItem('yichang_list', JSON.stringify(yichang_list.value))
}

const handle_dialog_visible = ref(false)
const detail_dialog_visible = ref(false)
const confirm_dialog_visible = ref(false)
const current_detail = ref<any>({})
const confirm_message = ref('')

const handle_form = ref({
  id: null as any,
  dingdan: '',
  siji: '',
  leixing: '',
  miaoshu: '',
  fangshi: 'dispatch',
  shuoming: ''
})

// 打开处理弹窗
function handle_yichang(row: any) {
  handle_form.value = {
    id: row.id,
    dingdan: row.dingdan,
    siji: row.siji,
    leixing: row.leixing,
    miaoshu: row.miaoshu,
    fangshi: 'dispatch',
    shuoming: ''
  }
  handle_dialog_visible.value = true
}

// 查看详情
function view_detail(row: any) {
  current_detail.value = { ...row }
  detail_dialog_visible.value = true
}

// 获取处理方式标签
function get_chuli_fangshi_label(fangshi: string) {
  const labels: Record<string, string> = {
    'dispatch': '派遣救援',
    'reassign': '重新指派',
    'cancel': '取消订单',
    'self': '自行处理'
  }
  return labels[fangshi] || fangshi
}

// 确认处理 - 显示自定义确认弹窗
function confirm_handle() {
  if (!handle_form.value.shuoming) {
    ElMessage.warning('请输入处理说明')
    return
  }

  confirm_message.value = `确定要${get_chuli_fangshi_label(handle_form.value.fangshi)}吗？`
  confirm_dialog_visible.value = true
}

// 执行处理
function execute_handle() {
  const record = yichang_list.value.find(item => item.id === handle_form.value.id)
  if (record) {
    record.zhuangtai = 2
    record.chuli_fangshi = handle_form.value.fangshi
    record.chuli_shuoming = handle_form.value.shuoming
    record.chuli_shijian = new Date().toLocaleString()
    
    // 保存到 localStorage
    save_yichang_list()
    
    // 推送通知到司机端（模拟）
    push_notification_to_driver(record.siji_id, {
      type: 'yichang_chuli',
      title: '异常处理通知',
      message: `您的异常上报已处理：${get_chuli_fangshi_label(handle_form.value.fangshi)}`,
      dingdan: record.dingdan,
      chuli_fangshi: handle_form.value.fangshi,
      chuli_shuoming: handle_form.value.shuoming
    })
    
    ElMessage.success('异常已处理，通知已发送给司机')
  }

  confirm_dialog_visible.value = false
  handle_dialog_visible.value = false
}

// 推送通知到司机端（模拟）
function push_notification_to_driver(siji_id: number, notification: any) {
  // 将通知存储到 localStorage，模拟推送到司机端
  const key = `siji_notifications_${siji_id}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({
    ...notification,
    id: Date.now(),
    shijian: new Date().toLocaleString(),
    yidu: false
  })
  localStorage.setItem(key, JSON.stringify(existing))
  console.log(`推送通知给司机 ${siji_id}:`, notification)
}
</script>

<style scoped>
.yichang-page { 
  padding: 0; 
}

.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
}

.warning-icon {
  font-size: 48px;
  color: #e6a23c;
  margin-bottom: 15px;
}

.confirm-content p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}
</style>
