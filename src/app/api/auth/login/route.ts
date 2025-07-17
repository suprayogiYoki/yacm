import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { comparePassword } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { getZodSchema } from '@/shared/getZodSchema';
import { error } from 'console';
import { signToken } from '@/shared/jwt';
import { use } from 'react';

const prisma = new PrismaClient();
export async function POST(req: NextRequest, { params }: { params: any }) {
  const name = 'User';

  const body = await req.json();
  if (body instanceof Response) {
    return body
  }

  let result: StandardApiResp = {
    success: false,
  }
  result.data = { req, body: body };

  const yaml = loadYaml('db');
  if (!yaml[name] || !yaml[name].properties) {
    return Response.json(result, { status: 404 });
  }
  const schema: any = yaml[name];


  schema.properties = {
    email: schema.properties.email,
    password: schema.properties.password,
  }

  const zodSchema = getZodSchema({
    schema: {
      ...schema,
      properties: Object.keys(schema.properties).reduce((acc: any, key: string) => {
        if (!schema.properties[key].readOnly) {
          acc[key] = schema.properties[key];
        }
        return acc;
      }, {})
    }
  });

  const parsed = zodSchema.safeParse(body);

  if (!parsed.success) {
    result.error = parsed.error.errors.reduce((p, c) => ({ ...p, [c.path[0]]: c.message }), {})
    return Response.json(result, { status: 400 });
  }

  const found = await prisma.user.findFirst({
    where: {
      email: parsed.data.email
    }
  }).then(async (res:any) => {
    if (res) {
      const valid = await comparePassword(parsed.data.password, res.password)
      if (!valid) {
        return null
      }
    }
    return res;
  });

  if (!found) {
    return Response.json({ success: false, error: { password: 'Invalid credential' } }, { status: 404 });
  }

  const { password, ...data } = found;
  const token = signToken({ username: data.username, id: data.id });
  const response = NextResponse.json({
    data: data,
    success: true,
  }, { status: 200, headers: { 'Authorization': `Bearer ${token}` } });
  response.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 3600,
    path: '/',
  })
  return response;
}
