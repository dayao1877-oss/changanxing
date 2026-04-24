<template>
  <div class="zhineng-page">
    <!-- 智能调度总览 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
            <el-icon><Aim /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ auto_dispatch_stats.today_count }}</div>
            <div class="stat-label">今日自动派单</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
            <el-icon><Timer /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ auto_dispatch_stats.avg_time }}分钟</div>
            <div class="stat-label">平均派单时间</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
            <el-icon><MapLocation /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ route_optimization.saved_distance }}km</div>
            <div class="stat-label">节省总里程</div>
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-icon" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
            <el-icon><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ auto_dispatch_stats.success_rate }}%</div>
            <div class="stat-label">派单成功率</div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 自动派单配置 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Setting /></el-icon>
            <span>自动派单配置</span>
          </div>
          <el-switch
            v-model="dispatch_config.enabled"
            active-text="已启用"
            inactive-text="已关闭"
            @change="toggle_auto_dispatch"
          />
        </div>
      </template>

      <el-form :model="dispatch_config" label-width="140px" class="config-form">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="最大接单距离">
              <el-input-number v-model="dispatch_config.max_distance" :min="1" :max="50" />
              <span class="unit">公里</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="响应超时时间">
              <el-input-number v-model="dispatch_config.response_timeout" :min="10" :max="300" />
              <span class="unit">秒</span>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="同时派单数量">
              <el-input-number v-model="dispatch_config.max_dispatch" :min="1" :max="10" />
              <span class="unit">个司机</span>
            </el-form-item>
          </el-col>
        </el-row>

        <el-divider />

        <h4>派单策略权重</h4>
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="距离权重">
              <el-slider v-model="dispatch_config.weights.distance" :max="100" show-input />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="评分权重">
              <el-slider v-model="dispatch_config.weights.rating" :max="100" show-input />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="完成率权重">
              <el-slider v-model="dispatch_config.weights.completion" :max="100" show-input />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item>
          <el-button type="primary" @click="save_dispatch_config">
            <el-icon><Check /></el-icon>
            保存配置
          </el-button>
          <el-button @click="reset_dispatch_config">
            <el-icon><RefreshLeft /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 智能调度推荐 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><MagicStick /></el-icon>
            <span>智能调度推荐</span>
          </div>
          <el-button type="primary" @click="refresh_recommendations">
            <el-icon><Refresh /></el-icon>
            刷新推荐
          </el-button>
        </div>
      </template>

      <div v-if="recommendations.length === 0" class="empty-state">
        <el-icon size="48" color="#909399"><InfoFilled /></el-icon>
        <p>暂无待调度订单</p>
      </div>

      <div v-else class="recommendation-list">
        <div
          v-for="(rec, index) in recommendations"
          :key="rec.order_id"
          class="recommendation-item"
        >
          <div class="rec-header">
            <div class="rec-title">
              <span class="order-id">订单 {{ rec.order_id }}</span>
              <el-tag :type="get_urgency_type(rec.urgency)" size="small">
                {{ rec.urgency_text }}
              </el-tag>
            </div>
            <div class="rec-actions">
              <el-button type="primary" size="small" @click="apply_recommendation(rec)">
                应用推荐
              </el-button>
              <el-button size="small" @click="view_order_detail(rec.order_id)">
                查看订单
              </el-button>
            </div>
          </div>

          <div class="rec-content">
            <div class="rec-route">
              <div class="route-point">
                <div class="point-marker start">起</div>
                <span class="point-address">{{ rec.start_address }}</span>
              </div>
              <div class="route-line">
                <el-icon><ArrowDown /></el-icon>
                <span class="route-distance">{{ rec.distance }}公里</span>
              </div>
              <div class="route-point">
                <div class="point-marker end">终</div>
                <span class="point-address">{{ rec.end_address }}</span>
              </div>
            </div>

            <div class="rec-drivers">
              <h5>推荐司机 (按匹配度排序)</h5>
              <div class="driver-list">
                <div
                  v-for="(driver, dIndex) in rec.recommended_drivers"
                  :key="driver.id"
                  class="driver-item"
                  :class="{ 'best-match': dIndex === 0 }"
                >
                  <div class="driver-rank">{{ dIndex + 1 }}</div>
                  <el-avatar :size="40" :src="driver.avatar">
                    {{ driver.name.charAt(0) }}
                  </el-avatar>
                  <div class="driver-info">
                    <div class="driver-name">{{ driver.name }}</div>
                    <div class="driver-meta">
                      <el-rate v-model="driver.rating" disabled size="small" />
                      <span>距乘客 {{ driver.distance }}公里</span>
                    </div>
                  </div>
                  <div class="driver-score">
                    <div class="score-value">{{ driver.match_score }}分</div>
                    <div class="score-label">匹配度</div>
                  </div>
                  <div class="driver-actions">
                    <el-button
                      type="primary"
                      size="small"
                      @click="dispatch_to_driver(rec.order_id, driver.id)"
                    >
                      派单
                    </el-button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="rec-reason">
            <el-icon><InfoFilled /></el-icon>
            <span>推荐理由: {{ rec.reason }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 路线优化建议 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><MapLocation /></el-icon>
            <span>路线优化建议</span>
          </div>
          <el-radio-group v-model="route_filter" size="small">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="pending">待优化</el-radio-button>
            <el-radio-button label="applied">已应用</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-table :data="filtered_routes" style="width: 100%">
        <el-table-column prop="order_id" label="订单号" width="120" />
        <el-table-column label="原路线" min-width="200">
          <template #default="{ row }">
            <div class="route-simple">
              <span>{{ row.original_route }}</span>
              <el-tag size="small" type="info">{{ row.original_distance }}km</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优化后路线" min-width="200">
          <template #default="{ row }">
            <div class="route-simple">
              <span>{{ row.optimized_route }}</span>
              <el-tag size="small" type="success">{{ row.optimized_distance }}km</el-tag>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="节省" width="120">
          <template #default="{ row }">
            <div class="saving-info">
              <span class="saving-distance">-{{ row.saved_distance }}km</span>
              <span class="saving-time">-{{ row.saved_time }}分钟</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'applied' ? 'success' : 'warning'" size="small">
              {{ row.status === 'applied' ? '已应用' : '待处理' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'pending'"
              type="primary"
              size="small"
              @click="apply_route_optimization(row)"
            >
              应用
            </el-button>
            <el-button size="small" @click="view_route_detail(row)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 派单模拟器 -->
    <el-card class="section-card">
      <template #header>
        <div class="card-header">
          <div class="header-left">
            <el-icon><Monitor /></el-icon>
            <span>智能派单模拟器</span>
          </div>
        </div>
      </template>

      <el-row :gutter="20">
        <el-col :span="8">
          <el-form :model="simulator" label-width="100px">
            <el-form-item label="起点">
              <el-input v-model="simulator.start" placeholder="输入起点地址" />
            </el-form-item>
            <el-form-item label="终点">
              <el-input v-model="simulator.end" placeholder="输入终点地址" />
            </el-form-item>
            <el-form-item label="订单类型">
              <el-select v-model="simulator.type" style="width: 100%">
                <el-option label="普通订单" value="normal" />
                <el-option label="紧急订单" value="urgent" />
                <el-option label="预约订单" value="scheduled" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="run_simulation" :loading="simulating">
                开始模拟
              </el-button>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="16">
          <div v-if="simulation_result" class="simulation-result">
            <h4>模拟结果</h4>
            <el-timeline>
              <el-timeline-item
                v-for="(step, index) in simulation_result.steps"
                :key="index"
                :type="step.type"
                :timestamp="step.time"
              >
                {{ step.content }}
              </el-timeline-item>
            </el-timeline>
            <div class="simulation-summary">
              <el-descriptions :column="3" border>
                <el-descriptions-item label="推荐司机">{{ simulation_result.driver_name }}</el-descriptions-item>
                <el-descriptions-item label="预计到达">{{ simulation_result.eta }}分钟</el-descriptions-item>
                <el-descriptions-item label="匹配得分">{{ simulation_result.score }}分</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
          <div v-else class="simulation-placeholder">
            <el-icon size="48" color="#dcdfe6"><Monitor /></el-icon>
            <p>点击"开始模拟"查看派单过程</p>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 路线详情弹窗 -->
    <el-dialog
      v-model="route_detail_visible"
      title="路线优化详情"
      width="800px"
    >
      <div v-if="current_route" class="route-detail">
        <el-row :gutter="20">
          <el-col :span="12">
            <h4>原路线</h4>
            <div class="route-map-placeholder">
              <el-icon size="48" color="#dcdfe6"><MapLocation /></el-icon>
              <p>原路线地图</p>
            </div>
            <div class="route-stats">
              <div class="stat-item">
                <span class="stat-label">距离:</span>
                <span class="stat-value">{{ current_route.original_distance }} km</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">预计时间:</span>
                <span class="stat-value">{{ current_route.original_time }} 分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">红绿灯:</span>
                <span class="stat-value">{{ current_route.original_lights }} 个</span>
              </div>
            </div>
          </el-col>
          <el-col :span="12">
            <h4>优化后路线</h4>
            <div class="route-map-placeholder optimized">
              <el-icon size="48" color="#67c23a"><MapLocation /></el-icon>
              <p>优化路线地图</p>
            </div>
            <div class="route-stats">
              <div class="stat-item">
                <span class="stat-label">距离:</span>
                <span class="stat-value highlight">{{ current_route.optimized_distance }} km</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">预计时间:</span>
                <span class="stat-value highlight">{{ current_route.optimized_time }} 分钟</span>
              </div>
              <div class="stat-item">
                <span class="stat-label">红绿灯:</span>
                <span class="stat-value highlight">{{ current_route.optimized_lights }} 个</span>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-divider />

        <div class="optimization-summary">
          <h4>优化效果</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="summary-item">
                <div class="summary-value">-{{ current_route.saved_distance }}km</div>
                <div class="summary-label">距离缩短</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <div class="summary-value">-{{ current_route.saved_time }}分钟</div>
                <div class="summary-label">时间节省</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="summary-item">
                <div class="summary-value">-{{ current_route.saved_fuel }}L</div>
                <div class="summary-label">预计省油</div>
              </div>
            </el-col>
          </el-row>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Aim, Timer, MapLocation, CircleCheck, Setting, Check,
  RefreshLeft, MagicStick, Refresh, InfoFilled, ArrowDown,
  Monitor
} from '@element-plus/icons-vue'
import { log_caozuo, type CaozuoType } from '~/utils/caozuo-log'

// 自动派单统计
const auto_dispatch_stats = ref({
  today_count: 0,
  avg_time: 0,
  success_rate: 0
})

// 路线优化统计
const route_optimization = ref({
  saved_distance: 0,
  saved_time: 0,
  saved_fuel: 0
})

// 派单配置
const dispatch_config = ref({
  enabled: true,
  max_distance: 5,
  response_timeout: 60,
  max_dispatch: 3,
  weights: {
    distance: 40,
    rating: 30,
    completion: 30
  }
})

// 智能推荐列表
const recommendations = ref<any[]>([])

// 路线优化列表
const routes = ref<any[]>([])
const route_filter = ref('all')

// 模拟器
const simulator = ref({
  start: '',
  end: '',
  type: 'normal'
})
const simulating = ref(false)
const simulation_result = ref<any>(null)

// 路线详情
const route_detail_visible = ref(false)
const current_route = ref<any>(null)

// 过滤后的路线
const filtered_routes = computed(() => {
  if (route_filter.value === 'all') return routes.value
  return routes.value.filter(r => r.status === route_filter.value)
})

// 获取紧急程度类型
function get_urgency_type(urgency: number) {
  if (urgency >= 3) return 'danger'
  if (urgency >= 2) return 'warning'
  return 'info'
}

// 加载数据
function load_data() {
  // 加载配置
  const saved_config = localStorage.getItem('dispatch_config')
  if (saved_config) {
    dispatch_config.value = JSON.parse(saved_config)
  }

  // 加载统计数据
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const today = new Date().toDateString()
  const today_orders = orders.filter((o: any) => {
    const order_date = new Date(o.shijian).toDateString()
    return order_date === today && o.zidongpaidan
  })

  auto_dispatch_stats.value = {
    today_count: today_orders.length,
    avg_time: 2.5,
    success_rate: 92
  }

  // 加载路线优化数据
  const saved_routes = localStorage.getItem('route_optimizations')
  if (saved_routes) {
    routes.value = JSON.parse(saved_routes)
  } else {
    // 生成示例数据
    routes.value = generate_sample_routes()
  }

  // 计算节省统计
  const applied_routes = routes.value.filter(r => r.status === 'applied')
  route_optimization.value = {
    saved_distance: applied_routes.reduce((sum, r) => sum + r.saved_distance, 0),
    saved_time: applied_routes.reduce((sum, r) => sum + r.saved_time, 0),
    saved_fuel: applied_routes.reduce((sum, r) => sum + (r.saved_fuel || 0), 0)
  }

  // 加载推荐数据
  refresh_recommendations()
}

// 生成示例路线数据
function generate_sample_routes() {
  return [
    {
      id: 1,
      order_id: 'DD20260120001',
      original_route: '市中心 → 火车站',
      original_distance: 12.5,
      original_time: 35,
      original_lights: 8,
      optimized_route: '市中心 → 高架 → 火车站',
      optimized_distance: 10.2,
      optimized_time: 22,
      optimized_lights: 3,
      saved_distance: 2.3,
      saved_time: 13,
      saved_fuel: 0.3,
      status: 'pending'
    },
    {
      id: 2,
      order_id: 'DD20260120005',
      original_route: '机场 → 高新区',
      original_distance: 28.6,
      original_time: 52,
      original_lights: 12,
      optimized_route: '机场 → 绕城高速 → 高新区',
      optimized_distance: 24.1,
      optimized_time: 35,
      optimized_lights: 4,
      saved_distance: 4.5,
      saved_time: 17,
      saved_fuel: 0.6,
      status: 'applied'
    },
    {
      id: 3,
      order_id: 'DD20260120008',
      original_route: '商业区 → 住宅区',
      original_distance: 8.3,
      original_time: 25,
      original_lights: 6,
      optimized_route: '商业区 → 滨河路 → 住宅区',
      optimized_distance: 7.1,
      optimized_time: 18,
      optimized_lights: 2,
      saved_distance: 1.2,
      saved_time: 7,
      saved_fuel: 0.15,
      status: 'pending'
    }
  ]
}

// 切换自动派单
function toggle_auto_dispatch(enabled: boolean) {
  dispatch_config.value.enabled = enabled
  save_dispatch_config()
  ElMessage.success(enabled ? '自动派单已启用' : '自动派单已关闭')
  log_caozuo('system' as CaozuoType, enabled ? '启用自动派单' : '关闭自动派单', `自动派单功能${enabled ? '开启' : '关闭'}`)
}

// 保存派单配置
function save_dispatch_config() {
  localStorage.setItem('dispatch_config', JSON.stringify(dispatch_config.value))
  ElMessage.success('配置已保存')
  log_caozuo('system' as CaozuoType, '更新自动派单配置', `最大距离:${dispatch_config.value.max_distance}km, 超时:${dispatch_config.value.response_timeout}秒`)
}

// 重置派单配置
function reset_dispatch_config() {
  dispatch_config.value = {
    enabled: true,
    max_distance: 5,
    response_timeout: 60,
    max_dispatch: 3,
    weights: {
      distance: 40,
      rating: 30,
      completion: 30
    }
  }
  save_dispatch_config()
}

// 刷新推荐
function refresh_recommendations() {
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const drivers = JSON.parse(localStorage.getItem('user_list') || '[]')
    .filter((u: any) => u.leixing === '司机' && u.zhuangtai === '在职')

  // 获取待派单订单
  const pending_orders = orders.filter((o: any) => o.zhuangtai === 0).slice(0, 3)

  recommendations.value = pending_orders.map((order: any) => {
    // 计算推荐司机
    const recommended_drivers = drivers.slice(0, 3).map((driver: any, index: number) => ({
      id: driver.id,
      name: driver.xingming,
      avatar: driver.touxiang,
      rating: driver.pingfen || 4.5,
      distance: (Math.random() * 5 + 0.5).toFixed(1),
      match_score: Math.round(95 - index * 8)
    }))

    return {
      order_id: order.bianhao,
      urgency: Math.floor(Math.random() * 3) + 1,
      urgency_text: ['普通', '较急', '紧急'][Math.floor(Math.random() * 3)],
      start_address: order.qidian || '起点地址',
      end_address: order.zhongdian || '终点地址',
      distance: (Math.random() * 15 + 3).toFixed(1),
      recommended_drivers,
      reason: `距离最近司机 ${recommended_drivers[0]?.distance}km，评分 ${recommended_drivers[0]?.rating}分，历史完成率高`
    }
  })
}

// 应用推荐
function apply_recommendation(rec: any) {
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const order = orders.find((o: any) => o.bianhao === rec.order_id)

  if (order) {
    order.zhuangtai = 1
    order.siji = rec.recommended_drivers[0]?.name
    order.zidongpaidan = true
    localStorage.setItem('order_list', JSON.stringify(orders))

    ElMessage.success(`已自动派单给 ${rec.recommended_drivers[0]?.name}`)
    log_caozuo('order' as CaozuoType, '智能派单', `订单 ${rec.order_id} 自动派单给 ${rec.recommended_drivers[0]?.name}`)

    // 刷新推荐
    refresh_recommendations()
  }
}

// 派单给指定司机
function dispatch_to_driver(order_id: string, driver_id: string) {
  const orders = JSON.parse(localStorage.getItem('order_list') || '[]')
  const drivers = JSON.parse(localStorage.getItem('user_list') || '[]')
  const order = orders.find((o: any) => o.bianhao === order_id)
  const driver = drivers.find((d: any) => d.id === driver_id)

  if (order && driver) {
    order.zhuangtai = 1
    order.siji = driver.xingming
    order.zidongpaidan = true
    localStorage.setItem('order_list', JSON.stringify(orders))

    ElMessage.success(`已派单给 ${driver.xingming}`)
    log_caozuo('order' as CaozuoType, '指定派单', `订单 ${order_id} 派单给 ${driver.xingming}`)

    // 刷新推荐
    refresh_recommendations()
  }
}

// 查看订单详情
function view_order_detail(order_id: string) {
  window.open(`/orders?id=${order_id}`, '_blank')
}

// 应用路线优化
function apply_route_optimization(route: any) {
  route.status = 'applied'
  localStorage.setItem('route_optimizations', JSON.stringify(routes.value))

  // 更新统计
  route_optimization.value.saved_distance += route.saved_distance
  route_optimization.value.saved_time += route.saved_time
  route_optimization.value.saved_fuel += route.saved_fuel || 0

  ElMessage.success('路线优化已应用')
  log_caozuo('order' as CaozuoType, '应用路线优化', `订单 ${route.order_id} 应用路线优化,节省${route.saved_distance}km`)
}

// 查看路线详情
function view_route_detail(route: any) {
  current_route.value = route
  route_detail_visible.value = true
}

// 运行模拟
async function run_simulation() {
  if (!simulator.value.start || !simulator.value.end) {
    ElMessage.warning('请输入起点和终点')
    return
  }

  simulating.value = true
  simulation_result.value = null

  // 模拟派单过程
  await new Promise(resolve => setTimeout(resolve, 2000))

  const drivers = JSON.parse(localStorage.getItem('user_list') || '[]')
    .filter((u: any) => u.leixing === '司机' && u.zhuangtai === '在职')
    .slice(0, 3)

  simulation_result.value = {
    steps: [
      { type: 'primary', content: '开始搜索附近司机...', time: '00:00' },
      { type: 'primary', content: `找到 ${drivers.length} 位在线司机`, time: '00:01' },
      { type: 'success', content: '计算最优匹配...', time: '00:02' },
      { type: 'success', content: '派单成功', time: '00:03' }
    ],
    driver_name: drivers[0]?.xingming || '张师傅',
    eta: Math.floor(Math.random() * 5 + 3),
    score: Math.floor(Math.random() * 10 + 85)
  }

  simulating.value = false
  log_caozuo('system' as CaozuoType, '运行派单模拟', `模拟从 ${simulator.value.start} 到 ${simulator.value.end} 的派单过程`)
}

onMounted(() => {
  load_data()
})
</script>

<style scoped>
.overview-cards {
  margin-bottom: 20px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 24px;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.stat-label {
  font-size: 13px;
  color: #909399;
  margin-top: 4px;
}

.section-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
}

.config-form {
  padding: 20px 0;
}

.unit {
  margin-left: 8px;
  color: #909399;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin-top: 16px;
}

.recommendation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.recommendation-item {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  background: #fafafa;
}

.rec-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.rec-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.order-id {
  font-weight: 500;
  color: #303133;
}

.rec-actions {
  display: flex;
  gap: 8px;
}

.rec-content {
  display: flex;
  gap: 24px;
}

.rec-route {
  flex: 0 0 200px;
}

.route-point {
  display: flex;
  align-items: center;
  gap: 8px;
}

.point-marker {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
}

.point-marker.start {
  background: #67c23a;
}

.point-marker.end {
  background: #f56c6c;
}

.point-address {
  font-size: 13px;
  color: #606266;
}

.route-line {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  color: #909399;
}

.route-distance {
  font-size: 12px;
  margin-top: 4px;
}

.rec-drivers {
  flex: 1;
}

.rec-drivers h5 {
  margin: 0 0 12px;
  font-size: 14px;
  color: #606266;
}

.driver-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.driver-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: white;
  border-radius: 8px;
  border: 1px solid #ebeef5;
}

.driver-item.best-match {
  border-color: #67c23a;
  background: #f0f9ff;
}

.driver-rank {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #e4e7ed;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.driver-item.best-match .driver-rank {
  background: #67c23a;
  color: white;
}

.driver-info {
  flex: 1;
}

.driver-name {
  font-weight: 500;
  margin-bottom: 4px;
}

.driver-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  color: #909399;
}

