<template>
  <Layout>
    <div class="dingwei-page">
      <el-card>
        <div class="page-header">
          <h3>实时定位监控</h3>
          <div class="legend">
            <span class="legend-item"><span class="dot online"></span> 在线</span>
            <span class="legend-item"><span class="dot busy"></span> 忙碌</span>
            <span class="legend-item"><span class="dot offline"></span> 离线</span>
          </div>
        </div>
        
        <div id="driverMap" class="driver-map"></div>
        
        <div class="driver-list">
          <h4>在线司机列表 ({{ online_drivers.length }})</h4>
          <el-table :data="online_drivers" style="width: 100%;" v-loading="loading">
            <el-table-column prop="siji" label="司机" width="120" />
            <el-table-column prop="chepai" label="车牌号" width="120" />
            <el-table-column prop="dingdan" label="当前订单" width="150" />
            <el-table-column prop="dizhi" label="当前位置" />
            <el-table-column prop="sudu" label="速度" width="100">
              <template #default="{ row }">
                <span :class="{ 'text-danger': row.sudu > 80 }">{{ row.sudu }} km/h</span>
              </template>
            </el-table-column>
            <el-table-column prop="shijian" label="更新时间" width="170" />
            <el-table-column label="操作" width="220">
              <template #default="{ row }">
                <el-button size="small" @click="locateDriver(row)">定位</el-button>
                <el-button size="small" type="primary" @click="viewDriverDetail(row)">详情</el-button>
                <el-button size="small" type="success" @click="showTrajectory(row)">轨迹</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-card>

      <!-- 轨迹回放弹窗 -->
      <el-dialog 
        :title="`${current_trajectory_driver?.siji || '司机'} - 轨迹回放`" 
        v-model="trajectory_dialog_visible" 
        width="900px"
        @close="closeTrajectoryDialog"
      >
        <div class="trajectory-container">
          <div id="trajectoryMap" class="trajectory-map"></div>
          
          <div class="trajectory-controls">
            <el-button :type="is_playing ? 'warning' : 'primary'" @click="togglePlay">
              <el-icon><component :is="is_playing ? 'VideoPause' : 'VideoPlay'" /></el-icon>
              {{ is_playing ? '暂停' : '播放' }}
            </el-button>
            <el-button @click="resetPlay">
              <el-icon><RefreshRight /></el-icon>
              重置
            </el-button>
            <el-slider v-model="play_progress" :max="100" style="flex: 1; margin: 0 20px;" />
            <span class="progress-text">{{ play_progress }}%</span>
          </div>
          
          <div class="trajectory-info" v-if="trajectory_points.length > 0">
            <el-descriptions :column="3" border size="small">
              <el-descriptions-item label="轨迹点数">{{ trajectory_points.length }} 个</el-descriptions-item>
              <el-descriptions-item label="起点时间">{{ trajectory_points[0]?.time }}</el-descriptions-item>
              <el-descriptions-item label="终点时间">{{ trajectory_points[trajectory_points.length - 1]?.time }}</el-descriptions-item>
            </el-descriptions>
          </div>
          
          <div class="trajectory-table">
            <h5>轨迹点详情</h5>
            <el-table :data="trajectory_points" height="200" size="small">
              <el-table-column type="index" label="序号" width="60" />
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="lng" label="经度" width="120" />
              <el-table-column prop="lat" label="纬度" width="120" />
              <el-table-column prop="speed" label="速度(km/h)" width="100" />
            </el-table>
          </div>
        </div>
      </el-dialog>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import Layout from '~/components/Layout.vue'

const loading = ref(false)
const mapInstance = ref<any>(null)
const markers = ref<any[]>([])
const refreshTimer = ref<any>(null)

// 模拟在线司机数据
const online_drivers = ref([
  { 
    id: 1, 
    siji: '王师傅', 
    chepai: '陕A12345',
    dingdan: 'DD20240424001', 
    jingdu: 108.957238, 
    weidu: 34.386166, 
    dizhi: '西安北站',
    sudu: 60, 
    shijian: '2024-04-24 10:30:00',
    zhuangtai: 'busy'
  },
  { 
    id: 2, 
    siji: '李师傅', 
    chepai: '陕A67890',
    dingdan: '-', 
    jingdu: 108.965705, 
    weidu: 34.217619, 
    dizhi: '大雁塔',
    sudu: 0, 
    shijian: '2024-04-24 10:30:30',
    zhuangtai: 'online'
  },
  { 
    id: 3, 
    siji: '张师傅', 
    chepai: '陕A54321',
    dingdan: 'DD20240424003', 
    jingdu: 108.948333, 
    weidu: 34.263333, 
    dizhi: '钟楼',
    sudu: 45, 
    shijian: '2024-04-24 10:29:45',
    zhuangtai: 'busy'
  }
])

onMounted(() => {
  setTimeout(() => {
    initMap()
  }, 500)
  
  // 每30秒刷新一次位置
  refreshTimer.value = setInterval(() => {
    refreshDriverLocations()
  }, 30000)
})

