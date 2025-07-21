'use server';
import { getApiSchema } from "@/lib/builder/SchemaParser";
import { Metadata } from "next";
import { Client } from "./client";
import { notFound } from "next/navigation";
import { fetcher } from "@/lib/fetcher";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { AuthState } from "@/store/slices/auth_slice";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  return {
    title: 'User Profile page',
    description: 'View your profile information',
  };
};

export default async function Profile() {

  const apiSchema = getApiSchema({ table: 'User' });
  if (!apiSchema.schema) {
    notFound();
  }

  const token = (await cookies()).get('token')?.value;

  const { payload } = (token
    ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    : { payload: { id: '', username: 'Guest' } }) as { payload: AuthState };

  if (!payload.user.id || payload.user.id === '') {
    notFound();
  }
    
  const { data } = await fetcher({
    path: `/profile`,
    method: 'get'
  }).then((res) => {
    return res
  });
  return <Client schema={apiSchema.schema} schemas={apiSchema.schemas} initData={data ?? {}} />;
}
