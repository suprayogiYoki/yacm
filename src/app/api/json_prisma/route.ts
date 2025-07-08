import { mergePrismas } from '@/backend/lib/merge_prisma';
import { NextResponse } from 'next/server';
export async function GET(req: Request) {
  return NextResponse.json({
    prisma: await mergePrismas(),
  });
}