import { NextResponse } from 'next/server';
  import { PrismaClient } from '@prisma/client';
  import { z } from 'zod';
  import { context } from '@/backend/lib/context';
  import JSON5 from 'json5'
  import bcrypt from 'bcrypt';

  const prisma = new PrismaClient();
export async function POST(req: Request) {
  
  const bodyString = await req.text();
  let body = JSON5.parse(bodyString);
  body = await context.bodyModifier({req, body})
  if (body instanceof Response) {
    return body
  }
  const result = await prisma.user.findFirst({ where: { email: body.email } }).then(r=>({login_data: r}))
  let modResult = await context.resultModifier({req, result, body})
  if (modResult instanceof Response) {
    return modResult
  }
  return NextResponse.json(modResult, { status: 200 });
}
