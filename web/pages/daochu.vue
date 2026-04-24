<template>
  <Layout>
    <div class="daochu-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>数据导出中心</span>
          </div>
        </template>

        <el-row :gutter="20">
          <!-- 订单数据导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><Document /></el-icon>
                  <span>订单数据</span>
                </div>
              </template>
              <div class="export-content">
                <p>导出所有订单数据，包括：</p>
                <ul>
                  <li>订单基本信息</li>
                  <li>乘客信息</li>
                  <li>司机信息</li>
                  <li>金额信息</li>
                  <li>状态信息</li>
                </ul>
                <el-button type="primary" @click="export_orders" :loading="loading.orders">
                  <el-icon><Download /></el-icon> 导出Excel
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 财务记录导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><Money /></el-icon>
                  <span>财务记录</span>
                </div>
              </template>
              <div class="export-content">
                <p>导出所有财务记录，包括：</p>
                <ul>
                  <li>收入记录</li>
                  <li>支出记录</li>
                  <li>结算状态</li>
                  <li>收支明细</li>
                </ul>
                <el-button type="primary" @click="export_caiwu" :loading="loading.caiwu">
                  <el-icon><Download /></el-icon> 导出Excel
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 司机工资单导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><User /></el-icon>
                  <span>司机工资单</span>
                </div>
              </template>
              <div class="export-content">
                <p>按司机导出工资单，包括：</p>
                <ul>
                  <li>完成订单数</li>
                  <li>订单总金额</li>
                  <li>司机提成金额</li>
                  <li>结算明细</li>
                </ul>
                <el-button type="primary" @click="open_gongzidan_dialog">
                  <el-icon><Download /></el-icon> 导出工资单
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>

        <el-row :gutter="20" style="margin-top: 20px;">
          <!-- 异常记录导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><Warning /></el-icon>
                  <span>异常记录</span>
                </div>
              </template>
              <div class="export-content">
                <p>导出所有异常上报记录，包括：</p>
                <ul>
                  <li>异常类型</li>
                  <li>上报司机</li>
                  <li>处理状态</li>
                  <li>处理结果</li>
                </ul>
                <el-button type="primary" @click="export_yichang" :loading="loading.yichang">
                  <el-icon><Download /></el-icon> 导出Excel
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 操作日志导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><List /></el-icon>
                  <span>操作日志</span>
                </div>
              </template>
              <div class="export-content">
                <p>导出系统操作日志，包括：</p>
                <ul>
                  <li>操作人</li>
                  <li>操作类型</li>
                  <li>操作详情</li>
                  <li>操作时间</li>
                </ul>
                <el-button type="primary" @click="export_logs" :loading="loading.logs">
                  <el-icon><Download /></el-icon> 导出Excel
                </el-button>
              </div>
            </el-card>
          </el-col>

          <!-- 对账单导出 -->
          <el-col :span="8">
            <el-card class="export-card">
              <template #header>
                <div class="export-header">
                  <el-icon><DocumentChecked /></el-icon>
                  <span>对账单</span>
                </div>
              </template>
              <div class="export-content">
                <p>导出甲方对账单，包括：</p>
                <ul>
                  <li>订单明细</li>
                  <li>金额汇总</li>
                  <li>打卡记录</li>
                  <li>结算信息</li>
                </ul>
                <el-button type="primary" @click="open_duizhangdan_dialog">
                  <el-icon><Download /></el-icon> 导出对账单
                </el-button>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-card>

      <!-- 工资单导出弹窗 -->
      <el-dialog title="导出司机工资单" v-model="gongzidan_dialog_visible" width="500px">
        <el-form :model="gongzidan_form" label-width="100px">
          <el-form-item label="选择司机">
            <el-select v-model="gongzidan_form.siji_id" placeholder="请选择司机" style="width: 100%;">
              <el-option label="全部司机" :value="null" />
              <el-option v-for="siji in siji_list" :key="siji.id" :label="siji.xingming" :value="siji.id" />
            </el-select>
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="gongzidan_form.kaishi_riqi" type="date" placeholder="选择开始日期" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker v-model="gongzidan_form.jieshu_riqi" type="date" placeholder="选择结束日期" style="width: 100%;" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="gongzidan_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="export_gongzidan" :loading="loading.gongzidan">导出</el-button>
        </template>
      </el-dialog>

      <!-- 对账单导出弹窗 -->
      <el-dialog title="导出对账单" v-model="duizhangdan_dialog_visible" width="500px">
        <el-form :model="duizhangdan_form" label-width="100px">
          <el-form-item label="甲方名称">
            <el-input v-model="duizhangdan_form.jiafang" placeholder="请输入甲方名称" />
          </el-form-item>
          <el-form-item label="开始日期">
            <el-date-picker v-model="duizhangdan_form.kaishi_riqi" type="date" placeholder="选择开始日期" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="结束日期">
            <el-date-picker v-model="duizhangdan_form.jieshu_riqi" type="date" placeholder="选择结束日期" style="width: 100%;" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="duizhangdan_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="export_duizhangdan" :loading="loading.duizhangdan">导出</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Document, Money, User, Warning, List, DocumentChecked, Download } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { log_daochu_action } from '~/utils/caozuo-log'

