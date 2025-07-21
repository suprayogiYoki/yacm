'use server';

import { Client } from "./client";
import { getApiSchema } from "@/lib/builder/SchemaParser";
import { ucFirst } from "@/shared/string";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>
}): Promise<Metadata> {
  const name = (await params).name
  return {
    title: `Business owner registration - yamc`,
    description: `Register as business owner, managing your business and grow with our platform`,
  }
}

export default async function AddPage() {
  const name = 'Tenant'

  const apiSchema = getApiSchema({ table: name });
  if (!apiSchema.schema) {
    notFound();
  }

  return <Client name={name} schema={apiSchema.schema} schemas={apiSchema.schemas} />;
};