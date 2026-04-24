<template>
  <el-dialog 
    :title="sjTitle" 
    :model-value="sjVisible"
    @update:model-value="(val) => emit('update:sjVisible', val)"
    width="900px" 
    :close-on-click-modal="false"
  >
    <div class="sj-map-container">
      <div class="sj-map-left">
        <el-input
          v-model="sjSearchKeyword"
          placeholder="搜索地点"
          clearable
          @keyup.enter="sjSearchLocation"
          style="margin-bottom: 10px;"
        >
          <template #append>
            <el-button :icon="Search" @click="sjSearchLocation" />
          </template>
        </el-input>
        
        <!-- 搜索结果列表 -->
        <div v-if="sjSearchResults.length > 0" class="sj-search-results">
          <div class="sj-search-title">搜索结果</div>
          <div class="sj-location-list">
            <div
              v-for="item in sjSearchResults"
              :key="item.id"
              class="sj-location-item"
              @click="sjSelectSearchResult(item)"
            >
              <div class="sj-location-name">{{ item.name }}</div>
              <div class="sj-location-address">{{ item.address }}</div>
            </div>
          </div>
        </div>
        
        <el-tabs v-model="sjActiveTab" style="margin-bottom: 10px;">
          <el-tab-pane label="常用地点" name="favorites">
            <el-collapse>
              <el-collapse-item title="🚉 车站" name="chezhan">
                <div class="sj-location-list">
                  <div
                    v-for="item in SJ_XIAN_LOCATIONS.sj_chezhan"
                    :key="item.sj_name"
                    class="sj-location-item"
                    @click="sjSelectLocation(item)"
                  >
                    <div class="sj-location-name">{{ item.sj_name }}</div>
                    <div class="sj-location-address">{{ item.sj_address }}</div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="🏯 景区" name="jingqu">
                <div class="sj-location-list">
                  <div
                    v-for="item in SJ_XIAN_LOCATIONS.sj_jingqu"
                    :key="item.sj_name"
                    class="sj-location-item"
                    @click="sjSelectLocation(item)"
                  >
                    <div class="sj-location-name">{{ item.sj_name }}</div>
                    <div class="sj-location-address">{{ item.sj_address }}</div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="✈️ 机场" name="jichang">
                <div class="sj-location-list">
                  <div
                    v-for="item in SJ_XIAN_LOCATIONS.sj_jichang"
                    :key="item.sj_name"
                    class="sj-location-item"
                    @click="sjSelectLocation(item)"
                  >
                    <div class="sj-location-name">{{ item.sj_name }}</div>
                    <div class="sj-location-address">{{ item.sj_address }}</div>
                  </div>
                </div>
              </el-collapse-item>
              <el-collapse-item title="📍 其他" name="qita">
                <div class="sj-location-list">
                  <div
                    v-for="item in SJ_XIAN_LOCATIONS.sj_qita"
                    :key="item.sj_name"
                    class="sj-location-item"
                    @click="sjSelectLocation(item)"
                  >
                    <div class="sj-location-name">{{ item.sj_name }}</div>
                    <div class="sj-location-address">{{ item.sj_address }}</div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </el-tab-pane>
        </el-tabs>
      </div>
      
      <div class="sj-map-right">
        <div id="sjMapPicker" class="sj-map"></div>
        <div class="sj-selected-info" v-if="sjSelectedLocation.sj_address">
          <div class="sj-selected-label">已选位置：</div>
          <div class="sj-selected-address">{{ sjSelectedLocation.sj_address }}</div>
        </div>
        <div class="sj-map-tip" v-else>点击地图选点，或选择左侧常用地点</div>
      </div>
    </div>
    
    <template #footer>
      <el-button @click="sjCancel">取消</el-button>
      <el-button type="primary" @click="sjConfirm" :disabled="!sjSelectedLocation.sj_address">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { Search } from '@element-plus/icons-vue'
import { SJ_XIAN_LOCATIONS } from '~/composables/sj-xian-locations'

const config = useRuntimeConfig()
const AMAP_KEY = config.public.amapKey || ''

const props = defineProps<{
  sjTitle?: string
  sjVisible: boolean
  sjInitialLocation?: { sj_jingdu: number; sj_weidu: number; sj_name: string }
}>()

const emit = defineEmits(['update:sjVisible', 'sjConfirm', 'sjCancel'])

const sjActiveTab = ref('favorites')
const sjSearchKeyword = ref('')
const sjSearchResults = ref<any[]>([])
const sjMapInstance = ref<any>(null)
const sjMarker = ref<any>(null)
const sjSelectedLocation = ref({
  sj_name: '',
  sj_address: '',
  sj_jingdu: 0,
  sj_weidu: 0
})

