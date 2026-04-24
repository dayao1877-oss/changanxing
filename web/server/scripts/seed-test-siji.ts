import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('开始创建测试司机数据...')

  const sj_hashed_password = await bcrypt.hash('123456', 10)

  const sj_test_siji = await prisma.sjSiji.upsert({
    where: { sj_shouji: '13800138000' },
    update: {},
    create: {
      sj_bianhao: 'SJ001',
      sj_xingming: '张三',
      sj_shouji: '13800138000',
      sj_mima: sj_hashed_password,
      sj_shenfenzheng: '110101199001011234',
      sj_chepaihao: '京A12345',
      sj_zhuangtai: 1,
      sj_ruzhi_shijian: new Date('2024-01-01')
    }
  })

  console.log('测试司机创建成功:', sj_test_siji.sj_xingming)
  console.log('手机号: 13800138000')
  console.log('密码: 123456')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
