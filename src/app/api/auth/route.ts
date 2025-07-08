import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: Request) {
  const user = await prisma.user.findMany();
  return NextResponse.json({ user: user });
}