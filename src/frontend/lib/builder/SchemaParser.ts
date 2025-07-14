import yaml from 'js-yaml';
import fs from 'fs';
import { inDeepSchema } from '@/backend/lib/lib_gen';

export function getYaml() {
  return yaml.load(fs.readFileSync('src/shared/db.yaml', 'utf8')) as any
}

export const getApiSchema = function ({table}:{table: string}) {
  const openapi = getYaml()
  const schemas = openapi.components?.schemas || {};
  const schema = schemas[table];
  
  return { schema, schemas, table }
}