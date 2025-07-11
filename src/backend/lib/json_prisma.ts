import fs from 'fs';
import yaml from 'js-yaml';
import { generateFieldLine } from './merge_prisma';

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

function generatePrismaField(
  key: string,
  prop: Property,
  required: string[] = []
): string {
  return generateFieldLine(key, prop, required);
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

