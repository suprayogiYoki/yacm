'use server';

import { getApiSchema } from "@/lib/builder/SchemaParser";
import { Metadata } from "next";
import { Client } from "./client";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  // const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(res => res.json())
  const name = (await params).name
  return {
    title: `${name}s Management, mantain your related ${name} data - yamc`,
    description: `Manage your ${name}s, add more ${name}, edit or delete your ${name} effectively`,

  }
}


export default async function TablePage({
  params,
}: {
  params: Promise<{ name: string }>
}) {
  const name = (await params).name

  const apiSchema = getApiSchema({table: name});
  return <Client table={name} schema={apiSchema.schema} schemas={apiSchema.schemas} />;
}