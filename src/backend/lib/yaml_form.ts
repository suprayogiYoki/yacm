import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import * as prettier from 'prettier';
import parserTypescript from 'prettier/plugins/typescript';
import { inDeepSchema } from './lib_gen';

const args = process.argv.slice(2);
const isForce = (args.find(arg => arg.startsWith('force=')) ?? '').split('=')[1] === 'true';
const pathOnly = (args.find(arg => arg.startsWith('pathOnly=')) ?? '').split('=')[1];

// Load the OpenAPI specification
const openapi = yaml.load(fs.readFileSync('src/shared/db.yaml', 'utf8')) as any
const paths = openapi.paths || {}
const schemas = openapi.components?.schemas || {}
let extraImport: { [key: string]: { [key: string]: boolean } } = {}

function extraInportPush(lib: string, prop: string) {
  if (!extraImport[lib])
    extraImport[lib] = {}
  extraImport[lib][prop] = true;
}

function getZodSchema({ schema }: { schema: any }) {
  if (!schema) return 'z.object({})'

  const fields = Object.entries(schema.properties || {})
    .filter(ignoreFields)
    .map(([key, val]: any) => {
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

      if (!(schema.required ?? []).includes(key) || val.readOnly) zodChain += '.optional()'

      return `  ${key}: ${zodChain},`
    })

  return `z.object({\n${fields.join('\n')}\n})`
}

export function toLabel(name: string): string {
  return ucfirst(name).split('_').join(' ');
}

function ignoreFields([key, val]: any) {
  return ['created_at', 'updated_at'].indexOf(key) === -1 && val?.readOnly !== true;
}

function generateFormInput({ schema }: { schema: any }) {
  if (!schema) return ''

  const fields = Object.entries(schema.properties || {})
    .filter(ignoreFields)
    .map(([key, val]: any) => {

      // Base type mapping
      switch (val.type) {
        case 'integer':
        case 'number':
          extraInportPush('@ant-design/pro-components', 'ProFormDigit');
          return `
        <ProFormDigit
          name="${key}"
          label="${toLabel(key)}"
          placeholder="${val.example ?? ""}"
          rules={[createZodRule(schema.shape.${key})]}
        />
        `;

        case 'boolean':
          extraInportPush('@ant-design/pro-components', 'ProFormCheckbox');
          return `
        <ProFormCheckbox
          name="${key}"
          label="${toLabel(key)}"
          placeholder="${val.example ?? ""}"
          rules={[createZodRule(schema.shape.${key})]}
        />
        `

        default:
          if (val.format === 'date-time') {
            extraInportPush('@ant-design/pro-components', 'ProFormDateTimePicker');
            return `
          <ProFormDateTimePicker
            name="${key}"
            label="${toLabel(key)}"
            placeholder="${val.example ?? ""}"
            rules={[createZodRule(schema.shape.${key})]}
          />
          `;
          }
          else {
            extraInportPush('@ant-design/pro-components', 'ProFormText');
            return `
          <ProFormText
            name="${key}"
            label="${toLabel(key)}"
            placeholder="${val.example ?? ""}"
            rules={[createZodRule(schema.shape.${key})]}
          />
          `;
          }
      }
    })

  return fields.join('\n')
}

function generateHandler({ schema, fileName }: { schema: any, fileName: string }) {
  const zodSchema = schema ? getZodSchema({ schema }) : 'z.object({})'

  const formatted: { [key: string]: string[] } = {
    'date-time': [],
    'date': [],
    'time': []
  };

  Object.entries(schema?.properties ?? {}).filter(ignoreFields).forEach(([key, val]: any) => {
    if (val.format === 'date-time') {
      formatted['date-time'].push(key);
    }
    else if (val.format === 'date') {
      formatted['date'].push(key);
    }
    else if (val.format === 'time') {
      formatted['time'].push(key);
    }
  });

  return `
// 1. Define Zod validation schema
const schema = ${zodSchema};

// 2. Create manual validation rules using safeParse
const createZodRule = (schema: z.ZodTypeAny) => ({
  validator: (_: any, value: any) => {
    let formatted: {[key: string]: string[]}  = ${JSON.stringify(formatted)};
    let transformed = value;
    // format date-time
    if(formatted['date-time'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD HH:mm:ss');
    }
    // format date
    else if(formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD');
    }
    // format time
    else if(formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('HH:mm:ss');
    }
    const result = schema.safeParse(transformed);
    if (result.success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(result.error.errors[0].message));
  },
});

// 3. TypeScript type inference from Zod schema
type UserFormValues = z.infer<typeof schema>;

export default function ${fileName}() {
  const handleSubmit = async (values: UserFormValues) => {
    try {
      // Full schema validation on submit
      const validatedData = schema.parse(values);
      console.log('Validated data:', validatedData);
      // Submit to API here
    } catch (err) {
      if (err instanceof ZodError) {
        console.error('Validation errors:', err.flatten());
      }
    }
  };

    return (
    <ProForm<UserFormValues>
      onFinish={handleSubmit}
      autoFocusFirstInput
      submitter={{
        searchConfig: {
          submitText: 'Save',
          resetText: 'Cancel',
        },
        render: (_, dom) => [dom[1], dom[0]],
      }}
    >
      ${generateFormInput({ schema })}
    </ProForm>
  );
};
`
}

function ucfirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function templateForm({ schema, routeCode, fileName }: { schema: any, routeCode: string, fileName: string }): string {
  routeCode = `import { ProForm } from '@ant-design/pro-components';
  import { z, ZodError } from 'zod';\n`

  routeCode += generateHandler({ schema, fileName })

  const additionalImports = Object.keys(extraImport).map(lib => `import { ${Object.keys(extraImport[lib]).join(', ')} } from '${lib}'`).join('\n');
  routeCode = additionalImports + '\n\n' + routeCode

  return routeCode
}

function templateTable({ schema, routeCode, fileName }: { schema: any, routeCode: string, fileName: string }): string {
  routeCode = `import { ProForm } from '@ant-design/pro-components';
  import { z, ZodError } from 'zod';\n`

  routeCode += generateHandler({ schema, fileName })

  const additionalImports = Object.keys(extraImport).map(lib => `import { ${Object.keys(extraImport[lib]).join(', ')} } from '${lib}'`).join('\n');
  routeCode = additionalImports + '\n\n' + routeCode

  return routeCode
}

console.log('Generate form\n---------------')
// Loop through all paths and methods to generate handlers
if (pathOnly) {
  const keep = pathOnly.split(',').map(x => x.trim());
  Object.keys(paths).forEach(x => {
    if (!keep.includes(x)) {
      delete paths[x];
    }
  })
}
for (const [endpoint, methods] of Object.entries<any>(paths)) {
  const segments = endpoint.split('/').filter(Boolean)
  const dir = path.join('src/frontend/components', ...segments)
  fs.mkdirSync(dir, { recursive: true })

  let routeCode = ``;

  for (const method of Object.keys(methods)) {
    extraImport = {};
    const op = methods[method]
    const reqtype = Object.keys(op?.requestBody?.content ?? {})[0];
    const fileName = ucfirst(segments[segments.length - 1]) + ucfirst(method)

    if (fs.existsSync(path.join(dir, `${fileName}.tsx`)) && !isForce) {
      console.log(`[skip] ${path.join(dir, `${fileName}.tsx`)}`);
      continue;
    }

    const schema = inDeepSchema({ schema: op?.requestBody?.content?.[reqtype]?.schema, schemas: schemas });
    const schemaResp = inDeepSchema({ schema: op?.responses?.['200']?.content?.['application/json']?.schema, schemas: schemas });

    if (['post', 'patch', 'put', 'delete'].indexOf(method.toLowerCase()) !== -1) {
      routeCode = templateForm({ schema, routeCode, fileName })
    }
    else if (['get'].indexOf(method.toLowerCase()) !== -1) {
      // routeCode = templateList({ schema, routeCode, fileName })
      routeCode = templateTable({ schema, routeCode, fileName })
    }
    else {
      continue;
    }

    const formatted = await prettier.format(routeCode, {
      parser: 'typescript',
      plugins: [parserTypescript],
      semi: true,
      singleQuote: true,
      jsxSingleQuote: false,
      trailingComma: 'all',
    });

    fs.mkdirSync(path.join(dir), { recursive: true })
    fs.writeFileSync(path.join(dir, `${fileName}.tsx`), formatted)
    console.log(`[generate] ${path.join(dir, `${fileName}.tsx`)}`);
  }

}