const loading = ref({
  orders: false,
  caiwu: false,
  yichang: false,
  logs: false,
  gongzidan: false,
  duizhangdan: false
})

const gongzidan_dialog_visible = ref(false)
const duizhangdan_dialog_visible = ref(false)

const gongzidan_form = ref({
  siji_id: null,
  kaishi_riqi: null,
  jieshu_riqi: null
})

const duizhangdan_form = ref({
  jiafang: '',
  kaishi_riqi: null,
  jieshu_riqi: null
})

const siji_list = ref([
  { id: 1, xingming: '王师傅' },
  { id: 2, xingming: '赵师傅' },
  { id: 3, xingming: '李师傅' }
])

// 导出订单数据
function export_orders() {
  loading.value.orders = true
  setTimeout(() => {
    const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
    const data = orders.map((order: any) => ({
      '订单号': order.dingdanhao,
      '乘客': order.chengke,
      '司机': order.siji || '未指派',
      '始发地': order.shifadi,
      '目的地': order.mudedi,
      '金额': order.jine,
      '司机提成': order.siji_ticheng || '-',
      '提成比例': order.ticheng_bili ? order.ticheng_bili + '%' : '-',
      '状态': get_status_text(order.zhuangtai),
      '创建时间': order.chuangjian_shijian
    }))
    export_to_excel(data, '订单数据', '订单数据')
    loading.value.orders = false
    ElMessage.success('订单数据导出成功')
  }, 1000)
}

// 导出财务记录
function export_caiwu() {
  loading.value.caiwu = true
  setTimeout(() => {
    const caiwu = JSON.parse(localStorage.getItem('caiwu_list') || '[]')
    const data = caiwu.map((item: any) => ({
      'ID': item.id,
      '类型': item.leixing === 1 ? '收入' : '支出',
      '项目': item.xiangmu,
      '金额': item.jine,
      '收付方': item.shoufu_fang || '-',
      '结算状态': item.jiezhang_zhuangtai === 1 ? '已结算' : '未结算',
      '时间': item.shijian
    }))
    export_to_excel(data, '财务记录', '财务记录')
    loading.value.caiwu = false
    ElMessage.success('财务记录导出成功')
  }, 1000)
}

// 导出异常记录
function export_yichang() {
  loading.value.yichang = true
  setTimeout(() => {
    const yichang = JSON.parse(localStorage.getItem('yichang_list') || '[]')
    const data = yichang.map((item: any) => ({
      'ID': item.id,
      '订单号': item.dingdan,
      '司机': item.siji,
      '异常类型': item.leixing,
      '描述': item.miaoshu,
      '状态': item.zhuangtai === 2 ? '已处理' : (item.zhuangtai === 1 ? '处理中' : '未处理'),
      '上报时间': item.shijian,
      '处理时间': item.chuli_shijian || '-'
    }))
    export_to_excel(data, '异常记录', '异常记录')
    loading.value.yichang = false
    ElMessage.success('异常记录导出成功')
  }, 1000)
}

// 导出操作日志
function export_logs() {
  loading.value.logs = true
  setTimeout(() => {
    // 收集所有订单的操作日志
    const all_logs: any[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith('order_logs_')) {
        const logs = JSON.parse(localStorage.getItem(key) || '[]')
        all_logs.push(...logs)
      }
    }
    
    const data = all_logs.map((log: any) => ({
      '操作标题': log.biaoti,
      '操作内容': log.neirong,
      '操作人': log.caozuoren,
      '操作时间': log.shijian
    }))
    export_to_excel(data, '操作日志', '操作日志')
    loading.value.logs = false
    ElMessage.success('操作日志导出成功')
  }, 1000)
}

// 打开工资单导出弹窗
function open_gongzidan_dialog() {
  gongzidan_form.value = {
    siji_id: null,
    kaishi_riqi: null,
    jieshu_riqi: null
  }
  gongzidan_dialog_visible.value = true
}

