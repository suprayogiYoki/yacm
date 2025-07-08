import fs from 'fs';
import yaml from 'js-yaml'; import prettier from 'prettier';

import { loadYaml } from './json_prisma';

interface Property {
  type: string;
  format?: string;
  default?: any;
  nullable?: boolean;
  'x-autoincrement'?: boolean;
}

interface Schema {
  type: string;
  properties: Record<string, Property>;
  required?: string[];
}

function mapType(prop: Property): string {
  if (prop.format === 'date-time') return 'DateTime';
  switch (prop.type) {
    case 'integer': return 'Int';
    case 'boolean': return 'Boolean';
    case 'string': return 'String';
    default: return 'Json';
  }
}

function generateFieldLine(
  key: string,
  prop: Property,
  required: string[] = []
): string {
  const type = mapType(prop);
  const optional = prop.nullable || !required.includes(key) ? '?' : '';
  const defaultVal = 
  prop['x-autoincrement'] ? '@id @default(autoincrement())' :
  prop.default !== undefined
    ? ` @default(${typeof prop.default == 'boolean' || typeof prop.default == 'number' ? prop.default : `"${prop.default}"`})`
    :  '';
  return `  ${key} ${type}${optional}${defaultVal}`;
}

function mergeIntoExistingSchema(
  existing: string,
  modelName: string,
  newFields: Record<string, Property>,
  required: string[] = []
): string {
  const lines = existing.split('\n');
  const startIndex = lines.findIndex(line => line.trim().startsWith(`model ${modelName} {`));

  // Jika model belum ada → buat model baru
  if (startIndex === -1) {
    const newModelLines = [
      '',
      `model ${modelName} {`,
      ...Object.entries(newFields).map(([key, prop]) => '  ' + generateFieldLine(key, prop, required)),
      '}',
    ];
    return existing + '\n' + newModelLines.join('\n');
  }

  // Jika model sudah ada → cari batas akhir model
  const endIndex = lines.slice(startIndex).findIndex(line => line.trim() === '}') + startIndex;

  const existingFields = new Set(
    lines.slice(startIndex + 1, endIndex).map(line => line.trim().split(' ')[0])
  );

  const newFieldLines = Object.entries(newFields)
    .filter(([key]) => !existingFields.has(key))
    .map(([key, prop]) => '  ' + generateFieldLine(key, prop, required));

  lines.splice(endIndex, 0, ...newFieldLines);
  return lines.join('\n');
}


export async function mergePrismas(): Promise<string> {
  let prismaSchema = fs.readFileSync('./src/backend/prisma/schema.prisma', 'utf8');
  const prismas = loadYaml('db');
  Object.entries(prismas)
    .forEach(([name, schema]) => prismaSchema = mergeIntoExistingSchema(prismaSchema, name, schema.properties, schema.required));


  // Format hasil merge sebelum disimpan
  // const formatted = await prettier.format(prismaSchema, {
  //   semi: true,
  //   singleQuote: true,
  //   tabWidth: 2,
  // });
  const formatted = await prettier.format(prismaSchema, {
    filepath: 'schema.prisma',
    plugins: ['prettier-plugin-prisma'],
  });

  await fs.promises.writeFile('./src/backend/prisma/schema.prisma', formatted);
  return formatted;
}
