import fs from 'fs';
import yaml from 'js-yaml';

interface Property {
  type: string;
  format?: string;
  example?: any;
  default?: any;
  nullable?: boolean;
  description?: string;
  'x-autoincrement'?: boolean
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

function generatePrismaField(
  key: string,
  prop: Property,
  required: string[] = []
): string {
  const type = mapType(prop);
  const optional = prop.nullable || !required.includes(key) ? '?' : '';
  const defaultVal =  prop['x-autoincrement'] ? '@id @default(autoincrement())' :
  prop.default !== undefined
    ? ` @default(${typeof prop.default == 'boolean' || typeof prop.default == 'number' ? prop.default : `"${prop.default}"`})`
    :  '';
  return `  ${key} ${type}${optional}${defaultVal}`;
}

function generatePrismaModel(name: string, schema: Schema): string {
  const lines = [`model ${name} {`];
  for (const [key, prop] of Object.entries(schema.properties)) {
    lines.push(generatePrismaField(key, prop, schema.required));
  }
  lines.push('}');
  return lines.join('\n');
}

export function loadYaml(filename: string): Record<string, Schema> {

  const yamlText = fs.readFileSync(`./src/shared/${filename}.yaml`, 'utf8');
  const parsedYaml = yaml.load(yamlText).components.schemas as Record<string, Schema>;

  return parsedYaml
}

export function prismaTostring(schemas: Record<string, Schema>): string {
  const prismaModels = Object.entries(schemas)
    .map(([name, schema]) => generatePrismaModel(name, schema))
    .join('\n\n');
  return prismaModels
}

