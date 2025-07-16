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
  // const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(res => res.json())
  const name = (await params).name
  return {
    title: `Edit ${name}, Modify ${name} data - yamc`,
    description: `Form to edit detail ${name} data, keep updating your ${name} data effectively`,
  }
}

export default async function EditPage({
  params,
}: {
  params: Promise<{ name: string, id: string }>
}) {
  const { name, id } = (await params)

  const apiSchema = getApiSchema({ table: ucFirst(name) });
  if (!apiSchema.schema) {
    notFound();
  }

  return <Client name={name} id={id} schema={apiSchema.schema} schemas={apiSchema.schemas} />;
};