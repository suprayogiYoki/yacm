import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { object } from 'zod';

const lcfirst = (str: string): string => str.charAt(0).toLowerCase() + str.slice(1);

const prisma = new PrismaClient();
export async function GET(req: NextRequest, { params }: { params: any }) {
  const { name } = await (params);
  
  let result = {
    success: false,
    data: [],
    total: 0
  }

  const { searchParams } = new URL(req.url);
  const pageSize = parseInt(searchParams.get('pageSize')??'10');
  const current = parseInt(searchParams.get('current')??'1');

  const yaml = loadYaml('db');
  if(!yaml[name] || !yaml[name].properties){ 
    return Response.json(result, { status: 404 });
  }

  let where: any = {}
  try {
    Object.keys(yaml[name].properties).forEach((key: string) => {
      if(searchParams.get(key)){
        where[key] = searchParams.get(key)
      }
    })
  } catch (error) {
    return Response.json(result, { status: 404 });
  }

  await Promise.all([
    (prisma[lcfirst(name) as any] as any).findMany({
      where,
      skip: (current - 1) * pageSize,
      take: pageSize,
    }).then((r: any) => {
      result.data = r
    }),
    (prisma[lcfirst(name) as any] as any).count({
      where
    }).then((r: any) => {
      result.total = r
    })
  ]).then(() => {
    result.success = true
  })
  
  let modResult = await context.resultModifier({ req, result })
  return Response.json(modResult, { status: 200 });
}
