'use client'
import { InputBuilder } from "@/lib/builder/InputBuilder";
import { useNotifier } from "@/provider/notificationProvider";
import { createZodRule, getZodSchema } from "@/shared/getZodSchema";
import { ProForm } from "@ant-design/pro-components";
import { Spin } from "antd";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const fetcher = async ({ queryJson, bodyJson, path, method }: { queryJson?: any, bodyJson?: any, path: string, method: string }) => {
  let url = "/api" + path;
  if (queryJson) {
    url += `?${new URLSearchParams(queryJson).toString()}`;
  }
  return await fetch(url, {
    body: bodyJson ? JSON.stringify(bodyJson) : null,
    headers: {
      'Content-Type': 'application/json',
    },
    method: method.toUpperCase(),
  }).then((res) => res.json());
}

export const Client = ({ name, schema, schemas, onSuccess }: any &
{
  onSuccess?: () => void,
}) => {
  const router = useRouter();
  const formRef = useRef<any>({});

  const zodSchema = useMemo(() => getZodSchema({
    schema: {
      ...schema,
      properties: Object.keys(schema.properties).reduce((acc: any, key: string) => {
        if (!schema.properties[key].readOnly) {
          acc[key] = schema.properties[key];
        }
        return acc;
      }, {})
    }
  }), [schema]);

  const notify = useNotifier();

  const handleSubmit = async (values: any) => {
    try {
      const res = await fetcher({
        path: `/post/${name}`,
        method: 'post',
        bodyJson: values
      })

      if (res.success === true) {
        notify?.success({
          message: 'Success',
          description: 'Data saved successfully!',
        });
        setTimeout(() => {
          onSuccess?.() ?? router.back();
        }, 2000);
      }
      else  {
        throw new Error(res.error);
      }
    } catch (err: any) {
      notify?.error({
        message: 'Failed',
        description: 'Failed to save data',
      });
    }
  };

  return <div className="p-[5px]">
    <div className="relative">
      <ProForm
        formRef={formRef}
        onFinish={handleSubmit}
        autoFocusFirstInput
        submitter={{
          searchConfig: {
            submitText: 'Save',
            resetText: 'Cancel',
          },
          render: (_, dom) => [dom[1], dom[0]],
        }}
      >
        {
          Object.entries(schema.properties)
            .filter(([name, item]: any) => item.readOnly !== true)
            .map(([name, item]: any) => {
              return <InputBuilder
                key={name}
                schemas={schemas}
                item={item}
                name={name}
                rules={[createZodRule(zodSchema?.shape?.[name])]}
                withLabel
              />
            })
        }
      </ProForm>
    </div>
  </div>;
};