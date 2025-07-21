import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { signToken } from '@/shared/jwt';
import { jwtVerify } from 'jose';
import { AuthState, initialState } from '@/store/slices/auth_slice';

const prisma = new PrismaClient();
export async function GET(req: NextRequest, res: NextResponse) {
  const token = req.cookies.get('token')?.value
  const { payload } = (token ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) : { payload: initialState }) as {payload: any};
  try {
    if(!payload) throw new Error('Unauthorized')
    // Issue new tokens (adjust expiry as needed)
    delete payload.exp
    const newAccessToken = signToken({ ...payload });
    const response = NextResponse.json({
      success: true,
    }, { status: 200, headers: { 'Authorization': `Bearer ${newAccessToken}` } });
    response.cookies.set('token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600,
      path: '/',
    })
    return response;
  } catch (error) {
    const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    return response;
  }
}