watch(() => props.sjVisible, (val) => {
  if (val) {
    sjSearchResults.value = []
    sjSearchKeyword.value = ''
    if (props.sjInitialLocation && props.sjInitialLocation.sj_jingdu) {
      sjSelectedLocation.value = {
        sj_name: props.sjInitialLocation.sj_name || '',
        sj_address: props.sjInitialLocation.sj_name || '',
        sj_jingdu: props.sjInitialLocation.sj_jingdu,
        sj_weidu: props.sjInitialLocation.sj_weidu
      }
    } else {
      sjSelectedLocation.value = {
        sj_name: '',
        sj_address: '',
        sj_jingdu: 0,
        sj_weidu: 0
      }
    }
    sjMarker.value = null
    nextTick(() => {
      setTimeout(() => {
        sjInitMap()
      }, 300)
    })
  } else {
    sjCleanupMap()
  }
}, { immediate: false })

onUnmounted(() => {
  sjCleanupMap()
})

function sjCleanupMap() {
  if (sjMapInstance.value) {
    try {
      sjMapInstance.value.destroy()
    } catch (error) {
      console.log('清理地图实例时出错:', error)
    }
    sjMapInstance.value = null
  }
  sjMarker.value = null
}

function sjInitMap() {
  if (typeof window === 'undefined') return
  const AMap = (window as any).AMap
  if (!AMap) {
    console.warn('高德地图API未加载，将在1秒后重试...')
    setTimeout(sjInitMap, 1000)
    return
  }
  
  const mapDom = document.getElementById('sjMapPicker')
  if (!mapDom) {
    console.error('地图DOM不存在')
    return
  }
  
  sjCleanupMap()
  
  try {
    sjMapInstance.value = new AMap.Map('sjMapPicker', {
      zoom: 13,
      center: [108.948333, 34.263333],
      viewMode: '2D'
    })
    
    sjMapInstance.value.on('click', sjHandleMapClick)
    
    if (props.sjInitialLocation && props.sjInitialLocation.sj_jingdu) {
      sjSetMarker(props.sjInitialLocation.sj_jingdu, props.sjInitialLocation.sj_weidu)
      sjMapInstance.value.setCenter([props.sjInitialLocation.sj_jingdu, props.sjInitialLocation.sj_weidu])
    }
  } catch (error) {
    console.error('地图初始化失败:', error)
  }
}

async function sjGetAddress(lng: number, lat: number): Promise<{name: string, address: string} | null> {
  try {
    const url = `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${lng.toFixed(6)},${lat.toFixed(6)}&extensions=all&output=json`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.regeocode) {
      const regeocode = data.regeocode
      const addressComponent = regeocode.addressComponent || {}
      const pois = regeocode.pois || []
      
      let poiName = ''
      if (pois.length > 0) {
        poiName = pois[0].name
      }
      
      // 手动拼接地址，避免使用可能包含对象的 formattedAddress
      const parts: string[] = []
      
      // 省
      if (addressComponent.province && typeof addressComponent.province === 'string') {
        parts.push(addressComponent.province)
      }
      
      // 市（如果和市不同）
      if (addressComponent.city && typeof addressComponent.city === 'string') {
        if (addressComponent.city !== addressComponent.province) {
          parts.push(addressComponent.city)
        }
      }
      
      // 区/县
      if (addressComponent.district && typeof addressComponent.district === 'string') {
        parts.push(addressComponent.district)
      }
      
      // 乡镇/街道
      if (addressComponent.township && typeof addressComponent.township === 'string') {
        parts.push(addressComponent.township)
      }
      
      // 街道名称（如果是字符串）
      if (addressComponent.street && typeof addressComponent.street === 'string') {
        parts.push(addressComponent.street)
      }
      
      // 门牌号（如果是字符串）
      if (addressComponent.streetNumber && typeof addressComponent.streetNumber === 'string') {
        parts.push(addressComponent.streetNumber)
      }
      
      // 建筑名称
      if (addressComponent.building && typeof addressComponent.building === 'string') {
        parts.push(addressComponent.building)
      }
      
      let formattedAddress = parts.join('')
      
      // 如果拼接的地址为空，尝试使用 formattedAddress（清理对象字符串）
      if (!formattedAddress || formattedAddress.length < 3) {
        formattedAddress = (regeocode.formattedAddress || '').replace(/\[object Object\]/g, '').trim()
      }
      
      // 如果还是没有，使用POI名称
      if (!formattedAddress || formattedAddress.length < 3) {
        formattedAddress = poiName || '西安市'
      }
      
      return {
        name: poiName || formattedAddress.substring(0, 30),
        address: formattedAddress
      }
    }
    return null
  } catch (error) {
    console.error('逆地理编码请求失败:', error)
    return null
  }
}

