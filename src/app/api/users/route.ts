import { NextResponse } from 'next/server';
  import { PrismaClient } from '@prisma/client';
  import { z } from 'zod';
  import { context } from '@/backend/lib/context';
  import JSON5 from 'json5'

  const prisma = new PrismaClient();
export async function GET(req: Request) {
  
  const result = await prisma.user.findMany().then(r=>({user_data: r}))
  let modResult = await context.resultModifier({req, result})
  return NextResponse.json(modResult, { status: 200 });
}