onUnmounted(() => {
  if (refreshTimer.value) {
    clearInterval(refreshTimer.value)
  }
  if (mapInstance.value) {
    mapInstance.value.destroy()
  }
})

function initMap() {
  if (typeof window === 'undefined') return
  const AMap = (window as any).AMap
  if (!AMap) {
    console.error('高德地图API未加载')
    return
  }
  
  try {
    mapInstance.value = new AMap.Map('driverMap', {
      zoom: 12,
      center: [108.948333, 34.263333],
      viewMode: '2D'
    })
    
    // 添加司机标记
    updateDriverMarkers()
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

function updateDriverMarkers() {
  if (!mapInstance.value) return
  
  const AMap = (window as any).AMap
  
  // 清除旧标记
  markers.value.forEach(marker => {
    mapInstance.value.remove(marker)
  })
  markers.value = []
  
  // 添加新标记
  online_drivers.value.forEach(driver => {
    const marker = new AMap.Marker({
      position: [driver.jingdu, driver.weidu],
      title: driver.siji,
      label: {
        content: driver.siji,
        direction: 'top'
      },
      icon: new AMap.Icon({
        image: getMarkerIcon(driver.zhuangtai),
        size: new AMap.Size(30, 40),
        imageSize: new AMap.Size(30, 40)
      })
    })
    
    // 添加点击事件
    marker.on('click', () => {
      showDriverInfo(driver)
    })
    
    mapInstance.value.add(marker)
    markers.value.push(marker)
  })
}

function getMarkerIcon(zhuangtai: string) {
  // 根据状态返回不同颜色的标记图标
  switch (zhuangtai) {
    case 'online':
      return 'https://webapi.amap.com/theme/v1.3/markers/n/mark_b.png' // 蓝色-在线
    case 'busy':
      return 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png' // 红色-忙碌
    default:
      return 'https://webapi.amap.com/theme/v1.3/markers/n/mark_g.png' // 灰色-离线
  }
}

function showDriverInfo(driver: any) {
  const AMap = (window as any).AMap
  const infoWindow = new AMap.InfoWindow({
    content: `
      <div style="padding: 10px;">
        <h4 style="margin: 0 0 10px 0;">${driver.siji}</h4>
        <p style="margin: 5px 0;">车牌号: ${driver.chepai}</p>
        <p style="margin: 5px 0;">当前订单: ${driver.dingdan}</p>
        <p style="margin: 5px 0;">速度: ${driver.sudu} km/h</p>
        <p style="margin: 5px 0;">位置: ${driver.dizhi}</p>
        <p style="margin: 5px 0;">更新时间: ${driver.shijian}</p>
      </div>
    `,
    offset: new AMap.Pixel(0, -30)
  })
  
  infoWindow.open(mapInstance.value, [driver.jingdu, driver.weidu])
}

function locateDriver(driver: any) {
  if (!mapInstance.value) return
  mapInstance.value.setCenter([driver.jingdu, driver.weidu])
  mapInstance.value.setZoom(15)
  showDriverInfo(driver)
}

function viewDriverDetail(driver: any) {
  ElMessage.info(`查看司机 ${driver.siji} 详情功能开发中`)
}

// 轨迹回放相关
const trajectory_dialog_visible = ref(false)
const current_trajectory_driver = ref<any>(null)
const trajectory_loading = ref(false)
const trajectory_map = ref<any>(null)
const trajectory_polyline = ref<any>(null)
const trajectory_markers = ref<any[]>([])
const is_playing = ref(false)
const play_progress = ref(0)
const play_timer = ref<any>(null)

// 模拟轨迹数据
const trajectory_points = ref<any[]>([])

function showTrajectory(driver: any) {
  current_trajectory_driver.value = driver
  trajectory_dialog_visible.value = true
  
  // 生成模拟轨迹数据
  generateMockTrajectory(driver)
  
  // 延迟初始化轨迹地图
  setTimeout(() => {
    initTrajectoryMap()
  }, 300)
}

function generateMockTrajectory(driver: any) {
  const points = []
  const startLng = driver.jingdu - 0.05
  const startLat = driver.weidu - 0.05
  const endLng = driver.jingdu + 0.05
  const endLat = driver.weidu + 0.05
  
  for (let i = 0; i <= 20; i++) {
    const t = i / 20
    points.push({
      lng: startLng + (endLng - startLng) * t + (Math.random() - 0.5) * 0.01,
      lat: startLat + (endLat - startLat) * t + (Math.random() - 0.5) * 0.01,
      time: new Date(Date.now() - (20 - i) * 60000).toLocaleString(),
      speed: Math.floor(Math.random() * 60) + 20
    })
  }
  
  trajectory_points.value = points
}

function initTrajectoryMap() {
  if (typeof window === 'undefined') return
  const AMap = (window as any).AMap
  if (!AMap) return
  
  if (trajectory_map.value) {
    trajectory_map.value.destroy()
  }
  
  try {
    trajectory_map.value = new AMap.Map('trajectoryMap', {
      zoom: 12,
      center: [current_trajectory_driver.value.jingdu, current_trajectory_driver.value.weidu],
      viewMode: '2D'
    })
    
    // 绘制完整轨迹线
    drawTrajectoryLine()
    
    // 添加起点和终点标记
    addStartEndMarkers()
  } catch (error) {
    console.error('轨迹地图初始化失败:', error)
  }
}

function drawTrajectoryLine() {
  if (!trajectory_map.value || trajectory_points.value.length === 0) return
  
  const AMap = (window as any).AMap
  
  if (trajectory_polyline.value) {
    trajectory_map.value.remove(trajectory_polyline.value)
  }
  
  const path = trajectory_points.value.map(p => [p.lng, p.lat])
  
  trajectory_polyline.value = new AMap.Polyline({
    path: path,
    strokeColor: '#409EFF',
    strokeWeight: 4,
    strokeOpacity: 0.8,
    showDir: true
  })
  
  trajectory_map.value.add(trajectory_polyline.value)
  trajectory_map.value.setFitView()
}

function addStartEndMarkers() {
  if (!trajectory_map.value || trajectory_points.value.length === 0) return
  
  const AMap = (window as any).AMap
  
  // 清除旧标记
  trajectory_markers.value.forEach(marker => {
    trajectory_map.value.remove(marker)
  })
  trajectory_markers.value = []
  
  const startPoint = trajectory_points.value[0]
  const endPoint = trajectory_points.value[trajectory_points.value.length - 1]
  
  // 起点标记
  const startMarker = new AMap.Marker({
    position: [startPoint.lng, startPoint.lat],
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      size: new AMap.Size(25, 34),
      imageSize: new AMap.Size(25, 34)
    }),
    label: {
      content: '起点',
      direction: 'top'
    }
  })
  
  // 终点标记
  const endMarker = new AMap.Marker({
    position: [endPoint.lng, endPoint.lat],
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      size: new AMap.Size(25, 34),
      imageSize: new AMap.Size(25, 34)
    }),
    label: {
      content: '终点',
      direction: 'top'
    }
  })
  
  trajectory_map.value.add([startMarker, endMarker])
  trajectory_markers.value.push(startMarker, endMarker)
}

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
    
    // 更新当前位置标记
    updateCurrentPosition()
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
  updateCurrentPosition()
}

