'use server';

import { fetcher } from "@/lib/fetcher";
import { Client } from "./client";
import { getApiSchema } from "@/lib/builder/SchemaParser";
import { ucFirst } from "@/shared/string";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string, id: number }>
}): Promise<Metadata> {
  // const post = await fetch(`https://api.example.com/posts/${params.slug}`).then(res => res.json())
  const {name, id} = await params
  const { data } = await fetcher({
    path: `/get/${name}/${id}`,
    method: 'get'
  })

  return {
    title: `Display ${name} related data - yamc`,
    description: `Display data of ${name}. ${ Object.values(data).slice(0, 4).map((value: any) => value.toString().substring(0, 100)).join(' | ') }`,
  }
}

export default async function ViewPage({
  params,
}: {
  params: Promise<{ name: string, id: string }>
}) {
  const { name, id } = (await params)

  const apiSchema = getApiSchema({ table: ucFirst(name) });
  if (!apiSchema.schema) {
    notFound();
  }

  const { data } = await fetcher({
    path: `/get/${name}/${id}`,
    method: 'get'
  })
  return <Client name={name} id={id} schema={apiSchema.schema} schemas={apiSchema.schemas} initData={data}/>;
};