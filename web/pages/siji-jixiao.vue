<template>
  <Layout>
    <div class="jixiao-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>司机绩效统计</span>
            <div class="header-actions">
              <el-date-picker
                v-model="date_range"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                style="margin-right: 10px;"
              />
              <el-button type="primary" @click="refresh_data">
                <el-icon><Refresh /></el-icon> 刷新数据
              </el-button>
            </div>
          </div>
        </template>

        <!-- 绩效概览 -->
        <el-row :gutter="20" class="overview-row">
          <el-col :span="6">
            <div class="overview-card">
              <div class="overview-value">{{ overview.total_siji }}</div>
              <div class="overview-label">司机总数</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card">
              <div class="overview-value">{{ overview.total_dingdan }}</div>
              <div class="overview-label">完成订单</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card">
              <div class="overview-value">{{ overview.total_jine }}</div>
              <div class="overview-label">总金额</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="overview-card">
              <div class="overview-value">{{ overview.avg_pingfen }}</div>
              <div class="overview-label">平均评分</div>
            </div>
          </el-col>
        </el-row>

        <!-- 绩效排行榜 -->
        <el-divider content-position="left">绩效排行榜</el-divider>
        <el-table :data="jixiao_list" style="width: 100%;" v-loading="loading">
          <el-table-column type="index" label="排名" width="80">
            <template #default="{ $index }">
              <div class="rank-cell">
                <el-tag v-if="$index === 0" type="danger" effect="dark">1</el-tag>
                <el-tag v-else-if="$index === 1" type="warning" effect="dark">2</el-tag>
                <el-tag v-else-if="$index === 2" type="success" effect="dark">3</el-tag>
                <span v-else>{{ $index + 1 }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="xingming" label="司机姓名" />
          <el-table-column prop="wancheng_dingdan" label="完成订单" sortable />
          <el-table-column prop="jujue_dingdan" label="拒绝订单" sortable />
          <el-table-column prop="wancheng_lv" label="完成率" sortable>
            <template #default="{ row }">
              <el-progress :percentage="row.wancheng_lv" :color="get_progress_color(row.wancheng_lv)" />
            </template>
          </el-table-column>
          <el-table-column prop="zongjine" label="总金额" sortable />
          <el-table-column prop="pingjun_jine" label="平均金额" sortable />
          <el-table-column prop="pingfen" label="评分" sortable>
            <template #default="{ row }">
              <el-rate v-model="row.pingfen" disabled show-score />
            </template>
          </el-table-column>
          <el-table-column prop="jujue_lv" label="拒单率" sortable>
            <template #default="{ row }">
              <el-tag :type="row.jujue_lv > 20 ? 'danger' : row.jujue_lv > 10 ? 'warning' : 'success'">
                {{ row.jujue_lv }}%
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template #default="{ row }">
              <el-button size="small" type="primary" @click="view_detail(row)">详情</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 司机绩效详情弹窗 -->
      <el-dialog title="司机绩效详情" v-model="detail_visible" width="800px">
        <div v-if="current_detail.id">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="司机姓名">{{ current_detail.xingming }}</el-descriptions-item>
            <el-descriptions-item label="手机号">{{ current_detail.shouji }}</el-descriptions-item>
            <el-descriptions-item label="完成订单">{{ current_detail.wancheng_dingdan }} 单</el-descriptions-item>
            <el-descriptions-item label="拒绝订单">{{ current_detail.jujue_dingdan }} 单</el-descriptions-item>
            <el-descriptions-item label="完成率">{{ current_detail.wancheng_lv }}%</el-descriptions-item>
            <el-descriptions-item label="拒单率">{{ current_detail.jujue_lv }}%</el-descriptions-item>
            <el-descriptions-item label="总金额">{{ current_detail.zongjine }}</el-descriptions-item>
            <el-descriptions-item label="司机提成">{{ current_detail.siji_ticheng }}</el-descriptions-item>
            <el-descriptions-item label="平均订单金额">{{ current_detail.pingjun_jine }}</el-descriptions-item>
            <el-descriptions-item label="评分">
              <el-rate v-model="current_detail.pingfen" disabled show-score />
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">月度趋势</el-divider>
          <div class="chart-placeholder">
            <p>月度订单数量趋势图表</p>
          </div>
        </div>
        <template #footer>
          <el-button @click="detail_visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

const loading = ref(false)
const date_range = ref<[Date, Date] | null>(null)
const detail_visible = ref(false)
const current_detail = ref<any>({})

const overview = ref({
  total_siji: 0,
  total_dingdan: 0,
  total_jine: '¥0.00',
  avg_pingfen: 0
})

const jixiao_list = ref<any[]>([])

// 加载数据
onMounted(() => {
  refresh_data()
})

function refresh_data() {
  loading.value = true
  
  setTimeout(() => {
    // 模拟数据
    const siji_data = [
      { id: 1, xingming: '王师傅', shouji: '13800138001', pingfen: 4.8 },
      { id: 2, xingming: '赵师傅', shouji: '13800138002', pingfen: 4.5 },
      { id: 3, xingming: '李师傅', shouji: '13800138003', pingfen: 4.2 },
      { id: 4, xingming: '张师傅', shouji: '13800138004', pingfen: 4.9 },
      { id: 5, xingming: '刘师傅', shouji: '13800138005', pingfen: 4.6 }
    ]

    jixiao_list.value = siji_data.map(siji => {
      const wancheng_dingdan = Math.floor(Math.random() * 80) + 20
      const jujue_dingdan = Math.floor(Math.random() * 10)
      const total = wancheng_dingdan + jujue_dingdan
      const wancheng_lv = total > 0 ? Math.round((wancheng_dingdan / total) * 100) : 0
      const jujue_lv = total > 0 ? Math.round((jujue_dingdan / total) * 100) : 0
      const zongjine = Math.floor(Math.random() * 50000) + 10000
      
      return {
        ...siji,
        wancheng_dingdan,
        jujue_dingdan,
        wancheng_lv,
        jujue_lv,
        zongjine: '¥' + zongjine.toFixed(2),
        pingjun_jine: '¥' + (zongjine / wancheng_dingdan).toFixed(2),
        siji_ticheng: '¥' + (zongjine * 0.6).toFixed(2)
      }
    })

    // 按完成率排序
    jixiao_list.value.sort((a, b) => b.wancheng_lv - a.wancheng_lv)

    // 计算概览
    overview.value = {
      total_siji: siji_data.length,
      total_dingdan: jixiao_list.value.reduce((sum, item) => sum + item.wancheng_dingdan, 0),
      total_jine: '¥' + jixiao_list.value.reduce((sum, item) => sum + parseFloat(item.zongjine.replace('¥', '')), 0).toFixed(2),
      avg_pingfen: (jixiao_list.value.reduce((sum, item) => sum + item.pingfen, 0) / siji_data.length).toFixed(1)
    }

    loading.value = false
    ElMessage.success('数据刷新成功')
  }, 1000)
}

function view_detail(row: any) {
  current_detail.value = { ...row }
  detail_visible.value = true
}

function get_progress_color(percentage: number) {
  if (percentage >= 90) return '#67c23a'
  if (percentage >= 70) return '#e6a23c'
  return '#f56c6c'
}
</script>

<style scoped>
.jixiao-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-actions {
  display: flex;
  align-items: center;
}

.overview-row {
  margin-bottom: 20px;
}

.overview-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.overview-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.overview-label {
  font-size: 14px;
  opacity: 0.9;
}

.rank-cell {
  display: flex;
  justify-content: center;
}

.chart-placeholder {
  height: 200px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #909399;
}
</style>
