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
    title: `User login - yamc`,
    description: `Login form, fill up your details information for access your account.`,
  }
}

export default async function RegisterPage() {

  const apiSchema = getApiSchema({ table: 'User' });
  if (!apiSchema.schema) {
    notFound();
  }

  const {email, password} = apiSchema.schema.properties;

  apiSchema.schema.properties = {
    email,
    password
  };
  return <Card
    title={<span className="text-2xl font-bold text-gray-800">Login</span>}
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