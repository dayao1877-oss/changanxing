<template>
  <Layout>
    <div class="dashboard">
      <el-row :gutter="20" class="stats-row">
        <el-col :xs="24" :sm="12" :md="6" v-for="(stat, idx) in stats" :key="idx">
          <el-card class="stat-card" shadow="hover">
            <div class="stat-content" :style="{ borderLeftColor: stat.color }">
              <div class="stat-icon" :style="{ background: stat.color }">
                <span class="icon">{{ stat.icon }}</span>
              </div>
              <div class="stat-text">
                <div class="stat-value">{{ stat.value }}</div>
                <div class="stat-label">{{ stat.label }}</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>订单趋势</span>
              </div>
            </template>
            <div ref="orderChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="12">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>收入统计</span>
              </div>
            </template>
            <div ref="incomeChartRef" class="chart-container"></div>
          </el-card>
        </el-col>
      </el-row>

      <el-row :gutter="20" style="margin-top: 20px;">
        <el-col :xs="24" :lg="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>快捷操作</span>
              </div>
            </template>
            <div class="quick-actions">
              <el-button type="primary" @click="go_page('/orders')" style="width: 100%; margin-bottom: 10px;">
                <el-icon><Document /></el-icon> 查看订单
              </el-button>
              <el-button type="success" @click="go_page('/users')" style="width: 100%; margin-bottom: 10px;">
                <el-icon><User /></el-icon> 用户管理
              </el-button>
              <el-button type="warning" @click="go_page('/vehicles')" style="width: 100%;">
                <el-icon><Van /></el-icon> 车辆管理
              </el-button>
            </div>
          </el-card>
        </el-col>
        <el-col :xs="24" :lg="16">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">
                <span>最近订单</span>
                <el-button type="text">查看全部</el-button>
              </div>
            </template>
            <el-table :data="recent_orders" style="width: 100%">
              <el-table-column prop="dingdanhao" label="订单号" />
              <el-table-column prop="chengke" label="乘客" />
              <el-table-column prop="siji" label="司机" />
              <el-table-column prop="zhuangtai" label="状态">
                <template #default="{ row }">
                  <el-tag :type="row.zhuangtai_type">
                    {{ row.zhuangtai }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="jine" label="金额" />
            </el-table>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import * as echarts from 'echarts'
import type { EChartsOption } from 'echarts'
import { Document, User, Van } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

const router = useRouter()

const stats = ref([
  { icon: '🚗', value: 12, label: '司机数量', color: '#667eea' },
  { icon: '🚙', value: 18, label: '车辆数量', color: '#f093fb' },
  { icon: '📦', value: 156, label: '订单总数', color: '#4facfe' },
  { icon: '💰', value: '¥125,800', label: '总收入', color: '#43e97b' }
])

const recent_orders = ref([
  { dingdanhao: 'DD20240424001', chengke: '张三', siji: '王师傅', zhuangtai: '已完成', zhuangtai_type: 'success', jine: '¥128.00' },
  { dingdanhao: 'DD20240424002', chengke: '李四', siji: '赵师傅', zhuangtai: '进行中', zhuangtai_type: 'primary', jine: '¥89.50' },
  { dingdanhao: 'DD20240424003', chengke: '王五', siji: '李师傅', zhuangtai: '待接单', zhuangtai_type: 'warning', jine: '¥156.00' }
])

const orderChartRef = ref<HTMLElement | null>(null)
const incomeChartRef = ref<HTMLElement | null>(null)

let orderChart: echarts.ECharts | null = null
let incomeChart: echarts.ECharts | null = null

function go_page(path: string) {
  router.push(path)
}

function init_order_chart() {
  if (!orderChartRef.value) return
  orderChart = echarts.init(orderChartRef.value)
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [12, 19, 15, 22, 18, 24, 20],
      type: 'line',
      smooth: true,
      areaStyle: { color: 'rgba(102, 126, 234, 0.2)' },
      lineStyle: { color: '#667eea', width: 3 },
      itemStyle: { color: '#667eea' }
    }]
  }
  orderChart.setOption(option)
}

function init_income_chart() {
  if (!incomeChartRef.value) return
  incomeChart = echarts.init(incomeChartRef.value)
  const option: EChartsOption = {
    tooltip: { trigger: 'axis' },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: { type: 'value' },
    series: [{
      data: [1200, 1900, 1500, 2200, 1800, 2400, 2100],
      type: 'bar',
      itemStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ])
      },
      barWidth: '50%'
    }]
  }
  incomeChart.setOption(option)
}

function handle_resize() {
  orderChart?.resize()
  incomeChart?.resize()
}

onMounted(() => {
  nextTick(() => {
    init_order_chart()
    init_income_chart()
    window.addEventListener('resize', handle_resize)
  })
})
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 10px;
}

.stat-card {
  border: none;
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-left: 4px solid #667eea;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.stat-icon .icon {
  font-size: 28px;
}

.stat-text {
  flex: 1;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #303133;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #909399;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.chart-container {
  width: 100%;
  height: 300px;
}

.quick-actions {
  padding: 10px 0;
}
</style>
