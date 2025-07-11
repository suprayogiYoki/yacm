import fs from 'fs'
import path from 'path'
import yaml from 'js-yaml'

const args = process.argv.slice(2);
const isForce = (args.find(arg => arg.startsWith('force='))??'').split('=')[1] === 'true';
const pathOnly = (args.find(arg => arg.startsWith('pathOnly='))??'').split('=')[1];

// Load the OpenAPI specification
const openapi = yaml.load(fs.readFileSync('src/shared/db.yaml', 'utf8')) as any
const paths = openapi.paths || {}
const schemas = openapi.components?.schemas || {}

// Function to generate a Zod schema from OpenAPI schema
function getZodSchema(schemaName: string) {
  const schema = schemas[schemaName]
  if (!schema) return 'z.object({})'

  const fields = Object.entries(schema.properties || {}).map(([key, val]: any) => {
    let zodChain = ''

    // Base type mapping
    switch (val.type) {
      case 'string':
        zodChain = 'z.string()'
        if (val.format === 'email') zodChain += '.email()'
        if (val.maxLength) zodChain += `.max(${val.maxLength})`
        if (val.minLength) zodChain += `.min(${val.minLength})`
        if (val.pattern) zodChain += `.regex(new RegExp(${JSON.stringify(val.pattern)}))`
        break

      case 'integer':
        zodChain = 'z.number().int()'
        break

      case 'number':
        zodChain = 'z.number()'
        if (val.minimum !== undefined) zodChain += `.min(${val.minimum})`
        if (val.maximum !== undefined) zodChain += `.max(${val.maximum})`
        break

      case 'boolean':
        zodChain = 'z.boolean()'
        break

      default:
        zodChain = 'z.any()'
    }

    if (!schema.required?.includes(key) || val.readOnly) zodChain += '.optional()'

    return `  ${key}: ${zodChain},`
  })

  return `z.object({\n${fields.join('\n')}\n})`
}

// Function to generate route handler based on HTTP method and schema
function generateHandler(method: string, schemaName: string, modelName: string) {
  const zodSchema = schemaName ? getZodSchema(schemaName) : 'z.object({})'

  const queryMap: any = {
    get: `const result = await prisma.${modelName}.findMany().then(r=>({${modelName}_data: r}))`,
    post: `const result = await prisma.${modelName}.create({ data: parsed.data }).then(r=>({${modelName}_data: r}))`,
    put: `const result = await prisma.${modelName}.update({ where: { id: parsed.data.id }, data: parsed.data }).then(r=>({${modelName}_data: r}))`,
    delete: `const result = await prisma.${modelName}.delete({ where: { id: parsed.data.id } })`,
  }

  return `
export async function ${method.toUpperCase()}(req: Request) {
  ${method === 'get' ? '' : `
  const bodyString = await req.text();
  let body = JSON5.parse(bodyString);
  body = await context.bodyModifier({req, body})
  if (body instanceof Response) {
    return body
  }
  const schema = ${zodSchema};
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input', issues: parsed.error.format() }, { status: 400 });
  }`}
  ${queryMap[method]}
  let modResult = await context.resultModifier({req, result, body})
  if (modResult instanceof Response) {
    return modResult
  }
  return NextResponse.json(modResult, { status: 200 });
}
`
}

console.log('Generate route\n---------------')

// Loop through all paths and methods to generate route handlers
if(pathOnly) {
  const keep = pathOnly.split(',').map(x => x.trim());
  Object.keys(paths).forEach(x => {
    if(!keep.includes(x)) {
      delete paths[x];
    }
  })
}
for (const [endpoint, methods] of Object.entries<any>(paths)) {
  const segments = endpoint.split('/').filter(Boolean)
  const dir = path.join('src/app/api', ...segments)
  if(fs.existsSync(path.join(dir, 'route.ts')) && !isForce) {
    console.log(`[skip] ${path.join(dir, 'route.ts')}`);
    continue;
  }
  fs.mkdirSync(dir, { recursive: true })

  let routeCode = `import { NextResponse } from 'next/server';
  import { PrismaClient } from '@prisma/client';
  import { z } from 'zod';
  import { context } from '@/backend/lib/context';
  import JSON5 from 'json5'\n
  const prisma = new PrismaClient();`

  if (methods['x-generate-route'] === false) {
    continue
  } else {
    delete methods['x-generate-route']
  }

  for (const method of Object.keys(methods)) {
    const op = methods[method]
    const reqtype = Object.keys(op?.requestBody?.content ?? {})[0];
    const ref = op?.requestBody?.content?.[reqtype]?.schema?.$ref
    const schemaName = ref?.split('/').pop()
    let modelName = schemaName?.toLowerCase() || segments[segments.length - 1]
    if (!ref) {
      let outListing = op?.responses?.["200"]?.content?.['application/json']?.schema?.items?.['$ref'];
      if (outListing) {
        modelName = outListing.split('/').pop().toLowerCase();
      }
    }

    routeCode += generateHandler(method, schemaName, modelName)
  }

  fs.mkdirSync(path.join(dir), { recursive: true })
  fs.writeFileSync(path.join(dir, 'route.ts'), routeCode)
  console.log(`[v] ${path.join(dir, 'route.ts')} : ${Object.keys(methods)}`);
}
