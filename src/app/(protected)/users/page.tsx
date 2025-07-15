import type { Metadata } from 'next'

// dibuang di client
import yaml from 'js-yaml';
import fs from 'fs';
import { inDeepSchema } from '@/backend/lib/lib_gen';
import TableGenerator from './client';

export function generateMetadata({ params }: any): Metadata {
  // const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(res => res.json())

  return {
    title: 'User Management, mantain your registered user, activated or deactivated - yamc',
    description: `Manage your users, add more user, activated, deactivated, edit or delete your user effectively`,

  }
}

export function getYaml() {
  return yaml.load(fs.readFileSync('src/shared/db.yaml', 'utf8')) as any
}

const openapi = getYaml()

const path:string = '/users';
const method:string = 'get';

const getApiSchema = function () {
  const schemas = openapi.components?.schemas || {};
  const schema = openapi.paths[path][method];
  const reqtype = Object.keys(schema?.requestBody?.content ?? {})[0];
  const reqOpt = inDeepSchema({ schema: schema?.requestBody?.content?.[reqtype]?.schema, schemas: schemas });
  const resOpt = inDeepSchema({ schema: schema?.responses?.['200']?.content?.['application/json']?.schema, schemas: schemas });
  return { schema, schemas, reqOpt, resOpt, path, method }
}

const Page = async () => {
  return <TableGenerator { ...getApiSchema() } />
};

export default Page;
