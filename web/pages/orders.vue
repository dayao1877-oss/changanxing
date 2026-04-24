<template>
  <Layout>
    <div class="orders-page">
      <el-card>
        <div class="table-toolbar">
          <div class="left-actions">
            <el-button type="primary" @click="open_order_dialog()">
              <el-icon><Plus /></el-icon> 创建订单
            </el-button>
            <el-dropdown @command="handle_batch_command" v-if="selected_orders.length > 0">
              <el-button type="warning">
                批量操作({{ selected_orders.length }})<el-icon class="el-icon--right"><arrow-down /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="export">批量导出</el-dropdown-item>
                  <el-dropdown-item command="assign" :disabled="!can_batch_assign">批量指派</el-dropdown-item>
                  <el-dropdown-item command="cancel" :disabled="!can_batch_cancel">批量取消</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
          <div class="filters">
            <el-select v-model="filter_status" placeholder="订单状态" clearable style="width: 150px; margin-right: 10px;">
              <el-option label="全部" value="" />
              <el-option label="待指派" :value="0" />
              <el-option label="已指派" :value="1" />
              <el-option label="已拒单" :value="2" />
              <el-option label="已接单" :value="3" />
              <el-option label="进行中" :value="4" />
              <el-option label="已完成" :value="5" />
              <el-option label="已取消" :value="6" />
            </el-select>
            <el-input v-model="search_keyword" placeholder="搜索订单号/乘客/司机" clearable style="width: 300px;" />
          </div>
        </div>

        <el-table :data="order_list" style="width: 100%; margin-top: 20px;" @selection-change="handle_selection_change">
          <el-table-column type="selection" width="55" />
          <el-table-column prop="dingdanhao" label="订单号" width="160" />
          <el-table-column prop="chengke" label="乘客" width="120" />
          <el-table-column prop="siji" label="司机" width="120" />
          <el-table-column prop="shifadi" label="始发地" />
          <el-table-column prop="mudedi" label="目的地" />
          <el-table-column prop="jine" label="金额" width="100" />
          <el-table-column prop="zhuangtai" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="get_status_type(row.zhuangtai)">
                {{ get_status_label(row.zhuangtai) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="chuangjian_shijian" label="创建时间" width="170" />
          <el-table-column label="操作" width="400">
            <template #default="{ row }">
              <el-button size="small" @click="view_order(row)">查看</el-button>
              <el-button size="small" type="success" @click="open_assign_dialog(row)" v-if="row.zhuangtai === 0 || row.zhuangtai === 2">指派司机</el-button>
              <el-button size="small" type="warning" @click="simulate_driver_action(row, 'accept')" v-if="row.zhuangtai === 1">模拟司机接单</el-button>
              <el-button size="small" type="danger" @click="simulate_driver_action(row, 'reject')" v-if="row.zhuangtai === 1">模拟司机拒单</el-button>
              <el-button size="small" type="primary" @click="start_order(row)" v-if="row.zhuangtai === 3">开始订单</el-button>
              <el-button size="small" type="success" @click="complete_order(row)" v-if="row.zhuangtai === 4">完成订单</el-button>
              <el-button size="small" type="danger" @click="cancel_order(row)" v-if="row.zhuangtai !== 5 && row.zhuangtai !== 6">取消</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 创建订单弹窗 -->
      <el-dialog title="创建订单" v-model="order_dialog_visible" width="650px">
        <el-form :model="current_order" label-width="120px">
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="乘客姓名">
                <el-input v-model="current_order.chengke_xingming" placeholder="请输入乘客姓名" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="联系电话">
                <el-input v-model="current_order.chengke_shouji" placeholder="请输入联系电话" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="乘客人数">
                <el-input-number v-model="current_order.renshu" :min="1" :max="20" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="行李件数">
                <el-input-number v-model="current_order.xinglijian" :min="0" :max="20" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="订单日期">
                <el-date-picker v-model="current_order.dingdanriqi" type="date" placeholder="选择日期" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="订单时间">
                <el-time-picker v-model="current_order.dingdanshijian" placeholder="选择时间" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="始发地">
            <div class="sj-input-with-map">
              <el-input v-model="current_order.shifadi" placeholder="请输入或点击右侧按钮选择" readonly />
              <el-button @click="open_map_picker('start')" type="primary">选点</el-button>
            </div>
          </el-form-item>
          <el-form-item label="目的地">
            <div class="sj-input-with-map">
              <el-input v-model="current_order.mudedi" placeholder="请输入或点击右侧按钮选择" readonly />
              <el-button @click="open_map_picker('end')" type="primary">选点</el-button>
            </div>
          </el-form-item>
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="金额">
                <el-input-number v-model="current_order.jine" :min="0" :precision="2" style="width: 100%;" placeholder="请输入订单金额" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="特殊乘客">
                <el-checkbox v-model="current_order.laoren">老人</el-checkbox>
                <el-checkbox v-model="current_order.ertong" style="margin-left: 20px;">儿童</el-checkbox>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item label="备注">
            <el-input v-model="current_order.beizhu" type="textarea" placeholder="请输入备注" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="order_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_order()">保存</el-button>
        </template>
      </el-dialog>

      <!-- 查看详情弹窗 -->
      <el-dialog title="订单详情" v-model="detail_dialog_visible" width="900px">
        <div v-if="current_detail.dingdanhao">
          <!-- 基本信息 -->
          <el-divider content-position="left">基本信息</el-divider>
          <el-descriptions :column="2" border>
            <el-descriptions-item label="订单号">{{ current_detail.dingdanhao }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="get_status_type(current_detail.zhuangtai)">
                {{ get_status_label(current_detail.zhuangtai) }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="乘客姓名">{{ current_detail.chengke_xingming || current_detail.chengke || '-' }}</el-descriptions-item>
            <el-descriptions-item label="联系电话">{{ current_detail.chengke_shouji || '-' }}</el-descriptions-item>
            <el-descriptions-item label="乘客人数">{{ current_detail.renshu || 1 }}人</el-descriptions-item>
            <el-descriptions-item label="行李件数">{{ current_detail.xinglijian || 0 }}件</el-descriptions-item>
            <el-descriptions-item label="司机">{{ current_detail.siji || '未指派' }}</el-descriptions-item>
            <el-descriptions-item label="车牌号">{{ current_detail.chepai || '-' }}</el-descriptions-item>
            <el-descriptions-item label="距离">{{ current_detail.juli || '-' }}</el-descriptions-item>
            <el-descriptions-item label="金额">{{ current_detail.jine }}</el-descriptions-item>
            <el-descriptions-item label="特殊乘客">
              <span v-if="current_detail.laoren" style="margin-right: 10px;">👵 老人</span>
              <span v-if="current_detail.ertong">👶 儿童</span>
              <span v-if="!current_detail.laoren && !current_detail.ertong">无</span>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间">{{ current_detail.chuangjian_shijian }}</el-descriptions-item>
            <el-descriptions-item label="开始时间">{{ current_detail.kaishi_shijian || '-' }}</el-descriptions-item>
            <el-descriptions-item label="完成时间">{{ current_detail.wancheng_shijian || '-' }}</el-descriptions-item>
            <el-descriptions-item label="始发地">{{ current_detail.shifadi }}</el-descriptions-item>
            <el-descriptions-item label="目的地">{{ current_detail.mudedi }}</el-descriptions-item>
            <el-descriptions-item label="备注" :span="2">{{ current_detail.beizhu || '无' }}</el-descriptions-item>
          </el-descriptions>
          
          <!-- 路线图 -->
          <div class="sj-map-section" v-if="current_detail.shifadi_jingdu && current_detail.mudedi_jingdu">
            <el-divider content-position="left">路线图</el-divider>
            <SjMapRoute
              :sj-start-location="{
                sj_jingdu: current_detail.shifadi_jingdu,
                sj_weidu: current_detail.shifadi_weidu,
                sj_name: current_detail.shifadi
              }"
              :sj-end-location="{
                sj_jingdu: current_detail.mudedi_jingdu,
                sj_weidu: current_detail.mudedi_weidu,
                sj_name: current_detail.mudedi
              }"
            />
          </div>
          
          <!-- 打卡记录 -->
          <div v-if="current_detail.daka_jilu && current_detail.daka_jilu.length > 0" class="daka-section">
            <el-divider content-position="left">打卡记录</el-divider>
            <el-timeline>
              <el-timeline-item
                v-for="(daka, index) in current_detail.daka_jilu"
                :key="index"
                :type="daka.leixing === '起点' ? 'primary' : daka.leixing === '终点' ? 'success' : 'warning'"
                :icon="daka.leixing === '起点' ? 'Location' : daka.leixing === '终点' ? 'Check' : 'Timer'"
              >
                <div class="daka-item">
                  <div class="daka-title">{{ daka.leixing }} - {{ daka.shijian }}</div>
                  <div class="daka-content">
                    <p><strong>位置：</strong>{{ daka.dizhi }}</p>
                    <p><strong>坐标：</strong>{{ daka.jingdu.toFixed(6) }}, {{ daka.weidu.toFixed(6) }}</p>
                    <p v-if="daka.luxian"><strong>路线：</strong>{{ daka.luxian }}</p>
                    <p v-if="daka.juli"><strong>已行驶：</strong>{{ daka.juli }}</p>
                    <p v-if="daka.beizhu"><strong>备注：</strong>{{ daka.beizhu }}</p>
                  </div>
                </div>
              </el-timeline-item>
            </el-timeline>
          </div>
          
          <!-- 轨迹回放 -->
          <div v-if="current_detail.zhuangtai >= 4 && current_detail.daka_jilu && current_detail.daka_jilu.length >= 2" class="trajectory-section">
            <el-divider content-position="left">轨迹回放</el-divider>
            <div class="trajectory-controls">
              <el-button :type="is_playing ? 'warning' : 'primary'" size="small" @click="togglePlay">
                <el-icon><component :is="is_playing ? 'VideoPause' : 'VideoPlay'" /></el-icon>
                {{ is_playing ? '暂停' : '播放' }}
              </el-button>
              <el-button size="small" @click="resetPlay">
                <el-icon><RefreshRight /></el-icon>
                重置
              </el-button>
              <el-slider v-model="play_progress" :max="100" style="flex: 1; margin: 0 15px;" size="small" />
              <span class="progress-text">{{ play_progress }}%</span>
            </div>
          </div>
        </div>
        
        <template #footer>
          <el-button type="info" @click="view_operation_logs(current_detail)">
            <el-icon><Document /></el-icon> 操作日志
          </el-button>
          <el-button @click="detail_dialog_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 操作日志弹窗 -->
      <el-dialog title="订单操作日志" v-model="logs_dialog_visible" width="800px">
        <div v-if="current_logs.length > 0">
          <el-timeline>
            <el-timeline-item
              v-for="(log, index) in current_logs"
              :key="index"
              :type="log.type || 'primary'"
              :timestamp="log.shijian"
            >
              <div class="log-item">
                <div class="log-title">{{ log.biaoti }}</div>
                <div class="log-content">{{ log.neirong }}</div>
                <div class="log-operator" v-if="log.caozuoren">操作人：{{ log.caozuoren }}</div>
              </div>
            </el-timeline-item>
          </el-timeline>
        </div>
        <el-empty v-else description="暂无操作日志" />
        <template #footer>
          <el-button @click="logs_dialog_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 指派司机弹窗 -->
      <el-dialog title="指派司机" v-model="assign_dialog_visible" width="500px">
        <el-form :model="current_assign" label-width="100px">
          <el-form-item label="订单号">
            <el-input v-model="current_assign.dingdanhao" disabled />
          </el-form-item>
          <el-form-item label="选择司机">
            <el-select v-model="current_assign.siji_id" placeholder="请选择司机">
              <el-option v-for="item in siji_list" :key="item.id" :label="item.xingming" :value="item.id" />
            </el-select>
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="assign_dialog_visible = false">取消</el-button>
          <el-button type="primary" @click="save_assign()">指派</el-button>
        </template>
      </el-dialog>

      <!-- 地图选点弹窗 -->
      <SjMapPicker
        :sj-title="map_picker_type === 'start' ? '选择始发地' : '选择目的地'"
        :sj-visible="map_picker_visible"
        :sj-initial-location="map_initial_location"
        @update:sj-visible="map_picker_visible = $event"
        @sj-confirm="handle_map_picker_confirm"
      />

      <!-- 取消订单弹窗 -->
      <el-dialog title="取消订单" v-model="cancel_dialog_visible" width="500px">
        <el-form :model="cancel_form" label-width="100px">
          <el-form-item label="取消原因">
            <el-select v-model="cancel_form.yuanyin" placeholder="请选择取消原因" style="width: 100%;">
              <el-option label="乘客取消" value="乘客取消" />
              <el-option label="司机取消" value="司机取消" />
              <el-option label="车辆故障" value="车辆故障" />
              <el-option label="路线问题" value="路线问题" />
              <el-option label="天气原因" value="天气原因" />
              <el-option label="其他原因" value="其他原因" />
            </el-select>
          </el-form-item>
          <el-form-item label="详细说明">
            <el-input v-model="cancel_form.shuoming" type="textarea" placeholder="请输入详细说明（选填）" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="cancel_dialog_visible = false">取消</el-button>
          <el-button type="danger" @click="confirm_cancel()">确认取消</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Plus, VideoPlay, VideoPause, RefreshRight, Document, ArrowDown } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import SjMapPicker from '~/components/sj-map-picker.vue'
import SjMapRoute from '~/components/sj-map-route.vue'

// 操作日志相关
const logs_dialog_visible = ref(false)
const current_logs = ref<any[]>([])

// 查看操作日志
function view_operation_logs(order: any) {
  const logs = get_order_logs(order.dingdanhao)
  current_logs.value = logs
  logs_dialog_visible.value = true
}

// 获取订单日志
function get_order_logs(dingdanhao: string) {
  const key = `order_logs_${dingdanhao}`
  return JSON.parse(localStorage.getItem(key) || '[]')
}

// 添加订单日志
function add_order_log(dingdanhao: string, log: any) {
  const key = `order_logs_${dingdanhao}`
  const logs = JSON.parse(localStorage.getItem(key) || '[]')
  logs.unshift({
    ...log,
    shijian: new Date().toLocaleString()
  })
  localStorage.setItem(key, JSON.stringify(logs))
}

const search_keyword = ref('')
const filter_status = ref<number | null>(null)
const selected_orders = ref<any[]>([])

// 批量操作相关计算属性
const can_batch_assign = computed(() => {
  return selected_orders.value.some(order => order.zhuangtai === 0 || order.zhuangtai === 2)
})

const can_batch_cancel = computed(() => {
  return selected_orders.value.some(order => order.zhuangtai !== 5 && order.zhuangtai !== 6)
})

const order_dialog_visible = ref(false)
const detail_dialog_visible = ref(false)
const assign_dialog_visible = ref(false)
const map_picker_visible = ref(false)
const map_picker_type = ref<'start' | 'end'>('start')
const cancel_dialog_visible = ref(false)
const current_cancel_order = ref<any>(null)
const cancel_form = ref({
  yuanyin: '',
  shuoming: ''
})

// 轨迹回放相关
const is_playing = ref(false)
const play_progress = ref(0)
const play_timer = ref<any>(null)
const map_initial_location = ref<{ sj_jingdu: number; sj_weidu: number; sj_name: string; sj_address: string } | undefined>(undefined)

const siji_list = ref<any[]>([
  { id: 1, xingming: '王师傅', shouji: '13800138001', zhuangtai: 1, ticheng_bili: null },
  { id: 2, xingming: '赵师傅', shouji: '13800138002', zhuangtai: 1, ticheng_bili: null },
  { id: 3, xingming: '李师傅', shouji: '13800138003', zhuangtai: 1, ticheng_bili: null }
])

const chengke_list = ref([
  { id: 1, xingming: '张三', shouji: '13900139001' },
  { id: 2, xingming: '李四', shouji: '13900139002' },
  { id: 3, xingming: '王五', shouji: '13900139003' }
])

const order_list = ref<any[]>([
  { 
    id: 1, 
    dingdanhao: 'DD20240424001', 
    chengke: '张三',
    chengke_xingming: '张三',
    chengke_shouji: '13800000001',
    chengke_id: 1, 
    siji: '王师傅', 
    siji_id: 1, 
    chepai: '陕A12345',
    shifadi: '西安北站',
    shifadi_jingdu: 108.957238,
    shifadi_weidu: 34.386166,
    mudedi: '秦始皇兵马俑博物馆',
    mudedi_jingdu: 109.279333,
    mudedi_weidu: 34.384123,
    jine: '¥156.00', 
    zhuangtai: 5, 
    chuangjian_shijian: '2024-04-24 10:30:00',
    kaishi_shijian: '2024-04-24 11:00:00',
    wancheng_shijian: '2024-04-24 12:30:00',
    beizhu: '',
    renshu: 2,
    xinglijian: 3,
    laoren: true,
    ertong: false,
    juli: '34.56公里'
  },
  { 
    id: 2, 
    dingdanhao: 'DD20240424002', 
    chengke: '李四',
    chengke_xingming: '李四',
    chengke_shouji: '13800000002',
    chengke_id: 2, 
    siji: '赵师傅', 
    siji_id: 2, 
    chepai: '陕A67890',
    shifadi: '大雁塔',
    shifadi_jingdu: 108.965705,
    shifadi_weidu: 34.217619,
    mudedi: '华清宫',
    mudedi_jingdu: 109.225338,
    mudedi_weidu: 34.367566,
    jine: '¥89.50', 
    zhuangtai: 4, 
    chuangjian_shijian: '2024-04-24 11:20:00',
    kaishi_shijian: '2024-04-24 14:00:00',
    wancheng_shijian: '',
    beizhu: '',
    renshu: 1,
    xinglijian: 1,
    laoren: false,
    ertong: false,
    juli: '28.90公里'
  },
  { 
    id: 3, 
    dingdanhao: 'DD20240424003', 
    chengke: '王五',
    chengke_xingming: '王五',
    chengke_shouji: '13800000003',
    chengke_id: 3, 
    siji: '', 
    siji_id: null, 
    chepai: '',
    shifadi: '钟楼',
    shifadi_jingdu: 108.948333,
    shifadi_weidu: 34.263333,
    mudedi: '西安咸阳国际机场',
    mudedi_jingdu: 108.753333,
    mudedi_weidu: 34.446666,
    jine: '¥156.00', 
    zhuangtai: 0, 
    chuangjian_shijian: '2024-04-24 12:15:00',
    kaishi_shijian: '',
    wancheng_shijian: '',
    beizhu: '',
    renshu: 3,
    xinglijian: 4,
    laoren: false,
    ertong: true,
    juli: '42.30公里'
  },
  { 
    id: 4, 
    dingdanhao: 'DD20240424004', 
    chengke: '赵六',
    chengke_xingming: '赵六',
    chengke_shouji: '13800000004',
    chengke_id: 4, 
    siji: '王师傅', 
    siji_id: 1, 
    chepai: '陕A54321',
    shifadi: '小寨',
    shifadi_jingdu: 108.956666,
    shifadi_weidu: 34.233333,
    mudedi: '高新路',
    mudedi_jingdu: 108.916666,
    mudedi_weidu: 34.233333,
    jine: '¥68.00', 
    zhuangtai: 1, 
    chuangjian_shijian: '2024-04-24 13:00:00',
    kaishi_shijian: '',
    wancheng_shijian: '',
    beizhu: '',
    renshu: 2,
    xinglijian: 2,
    laoren: false,
    ertong: false,
    juli: '6.80公里'
  }
])

const current_order = ref<any>({
  chengke_xingming: '',
  chengke_shouji: '',
  renshu: 1,
  xinglijian: 0,
  dingdanriqi: new Date(),
  dingdanshijian: new Date(),
  shifadi: '',
  shifadi_jingdu: 0,
  shifadi_weidu: 0,
  mudedi: '',
  mudedi_jingdu: 0,
  mudedi_weidu: 0,
  laoren: false,
  ertong: false,
  beizhu: ''
})

const current_detail = ref<any>({
  dingdanhao: '',
  chengke_xingming: '',
  chengke_shouji: '',
  renshu: 0,
  xinglijian: 0,
  dingdanriqi: '',
  dingdanshijian: '',
  chengke: '',
  siji: '',
  chepai: '',
  kaishi_shijian: '',
  wancheng_shijian: '',
  shifadi: '',
  shifadi_jingdu: 0,
  shifadi_weidu: 0,
  mudedi: '',
  mudedi_jingdu: 0,
  mudedi_weidu: 0,
  laoren: false,
  ertong: false,
  jine: '',
  zhuangtai: 0,
  chuangjian_shijian: '',
  juli: '',
  beizhu: '',
  daka_jilu: []
})

const current_assign = ref({
  id: null,
  dingdanhao: '',
  siji_id: null
})

function get_status_type(status: number) {
  const type_map: Record<number, any> = {
    0: 'warning',
    1: 'info',
    2: 'danger',
    3: 'primary',
    4: 'primary',
    5: 'success',
    6: 'info'
  }
  return type_map[status] || 'info'
}

function get_status_label(status: number) {
  const label_map: Record<number, string> = {
    0: '待指派',
    1: '已指派',
    2: '已拒单',
    3: '已接单',
    4: '进行中',
    5: '已完成',
    6: '已取消'
  }
  return label_map[status] || '未知'
}

// 处理表格选择变化
function handle_selection_change(selection: any[]) {
  selected_orders.value = selection
}

// 处理批量操作命令
async function handle_batch_command(command: string) {
  if (selected_orders.value.length === 0) {
    ElMessage.warning('请先选择订单')
    return
  }

  switch (command) {
    case 'export':
      await batch_export()
      break
    case 'assign':
      await batch_assign()
      break
    case 'cancel':
      await batch_cancel()
      break
  }
}

// 批量导出
async function batch_export() {
  const data = selected_orders.value.map(order => ({
    '订单号': order.dingdanhao,
    '乘客': order.chengke,
    '司机': order.siji || '未指派',
    '始发地': order.shifadi,
    '目的地': order.mudedi,
    '金额': order.jine,
    '状态': get_status_label(order.zhuangtai),
    '创建时间': order.chuangjian_shijian
  }))

  // 创建CSV内容
  const headers = Object.keys(data[0])
  const csv_content = [
    headers.join(','),
    ...data.map(row => headers.map(h => {
      const val = (row as any)[h]
      if (typeof val === 'string' && val.includes(',')) {
        return `"${val}"`
      }
      return val
    }).join(','))
  ].join('\n')

  const blob = new Blob(['\ufeff' + csv_content], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `批量导出订单_${new Date().toLocaleDateString()}.csv`
  link.click()

  ElMessage.success(`已导出 ${selected_orders.value.length} 条订单`)

  // 记录操作日志
  add_caozuo_log({
    caozuoren: get_caozuoren(),
    mokuai: '订单管理',
    type: 'order',
    biaoti: '批量导出订单',
    neirong: `导出数量：${selected_orders.value.length}条`
  })
}

// 批量指派
async function batch_assign() {
  const assignable_orders = selected_orders.value.filter(order => order.zhuangtai === 0 || order.zhuangtai === 2)
  if (assignable_orders.length === 0) {
    ElMessage.warning('选中的订单中没有可指派的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量指派 ${assignable_orders.length} 个订单吗？`,
      '确认批量指派',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    // 这里可以打开一个选择司机的弹窗，简化处理为自动指派第一个可用司机
    const available_siji = siji_list.value.find(s => s.zhuangtai === 1)
    if (!available_siji) {
      ElMessage.warning('没有可用的司机')
      return
    }

    for (const order of assignable_orders) {
      order.siji = available_siji.xingming
      order.siji_id = available_siji.id
      order.zhuangtai = 1

      // 记录操作日志
      add_order_log(order.dingdanhao, {
        biaoti: '批量指派司机',
        neirong: `订单批量指派给司机：${available_siji.xingming}`,
        caozuoren: '管理员',
        type: 'primary'
      })
    }

    ElMessage.success(`成功指派 ${assignable_orders.length} 个订单`)
    selected_orders.value = []
  } catch {
    // 用户取消
  }
}

// 批量取消
async function batch_cancel() {
  const cancelable_orders = selected_orders.value.filter(order => order.zhuangtai !== 5 && order.zhuangtai !== 6)
  if (cancelable_orders.length === 0) {
    ElMessage.warning('选中的订单中没有可取消的订单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要批量取消 ${cancelable_orders.length} 个订单吗？`,
      '确认批量取消',
      { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' }
    )

    for (const order of cancelable_orders) {
      order.zhuangtai = 6
      ;(order as any).quxiao_yuanyin = '批量取消'
      ;(order as any).quxiao_shijian = new Date().toLocaleString()

      // 记录操作日志
      add_order_log(order.dingdanhao, {
        biaoti: '批量取消订单',
        neirong: '订单被批量取消',
        caozuoren: '管理员',
        type: 'danger'
      })
    }

    ElMessage.success(`成功取消 ${cancelable_orders.length} 个订单`)
    selected_orders.value = []
  } catch {
    // 用户取消
  }
}

function open_order_dialog() {
  current_order.value = {
    chengke_xingming: '',
    chengke_shouji: '',
    renshu: 1,
    xinglijian: 0,
    dingdanriqi: new Date(),
    dingdanshijian: new Date(),
    shifadi: '',
    shifadi_jingdu: 0,
    shifadi_weidu: 0,
    mudedi: '',
    mudedi_jingdu: 0,
    mudedi_weidu: 0,
    jine: undefined,
    laoren: false,
    ertong: false,
    beizhu: ''
  }
  order_dialog_visible.value = true
}

// 计算两点间距离（单位：公里）
function calculate_distance(lng1: number, lat1: number, lng2: number, lat2: number) {
  const R = 6371 // 地球半径（公里）
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c
  return distance.toFixed(2)
}

function view_order(row: any) {
  // 加载订单详情，包括打卡记录
  const order_detail = { ...row }
  
  // 模拟加载打卡记录（实际应从后端获取）
  if (order_detail.zhuangtai >= 3) {
    order_detail.daka_jilu = [
      {
        leixing: '起点',
        shijian: order_detail.kaishi_shijian || '2024-04-24 11:00:00',
        dizhi: order_detail.shifadi,
        jingdu: order_detail.shifadi_jingdu,
        weidu: order_detail.shifadi_weidu,
        luxian: null,
        juli: null,
        beizhu: '准时出发'
      }
    ]
    
    // 如果有途径点，添加途径点记录
    if (order_detail.zhuangtai >= 4) {
      order_detail.daka_jilu.push({
        leixing: '途径点',
        shijian: '2024-04-24 11:30:00',
        dizhi: '途中休息点',
        jingdu: (order_detail.shifadi_jingdu + order_detail.mudedi_jingdu) / 2,
        weidu: (order_detail.shifadi_weidu + order_detail.mudedi_weidu) / 2,
        luxian: '主要道路',
        juli: order_detail.juli ? String(parseFloat(order_detail.juli) / 2) + '公里' : '15公里',
        beizhu: null
      })
    }
    
    // 如果已完成，添加终点记录
    if (order_detail.zhuangtai === 5) {
      order_detail.daka_jilu.push({
        leixing: '终点',
        shijian: order_detail.wancheng_shijian || '2024-04-24 12:30:00',
        dizhi: order_detail.mudedi,
        jingdu: order_detail.mudedi_jingdu,
        weidu: order_detail.mudedi_weidu,
        luxian: null,
        juli: order_detail.juli,
        beizhu: '安全送达'
      })
    }
  }
  
  current_detail.value = order_detail
  detail_dialog_visible.value = true
  
  // 重置轨迹播放状态
  is_playing.value = false
  play_progress.value = 0
  if (play_timer.value) {
    clearInterval(play_timer.value)
    play_timer.value = null
  }
}

// 轨迹回放控制
function togglePlay() {
  if (is_playing.value) {
    pausePlay()
  } else {
    startPlay()
  }
}

function startPlay() {
  if (play_progress.value >= 100) {
    play_progress.value = 0
  }
  
  is_playing.value = true
  
  play_timer.value = setInterval(() => {
    play_progress.value += 2
    
    if (play_progress.value >= 100) {
      play_progress.value = 100
      pausePlay()
    }
  }, 100)
}

function pausePlay() {
  is_playing.value = false
  if (play_timer.value) {
    clearInterval(play_timer.value)
    play_timer.value = null
  }
}

function resetPlay() {
  pausePlay()
  play_progress.value = 0
}

function open_assign_dialog(row: any) {
  current_assign.value = {
    id: row.id,
    dingdanhao: row.dingdanhao,
    siji_id: row.siji_id
  }
  assign_dialog_visible.value = true
}

function open_map_picker(type: 'start' | 'end') {
  map_picker_type.value = type
  // 设置初始位置
  if (type === 'start' && current_order.value.shifadi_jingdu) {
    map_initial_location.value = {
      sj_name: current_order.value.shifadi,
      sj_address: current_order.value.shifadi,
      sj_jingdu: current_order.value.shifadi_jingdu,
      sj_weidu: current_order.value.shifadi_weidu
    }
  } else if (type === 'end' && current_order.value.mudedi_jingdu) {
    map_initial_location.value = {
      sj_name: current_order.value.mudedi,
      sj_address: current_order.value.mudedi,
      sj_jingdu: current_order.value.mudedi_jingdu,
      sj_weidu: current_order.value.mudedi_weidu
    }
  } else {
    map_initial_location.value = undefined
  }
  map_picker_visible.value = true
}

function handle_map_picker_confirm(location: any) {
  // 直接使用返回的地址，地图组件已经处理好了地址格式
  const location_display = location.sj_address || location.sj_name || '地图选点'
  
  if (map_picker_type.value === 'start') {
    current_order.value.shifadi = location_display
    current_order.value.shifadi_jingdu = location.sj_jingdu
    current_order.value.shifadi_weidu = location.sj_weidu
  } else {
    current_order.value.mudedi = location_display
    current_order.value.mudedi_jingdu = location.sj_jingdu
    current_order.value.mudedi_weidu = location.sj_weidu
  }
}

async function save_assign() {
  if (!current_assign.value.siji_id) {
    ElMessage.warning('请选择司机')
    return
  }
  await ElMessageBox.confirm(`确定指派该司机吗？`, '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
  const order = order_list.value.find(o => o.id === current_assign.value.id)
  if (order) {
    const siji = siji_list.value.find(s => s.id === current_assign.value.siji_id)
    if (siji) {
      order.siji = siji.xingming
      order.siji_id = siji.id
      order.zhuangtai = 1
      
      // 根据司机的提成比例重新计算司机提成金额
      const jifei_config = localStorage.getItem('jifei_config')
      const config = jifei_config ? JSON.parse(jifei_config) : { tongyi_ticheng: 60 }
      const siji_ticheng_bili = siji.ticheng_bili || config.tongyi_ticheng || 60
      
      // 解析订单金额
      const order_amount = parseFloat(order.jine.replace('¥', ''))
      const siji_ticheng = order_amount * (siji_ticheng_bili / 100)
      
      order.siji_ticheng = '¥' + siji_ticheng.toFixed(2)
      order.ticheng_bili = siji_ticheng_bili
      
      // 记录操作日志
      add_order_log(order.dingdanhao, {
        biaoti: '指派司机',
        neirong: `订单指派给司机：${siji.xingming}（${siji.shouji}），司机提成比例：${siji_ticheng_bili}%，司机可得：¥${siji_ticheng.toFixed(2)}`,
        caozuoren: '管理员',
        type: 'primary'
      })
    }
  }
  ElNotification({
    title: '订单已指派',
    message: `订单 ${current_assign.value.dingdanhao} 已指派给 ${siji_list.value.find(s => s.id === current_assign.value.siji_id)?.xingming}，等待司机接单`,
    type: 'success',
    duration: 4000
  })
  assign_dialog_visible.value = false
}

async function simulate_driver_action(row: any, action: 'accept' | 'reject') {
  const order = order_list.value.find(o => o.id === row.id)
  if (!order) return
  if (action === 'accept') {
    await ElMessageBox.confirm(`模拟司机接单？`, '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    order.zhuangtai = 3
    
    // 记录操作日志
    add_order_log(order.dingdanhao, {
      biaoti: '司机接单',
      neirong: `司机 ${order.siji} 已接单`,
      caozuoren: '系统',
      type: 'success'
    })
    
    ElNotification({
      title: '司机已接单',
      message: `订单 ${order.dingdanhao} 司机已接单，可开始订单`,
      type: 'success',
      duration: 4000
    })
  } else {
    await ElMessageBox.confirm(`模拟司机拒单？`, '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
    
    const siji_name = order.siji
    order.zhuangtai = 2
    order.siji = ''
    order.siji_id = null
    
    // 记录操作日志
    add_order_log(order.dingdanhao, {
      biaoti: '司机拒单',
      neirong: `司机 ${siji_name} 拒绝接单`,
      caozuoren: '系统',
      type: 'danger'
    })
    
    ElNotification({
      title: '司机拒单通知',
      message: `订单 ${order.dingdanhao} 司机已拒单，请重新指派`,
      type: 'warning',
      duration: 5000
    })
  }
}

async function start_order(row: any) {
  const order = order_list.value.find(o => o.id === row.id)
  if (!order) return
  await ElMessageBox.confirm(`确定开始此订单？`, '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
  order.zhuangtai = 4
  order.kaishi_shijian = new Date().toLocaleString()
  
  // 记录操作日志
  add_order_log(order.dingdanhao, {
    biaoti: '订单开始',
    neirong: `订单开始执行，司机：${order.siji}，车牌：${order.chepai}`,
    caozuoren: '管理员',
    type: 'primary'
  })
  
  ElMessage.success('订单已开始，司机正在按完成')
}

async function complete_order(row: any) {
  const order = order_list.value.find(o => o.id === row.id)
  if (!order) return
  await ElMessageBox.confirm(`确定完成此订单？`, '确认', { confirmButtonText: '确定', cancelButtonText: '取消', type: 'warning' })
  order.zhuangtai = 5
  order.wancheng_shijian = new Date().toLocaleString()
  
  // 记录操作日志
  add_order_log(order.dingdanhao, {
    biaoti: '订单完成',
    neirong: `订单已完成，司机：${order.siji}，金额：${order.jine}`,
    caozuoren: '管理员',
    type: 'success'
  })
  
  ElMessage.success('订单已完成')
}

function cancel_order(row: any) {
  current_cancel_order.value = row
  cancel_form.value = { yuanyin: '', shuoming: '' }
  cancel_dialog_visible.value = true
}

async function confirm_cancel() {
  if (!cancel_form.value.yuanyin) {
    ElMessage.warning('请选择取消原因')
    return
  }

  const order = order_list.value.find(o => o.id === current_cancel_order.value.id)
  if (!order) return

  order.zhuangtai = 6
  ;(order as any).quxiao_yuanyin = cancel_form.value.yuanyin
  ;(order as any).quxiao_shuoming = cancel_form.value.shuoming
  ;(order as any).quxiao_shijian = new Date().toLocaleString()

  // 记录操作日志
  add_order_log(order.dingdanhao, {
    biaoti: '订单取消',
    neirong: `订单已取消，原因：${cancel_form.value.yuanyin}，说明：${cancel_form.value.shuoming || '无'}`,
    caozuoren: '管理员',
    type: 'danger'
  })

  cancel_dialog_visible.value = false
  ElMessage.success('订单已取消')
}

function save_order() {
  if (!current_order.value.shifadi || !current_order.value.mudedi) {
    ElMessage.warning('请选择始发地和目的地')
    return
  }
  if (!current_order.value.chengke_xingming) {
    ElMessage.warning('请输入乘客姓名')
    return
  }
  if (!current_order.value.chengke_shouji) {
    ElMessage.warning('请输入联系电话')
    return
  }
  
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  const second = String(now.getSeconds()).padStart(2, '0')
  
  const distance = calculate_distance(
    current_order.value.shifadi_jingdu,
    current_order.value.shifadi_weidu,
    current_order.value.mudedi_jingdu,
    current_order.value.mudedi_weidu
  )
  
  // 获取订单金额
  const order_amount = current_order.value.jine ? Number(current_order.value.jine) : (Math.floor(Math.random() * 100) + 50)
  
  // 获取统一提成比例
  const jifei_config = localStorage.getItem('jifei_config')
  const config = jifei_config ? JSON.parse(jifei_config) : { tongyi_ticheng: 60 }
  const ticheng_bili = config.tongyi_ticheng || 60
  
  // 计算司机提成金额（司机只能看到这个金额）
  const siji_ticheng = order_amount * (ticheng_bili / 100)
  
  const new_order = {
    id: order_list.value.length + 1,
    dingdanhao: `DD${year}${month}${day}${String(order_list.value.length + 1).padStart(3, '0')}`,
    chengke: current_order.value.chengke_xingming,
    chengke_xingming: current_order.value.chengke_xingming,
    chengke_shouji: current_order.value.chengke_shouji,
    chengke_id: null,
    siji: '',
    siji_id: null,
    shifadi: current_order.value.shifadi,
    shifadi_jingdu: current_order.value.shifadi_jingdu,
    shifadi_weidu: current_order.value.shifadi_weidu,
    mudedi: current_order.value.mudedi,
    mudedi_jingdu: current_order.value.mudedi_jingdu,
    mudedi_weidu: current_order.value.mudedi_weidu,
    jine: '¥' + order_amount.toFixed(2),
    siji_ticheng: '¥' + siji_ticheng.toFixed(2),
    ticheng_bili: ticheng_bili,
    zhuangtai: 0,
    chuangjian_shijian: `${year}-${month}-${day} ${hour}:${minute}:${second}`,
    beizhu: current_order.value.beizhu,
    renshu: current_order.value.renshu,
    xinglijian: current_order.value.xinglijian,
    laoren: current_order.value.laoren,
    ertong: current_order.value.ertong,
    juli: `${distance}公里`
  }
  
  order_list.value.unshift(new_order)

  // 记录操作日志
  add_order_log(new_order.dingdanhao, {
    biaoti: '订单创建',
    neirong: `订单创建成功，乘客：${new_order.chengke}，始发地：${new_order.shifadi}，目的地：${new_order.mudedi}，金额：${new_order.jine}`,
    caozuoren: '管理员',
    type: 'primary'
  })

  ElMessage.success('订单创建成功')
  order_dialog_visible.value = false
}
</script>

<style scoped>
.orders-page {
  padding: 0;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.filters {
  display: flex;
  align-items: center;
}

.sj-input-with-map {
  display: flex;
  gap: 10px;
  width: 100%;
}

.sj-input-with-map .el-input {
  flex: 1;
}

.sj-map-section {
  margin-top: 20px;
}

/* 打卡记录样式 */
.daka-section {
  margin-top: 20px;
}

.daka-item {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
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

/* 轨迹回放样式 */
.trajectory-section {
  margin-top: 20px;
}

.trajectory-controls {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 8px;
}

.progress-text {
  font-size: 14px;
  color: #606266;
  min-width: 40px;
}

/* 操作日志样式 */
.log-item {
  padding: 10px;
  background: #f5f7fa;
  border-radius: 8px;
  margin-bottom: 10px;
}

.log-title {
  font-weight: bold;
  font-size: 14px;
  color: #303133;
  margin-bottom: 8px;
}

.log-content {
  font-size: 13px;
  color: #606266;
  line-height: 1.6;
  margin-bottom: 5px;
}

.log-operator {
  font-size: 12px;
  color: #909399;
}
</style>
