<template>
  <Layout>
    <div class="jinji-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>紧急事件管理</span>
            <div class="header-actions">
              <el-button type="primary" @click="test_jinji_alert">
                <el-icon><Bell /></el-icon> 测试警报
              </el-button>
            </div>
          </div>
        </template>

        <el-alert title="紧急事件需要及时处理" type="error" :closable="false" style="margin-bottom: 20px;" show-icon />
        
        <el-table :data="jinji_list" style="width: 100%;" v-loading="loading">
          <el-table-column type="index" label="序号" width="80" />
          <el-table-column prop="siji" label="司机" width="120" />
          <el-table-column prop="dingdan" label="订单号" width="150" />
          <el-table-column prop="shijian" label="触发时间" width="170" />
          <el-table-column prop="weizhi" label="位置" />
          <el-table-column prop="zhuangtai" label="状态" width="120">
            <template #default="{ row }">
              <el-tag :type="row.zhuangtai === 1 ? 'success' : 'danger'" effect="dark">
                {{ row.zhuangtai === 1 ? '已解除' : '紧急中' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="350">
            <template #default="{ row }">
              <el-button size="small" type="danger" v-if="row.zhuangtai === 0" @click="handle_jiechu(row)">解除紧急</el-button>
              <el-button size="small" type="primary" @click="view_detail(row)">详情</el-button>
              <el-button size="small" @click="view_photos(row)">现场照片</el-button>
              <el-button size="small" type="warning" @click="contact_siji(row)">联系司机</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-card>

      <!-- 紧急事件详情弹窗 -->
      <el-dialog title="紧急事件详情" v-model="detail_visible" width="700px">
        <div v-if="current_detail.id">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="记录ID">{{ current_detail.id }}</el-descriptions-item>
            <el-descriptions-item label="司机">{{ current_detail.siji }}</el-descriptions-item>
            <el-descriptions-item label="订单号">{{ current_detail.dingdan }}</el-descriptions-item>
            <el-descriptions-item label="触发时间">{{ current_detail.shijian }}</el-descriptions-item>
            <el-descriptions-item label="位置">{{ current_detail.weizhi }}</el-descriptions-item>
            <el-descriptions-item label="状态">
              <el-tag :type="current_detail.zhuangtai === 1 ? 'success' : 'danger'" effect="dark">
                {{ current_detail.zhuangtai === 1 ? '已解除' : '紧急中' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="解除原因" v-if="current_detail.jiechu_yuanyin">
              {{ get_jiechu_yuanyin_label(current_detail.jiechu_yuanyin) }}
            </el-descriptions-item>
            <el-descriptions-item label="处理说明" v-if="current_detail.chuli_shuoming">
              {{ current_detail.chuli_shuoming }}
            </el-descriptions-item>
            <el-descriptions-item label="解除时间" v-if="current_detail.jiechu_shijian">
              {{ current_detail.jiechu_shijian }}
            </el-descriptions-item>
          </el-descriptions>

          <el-divider content-position="left">实时位置</el-divider>
          <div class="location-map" v-if="current_detail.dingwei">
            <div class="map-placeholder">
              <el-icon><MapLocation /></el-icon>
              <p>紧急事件发生位置</p>
              <p class="map-coords">
                经度: {{ current_detail.dingwei.jingdu?.toFixed(6) }}
                纬度: {{ current_detail.dingwei.weidu?.toFixed(6) }}
              </p>
            </div>
          </div>

          <el-divider content-position="left">相关部门联系</el-divider>
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="contact-card" @click="contact_bumen('police')">
                <el-icon class="contact-icon"><Phone /></el-icon>
                <div class="contact-title">报警电话</div>
                <div class="contact-number">110</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="contact-card" @click="contact_bumen('ambulance')">
                <el-icon class="contact-icon"><FirstAidKit /></el-icon>
                <div class="contact-title">急救电话</div>
                <div class="contact-number">120</div>
              </el-card>
            </el-col>
            <el-col :span="8">
              <el-card class="contact-card" @click="contact_bumen('fire')">
                <el-icon class="contact-icon"><FireExtinguisher /></el-icon>
                <div class="contact-title">火警电话</div>
                <div class="contact-number">119</div>
              </el-card>
            </el-col>
          </el-row>
        </div>
        <template #footer>
          <el-button @click="detail_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 现场照片弹窗 -->
      <el-dialog title="现场照片" v-model="photos_visible" width="800px">
        <div v-if="current_photos.length > 0">
          <el-carousel height="400px" :interval="5000" arrow="always">
            <el-carousel-item v-for="(photo, index) in current_photos" :key="index">
              <div class="photo-item">
                <img :src="photo.url" :alt="photo.miaoshu" />
                <div class="photo-info">
                  <p>{{ photo.miaoshu }}</p>
                  <p class="photo-time">{{ photo.shijian }}</p>
                </div>
              </div>
            </el-carousel-item>
          </el-carousel>
        </div>
        <el-empty v-else description="暂无现场照片" />
        <template #footer>
          <el-button @click="photos_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 联系司机弹窗 -->
      <el-dialog title="联系司机" v-model="contact_visible" width="500px">
        <div v-if="current_contact.siji" class="contact-content">
          <div class="siji-info">
            <h3>{{ current_contact.siji }}</h3>
            <p>订单号：{{ current_contact.dingdan }}</p>
            <p>位置：{{ current_contact.weizhi }}</p>
          </div>
          <div class="contact-actions">
            <el-button type="primary" size="large" @click="make_phone_call">
              <el-icon><Phone /></el-icon> 拨打电话
            </el-button>
            <el-button type="success" size="large" @click="send_sms">
              <el-icon><Message /></el-icon> 发送短信
            </el-button>
          </div>
        </div>
        <template #footer>
          <el-button @click="contact_visible = false">关闭</el-button>
        </template>
      </el-dialog>

      <!-- 解除紧急弹窗 -->
      <el-dialog title="解除紧急事件" v-model="jiechu_visible" width="500px">
        <el-form :model="jiechu_form" label-width="100px">
          <el-form-item label="解除原因">
            <el-radio-group v-model="jiechu_form.yuanyin">
              <el-radio label="wuxian">确认无危险</el-radio>
              <el-radio label="chuli">已处理完毕</el-radio>
              <el-radio label="wuwu">误触解除</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="处理说明">
            <el-input v-model="jiechu_form.shuoming" type="textarea" placeholder="请输入处理说明" />
          </el-form-item>
        </el-form>
        <template #footer>
          <el-button @click="jiechu_visible = false">取消</el-button>
          <el-button type="danger" @click="execute_jiechu">确认解除</el-button>
        </template>
      </el-dialog>

      <!-- 紧急警报弹窗 -->
      <el-dialog
        title="紧急警报"
        v-model="alert_visible"
        width="600px"
        :close-on-click-modal="false"
        :show-close="false"
        class="jinji-alert-dialog"
      >
        <div class="alert-content">
          <el-icon class="alert-icon"><Warning /></el-icon>
          <h2 class="alert-title">紧急事件警报！</h2>
          <p class="alert-message">司机 {{ alert_data.siji }} 触发紧急事件</p>
          <p class="alert-location">位置：{{ alert_data.weizhi }}</p>
          <p class="alert-time">时间：{{ alert_data.shijian }}</p>
        </div>
        <template #footer>
          <el-button type="primary" size="large" @click="handle_alert">立即处理</el-button>
        </template>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import { Bell, MapLocation, Phone, Message, Warning, FirstAidKit } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { add_caozuo_log } from '~/utils/caozuo-log'

// 音频对象
let alert_audio: HTMLAudioElement | null = null

const loading = ref(false)
const detail_visible = ref(false)
const photos_visible = ref(false)
const contact_visible = ref(false)
const jiechu_visible = ref(false)
const alert_visible = ref(false)

const jinji_list = ref<any[]>([])
const current_detail = ref<any>({})
const current_contact = ref<any>({})
const current_photos = ref<any[]>([])
const alert_data = ref<any>({})

const jiechu_form = ref({
  yuanyin: 'wuxian',
  shuoming: ''
})

// 加载数据
function load_data() {
  const saved = localStorage.getItem('jinji_list')
  if (saved) {
    jinji_list.value = JSON.parse(saved)
  } else {
    // 默认数据
    jinji_list.value = [
      {
        id: 1,
        siji: '王师傅',
        siji_id: 1,
        dingdan: 'DD20240424001',
        shijian: '2024-04-24 10:50:00',
        weizhi: '西安市雁塔区长安南路',
        zhuangtai: 0,
        jiechu_yuanyin: null,
        chuli_shuoming: null,
        jiechu_shijian: null,
        dingwei: {
          jingdu: 108.960000,
          weidu: 34.220000
        }
      }
    ]
    localStorage.setItem('jinji_list', JSON.stringify(jinji_list.value))
  }
}

// 初始化音频
function init_audio() {
  alert_audio = new Audio()
  alert_audio.src = 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZSA0PVanu8LdnHgU2k9n1unEiBC13yO/eizEIHWq+8+OZURE'
  alert_audio.loop = true
}

// 播放警报声音
function play_alert_sound() {
  if (alert_audio) {
    alert_audio.play().catch(() => {
      console.log('音频播放失败')
    })
  }
}

// 停止警报声音
function stop_alert_sound() {
  if (alert_audio) {
    alert_audio.pause()
    alert_audio.currentTime = 0
  }
}

// 发送浏览器通知
function send_browser_notification(title: string, body: string) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, {
      body,
      icon: '/favicon.ico',
      requireInteraction: true
    })
  }
}

// 请求通知权限
function request_notification_permission() {
  if ('Notification' in window) {
    Notification.requestPermission()
  }
}

// 测试紧急警报
function test_jinji_alert() {
  alert_data.value = {
    siji: '测试司机',
    weizhi: '西安市高新区',
    shijian: new Date().toLocaleString()
  }
  alert_visible.value = true
  play_alert_sound()
  
  // 发送浏览器通知
  send_browser_notification('紧急事件警报', '司机测试司机触发紧急事件')
  
  ElNotification({
    title: '紧急事件',
    message: '司机测试司机触发紧急事件',
    type: 'error',
    duration: 0
  })
}

// 处理警报
function handle_alert() {
  alert_visible.value = false
  stop_alert_sound()
}

// 查看详情
function view_detail(row: any) {
  current_detail.value = { ...row }
  detail_visible.value = true
}

// 查看现场照片
function view_photos(row: any) {
  // 模拟现场照片数据
  current_photos.value = [
    {
      url: 'https://via.placeholder.com/800x600/ff0000/ffffff?text=现场照片1',
      miaoshu: '车辆前部照片',
      shijian: row.shijian
    },
    {
      url: 'https://via.placeholder.com/800x600/ff0000/ffffff?text=现场照片2',
      miaoshu: '车辆后部照片',
      shijian: row.shijian
    }
  ]
  photos_visible.value = true
}

// 联系司机
function contact_siji(row: any) {
  current_contact.value = { ...row }
  contact_visible.value = true
}

// 拨打电话
function make_phone_call() {
  ElMessage.success(`正在呼叫 ${current_contact.value.siji}...`)
  window.open(`tel:13800138001`)
}

// 发送短信
function send_sms() {
  ElMessage.success(`短信已发送给 ${current_contact.value.siji}`)
}

// 联系部门
function contact_bumen(type: string) {
  const numbers: Record<string, string> = {
    'police': '110',
    'ambulance': '120',
    'fire': '119'
  }
  const names: Record<string, string> = {
    'police': '报警',
    'ambulance': '急救',
    'fire': '火警'
  }
  
  ElMessageBox.confirm(
    `确定要拨打${names[type]}电话 ${numbers[type]} 吗？`,
    '确认拨打',
    {
      confirmButtonText: '拨打',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    window.open(`tel:${numbers[type]}`)
    
    // 记录操作日志
    add_caozuo_log({
      caozuoren: '管理员',
      mokuai: '紧急事件',
      type: 'other',
      biaoti: '联系相关部门',
      neirong: `拨打${names[type]}电话：${numbers[type]}`
    })
  }).catch(() => {})
}

// 解除紧急
function handle_jiechu(row: any) {
  current_detail.value = { ...row }
  jiechu_form.value = { yuanyin: 'wuxian', shuoming: '' }
  jiechu_visible.value = true
}

// 执行解除
function execute_jiechu() {
  const record = jinji_list.value.find(item => item.id === current_detail.value.id)
  if (record) {
    record.zhuangtai = 1
    record.jiechu_yuanyin = jiechu_form.value.yuanyin
    record.chuli_shuoming = jiechu_form.value.shuoming
    record.jiechu_shijian = new Date().toLocaleString()
    
    localStorage.setItem('jinji_list', JSON.stringify(jinji_list.value))
    
    ElMessage.success('紧急事件已解除')
    
    // 记录操作日志
    add_caozuo_log({
      caozuoren: '管理员',
      mokuai: '紧急事件',
      type: 'other',
      biaoti: '解除紧急事件',
      neirong: `司机：${record.siji}，原因：${get_jiechu_yuanyin_label(jiechu_form.value.yuanyin)}`
    })
  }
  
  jiechu_visible.value = false
}

// 获取解除原因标签
function get_jiechu_yuanyin_label(yuanyin: string) {
  const labels: Record<string, string> = {
    'wuxian': '确认无危险',
    'chuli': '已处理完毕',
    'wuwu': '误触解除'
  }
  return labels[yuanyin] || yuanyin
}

onMounted(() => {
  load_data()
  init_audio()
  request_notification_permission()
})

onUnmounted(() => {
  stop_alert_sound()
})
</script>

<style scoped>
.jinji-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.location-map {
  margin-top: 20px;
}

.map-placeholder {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 40px;
  text-align: center;
}

.map-placeholder .el-icon {
  font-size: 48px;
  color: #909399;
}

.map-coords {
  color: #909399;
  font-size: 14px;
  margin-top: 10px;
}

.contact-card {
  text-align: center;
  cursor: pointer;
  transition: all 0.3s;
}

.contact-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.contact-icon {
  font-size: 32px;
  color: #f56c6c;
  margin-bottom: 10px;
}

.contact-title {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.contact-number {
  font-size: 24px;
  font-weight: bold;
  color: #f56c6c;
}

.contact-content {
  padding: 20px;
}

.siji-info {
  text-align: center;
  margin-bottom: 30px;
}

.siji-info h3 {
  margin: 0 0 10px 0;
  font-size: 20px;
}

.siji-info p {
  margin: 5px 0;
  color: #909399;
}

.contact-actions {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.photo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.photo-item img {
  max-width: 100%;
  max-height: 300px;
  object-fit: contain;
}

.photo-info {
  text-align: center;
  margin-top: 10px;
}

.photo-time {
  color: #909399;
  font-size: 12px;
}

.alert-content {
  text-align: center;
  padding: 30px;
}

.alert-icon {
  font-size: 80px;
  color: #f56c6c;
  animation: blink 1s infinite;
}

@keyframes blink {
  0%, 50% { opacity: 1; }
  51%, 100% { opacity: 0.3; }
}

.alert-title {
  color: #f56c6c;
  font-size: 28px;
  margin: 20px 0;
}

.alert-message {
  font-size: 18px;
  color: #303133;
  margin-bottom: 10px;
}

.alert-location,
.alert-time {
  color: #909399;
  margin: 5px 0;
}
</style>
