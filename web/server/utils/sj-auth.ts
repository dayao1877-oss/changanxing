import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import prisma from './prisma'

const SJ_JWT_SECRET = process.env.JWT_SECRET || 'sj-jwt-secret-key-for-development-only'
const SJ_JWT_EXPIRES_IN = '24h'

interface SjAuthTokenPayload {
  sj_guanliyuan_id: number
  sj_zhanghao: string
  sj_xingming: string
  sj_zhuangtai: number
}

export async function sjEncryptPassword(sj_mima: string): Promise<string> {
  const sj_salt_rounds = 10
  return await bcrypt.hash(sj_mima, sj_salt_rounds)
}

export async function sjVerifyPassword(sj_mima: string, sj_hash: string): Promise<boolean> {
  return await bcrypt.compare(sj_mima, sj_hash)
}

export function sjGenerateToken(sj_payload: SjAuthTokenPayload): string {
  return jwt.sign(sj_payload, SJ_JWT_SECRET, { expiresIn: SJ_JWT_EXPIRES_IN })
}

export function sjVerifyToken(sj_token: string): SjAuthTokenPayload | null {
  try {
    const sj_payload = jwt.verify(sj_token, SJ_JWT_SECRET) as SjAuthTokenPayload
    return sj_payload
  } catch (sj_error) {
    return null
  }
}

export async function sjGetGuanliyuanFromToken(sj_token: string) {
  const sj_payload = sjVerifyToken(sj_token)
  if (!sj_payload) {
    return null
  }

  const sj_guanliyuan = await prisma.sjGuanliyuan.findUnique({
    where: { sj_id: sj_payload.sj_guanliyuan_id }
  })

  if (!sj_guanliyuan || sj_guanliyuan.sj_zhuangtai !== 1) {
    return null
  }

  return sj_guanliyuan
}

export function sjExtractTokenFromHeader(sj_authorization: string | undefined): string | null {
  if (!sj_authorization) {
    return null
  }

  const sj_parts = sj_authorization.split(' ')
  if (sj_parts.length !== 2 || sj_parts[0] !== 'Bearer') {
    return null
  }

  return sj_parts[1]
}
