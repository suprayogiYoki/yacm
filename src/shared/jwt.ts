// lib/jwt.ts
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}
