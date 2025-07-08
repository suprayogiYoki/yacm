import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export async function POST(req: Request) {
  const { email, password, name } = await req.json();

  // Login
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) return NextResponse.json({ error: 'Invalid password' }, { status: 401 });

  return NextResponse.json({ user: { email: user.email, name: user.name }, token: 'fake-jwt-token' });
}