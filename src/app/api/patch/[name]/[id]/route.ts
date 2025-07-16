import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { getZodSchema } from '@/shared/getZodSchema';
import { lcFirst } from '@/shared/string';


const prisma = new PrismaClient();
export async function PATCH(req: NextRequest, { params }: { params: any }) {
  let { name, id } = await (params);
  name = ucFirst(name);

  const reqJson = await req.json();
  const body = await context.bodyModifier({ req, body: reqJson })
  if (body instanceof Response) {
    return body
  }

  let result: StandardApiResp = {
    success: false,
  }

  const yaml = loadYaml('db');
  if (!yaml[name] || !yaml[name].properties) {
    return Response.json(result, { status: 404 });
  }
  const schema: any = yaml[name];

  const zodSchema = getZodSchema({
    schema: {
      ...schema,
      properties: Object.keys(schema.properties).reduce((acc: any, key: string) => {
        if (!schema.properties[key].readOnly && !schema.properties[key].writeOnly) {
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

  for (const key of Object.keys(parsed.data)) {
    if (schema.properties[key]['x-unique'] === true) {
      const find = await (prisma[lcFirst(name) as any] as any).findFirst({
        where: {
          id: {
            not: parseInt(id)
          },
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


  let where: any = {
    id: parseInt(id)
  }

  if (schema.properties.updated_at && schema.properties.updated_at.format === 'date-time') {
    parsed.data.updated_at = new Date();
  }
  await (prisma[lcFirst(name) as any] as any).update({
    where,
    data: parsed.data
  }).then((r: any) => {
    result.data = parsed.data

    result.success = true
  })
    .catch((e: any) => {
      result.error = e
      result.success = false
    })


  let modResult = await context.resultModifier({ req, result })
  return Response.json(modResult, { status: 200 });
}