// 导出工资单
function export_gongzidan() {
  loading.value.gongzidan = true
  setTimeout(() => {
    const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
    const filtered_orders = orders.filter((order: any) => {
      if (gongzidan_form.value.siji_id && order.siji_id !== gongzidan_form.value.siji_id) return false
      if (gongzidan_form.value.kaishi_riqi && new Date(order.chuangjian_shijian) < new Date(gongzidan_form.value.kaishi_riqi)) return false
      if (gongzidan_form.value.jieshu_riqi && new Date(order.chuangjian_shijian) > new Date(gongzidan_form.value.jieshu_riqi)) return false
      return order.zhuangtai === 5 // 只统计已完成订单
    })

    // 按司机分组统计
    const siji_stats: any = {}
    filtered_orders.forEach((order: any) => {
      const siji_id = order.siji_id
      if (!siji_stats[siji_id]) {
        siji_stats[siji_id] = {
          siji: order.siji,
          dingdan_shu: 0,
          zongjine: 0,
          ticheng_jine: 0
        }
      }
      siji_stats[siji_id].dingdan_shu++
      siji_stats[siji_id].zongjine += parseFloat(order.jine.replace('¥', ''))
      siji_stats[siji_id].ticheng_jine += parseFloat((order.siji_ticheng || '¥0').replace('¥', ''))
    })

    const data = Object.values(siji_stats).map((stats: any) => ({
      '司机': stats.siji,
      '完成订单数': stats.dingdan_shu,
      '订单总金额': '¥' + stats.zongjine.toFixed(2),
      '司机提成金额': '¥' + stats.ticheng_jine.toFixed(2)
    }))

    export_to_excel(data, '司机工资单', '司机工资单')
    loading.value.gongzidan = false
    gongzidan_dialog_visible.value = false
    ElMessage.success('工资单导出成功')
  }, 1000)
}

// 打开对账单导出弹窗
function open_duizhangdan_dialog() {
  duizhangdan_form.value = {
    jiafang: '',
    kaishi_riqi: null,
    jieshu_riqi: null
  }
  duizhangdan_dialog_visible.value = true
}

// 导出对账单
function export_duizhangdan() {
  loading.value.duizhangdan = true
  setTimeout(() => {
    const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
    const filtered_orders = orders.filter((order: any) => {
      if (duizhangdan_form.value.kaishi_riqi && new Date(order.chuangjian_shijian) < new Date(duizhangdan_form.value.kaishi_riqi)) return false
      if (duizhangdan_form.value.jieshu_riqi && new Date(order.chuangjian_shijian) > new Date(duizhangdan_form.value.jieshu_riqi)) return false
      return order.zhuangtai === 5 // 只统计已完成订单
    })

    const data = filtered_orders.map((order: any) => ({
      '订单号': order.dingdanhao,
      '乘客': order.chengke,
      '司机': order.siji,
      '始发地': order.shifadi,
      '目的地': order.mudedi,
      '金额': order.jine,
      '完成时间': order.wancheng_shijian
    }))

    // 添加汇总行
    const total = filtered_orders.reduce((sum: number, order: any) => sum + parseFloat(order.jine.replace('¥', '')), 0)
    data.push({
      '订单号': '合计',
      '乘客': '',
      '司机': '',
      '始发地': '',
      '目的地': '',
      '金额': '¥' + total.toFixed(2),
      '完成时间': ''
    })

    export_to_excel(data, `对账单_${duizhangdan_form.value.jiafang || '甲方'}`)
    loading.value.duizhangdan = false
    duizhangdan_dialog_visible.value = false
    ElMessage.success('对账单导出成功')
  }, 1000)
}

// 通用导出Excel函数
function export_to_excel(data: any[], filename: string, type: string = '数据') {
  if (data.length === 0) {
    ElMessage.warning('没有数据可导出')
    return
  }

  // 记录操作日志
  log_daochu_action(type, data.length)

  // 创建CSV内容
  const headers = Object.keys(data[0])
  const csv_content = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = (row as any)[h]
      // 处理包含逗号的内容
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`
      }
      return val
    }).join(','))
  ].join('\n')

  // 创建下载链接
  const blob = new Blob(['\ufeff' + csv_content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${filename}_${new Date().toLocaleDateString()}.csv`
  link.click()
}

// 获取状态文本
function get_status_text(zhuangtai: number) {
  const status_map: Record<number, string> = {
    0: '待指派',
    1: '已指派',
    2: '已拒单',
    3: '已接单',
    4: '进行中',
    5: '已完成',
    6: '已取消'
  }
  return status_map[zhuangtai] || '未知'
}
</script>

<style scoped>
.daochu-page {
  padding: 0;
}

.card-header {
  font-size: 18px;
  font-weight: bold;
}

.export-card {
  height: 100%;
}

.export-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
}

.export-content {
  p {
    margin: 0 0 10px 0;
    color: #606266;
  }

  ul {
    margin: 0 0 20px 0;
    padding-left: 20px;
    color: #909399;
    font-size: 14px;
  }

  li {
    margin-bottom: 5px;
  }
}
</style>
