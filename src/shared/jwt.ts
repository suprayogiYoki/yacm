// lib/jwt.ts
import { AuthState } from '@/store/slices/auth_slice';
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: AuthState) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch(e) {
    return null
  }
}
