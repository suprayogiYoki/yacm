import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { getZodSchema } from '@/shared/getZodSchema';
import { format } from 'date-fns';
import { lcFirst, ucFirst } from '@/shared/string';
import { getPayload } from '@/backend/lib/session';

const prisma = new PrismaClient();
export async function POST(req: NextRequest) {
  let name = 'Tenant';
  name = ucFirst(name);

  const reqJson = await req.json();
  const body = await context.bodyModifier({ req, body: reqJson })
  if (body instanceof Response) {
    return body
  }

  let result: StandardApiResp = {
    success: false,
  }
  result.data = { req, body: reqJson };

  const yaml = loadYaml('db');
  if (!yaml[name] || !yaml[name].properties) {
    return Response.json(result, { status: 404 });
  }
  const schema: any = yaml[name];

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

  const payload: any = await getPayload(req);

  if (!parsed.success) {
    result.error = parsed.error.errors.reduce((p, c) => ({ ...p, [c.path[0]]: c.message }), {})
    return Response.json(result, { status: 400 });
  }

  for (const key of Object.keys(parsed.data)) {
    if (schema.properties[key]['x-unique'] === true) {
      const find = await (prisma[lcFirst(name) as any] as any).findFirst({
        where: {
          [key]: parsed.data[key]
        }
      });
      if (find) {
        result.error = {
          [key]: `${key} has been used`
        };
        return Response.json(result, { status: 400 });
      }
    }
  }


  if (schema.properties.created_at && schema.properties.created_at.format === 'date-time') {
    parsed.data.created_at = new Date();
  }

  await prisma.$transaction(async (tx) => {
    const tenant = await tx.tenant.create({
      data: parsed.data
    })

    return tx.user.update({
      where: {
        id: payload?.id
      },
      data: {
        tenant_id: tenant.id
      }
    })
    .then((r: any) => {
      result.success = true
    })
    .catch((e: any) => {
      result.error = e
      result.success = false
    })
  })



  let modResult = await context.resultModifier({ req, result })
  return Response.json(modResult, { status: 200 });
}
