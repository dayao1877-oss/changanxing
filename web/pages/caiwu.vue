<template>
  <Layout>
    <div class="caiwu-page">
      <el-card>
        <div class="table-toolbar">
          <div class="left-actions">
            <el-button type="primary" @click="open_caiwu_dialog()">
              <el-icon><Plus /></el-icon> 添加记录
            </el-button>
            <el-button type="success" @click="open_jiesuan_dialog()">
              <el-icon><Money /></el-icon> 订单结算
            </el-button>
            <el-button type="warning" @click="open_duizhang_dialog()">
              <el-icon><Document /></el-icon> 生成对账单
            </el-button>
          </div>
          <div class="filters">
            <el-select v-model="filter_type" placeholder="类型" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="收入" :value="1" />
              <el-option label="支出" :value="2" />
            </el-select>
            <el-select v-model="filter_status" placeholder="状态" clearable style="width: 120px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="未结算" :value="0" />
              <el-option label="已结算" :value="1" />
            </el-select>
            <el-date-picker
              v-model="filter_date_range"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 240px;"
            />
          </div>
        </div>

        <!-- 统计卡片 -->
        <el-row :gutter="20" style="margin: 20px 0;">
          <el-col :span="6">
            <el-card class="stat-card income">
              <div class="stat-label">总收入</div>
              <div class="stat-value">{{ total_income }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card expense">
              <div class="stat-label">总支出</div>
              <div class="stat-value">{{ total_expense }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card profit">
              <div class="stat-label">净利润</div>
              <div class="stat-value">{{ net_profit }}</div>
            </el-card>
          </el-col>
          <el-col :span="6">
            <el-card class="stat-card pending">
              <div class="stat-label">待结算</div>
              <div class="stat-value">{{ pending_count }} 笔</div>
            </el-card>
          </el-col>
        </el-row>

        <el-table :data="filtered_caiwu_list" style="width: 100%;" v-loading="loading">
          <el-table-column prop="id" label="ID" width="80" />
          <el-table-column prop="dingdan" label="关联订单" width="150" />
          <el-table-column prop="leixing" label="类型" width="100">
            <template #default="{ row }">
              <el-tag :type="row.leixing === 1 ? 'success' : 'danger'">
                {{ row.leixing === 1 ? '收入' : '支出' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="jine" label="金额" width="120" />
          <el-table-column prop="siji_ticheng" label="司机提成" width="120">
            <template #default="{ row }">
              <span v-if="row.siji_ticheng">{{ row.siji_ticheng }}</span>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column prop="xiangmu" label="项目" />
          <el-table-column prop="zhuangtai" label="结算状态" width="100">
            <template #default="{ row }">
              <el-tag :type="row.zhuangtai === 1 ? 'success' : 'warning'">
                {{ row.zhuangtai === 1 ? '已结算' : '未结算' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="shijian" label="时间" width="170" />
          <el-table-column label="操作" width="250">
            <template #default="{ row }">
              <el-button size="small" @click="view_detail(row)">查看</el-button>
              <el-button size="small" type="warning" v-if="row.zhuangtai === 0" @click="jiesuan(row)">结算</el-button>
              <el-button size="small" type="danger" @click="delete_record(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          v-model:current-page="current_page"
          v-model:page-size="page_size"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          layout="total, sizes, prev, pager, next"
          style="margin-top: 20px; justify-content: flex-end;"
        />
      </el-card>

      <!-- 添加财务记录弹窗 -->
      <el-dialog title="添加财务记录" v-model="caiwu_dialog_visible" width="500px">
        <el-form :model="caiwu_form" label-width="100px">
          <el-form-item label="类型">
            <el-radio-group v-model="caiwu_form.leixing">
              <el-radio :label="1">收入</el-radio>
              <el-radio :label="2">支出</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="关联订单">
            <el-input v-model="caiwu_form.dingdan" placeholder="请输入订单号（选填）" />
          </el-form-item>
          <el-form-item label="金额">
            <el-input-number v-model="caiwu_form.jine" :min="0" :precision="2" style="width: 100%;" />
          </el-form-item>
          <el-form-item label="项目">
            <el-select v-model="caiwu_form.xiangmu" placeholder="请选择项目" style="width: 100%;">
              <el-option label="订单收入" value="订单收入" />
              <el-option label="车辆油费" value="车辆油费" />
              <el-option label="车辆维修" value="车辆维修" />
              <el-option label="司机工资" value="司机工资" />
              <el-option label="过路费" value="过路费" />
              <el-option label="停车费" value="停车费" />
              <el-option label="其他收入" value="其他收入" />
              <el-option label="其他支出" value="其他支出" />
            </el-select>
          </el-form-item>
          <el-form-item label="备注">
            <el-input v-model="caiwu_form.beizhu" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="caiwu_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_caiwu()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 订单结算弹窗 -->
      <el-dialog title="订单结算" v-model="jiesuan_dialog_visible" width="600px">
        <el-form :model="jiesuan_form" label-width="100px">
          <el-form-item label="选择订单">
            <el-select v-model="jiesuan_form.dingdan_id" placeholder="请选择待结算订单" style="width: 100%;" @change="on_order_select">
              <el-option
                v-for="order in pending_orders"
                :key="order.id"
                :label="`${order.dingdanhao} - ${order.shifadi} → ${order.mudedi}`"
                :value="order.id"
              />
            </el-select>
          </el-form-item>
          
          <el-divider>订单信息</el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单金额">
                <el-input :value="jiesuan_form.jine" disabled>
                  <template #append>元</template>
                </el-input>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单距离">
                <el-input :value="jiesuan_form.juli" disabled>
                  <template #append>公里</template>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="司机">
                <el-input :value="jiesuan_form.siji" disabled />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="司机提成">
                <el-input-number v-model="jiesuan_form.siji_ticheng" :min="0" :max="jiesuan_form.jine" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          
          <el-form-item label="平台收入">
            <el-input :value="platform_income" disabled>
              <template #append>元</template>
            </el-input>
          </el-form-item>
          
          <el-form-item label="结算备注">
            <el-input v-model="jiesuan_form.beizhu" type="textarea" placeholder="请输入结算备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="jiesuan_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="confirm_jiesuan()">确认结算</el-button>
        </template>
      </el-dialog>

      <!-- 生成对账单弹窗 -->
      <el-dialog title="生成对账单" v-model="duizhang_dialog_visible" width="500px">
        <el-form :model="duizhang_form" label-width="100px">
          <el-form-item label="对账类型">
            <el-radio-group v-model="duizhang_form.leixing">
              <el-radio label="jiafang">甲方对账单</el-radio>
              <el-radio label="siji">司机工资单</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="时间范围">
            <el-date-picker
              v-model="duizhang_form.date_range"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 100%;"
            />
          </el-form-item>
          <el-form-item label="导出格式">
            <el-radio-group v-model="duizhang_form.format">
              <el-radio label="excel">Excel</el-radio>
              <el-radio label="pdf">PDF</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="duizhang_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="preview_duizhang()">预览对账单</el-button>
        </template>
      </el-dialog>

      <!-- 对账单预览弹窗 -->
      <el-dialog :title="duizhang_preview_title" v-model="duizhang_preview_visible" width="1000px">
        <div class="duizhang-preview">
          <!-- 对账单头部信息 -->
          <div class="duizhang-header">
            <h3>{{ duizhang_form.leixing === 'jiafang' ? '甲方对账单' : '司机工资单' }}</h3>
            <p class="duizhang-period">对账周期：{{ duizhang_form.date_range?.[0] ? new Date(duizhang_form.date_range[0]).toLocaleDateString() : '' }} 至 {{ duizhang_form.date_range?.[1] ? new Date(duizhang_form.date_range[1]).toLocaleDateString() : '' }}</p>
            <p class="duizhang-summary">订单总数：{{ duizhang_data.length }} 笔 | 总金额：¥{{ duizhang_total.toFixed(2) }}</p>
          </div>

          <!-- 对账单表格 -->
          <el-table :data="duizhang_data" border size="small" style="width: 100%;">
            <el-table-column type="index" label="序号" width="50" />
            <el-table-column prop="dingdanhao" label="订单号" width="140" />
            <el-table-column prop="shifadi" label="始发地" width="150" />
            <el-table-column prop="mudedi" label="目的地" width="150" />
            <el-table-column prop="juli" label="距离" width="100" />
            <el-table-column prop="jine" label="订单金额" width="100" />
            <el-table-column prop="siji_ticheng" label="司机提成" width="100" v-if="duizhang_form.leixing === 'jiafang'" />
            <el-table-column prop="pingtai_shouru" label="平台收入" width="100" v-if="duizhang_form.leixing === 'jiafang'" />
            <el-table-column prop="siji_shouru" label="司机收入" width="100" v-if="duizhang_form.leixing === 'siji'" />
            <el-table-column label="打卡记录" width="100">
              <template #default="{ row }">
                <el-button size="small" type="text" @click="showDuizhangDaka(row)">查看({{ row.daka_count }})</el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 打卡记录详情 -->
          <div v-if="current_duizhang_row" class="daka-detail-section">
            <el-divider content-position="left">订单 {{ current_duizhang_row.dingdanhao }} - 打卡记录</el-divider>
            <el-timeline>
              <el-timeline-item
                v-for="(daka, index) in current_duizhang_row.daka_jilu"
                :key="index"
                :type="daka.leixing === '起点' ? 'primary' : daka.leixing === '终点' ? 'success' : 'warning'"
              >
                <div class="daka-item">
                  <div class="daka-title">{{ daka.leixing }} - {{ daka.shijian }}</div>
                  <div class="daka-content">
                    <p><strong>位置：</strong>{{ daka.dizhi }}</p>
                    <p><strong>坐标：</strong>{{ daka.jingdu.toFixed(6) }}, {{ daka.weidu.toFixed(6) }}</p>
                    <p v-if="daka.luxian"><strong>路线：</strong>{{ daka.luxian }}</p>
                    <p v-if="daka.juli"><strong>已行驶：</strong>{{ daka.juli }}</p>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
        </div>
        <template #footer>
          <el-button @click="duizhang_preview_visible = false">关闭</el-button>
          <el-button type="primary" @click="export_duizhang()">导出{{ duizhang_form.format.toUpperCase() }}</el-button>
        </template>
      </el-dialog>

      <!-- 详情查看弹窗 -->
      <el-dialog title="财务记录详情" v-model="detail_dialog_visible" width="800px">
        <div v-if="current_detail.id">
          <!-- 财务基本信息 -->
          <el-divider content-position="left">财务信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录ID">{{ current_detail.id }}</el-descriptions-item>
            <el-descriptions-item label="关联订单">{{ current_detail.dingdan || '-' }}</el-descriptions-item>
            <el-descriptions-item label="类型">
              <el-tag :type="current_detail.leixing === 1 ? 'success' : 'danger'">
                {{ current_detail.leixing === 1 ? '收入' : '支出' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="项目">{{ current_detail.xiangmu }}</el-descriptions-item>
            <el-descriptions-item label="金额">¥{{ current_detail.jine }}</el-descriptions-item>
            <el-descriptions-item label="司机提成">¥{{ current_detail.siji_ticheng || 0 }}</el-descriptions-item>
            <el-descriptions-item label="平台收入">¥{{ (current_detail.jine - (current_detail.siji_ticheng || 0)).toFixed(2) }}</el-descriptions-item>
            <el-descriptions-item label="结算状态">
              <el-tag :type="current_detail.zhuangtai === 1 ? 'success' : 'warning'">
                {{ current_detail.zhuangtai === 1 ? '已结算' : '未结算' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ current_detail.shijian }}</el-descriptions-item>
            <el-descriptions-item label="结算时间">{{ current_detail.jiesuan_shijian || '-' }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ current_detail.beizhu || '-' }}</el-descriptions-item>
          </el-descriptions>

          <!-- 订单详细信息 -->
          <template v-if="current_detail.order_info">
            <el-divider content-position="left">订单信息</el-divider>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单号">{{ current_detail.order_info.dingdanhao }}</el-descriptions-item>
              <el-descriptions-item label="订单状态">
                <el-tag :type="getOrderStatusType(current_detail.order_info.zhuangtai)">
                  {{ getOrderStatusLabel(current_detail.order_info.zhuangtai) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="乘客">{{ current_detail.order_info.chengke }}</el-descriptions-item>
              <el-descriptions-item label="联系电话">{{ current_detail.order_info.chengke_shouji }}</el-descriptions-item>
              <el-descriptions-item label="司机">{{ current_detail.order_info.siji }}</el-descriptions-item>
              <el-descriptions-item label="车牌号">{{ current_detail.order_info.chepai }}</el-descriptions-item>
              <el-descriptions-item label="始发地">{{ current_detail.order_info.shifadi }}</el-descriptions-item>
              <el-descriptions-item label="目的地">{{ current_detail.order_info.mudedi }}</el-descriptions-item>
              <el-descriptions-item label="订单距离">{{ current_detail.order_info.juli }}</el-descriptions-item>
              <el-descriptions-item label="乘客人数">{{ current_detail.order_info.renshu }}人</el-descriptions-item>
              <el-descriptions-item label="行李件数">{{ current_detail.order_info.xinglijian }}件</el-descriptions-item>
              <el-descriptions-item label="创建时间">{{ current_detail.order_info.chuangjian_shijian }}</el-descriptions-item>
              <el-descriptions-item label="开始时间">{{ current_detail.order_info.kaishi_shijian || '-' }}</el-descriptions-item>
              <el-descriptions-item label="完成时间">{{ current_detail.order_info.wancheng_shijian || '-' }}</el-descriptions-item>
              <el-descriptions-item label="订单备注" :span="2">{{ current_detail.order_info.beizhu || '-' }}</el-descriptions-item>
            </el-descriptions>

            <!-- 打卡记录 -->
            <el-divider content-position="left">打卡记录</el-divider>
            <el-timeline v-if="current_detail.order_info.daka_jilu && current_detail.order_info.daka_jilu.length > 0">
              <el-timeline-item
                v-for="(daka, index) in current_detail.order_info.daka_jilu"
                :key="index"
                :type="daka.leixing === '起点' ? 'primary' : daka.leixing === '终点' ? 'success' : 'warning'"
                :icon="daka.leixing === '起点' ? 'Location' : daka.leixing === '终点' ? 'Check' : 'Timer'"
              >
                <div class="daka-item">
                  <div class="daka-title">{{ daka.leixing }} - {{ daka.shijian }}</div>
                  <div class="daka-content">
                    <p><strong>位置：</strong>{{ daka.dizhi }}</p>
                    <p><strong>坐标：</strong>{{ daka.jingdu }}, {{ daka.weidu }}</p>
                    <p v-if="daka.luxian"><strong>路线：</strong>{{ daka.luxian }}</p>
                    <p v-if="daka.juli"><strong>已行驶：</strong>{{ daka.juli }}</p>
                    <p v-if="daka.beizhu"><strong>备注：</strong>{{ daka.beizhu }}</p>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
            <el-empty v-else description="暂无打卡记录" />
          </template>
        </div>
        <template #footer>
          <el-button @click="detail_dialog_visible = false">关闭</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Money, Document } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'

const loading = ref(false)
const current_page = ref(1)
const page_size = ref(10)
const total = ref(0)
const filter_type = ref<number | null>(null)
const filter_status = ref<number | null>(null)
const filter_date_range = ref<[Date, Date] | null>(null)

// 弹窗控制
const caiwu_dialog_visible = ref(false)
const jiesuan_dialog_visible = ref(false)
const duizhang_dialog_visible = ref(false)
const detail_dialog_visible = ref(false)

// 表单数据
const caiwu_form = ref({
  leixing: 1,
  dingdan: '',
  jine: 0,
  xiangmu: '',
  beizhu: ''
})

const jiesuan_form = ref({
  dingdan_id: null,
  jine: 0,
  juli: '',
  siji: '',
  siji_ticheng: 0,
  beizhu: ''
})

const duizhang_form = ref({
  leixing: 'jiafang',
  date_range: null as [Date, Date] | null,
  format: 'excel'
})

const duizhang_preview_visible = ref(false)
const duizhang_preview_title = ref('')
const duizhang_data = ref<any[]>([])
const current_duizhang_row = ref<any>(null)

const current_detail = ref<any>({})

// 财务列表数据
const caiwu_list = ref([
  { id: 1, dingdan: 'DD20240424001', leixing: 1, jine: 128.00, siji_ticheng: 77.00, xiangmu: '订单收入', zhuangtai: 1, shijian: '2024-04-24 11:00:00', beizhu: '' },
  { id: 2, dingdan: 'DD20240424002', leixing: 1, jine: 89.50, siji_ticheng: 54.00, xiangmu: '订单收入', zhuangtai: 0, shijian: '2024-04-24 12:30:00', beizhu: '' },
  { id: 3, dingdan: '', leixing: 2, jine: 50.00, siji_ticheng: null, xiangmu: '车辆油费', zhuangtai: 1, shijian: '2024-04-24 09:00:00', beizhu: '' },
  { id: 4, dingdan: 'DD20240424003', leixing: 1, jine: 156.00, siji_ticheng: 94.00, xiangmu: '订单收入', zhuangtai: 0, shijian: '2024-04-24 14:00:00', beizhu: '' }
])

// 模拟待结算订单列表
const pending_orders = ref([
  { id: 2, dingdanhao: 'DD20240424002', shifadi: '大雁塔', mudedi: '华清宫', jine: 89.50, juli: '28.90公里', siji: '李师傅' },
  { id: 4, dingdanhao: 'DD20240424004', shifadi: '小寨', mudedi: '高新路', jine: 156.00, juli: '6.80公里', siji: '张师傅' }
])

// 计算属性
const filtered_caiwu_list = computed(() => {
  let result = [...caiwu_list.value]
  
  if (filter_type.value !== null) {
    result = result.filter(item => item.leixing === filter_type.value)
  }
  
  if (filter_status.value !== null) {
    result = result.filter(item => item.zhuangtai === filter_status.value)
  }
  
  total.value = result.length
  return result
})

const total_income = computed(() => {
  const income = caiwu_list.value
    .filter(item => item.leixing === 1)
    .reduce((sum, item) => sum + Number(item.jine), 0)
  return `¥${income.toFixed(2)}`
})

const total_expense = computed(() => {
  const expense = caiwu_list.value
    .filter(item => item.leixing === 2)
    .reduce((sum, item) => sum + Number(item.jine), 0)
  return `¥${expense.toFixed(2)}`
})

const net_profit = computed(() => {
  const income = caiwu_list.value
    .filter(item => item.leixing === 1)
    .reduce((sum, item) => sum + Number(item.jine), 0)
  const expense = caiwu_list.value
    .filter(item => item.leixing === 2)
    .reduce((sum, item) => sum + Number(item.jine), 0)
  const profit = income - expense
  return `¥${profit.toFixed(2)}`
})

const pending_count = computed(() => {
  return caiwu_list.value.filter(item => item.zhuangtai === 0).length
})

const platform_income = computed(() => {
  const jine = Number(jiesuan_form.value.jine) || 0
  const ticheng = Number(jiesuan_form.value.siji_ticheng) || 0
  return (jine - ticheng).toFixed(2)
})

const duizhang_total = computed(() => {
  return duizhang_data.value.reduce((sum, item) => sum + Number(item.jine), 0)
})

// 方法
function open_caiwu_dialog() {
  caiwu_form.value = {
    leixing: 1,
    dingdan: '',
    jine: 0,
    xiangmu: '',
    beizhu: ''
  }
  caiwu_dialog_visible.value = true
}

function save_caiwu() {
  if (caiwu_form.value.jine <= 0) {
    ElMessage.warning('请输入有效金额')
    return
  }
  if (!caiwu_form.value.xiangmu) {
    ElMessage.warning('请选择项目')
    return
  }
  
  const new_record = {
    id: caiwu_list.value.length + 1,
    dingdan: caiwu_form.value.dingdan,
    leixing: caiwu_form.value.leixing,
    jine: caiwu_form.value.jine,
    siji_ticheng: null,
    xiangmu: caiwu_form.value.xiangmu,
    zhuangtai: 0,
    shijian: new Date().toLocaleString(),
    beizhu: caiwu_form.value.beizhu
  }
  
  caiwu_list.value.unshift(new_record)
  caiwu_dialog_visible.value = false
  ElMessage.success('添加成功')
}

function open_jiesuan_dialog() {
  jiesuan_form.value = {
    dingdan_id: null,
    jine: 0,
    juli: '',
    siji: '',
    siji_ticheng: 0,
    beizhu: ''
  }
  jiesuan_dialog_visible.value = true
}

function on_order_select(order_id: number) {
  const order = pending_orders.value.find(o => o.id === order_id)
  if (order) {
    jiesuan_form.value.jine = order.jine
    jiesuan_form.value.juli = order.juli
    jiesuan_form.value.siji = order.siji
    jiesuan_form.value.siji_ticheng = Math.round(order.jine * 0.6 * 100) / 100
  }
}

async function confirm_jiesuan() {
  if (!jiesuan_form.value.dingdan_id) {
    ElMessage.warning('请选择订单')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确认结算此订单？\n订单金额：¥${jiesuan_form.value.jine}\n司机提成：¥${jiesuan_form.value.siji_ticheng}\n平台收入：¥${platform_income.value}`,
      '确认结算',
      { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' }
    )
    
    // 更新订单结算状态
    const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
    const order = orders.find((o: any) => o.id === jiesuan_form.value.dingdan_id)
    if (order) {
      order.zhuangtai = 5  // 已完成状态
      order.jiesuan_zhuangtai = 1  // 已结算
      localStorage.setItem('order_list', JSON.stringify(orders))
    }
    
    // 同时更新财务记录状态
    const record = caiwu_list.value.find(r => r.dingdan === jiesuan_form.value.dingdan_id)
    if (record) {
      record.zhuangtai = 1
    }
    
    jiesuan_dialog_visible.value = false
    ElMessage.success('结算成功')
  } catch {
    // 用户取消
  }
}

function jiesuan(row: any) {
  current_detail.value = row
  jiesuan_form.value = {
    dingdan_id: row.id,
    jine: row.jine,
    juli: '',
    siji: '',
    siji_ticheng: row.siji_ticheng || Math.round(row.jine * 0.6 * 100) / 100,
    beizhu: ''
  }
  jiesuan_dialog_visible.value = true
}

function open_duizhang_dialog() {
  duizhang_form.value = {
    leixing: 'jiafang',
    date_range: null,
    format: 'excel'
  }
  duizhang_dialog_visible.value = true
}

function generate_duizhang() {
  if (!duizhang_form.value.date_range) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  ElMessage.success(`正在生成${duizhang_form.value.leixing === 'jiafang' ? '甲方对账单' : '司机工资单'}，格式：${duizhang_form.value.format.toUpperCase()}`)
  duizhang_dialog_visible.value = false
}

function preview_duizhang() {
  if (!duizhang_form.value.date_range) {
    ElMessage.warning('请选择时间范围')
    return
  }
  
  // 生成模拟对账单数据
  duizhang_preview_title.value = duizhang_form.value.leixing === 'jiafang' ? '甲方对账单预览' : '司机工资单预览'
  
  duizhang_data.value = [
    {
      dingdanhao: 'DD20240424001',
      shifadi: '西安北站',
      mudedi: '秦始皇兵马俑博物馆',
      juli: '34.56公里',
      jine: 128.00,
      siji_ticheng: 77.00,
      pingtai_shouru: 51.00,
      siji_shouru: 77.00,
      daka_count: 4,
      daka_jilu: [
        {
          leixing: '起点',
          shijian: '2024-04-24 11:00:00',
          dizhi: '陕西省西安市未央区西安北站',
          jingdu: 108.957238,
          weidu: 34.386166,
          luxian: null,
          juli: null
        },
        {
          leixing: '途径点1',
          shijian: '2024-04-24 11:25:00',
          dizhi: '陕西省西安市新城区辛家庙',
          jingdu: 108.948123,
          weidu: 34.352345,
          luxian: '环城北路',
          juli: '12.5公里'
        },
        {
          leixing: '途径点2',
          shijian: '2024-04-24 11:50:00',
          dizhi: '陕西省西安市灞桥区十里铺',
          jingdu: 109.012345,
          weidu: 34.356789,
          luxian: '东三环',
          juli: '25.3公里'
        },
        {
          leixing: '终点',
          shijian: '2024-04-24 12:30:00',
          dizhi: '陕西省西安市临潼区秦始皇兵马俑博物馆',
          jingdu: 109.279333,
          weidu: 34.384123,
          luxian: '连霍高速',
          juli: '34.56公里'
        }
      ]
    },
    {
      dingdanhao: 'DD20240424002',
      shifadi: '大雁塔',
      mudedi: '华清宫',
      juli: '28.90公里',
      jine: 89.50,
      siji_ticheng: 54.00,
      pingtai_shouru: 35.50,
      siji_shouru: 54.00,
      daka_count: 3,
      daka_jilu: [
        {
          leixing: '起点',
          shijian: '2024-04-24 14:00:00',
          dizhi: '陕西省西安市雁塔区大雁塔',
          jingdu: 108.965705,
          weidu: 34.217619,
          luxian: null,
          juli: null
        },
        {
          leixing: '途径点',
          shijian: '2024-04-24 14:20:00',
          dizhi: '陕西省西安市灞桥区半坡',
          jingdu: 109.015678,
          weidu: 34.289012,
          luxian: '东二环',
          juli: '15.2公里'
        },
        {
          leixing: '终点',
          shijian: '2024-04-24 14:45:00',
          dizhi: '陕西省西安市临潼区华清宫',
          jingdu: 109.225338,
          weidu: 34.367566,
          luxian: '秦唐大道',
          juli: '28.90公里'
        }
      ]
    }
  ]
  
  current_duizhang_row.value = null
  duizhang_preview_visible.value = true
  duizhang_dialog_visible.value = false
}

function showDuizhangDaka(row: any) {
  current_duizhang_row.value = row
}

function export_duizhang() {
  ElMessage.success(`正在导出${duizhang_form.value.format.toUpperCase()}文件...`)
  // 实际导出逻辑需要后端支持
}

function view_detail(row: any) {
  // 加载关联的订单详情（模拟数据）
  if (row.dingdan) {
    row.order_info = {
      dingdanhao: row.dingdan,
      zhuangtai: 5, // 已完成
      chengke: '张三',
      chengke_shouji: '138****1234',
      siji: '王师傅',
      chepai: '陕A12345',
      shifadi: '西安北站',
      mudedi: '秦始皇兵马俑博物馆',
      juli: '34.56公里',
      renshu: 2,
      xinglijian: 3,
      chuangjian_shijian: '2024-04-24 10:30:00',
      kaishi_shijian: '2024-04-24 11:00:00',
      wancheng_shijian: '2024-04-24 12:30:00',
      beizhu: '',
      daka_jilu: [
        {
          leixing: '起点',
          shijian: '2024-04-24 11:00:00',
          dizhi: '陕西省西安市未央区西安北站',
          jingdu: 108.957238,
          weidu: 34.386166,
          luxian: null,
          juli: null,
          beizhu: '准时到达'
        },
        {
          leixing: '途径点1',
          shijian: '2024-04-24 11:25:00',
          dizhi: '陕西省西安市新城区辛家庙',
          jingdu: 108.948123,
          weidu: 34.352345,
          luxian: '环城北路',
          juli: '12.5公里',
          beizhu: null
        },
        {
          leixing: '途径点2',
          shijian: '2024-04-24 11:50:00',
          dizhi: '陕西省西安市灞桥区十里铺',
          jingdu: 109.012345,
          weidu: 34.356789,
          luxian: '东三环',
          juli: '25.3公里',
          beizhu: null
        },
        {
          leixing: '终点',
          shijian: '2024-04-24 12:30:00',
          dizhi: '陕西省西安市临潼区秦始皇兵马俑博物馆',
          jingdu: 109.279333,
          weidu: 34.384123,
          luxian: '连霍高速',
          juli: '34.56公里',
          beizhu: '安全送达'
        }
      ]
    }
  }
  current_detail.value = row
  detail_dialog_visible.value = true
}

function getOrderStatusType(status: number): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const types: ('primary' | 'success' | 'warning' | 'danger' | 'info')[] = ['warning', 'info', 'danger', 'primary', 'primary', 'success', 'info']
  return types[status] || 'info'
}

function getOrderStatusLabel(status: number) {
  const labels = ['待指派', '已指派', '已拒单', '已接单', '进行中', '已完成', '已取消']
  return labels[status] || '未知'
}

async function delete_record(row: any) {
  try {
    await ElMessageBox.confirm('确认删除此财务记录？', '警告', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    const index = caiwu_list.value.findIndex(r => r.id === row.id)
    if (index > -1) {
      caiwu_list.value.splice(index, 1)
      ElMessage.success('删除成功')
    }
  } catch {
    // 用户取消
  }
}
</script>

<style scoped>
.caiwu-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.left-actions {
  display: flex;
  gap: 10px;
}

.filters {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.stat-card {
  text-align: center;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
}

.stat-card.income .stat-value {
  color: #67c23a;
}

.stat-card.expense .stat-value {
  color: #f56c6c;
}

.stat-card.profit .stat-value {
  color: #409eff;
}

.stat-card.pending .stat-value {
  color: #e6a23c;
}

/* 详情弹窗中的打卡记录样式 */
.daka-item {
  margin-bottom: 15px;
}

.daka-title {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.daka-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.8;
}

.daka-content p {
  margin: 4px 0;
}

/* 对账单预览样式 */
.duizhang-preview {
  max-height: 600px;
  overflow-y: auto;
}

.duizhang-header {
  text-align: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.duizhang-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.duizhang-period {
  color: #606266;
  margin: 5px 0;
}

.duizhang-summary {
  color: #409eff;
  font-weight: bold;
  font-size: 16px;
  margin: 10px 0 0 0;
}

.daka-detail-section {
  margin-top: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}
</style>