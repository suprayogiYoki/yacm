import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { lcFirst, ucFirst } from '@/shared/string';

const prisma = new PrismaClient();
export async function GET(req: NextRequest, { params }: { params: any }) {
  let { name, id } = await (params);
  name = ucFirst(name);

  let result: any = {
    success: false,
    data: {}
  }

  const yaml = loadYaml('db');
  if (!yaml[name] || !yaml[name].properties) {
    return Response.json(result, { status: 404 });
  }

  const properties = yaml[name].properties;

  let where: any = {
    id: parseInt(id)
  }

  await Promise.all([
    (prisma[lcFirst(name) as any] as any).findFirst({
      where,
      include: {
        Tenant: true
      }
    }).then((r: any) => {
      Object.entries(properties).forEach(([key, val]: any) => {
        if (val.writeOnly) delete r[key]
      })
      result.data = r
    })
  ]).then(() => {
    if (result.data)
      result.success = true
  })

  let modResult = await context.resultModifier({ req, result })
  return Response.json(modResult, { status: 200 });
}
