'use server';
import { notFound } from 'next/navigation';
import { Client } from './client';
import { Metadata } from 'next';
import { getApiSchema } from '@/lib/builder/SchemaParser';
import { Card } from 'antd';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const name = (await params).name
  return {
    title: `User registration - yamc`,
    description: `User registration form, fill up your details information.`,
  }
}

export default async function RegisterPage() {

  const apiSchema = getApiSchema({ table: 'User' });
  if (!apiSchema.schema) {
    notFound();
  }

  delete apiSchema.schema.properties.tenant_id;
  return <Card
    title={<span className="text-2xl font-bold text-gray-800">Register</span>}
    className="w-full max-w-lg shadow-lg rounded-xl p-6 bg-white"
    styles={{
      header: {
        padding: '16px',
        borderBottom: '1px solid #f0f0f0',
      },
      body: {
        padding: '24px',
      },
    }}
  >
    <Client name='user' schema={apiSchema.schema} />
  </Card>
}