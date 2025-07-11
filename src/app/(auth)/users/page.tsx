import type { Metadata } from 'next'
import Client from './client';

// dibuang di client
import yaml from 'js-yaml';
import fs from 'fs';
import { inDeepSchema } from '@/backend/lib/lib_gen';

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

const Page = () => {
  const schemas = openapi.components?.schemas || {};
  const op = openapi.paths['/users'].get;
  const reqtype = Object.keys(op?.requestBody?.content ?? {})[0];
  const schemaRequest = inDeepSchema({ schema: op?.requestBody?.content?.[reqtype]?.schema, schemas: schemas });
  const schemaResponse = inDeepSchema({ schema: op?.responses?.['200']?.content?.['application/json']?.schema, schemas: schemas });



  // console.info('schemaRequest', schemaRequest);
  console.info('schemaResponse', schemaResponse);
  // console.info('columns', columns);

  return <Client openapi={openapi} schemaResponse={schemaResponse}/>
};

export default Page;
