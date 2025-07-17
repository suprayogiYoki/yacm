// lib/jwt.ts
import jwt from 'jsonwebtoken'

const SECRET = process.env.JWT_SECRET!

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: '24h' })
}

export function verifyToken(token: string) {
  try {
    console.log('token v', token);
    return jwt.verify(token, SECRET)
  } catch(e) {
    console.log('errror', e);
    return null
  }
}
