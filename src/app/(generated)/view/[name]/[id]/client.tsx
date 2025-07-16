'use client'
import { getZodSchema } from "@/shared/getZodSchema";
import { labelcase } from "@/shared/string";
import { Card } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

export const Client = ({ name, id, schema, schemas, initData }: any &
{
  onSuccess?: () => void,
}) => {
  const router = useRouter();

  return <div className="min-h-screen bg-gray-100 p-8 font-sans">
    <div className="mb-3">
      <Card>
        <div className="flex gap-2">
          <Link href={`/table/${name}`}>Back</Link>
          <Link href={`/add/${name}`}>Add New</Link>
        </div>
      </Card>
    </div>
    <Card
      title={<span className="text-2xl font-bold text-gray-800">Display {name}</span>}
      className="shadow-lg rounded-xl"
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
      <div className="grid grid-cols-2 gap-2"
        style={{
          gridTemplateColumns: 'auto 1fr',
        }}
      >
        {
          Object.entries(schema.properties)
            .filter(([name, item]: any) => item.writeOnly !== true)
            .map(([name, item]: any) => {
              return [
                <div key={`label-${name}`} className="semibold">{labelcase(name??'')}</div>,
                <div key={`value-${name}`}>: {initData?.[name]}</div>]
            })
        }
      </div>

    </Card >
  </div >;
};