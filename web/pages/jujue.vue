<template>
  <Layout>
    <div class="jujue-page">
      <el-card>
        <el-table :data="jujue_list" style="width: 100%;">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="dingdan" label="订单号" width="150" />
          <el-table-column prop="siji" label="司机" width="120" />
          <el-table-column prop="yuanyin" label="拒绝原因" width="150" />
          <el-table-column prop="shijian" label="时间" width="170" />
          <el-table-column prop="zhuangtai" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.zhuangtai === 1 ? 'success' : 'warning'">
                {{ row.zhuangtai === 1 ? '已处理' : '未处理' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="处理结果" width="150">
            <template #default="{ row }">
              <span v-if="row.chuli_jieguo === 'reassign'">已重新指派</span>
              <span v-else-if="row.chuli_jieguo === 'cancel'">已取消订单</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template #default="{ row }">
              <el-button size="small" type="primary" v-if="row.zhuangtai === 0" @click="handle_jujue(row)">处理</el-button>
              <el-button size="small" @click="view_detail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 处理拒绝记录弹窗 -->
      <el-dialog title="处理拒绝记录" v-model="handle_dialog_visible" width="500px" :append-to-body="true" :z-index="2000">
        <el-form :model="handle_form" label-width="100px">
          <el-form-item label="订单号">
            <el-input v-model="handle_form.dingdan" disabled />
          </el-form-item>
          <el-form-item label="拒绝司机">
            <el-input v-model="handle_form.siji" disabled />
          </el-form-item>
          <el-form-item label="拒绝原因">
            <el-input v-model="handle_form.yuanyin" disabled />
          </el-form-item>
          <el-form-item label="处理方式">
            <el-radio-group v-model="handle_form.fangshi">
              <el-radio label="reassign">重新指派司机</el-radio>
              <el-radio label="cancel">取消订单</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="选择司机" v-if="handle_form.fangshi === 'reassign'">
            <el-select v-model="handle_form.new_siji_id" placeholder="请选择司机" style="width: 100%;">
              <el-option 
                v-for="item in available_siji_list" 
                :key="item.id" 
                :label="item.xingming" 
                :value="item.id" 
              />
            </el-select>
          </el-form-item>
          <el-form-item label="取消原因" v-if="handle_form.fangshi === 'cancel'">
            <el-select v-model="handle_form.quxiao_yuanyin" placeholder="请选择取消原因" style="width: 100%;">
              <el-option label="司机拒绝" value="司机拒绝" />
              <el-option label="乘客取消" value="乘客取消" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="handle_form.beizhu" type="textarea" placeholder="请输入备注（选填）" />
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

      <!-- 拒绝记录详情弹窗 -->
      <el-dialog title="拒绝记录详情" v-model="detail_dialog_visible" width="600px">
        <el-descriptions :column="1" border v-if="current_detail.id">
          <el-descriptions-item label="记录ID">{{ current_detail.id }}</el-descriptions-item>
          <el-descriptions-item label="订单号">{{ current_detail.dingdan }}</el-descriptions-item>
          <el-descriptions-item label="拒绝司机">{{ current_detail.siji }}</el-descriptions-item>
          <el-descriptions-item label="拒绝原因">{{ current_detail.yuanyin }}</el-descriptions-item>
          <el-descriptions-item label="拒绝时间">{{ current_detail.shijian }}</el-descriptions-item>
          <el-descriptions-item label="处理状态">
            <el-tag :type="current_detail.zhuangtai === 1 ? 'success' : 'warning'">
              {{ current_detail.zhuangtai === 1 ? '已处理' : '未处理' }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="处理方式" v-if="current_detail.chuli_jieguo">
            {{ current_detail.chuli_jieguo === 'reassign' ? '重新指派' : '取消订单' }}
          </el-descriptions-item>
          <el-descriptions-item label="新指派司机" v-if="current_detail.new_siji">
            {{ current_detail.new_siji }}
          </el-descriptions-item>
          <el-descriptions-item label="处理时间" v-if="current_detail.chuli_shijian">
            {{ current_detail.chuli_shijian }}
          </el-descriptions-item>
          <el-descriptions-item label="备注" v-if="current_detail.beizhu">
            {{ current_detail.beizhu }}
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
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { Warning } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

// 可用司机列表（排除已拒绝的司机）
const available_siji_list = ref([
  { id: 1, xingming: '王师傅', shouji: '13800138001', zhuangtai: 1 },
  { id: 2, xingming: '赵师傅', shouji: '13800138002', zhuangtai: 1 },
  { id: 3, xingming: '李师傅', shouji: '13800138003', zhuangtai: 1 },
  { id: 4, xingming: '张师傅', shouji: '13800138004', zhuangtai: 1 },
  { id: 5, xingming: '刘师傅', shouji: '13800138005', zhuangtai: 1 }
])

// 默认拒绝记录数据
const default_jujue_list = [
  { 
    id: 1, 
    dingdan: 'DD20240424003', 
    siji: '王师傅', 
    siji_id: 1,
    yuanyin: '距离太远', 
    shijian: '2024-04-24 12:20:00', 
    zhuangtai: 0,
    chuli_jieguo: null,
    new_siji: null,
    chuli_shijian: null,
    beizhu: ''
  },
  { 
    id: 2, 
    dingdan: 'DD20240424005', 
    siji: '赵师傅', 
    siji_id: 2,
    yuanyin: '车辆故障', 
    shijian: '2024-04-24 14:30:00', 
    zhuangtai: 1,
    chuli_jieguo: 'reassign',
    new_siji: '李师傅',
    chuli_shijian: '2024-04-24 14:35:00',
    beizhu: '已重新指派给其他司机'
  }
]

// 拒绝记录列表 - 从 localStorage 加载
const jujue_list = ref<any[]>([])

// 从 localStorage 加载数据
onMounted(() => {
  const saved = localStorage.getItem('jujue_list')
  if (saved) {
    jujue_list.value = JSON.parse(saved)
  } else {
    jujue_list.value = [...default_jujue_list]
    save_jujue_list()
  }
})

// 保存到 localStorage
function save_jujue_list() {
  localStorage.setItem('jujue_list', JSON.stringify(jujue_list.value))
}

const handle_dialog_visible = ref(false)
const detail_dialog_visible = ref(false)
const confirm_dialog_visible = ref(false)
const current_detail = ref<any>({})
const confirm_message = ref('')

const handle_form = ref({
  id: null,
  dingdan: '',
  siji: '',
  yuanyin: '',
  fangshi: 'reassign',
  new_siji_id: null,
  quxiao_yuanyin: '',
  beizhu: ''
})

// 打开处理弹窗
function handle_jujue(row: any) {
  handle_form.value = {
    id: row.id,
    dingdan: row.dingdan,
    siji: row.siji,
    yuanyin: row.yuanyin,
    fangshi: 'reassign',
    new_siji_id: null,
    quxiao_yuanyin: '',
    beizhu: ''
  }
  handle_dialog_visible.value = true
}

// 查看详情
function view_detail(row: any) {
  current_detail.value = { ...row }
  detail_dialog_visible.value = true
}

// 确认处理 - 显示自定义确认弹窗
function confirm_handle() {
  if (handle_form.value.fangshi === 'reassign' && !handle_form.value.new_siji_id) {
    ElMessage.warning('请选择新司机')
    return
  }
  if (handle_form.value.fangshi === 'cancel' && !handle_form.value.quxiao_yuanyin) {
    ElMessage.warning('请选择取消原因')
    return
  }

  confirm_message.value = handle_form.value.fangshi === 'reassign'
    ? '确定要重新指派该订单给其他司机吗？'
    : '确定要取消该订单吗？'
  confirm_dialog_visible.value = true
}

// 执行处理
function execute_handle() {
  const record = jujue_list.value.find(item => item.id === handle_form.value.id)
  if (record) {
    record.zhuangtai = 1
    record.chuli_jieguo = handle_form.value.fangshi
    record.chuli_shijian = new Date().toLocaleString()
    record.beizhu = handle_form.value.beizhu

    if (handle_form.value.fangshi === 'reassign') {
      const new_siji = available_siji_list.value.find(s => s.id === handle_form.value.new_siji_id)
      record.new_siji = new_siji?.xingming || ''
      add_siji_jujue_record(record.siji_id, record)
      ElMessage.success(`已重新指派给 ${record.new_siji}`)
    } else {
      ;(record as any).quxiao_yuanyin = handle_form.value.quxiao_yuanyin
      add_siji_jujue_record(record.siji_id, record)
      ElMessage.success('订单已取消')
    }
    
    // 保存到 localStorage
    save_jujue_list()
  }

  confirm_dialog_visible.value = false
  handle_dialog_visible.value = false
}

// 添加司机拒绝记录（用于在司机详情页显示）
function add_siji_jujue_record(siji_id: number, record: any) {
  // 这里可以将记录存储到本地存储或发送到后端
  // 为了演示，我们存储到 localStorage
  const key = `siji_jujue_records_${siji_id}`
  const existing = JSON.parse(localStorage.getItem(key) || '[]')
  existing.push({
    ...record,
    chuli_shijian: new Date().toLocaleString()
  })
  localStorage.setItem(key, JSON.stringify(existing))
}
</script>

<style scoped>
.jujue-page { 
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
