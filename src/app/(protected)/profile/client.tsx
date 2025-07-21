'use client';
import { fetcher } from "@/lib/fetcher";
import { labelcase } from "@/shared/string";
import { useEffect } from "react";

export const Client = ({schema, initData}: {
  schema: any;
  schemas: any;
  initData?: any;
}) => {

  useEffect(() => {
    console.log(initData.Tenant);
  }, [initData])

  return <div className="grid grid-cols-2 gap-2"
    style={{
      gridTemplateColumns: 'auto 1fr',
    }}
  >
    {
      Object.entries(schema.properties)
        .filter(([name, item]: any) => item.writeOnly !== true && !['is_active', 'email_verified', 'tenant_id'].includes(name))
        .map(([name, item]: any) => {
          return [
            <div key={`label-${name}`} className="semibold">{labelcase(name ?? '')}</div>,
            <div key={`value-${name}`}>: {initData?.[name]}</div>]
        })
    }
  </div>
}