.driver-score {
  text-align: center;
  padding: 0 16px;
  border-left: 1px solid #ebeef5;
}

.score-value {
  font-size: 20px;
  font-weight: 600;
  color: #409eff;
}

.score-label {
  font-size: 12px;
  color: #909399;
}

.rec-reason {
  margin-top: 16px;
  padding: 12px;
  background: #ecf5ff;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #409eff;
}

.route-simple {
  display: flex;
  align-items: center;
  gap: 8px;
}

.saving-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.saving-distance {
  color: #67c23a;
  font-weight: 500;
}

.saving-time {
  color: #409eff;
  font-size: 12px;
}

.simulation-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  background: #f5f7fa;
  border-radius: 8px;
  color: #909399;
}

.simulation-result {
  padding: 20px;
}

.simulation-result h4 {
  margin-bottom: 20px;
}

.simulation-summary {
  margin-top: 20px;
}

.route-detail h4 {
  margin-bottom: 16px;
  color: #303133;
}

.route-map-placeholder {
  height: 150px;
  background: #f5f7fa;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.route-map-placeholder.optimized {
  background: #f0f9eb;
}

.route-stats {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #ebeef5;
}

.stat-label {
  color: #909399;
}

.stat-value {
  font-weight: 500;
  color: #303133;
}

.stat-value.highlight {
  color: #67c23a;
}

.optimization-summary {
  text-align: center;
}

.summary-item {
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.summary-value {
  font-size: 24px;
  font-weight: 600;
  color: #67c23a;
  margin-bottom: 8px;
}

.summary-label {
  color: #909399;
}
</style>