function updateCurrentPosition() {
  if (!trajectory_map.value || trajectory_points.value.length === 0) return
  
  const AMap = (window as any).AMap
  const index = Math.floor((play_progress.value / 100) * (trajectory_points.value.length - 1))
  const point = trajectory_points.value[index]
  
  // 移除旧的当前位置标记
  trajectory_markers.value.forEach(marker => {
    if (marker.getTitle() === 'current') {
      trajectory_map.value.remove(marker)
    }
  })
  
  // 添加新的当前位置标记
  const currentMarker = new AMap.Marker({
    position: [point.lng, point.lat],
    title: 'current',
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/mark_r.png',
      size: new AMap.Size(30, 40),
      imageSize: new AMap.Size(30, 40)
    })
  })
  
  trajectory_map.value.add(currentMarker)
  trajectory_markers.value.push(currentMarker)
}

function closeTrajectoryDialog() {
  pausePlay()
  trajectory_dialog_visible.value = false
}

function refreshDriverLocations() {
  loading.value = true
  
  // 模拟位置更新
  online_drivers.value.forEach(driver => {
    // 随机微调位置（模拟移动）
    if (driver.sudu > 0) {
      driver.jingdu += (Math.random() - 0.5) * 0.01
      driver.weidu += (Math.random() - 0.5) * 0.01
      driver.shijian = new Date().toLocaleString()
    }
  })
  
  // 更新地图标记
  updateDriverMarkers()
  
  loading.value = false
  ElMessage.success('位置已刷新')
}
</script>

<style scoped>
.dingwei-page {
  padding: 0;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.page-header h3 {
  margin: 0;
}

.legend {
  display: flex;
  gap: 20px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
}

.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.dot.online {
  background-color: #67c23a;
}

.dot.busy {
  background-color: #f56c6c;
}

.dot.offline {
  background-color: #909399;
}

.driver-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.driver-list {
  margin-top: 20px;
}

.driver-list h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.text-danger {
  color: #f56c6c;
  font-weight: bold;
}

.trajectory-container {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.trajectory-map {
  width: 100%;
  height: 350px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.trajectory-controls {
  display: flex;
  align-items: center;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 8px;
}

.progress-text {
  min-width: 50px;
  text-align: right;
  font-weight: bold;
  color: #409eff;
}

.trajectory-info {
  margin-top: 10px;
}

.trajectory-table {
  margin-top: 15px;
}

.trajectory-table h5 {
  margin: 0 0 10px 0;
  color: #303133;
}
</style>
