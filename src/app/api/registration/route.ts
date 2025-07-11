import { NextResponse } from 'next/server';
  import { PrismaClient } from '@prisma/client';
  import { z } from 'zod';
  import { context } from '@/backend/lib/context';
  import JSON5 from 'json5'

  const prisma = new PrismaClient();
export async function POST(req: Request) {
  
  const bodyString = await req.text();
  let body = JSON5.parse(bodyString);
  body = await context.bodyModifier({req, body})
  if (body instanceof Response) {
    return body
  }
  const schema = z.object({
  id: z.number().int().optional(),
  username: z.string().max(50).min(3),
  email: z.string().email(),
  password: z.string(),
  first_name: z.string().max(50).optional(),
  last_name: z.string().max(50).optional(),
  is_active: z.boolean().optional(),
  email_verified: z.boolean().optional(),
  last_login: z.string().optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  tenant_id: z.number().int().optional(),
});
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }
  const result = await prisma.user.create({ data: parsed.data }).then(r=>({user_data: r}))
  let modResult = await context.resultModifier({req, result})
  return NextResponse.json(modResult, { status: 200 });
}
