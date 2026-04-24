<template>
  <div class="sj-map-route">
    <div id="sjMapRoute" class="sj-map"></div>
    <div class="sj-route-info" v-if="sjRouteInfo">
      <el-descriptions :column="2" border size="small">
        <el-descriptions-item label="总距离">{{ sjRouteInfo.sj_distance }}公里</el-descriptions-item>
        <el-descriptions-item label="预计时间">{{ sjRouteInfo.sj_duration_text }}</el-descriptions-item>
      </el-descriptions>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, onUnmounted } from 'vue'

const props = defineProps<{
  sjStartLocation: { sj_jingdu: number; sj_weidu: number; sj_name: string }
  sjEndLocation: { sj_jingdu: number; sj_weidu: number; sj_name: string }
}>()

const sjMapInstance = ref<any>(null)
const sjRouteInfo = ref<any>(null)
const sjMarkers = ref<any[]>([])

onMounted(() => {
  nextTick(() => {
    setTimeout(() => {
      sjInitMap()
    }, 200)
  })
})

watch([() => props.sjStartLocation, () => props.sjEndLocation], () => {
  if (props.sjStartLocation && props.sjEndLocation) {
    nextTick(() => {
      setTimeout(() => {
        sjInitMap()
      }, 200)
    })
  }
}, { deep: true })

onUnmounted(() => {
  if (sjMapInstance.value) {
    sjMapInstance.value.destroy()
    sjMapInstance.value = null
  }
})

function sjInitMap() {
  if (typeof window === 'undefined') return
  if (!(window as any).AMap) {
    console.error('高德地图API未加载')
    return
  }
  
  const mapDom = document.getElementById('sjMapRoute')
  if (!mapDom) return
  
  if (sjMapInstance.value) {
    sjMapInstance.value.destroy()
  }
  
  try {
    const AMap = (window as any).AMap
    sjMapInstance.value = new AMap.Map('sjMapRoute', {
      zoom: 12,
      center: [props.sjStartLocation.sj_jingdu, props.sjStartLocation.sj_weidu],
      viewMode: '2D'
    })
    
    // 清除之前的标记
    sjMarkers.value.forEach(marker => {
      sjMapInstance.value.remove(marker)
    })
    sjMarkers.value = []
    
    // 添加起点终点标记
    sjAddMarkers()
    
    // 规划路线
    sjShowRoute()
    
    // 调整地图视野
    const sjBounds = new AMap.Bounds(
      [Math.min(props.sjStartLocation.sj_jingdu, props.sjEndLocation.sj_jingdu),
       Math.min(props.sjStartLocation.sj_weidu, props.sjEndLocation.sj_weidu)],
      [Math.max(props.sjStartLocation.sj_jingdu, props.sjEndLocation.sj_jingdu),
       Math.max(props.sjStartLocation.sj_weidu, props.sjEndLocation.sj_weidu)]
    )
    sjMapInstance.value.setBounds(sjBounds)
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

function sjAddMarkers() {
  if (!sjMapInstance.value) return
  const AMap = (window as any).AMap
  
  // 起点标记
  const sjStartMarker = new AMap.Marker({
    position: [props.sjStartLocation.sj_jingdu, props.sjStartLocation.sj_weidu],
    title: props.sjStartLocation.sj_name,
    label: {
      content: '起点',
      direction: 'top'
    },
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/start.png',
      size: new AMap.Size(25, 34),
      imageSize: new AMap.Size(25, 34)
    })
  })
  
  // 终点标记
  const sjEndMarker = new AMap.Marker({
    position: [props.sjEndLocation.sj_jingdu, props.sjEndLocation.sj_weidu],
    title: props.sjEndLocation.sj_name,
    label: {
      content: '终点',
      direction: 'top'
    },
    icon: new AMap.Icon({
      image: 'https://webapi.amap.com/theme/v1.3/markers/n/end.png',
      size: new AMap.Size(25, 34),
      imageSize: new AMap.Size(25, 34)
    })
  })
  
  sjMapInstance.value.add([sjStartMarker, sjEndMarker])
  sjMarkers.value = [sjStartMarker, sjEndMarker]
}

function sjShowRoute() {
  if (!sjMapInstance.value) return
  if (typeof window === 'undefined') return
  if (!(window as any).AMap) return
  
  const AMap = (window as any).AMap
  
  // 驾车路线规划
  const sjDriving = new AMap.Driving({
    map: sjMapInstance.value,
    hideMarkers: true,
    showTraffic: false
  })
  
  sjDriving.search(
    [props.sjStartLocation.sj_jingdu, props.sjStartLocation.sj_weidu],
    [props.sjEndLocation.sj_jingdu, props.sjEndLocation.sj_weidu],
    (status: any, result: any) => {
      if (status === 'complete' && result.route && result.route.paths && result.route.paths.length > 0) {
        const sjPath = result.route.paths[0]
        sjRouteInfo.value = {
          sj_distance: (sjPath.distance / 1000).toFixed(2),
          sj_duration_text: `${Math.floor(sjPath.duration / 60)}分钟`
        }
      }
    }
  )
}
</script>

<style scoped>
.sj-map-route {
  width: 100%;
}

.sj-map {
  width: 100%;
  height: 400px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.sj-route-info {
  margin-top: 10px;
}
</style>
