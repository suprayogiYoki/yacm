import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { context } from '@/backend/lib/context';
import { loadYaml } from '@/backend/lib/json_prisma';
import { getPayload } from '@/backend/lib/session';

const prisma = new PrismaClient();
export async function GET(req: NextRequest) {
  const session: any = await getPayload(req);
  if (!session?.user?.id) {
    return Response.json({ success: false, session }, { status: 401 });
  }

  let id= session?.user?.id;

  let result: any = {
    success: false,
    data: {}
  }

  const yaml = loadYaml('db');
  if (!yaml.User || !yaml.User.properties) {
    return Response.json({...result, id: session}, { status: 404 });
  }

  const properties = yaml.User.properties;

  let where: any = {
    id: parseInt(id)
  }

  await Promise.all([
    prisma.user.findFirst({
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
  });

  let modResult = await context.resultModifier({ req, result });
  return Response.json(modResult, { status: 200 });
}
