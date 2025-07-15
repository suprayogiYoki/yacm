import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';

const lcfirst = (str: string): string => str.charAt(0).toLowerCase() + str.slice(1);

const prisma = new PrismaClient();
export async function DELETE(req: NextRequest, { params }: { params: any }) {
  const { name, id } = await (params);

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
    (prisma[lcfirst(name) as any] as any).delete({
      where
    }).then((r: any) => {
      result.data = r
    })
  ]).then(() => {
    if (result.data)
      result.success = true
  })

  let modResult = await context.resultModifier({ req, result })
  return Response.json(modResult, { status: 200 });
}
