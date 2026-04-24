<template>
  <Layout>
    <div class="xitong-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>系统配置</span>
            <el-button type="primary" @click="save_config">
              <el-icon><Check /></el-icon> 保存配置
            </el-button>
          </div>
        </template>

        <el-form :model="config" label-width="180px">
          <el-divider content-position="left">定位配置</el-divider>
          
          <el-form-item label="定位频率">
            <el-radio-group v-model="config.dingwei_pinlv">
              <el-radio-button :label="15">15秒</el-radio-button>
              <el-radio-button :label="30">30秒</el-radio-button>
              <el-radio-button :label="60">60秒</el-radio-button>
            </el-radio-group>
            <div class="tip-text">司机端定位上传间隔时间</div>
          </el-form-item>

          <el-form-item label="智能定位调整">
            <el-switch v-model="config.zhineng_dingwei" />
            <span class="switch-label">根据速度自动调整定位频率</span>
          </el-form-item>

          <el-divider content-position="left">打卡配置</el-divider>

          <el-form-item label="打卡间隔（分钟）">
            <el-slider v-model="config.daka_jiange" :max="60" :min="5" show-stops :step="5" show-input />
            <div class="tip-text">司机两次打卡之间的最小间隔时间</div>
          </el-form-item>

          <el-form-item label="打卡提醒">
            <el-switch v-model="config.daka_tixing" />
            <span class="switch-label">到达打卡间隔后推送提醒</span>
          </el-form-item>

          <el-divider content-position="left">照片配置</el-divider>

          <el-form-item label="照片质量">
            <el-slider v-model="config.zhaopian_zhiliang" :max="100" :min="50" show-stops :step="10" show-input />
            <div class="tip-text">照片压缩质量，数值越高质量越好但文件越大</div>
          </el-form-item>

          <el-form-item label="最大照片尺寸">
            <el-select v-model="config.zhaopian_chicun" style="width: 200px;">
              <el-option label="1920x1080" value="1920x1080" />
              <el-option label="1280x720" value="1280x720" />
              <el-option label="640x480" value="640x480" />
            </el-select>
          </el-form-item>

          <el-form-item label="照片格式">
            <el-radio-group v-model="config.zhaopian_geshi">
              <el-radio-button label="jpg">JPG</el-radio-button>
              <el-radio-button label="png">PNG</el-radio-button>
            </el-radio-group>
          </el-form-item>

          <el-divider content-position="left">数据保留策略</el-divider>

          <el-form-item label="定位记录保留天数">
            <el-input-number v-model="config.dingwei_baoliu" :min="7" :max="365" />
            <span class="unit-text">天</span>
          </el-form-item>

          <el-form-item label="订单记录保留天数">
            <el-input-number v-model="config.dingdan_baoliu" :min="30" :max="1095" />
            <span class="unit-text">天（3年）</span>
          </el-form-item>

          <el-form-item label="操作日志保留天数">
            <el-input-number v-model="config.rizhi_baoliu" :min="30" :max="365" />
            <span class="unit-text">天</span>
          </el-form-item>

          <el-divider content-position="left">推送配置</el-divider>

          <el-form-item label="新订单推送">
            <el-switch v-model="config.tuisong_dingdan" />
          </el-form-item>

          <el-form-item label="打卡提醒推送">
            <el-switch v-model="config.tuisong_daka" />
          </el-form-item>

          <el-form-item label="异常处理结果推送">
            <el-switch v-model="config.tuisong_yichang" />
          </el-form-item>

          <el-form-item label="紧急状态解除推送">
            <el-switch v-model="config.tuisong_jinji" />
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 配置预览 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>配置预览</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="定位频率">{{ config.dingwei_pinlv }}秒</el-descriptions-item>
          <el-descriptions-item label="智能定位">{{ config.zhineng_dingwei ? '开启' : '关闭' }}</el-descriptions-item>
          <el-descriptions-item label="打卡间隔">{{ config.daka_jiange }}分钟</el-descriptions-item>
          <el-descriptions-item label="打卡提醒">{{ config.daka_tixing ? '开启' : '关闭' }}</el-descriptions-item>
          <el-descriptions-item label="照片质量">{{ config.zhaopian_zhiliang }}%</el-descriptions-item>
          <el-descriptions-item label="照片尺寸">{{ config.zhaopian_chicun }}</el-descriptions-item>
          <el-descriptions-item label="定位保留">{{ config.dingwei_baoliu }}天</el-descriptions-item>
          <el-descriptions-item label="订单保留">{{ config.dingdan_baoliu }}天</el-descriptions-item>
        </el-descriptions>
      </el-card>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import Layout from '~/components/Layout.vue'
import { log_xitong_change } from '~/utils/caozuo-log'

// 默认配置
const default_config = {
  dingwei_pinlv: 30,
  zhineng_dingwei: true,
  daka_jiange: 15,
  daka_tixing: true,
  zhaopian_zhiliang: 80,
  zhaopian_chicun: '1920x1080',
  zhaopian_geshi: 'jpg',
  dingwei_baoliu: 30,
  dingdan_baoliu: 365,
  rizhi_baoliu: 90,
  tuisong_dingdan: true,
  tuisong_daka: true,
  tuisong_yichang: true,
  tuisong_jinji: true
}

const config = ref({ ...default_config })
let old_config = { ...default_config }

// 加载配置
onMounted(() => {
  const saved = localStorage.getItem('xitong_config')
  if (saved) {
    config.value = { ...default_config, ...JSON.parse(saved) }
    old_config = { ...config.value }
  }
})

// 保存配置
function save_config() {
  // 记录变更
  log_xitong_change(old_config, config.value)
  
  localStorage.setItem('xitong_config', JSON.stringify(config.value))
  old_config = { ...config.value }
  ElMessage.success('系统配置已保存')
}
</script>

<style scoped>
.xitong-page {
  padding: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip-text {
  font-size: 12px;
  color: #909399;
  margin-top: 5px;
}

.switch-label {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}

.unit-text {
  margin-left: 10px;
  font-size: 14px;
  color: #606266;
}
</style>
