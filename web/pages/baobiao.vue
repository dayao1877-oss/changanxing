<template>
  <Layout>
    <div class="baobiao-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>财务报表</span>
            <div class="header-actions">
              <el-radio-group v-model="report_type" @change="generate_report">
                <el-radio-button label="daily">日报表</el-radio-button>
                <el-radio-button label="weekly">周报表</el-radio-button>
                <el-radio-button label="monthly">月报表</el-radio-button>
                <el-radio-button label="custom">自定义</el-radio-button>
              </el-radio-group>
            </div>
          </div>
        </template>

        <!-- 自定义日期选择 -->
        <div v-if="report_type === 'custom'" class="custom-date-range">
          <el-date-picker
            v-model="custom_date_range"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @change="generate_report"
          />
        </div>

        <!-- 报表概览 -->
        <el-row :gutter="20" class="stats-row">
          <el-col :span="6">
            <div class="stat-card income">
              <div class="stat-title">总收入</div>
              <div class="stat-value">{{ report_data.total_income }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card expense">
              <div class="stat-title">总支出</div>
              <div class="stat-value">{{ report_data.total_expense }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card profit">
              <div class="stat-title">净利润</div>
              <div class="stat-value">{{ report_data.profit }}</div>
            </div>
          </el-col>
          <el-col :span="6">
            <div class="stat-card orders">
              <div class="stat-title">订单数量</div>
              <div class="stat-value">{{ report_data.order_count }}</div>
            </div>
          </el-col>
        </el-row>

        <!-- 收入支出明细 -->
        <el-divider content-position="left">收入支出明细</el-divider>
        <el-table :data="report_data.details" style="width: 100%;">
          <el-table-column prop="date" label="日期" width="120" />
          <el-table-column prop="income" label="收入" />
          <el-table-column prop="expense" label="支出" />
          <el-table-column prop="profit" label="利润" />
          <el-table-column prop="orders" label="订单数" width="100" />
        </el-table>

        <!-- 导出按钮 -->
        <div class="export-actions">
          <el-button type="primary" @click="export_report">
            <el-icon><Download /></el-icon> 导出报表
          </el-button>
        </div>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Download } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { add_caozuo_log } from '~/utils/caozuo-log'

const report_type = ref('daily')
const custom_date_range = ref<[Date, Date] | null>(null)

const report_data = ref({
  total_income: '¥0.00',
  total_expense: '¥0.00',
  profit: '¥0.00',
  order_count: 0,
  details: [] as any[]
})

// 生成报表
function generate_report() {
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const caiwu = JSON.parse(localStorage.getItem('caiwu_list') || '[]')
  
  let start_date: Date
  let end_date: Date
  
  const now = new Date()
  
  switch (report_type.value) {
    case 'daily':
      start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      end_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
      break
    case 'weekly':
      const day = now.getDay()
      start_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day)
      end_date = new Date(now.getFullYear(), now.getMonth(), now.getDate() + (7 - day))
      break
    case 'monthly':
      start_date = new Date(now.getFullYear(), now.getMonth(), 1)
      end_date = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      break
    case 'custom':
      if (!custom_date_range.value) return
      start_date = custom_date_range.value[0]
      end_date = custom_date_range.value[1]
      break
    default:
      return
  }
  
  // 过滤订单
  const filtered_orders = orders.filter((o: any) => {
    const order_date = new Date(o.chuangjian_shijian)
    return order_date >= start_date && order_date <= end_date && o.zhuangtai === 5
  })
  
  // 过滤财务记录
  const filtered_caiwu = caiwu.filter((c: any) => {
    const caiwu_date = new Date(c.shijian)
    return caiwu_date >= start_date && caiwu_date <= end_date
  })
  
  // 计算统计
  const total_income = filtered_orders.reduce((sum: number, o: any) => {
    return sum + parseFloat((o.jine || '¥0').replace('¥', ''))
  }, 0)
  
  const total_expense = filtered_caiwu
    .filter((c: any) => c.leixing === 2)
    .reduce((sum: number, c: any) => sum + parseFloat((c.jine || '¥0').replace('¥', '')), 0)
  
  const profit = total_income - total_expense
  
  // 生成明细
  const details: any[] = []
  const date_map = new Map()
  
  filtered_orders.forEach((o: any) => {
    const date = o.chuangjian_shijian.split(' ')[0]
    if (!date_map.has(date)) {
      date_map.set(date, { income: 0, expense: 0, orders: 0 })
    }
    const data = date_map.get(date)
    data.income += parseFloat((o.jine || '¥0').replace('¥', ''))
    data.orders++
  })
  
  filtered_caiwu.forEach((c: any) => {
    const date = c.shijian.split(' ')[0]
    if (!date_map.has(date)) {
      date_map.set(date, { income: 0, expense: 0, orders: 0 })
    }
    const data = date_map.get(date)
    if (c.leixing === 2) {
      data.expense += parseFloat((c.jine || '¥0').replace('¥', ''))
    }
  })
  
  date_map.forEach((data, date) => {
    details.push({
      date,
      income: '¥' + data.income.toFixed(2),
      expense: '¥' + data.expense.toFixed(2),
      profit: '¥' + (data.income - data.expense).toFixed(2),
      orders: data.orders
    })
  })
  
  details.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  
  report_data.value = {
    total_income: '¥' + total_income.toFixed(2),
    total_expense: '¥' + total_expense.toFixed(2),
    profit: '¥' + profit.toFixed(2),
    order_count: filtered_orders.length,
    details
  }
}

// 导出报表
function export_report() {
  const data = [
    ['财务报表', report_type.value === 'daily' ? '日报表' : report_type.value === 'weekly' ? '周报表' : report_type.value === 'monthly' ? '月报表' : '自定义报表'],
    ['总收入', report_data.value.total_income],
    ['总支出', report_data.value.total_expense],
    ['净利润', report_data.value.profit],
    ['订单数量', report_data.value.order_count.toString()],
    [],
    ['日期', '收入', '支出', '利润', '订单数'],
    ...report_data.value.details.map(d => [d.date, d.income, d.expense, d.profit, d.orders.toString()])
  ]
  
  const csv_content = data.map(row => row.join(',')).join('\n')
  const blob = new Blob(['\ufeff' + csv_content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `财务报表_${new Date().toLocaleDateString()}.csv`
  link.click()
  
  ElMessage.success('报表导出成功')
  
  // 记录操作日志
  add_caozuo_log({
    caozuoren: '管理员',
    mokuai: '财务报表',
    type: 'other',
    biaoti: '导出财务报表',
    neirong: `报表类型：${report_type.value}`
  })
}

onMounted(() => {
  generate_report()
})
</script>

<style scoped>
.baobiao-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.custom-date-range {
  margin-bottom: 20px;
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  color: white;
}

.stat-card.income {
  background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
}

.stat-card.expense {
  background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
}

.stat-card.profit {
  background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
}

.stat-card.orders {
  background: linear-gradient(135deg, #e6a23c 0%, #ebb563 100%);
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.export-actions {
  margin-top: 20px;
  text-align: right;
}
</style>
