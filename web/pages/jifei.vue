<template>
  <Layout>
    <div class="jifei-page">
      <el-card>
        <template #header>
          <div class="card-header">
            <span>计费规则配置</span>
            <el-button type="primary" @click="save_config">
              <el-icon><Check /></el-icon> 保存配置
            </el-button>
          </div>
        </template>

        <el-form :model="config" label-width="150px">
          <el-divider content-position="left">基础计费</el-divider>
          
          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="起步价（元）">
                <el-input-number v-model="config.qibujia" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="起步里程（公里）">
                <el-input-number v-model="config.qibulicheng" :min="0" :precision="1" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="单价（元/公里）">
                <el-input-number v-model="config.danjia" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="最低消费（元）">
                <el-input-number v-model="config.zuidixiaofei" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">附加费用</el-divider>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="过路费计算">
                <el-radio-group v-model="config.guolufei_jisuan">
                  <el-radio label="shiji">按实际收取</el-radio>
                  <el-radio label="guding">固定金额</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="config.guolufei_jisuan === 'guding'">
              <el-form-item label="过路费固定金额">
                <el-input-number v-model="config.guolufei_jine" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="停车费计算">
                <el-radio-group v-model="config.tingchefei_jisuan">
                  <el-radio label="shiji">按实际收取</el-radio>
                  <el-radio label="guding">固定金额</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
            <el-col :span="12" v-if="config.tingchefei_jisuan === 'guding'">
              <el-form-item label="停车费固定金额">
                <el-input-number v-model="config.tingchefei_jine" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="12">
              <el-form-item label="等待费（元/小时）">
                <el-input-number v-model="config.dengdaifei" :min="0" :precision="2" style="width: 100%;" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="免费等待时间（分钟）">
                <el-input-number v-model="config.mianfei_dengdai" :min="0" :precision="0" style="width: 100%;" />
              </el-form-item>
            </el-col>
          </el-row>

          <el-divider content-position="left">司机提成</el-divider>

          <el-form-item label="统一提成比例">
            <el-slider v-model="config.tongyi_ticheng" :max="100" show-stops :step="5" show-input />
            <div class="tip-text">所有司机默认使用此提成比例，可在司机管理中单独设置</div>
          </el-form-item>

          <el-form-item label="夜间加成">
            <el-switch v-model="config.yejian_jiacheng" />
            <span class="switch-label">夜间时段（22:00-06:00）订单额外加成</span>
          </el-form-item>

          <el-row :gutter="20" v-if="config.yejian_jiacheng">
            <el-col :span="12">
              <el-form-item label="夜间加成比例">
                <el-slider v-model="config.yejian_bili" :max="50" show-stops :step="5" show-input />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item label="节假日加成">
                <el-slider v-model="config.jiejiari_bili" :max="50" show-stops :step="5" show-input />
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-card>

      <!-- 计费规则预览 -->
      <el-card style="margin-top: 20px;">
        <template #header>
          <span>计费规则预览</span>
        </template>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="起步价">¥{{ config.qibujia.toFixed(2) }} / {{ config.qibulicheng }}公里</el-descriptions-item>
          <el-descriptions-item label="超里程单价">¥{{ config.danjia.toFixed(2) }} / 公里</el-descriptions-item>
          <el-descriptions-item label="最低消费">¥{{ config.zuidixiaofei.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="等待费">¥{{ config.dengdaifei.toFixed(2) }} / 小时（前{{ config.mianfei_dengdai }}分钟免费）</el-descriptions-item>
          <el-descriptions-item label="过路费">{{ config.guolufei_jisuan === 'shiji' ? '按实际收取' : '固定¥' + config.guolufei_jine.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="停车费">{{ config.tingchefei_jisuan === 'shiji' ? '按实际收取' : '固定¥' + config.tingchefei_jine.toFixed(2) }}</el-descriptions-item>
          <el-descriptions-item label="司机提成">{{ config.tongyi_ticheng }}%</el-descriptions-item>
          <el-descriptions-item label="夜间加成" v-if="config.yejian_jiacheng">{{ config.yejian_bili }}%</el-descriptions-item>
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
import { log_jifei_change } from '~/utils/caozuo-log'

// 默认配置
const default_config = {
  qibujia: 15,
  qibulicheng: 3,
  danjia: 2.5,
  zuidixiaofei: 15,
  guolufei_jisuan: 'shiji',
  guolufei_jine: 0,
  tingchefei_jisuan: 'shiji',
  tingchefei_jine: 0,
  dengdaifei: 20,
  mianfei_dengdai: 15,
  tongyi_ticheng: 60,
  yejian_jiacheng: false,
  yejian_bili: 20,
  jiejiari_bili: 30
}

const config = ref({ ...default_config })
let old_config = { ...default_config }

// 加载配置
onMounted(() => {
  const saved = localStorage.getItem('jifei_config')
  if (saved) {
    config.value = { ...default_config, ...JSON.parse(saved) }
    old_config = { ...config.value }
  }
})

// 保存配置
function save_config() {
  // 记录变更
  log_jifei_change(old_config, config.value)
  
  localStorage.setItem('jifei_config', JSON.stringify(config.value))
  old_config = { ...config.value }
  ElMessage.success('计费规则已保存')
}
</script>

<style scoped>
.jifei-page {
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
</style>
