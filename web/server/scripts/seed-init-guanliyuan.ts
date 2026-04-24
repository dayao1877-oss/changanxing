import prisma from '../utils/prisma'
import { sjEncryptPassword } from '../utils/sj-auth'

async function sjSeedGuanliyuan() {
  try {
    const sj_existing = await prisma.sjGuanliyuan.findUnique({
      where: { sj_zhanghao: 'admin' }
    })

    if (sj_existing) {
      console.log('管理员账号已存在，无需重复创建')
      process.exit(0)
    }

    const sj_mima_hash = await sjEncryptPassword('123456')

    const sj_guanliyuan = await prisma.sjGuanliyuan.create({
      data: {
        sj_zhanghao: 'admin',
        sj_mima: sj_mima_hash,
        sj_xingming: '老板',
        sj_shouji: '13800138000',
        sj_zhuangtai: 1
      }
    })

    console.log('初始化管理员账号成功！')
    console.log('账号：admin')
    console.log('密码：123456')
    console.log('请在生产环境修改此默认密码！')

    process.exit(0)
  } catch (sj_error) {
    console.error('初始化管理员失败:', sj_error)
    process.exit(1)
  }
}

sjSeedGuanliyuan()