async function sjHandleMapClick(sjEvent: any) {
  if (!sjEvent.lnglat) return
  
  try {
    const sjLng = sjEvent.lnglat.lng
    const sjLat = sjEvent.lnglat.lat
    
    sjSetMarker(sjLng, sjLat)
    
    sjSelectedLocation.value = {
      sj_jingdu: sjLng,
      sj_weidu: sjLat,
      sj_name: '正在获取地址...',
      sj_address: '正在获取地址...'
    }
    
    const addressInfo = await sjGetAddress(sjLng, sjLat)
    
    if (addressInfo && addressInfo.address && addressInfo.address !== '未知地址') {
      sjSelectedLocation.value = {
        sj_jingdu: sjLng,
        sj_weidu: sjLat,
        sj_name: addressInfo.name,
        sj_address: addressInfo.address
      }
    } else {
      sjSelectedLocation.value = {
        sj_jingdu: sjLng,
        sj_weidu: sjLat,
        sj_name: '地图选点',
        sj_address: `西安市 (${sjLng.toFixed(4)}, ${sjLat.toFixed(4)})`
      }
    }
  } catch (error) {
    console.error('处理地图点击失败:', error)
  }
}

function sjSetMarker(sjLng: number, sjLat: number) {
  if (!sjMapInstance.value) return
  
  const AMap = (window as any).AMap
  
  if (sjMarker.value) {
    sjMarker.value.setPosition([sjLng, sjLat])
  } else {
    sjMarker.value = new AMap.Marker({
      position: [sjLng, sjLat],
      title: '选中位置',
      animation: 'AMAP_ANIMATION_DROP'
    })
    sjMapInstance.value.add(sjMarker.value)
  }
}

function sjSelectLocation(sjItem: any) {
  if (!sjItem) return
  
  sjSelectedLocation.value = {
    sj_name: sjItem.sj_name,
    sj_address: sjItem.sj_address,
    sj_jingdu: sjItem.sj_jingdu,
    sj_weidu: sjItem.sj_weidu
  }
  
  sjSetMarker(sjItem.sj_jingdu, sjItem.sj_weidu)
  if (sjMapInstance.value) {
    sjMapInstance.value.setCenter([sjItem.sj_jingdu, sjItem.sj_weidu])
    sjMapInstance.value.setZoom(15)
  }
  
  sjSearchResults.value = []
}

async function sjSearchLocation() {
  const keyword = sjSearchKeyword.value.trim()
  if (!keyword) return
  
  try {
    const url = `https://restapi.amap.com/v3/place/text?key=${AMAP_KEY}&keywords=${encodeURIComponent(keyword)}&city=西安&offset=10&page=1&extensions=all&output=json`
    const response = await fetch(url)
    const data = await response.json()
    
    if (data.status === '1' && data.pois && data.pois.length > 0) {
      sjSearchResults.value = data.pois.map((poi: any) => {
        const location = poi.location.split(',')
        return {
          id: poi.id,
          name: poi.name,
          address: poi.address || poi.name,
          lng: parseFloat(location[0]),
          lat: parseFloat(location[1])
        }
      })
    } else {
      sjSearchResults.value = []
    }
  } catch (error) {
    console.error('搜索失败:', error)
    sjSearchResults.value = []
  }
}

function sjSelectSearchResult(item: any) {
  if (!item) return
  
  sjSelectedLocation.value = {
    sj_name: item.name,
    sj_address: item.address,
    sj_jingdu: item.lng,
    sj_weidu: item.lat
  }
  
  sjSetMarker(item.lng, item.lat)
  if (sjMapInstance.value) {
    sjMapInstance.value.setCenter([item.lng, item.lat])
    sjMapInstance.value.setZoom(15)
  }
  
  sjSearchResults.value = []
  sjSearchKeyword.value = ''
}

function sjConfirm() {
  if (!sjSelectedLocation.value.sj_address) {
    return
  }
  emit('sjConfirm', sjSelectedLocation.value)
  emit('update:sjVisible', false)
}

function sjCancel() {
  emit('sjCancel')
  emit('update:sjVisible', false)
}
</script>

<style scoped>
.sj-map-container {
  display: flex;
  gap: 15px;
  height: 500px;
}

.sj-map-left {
  width: 300px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.sj-map-right {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sj-map {
  flex: 1;
  min-height: 400px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.sj-map-tip {
  text-align: center;
  color: #909399;
  font-size: 12px;
  margin-top: 8px;
  padding: 8px;
}

.sj-selected-info {
  margin-top: 8px;
  padding: 10px;
  background-color: #f0f9ff;
  border: 1px solid #409eff;
  border-radius: 4px;
}

.sj-selected-label {
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
}

.sj-selected-address {
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}

.sj-search-results {
  margin-bottom: 10px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background-color: #fff;
}

.sj-search-title {
  padding: 8px 12px;
  background-color: #f5f7fa;
  font-size: 12px;
  color: #606266;
  border-bottom: 1px solid #dcdfe6;
}

.sj-location-list {
  max-height: 200px;
  overflow-y: auto;
}

.sj-location-item {
  padding: 10px 12px;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.2s;
}

.sj-location-item:hover {
  background-color: #f5f7fa;
}

.sj-location-item:last-child {
  border-bottom: none;
}

.sj-location-name {
  font-weight: 500;
  font-size: 14px;
  color: #303133;
  margin-bottom: 4px;
}

.sj-location-address {
  font-size: 12px;
  color: #909399;
}
</style>
