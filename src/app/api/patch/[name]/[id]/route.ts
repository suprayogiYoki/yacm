import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { getZodSchema } from '@/shared/getZodSchema';
import { format } from 'date-fns';

const lcfirst = (str: string): string => str.charAt(0).toLowerCase() + str.slice(1);

const prisma = new PrismaClient();
export async function PATCH(req: NextRequest, { params }: { params: any }) {
  const { name, id } = await (params);

  const reqJson = await req.json();

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

  const parsed = zodSchema.safeParse(reqJson.body);

  if (!parsed.success) {
    result.error = parsed.error.errors.reduce((p, c) => ({ ...p, [c.path[0]]: c.message }), {})
    return Response.json(result, { status: 400 });
  }

  let where: any = {
    id: parseInt(id)
  }

  if (schema.properties.updated_at && schema.properties.updated_at.format === 'date-time') {
    parsed.data.updated_at = new Date();//format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  }
  await (prisma[lcfirst(name) as any] as any).update({
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
