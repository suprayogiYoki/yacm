'use client'
import { InputBuilder } from "@/lib/builder/InputBuilder";
import { useNotifier } from "@/provider/notificationProvider";
import { createZodRule, getZodSchema } from "@/shared/getZodSchema";
import { ProForm } from "@ant-design/pro-components";
import { Card, Form, Spin } from "antd";
import Link from "next/link";
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

export const Client = ({ name, id, schema, schemas, onSuccess }: any &
{
  onSuccess?: () => void,
}) => {
  const router = useRouter();
  const formRef = useRef<any>({});
  const [form] = Form.useForm();
  const [isFormLoading, setIsFormLoading] = useState(false);

  useEffect(() => {
    setIsFormLoading(true);
    fetcher({
      path: `/get/${name}/${id}`,
      method: 'get'
    }).then((res: any) => {
      formRef.current.setFieldsValue(res.data);
      setIsFormLoading(false);
      console.log(res.data);
    })
  }, [])

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
        path: `/patch/${name}/${id}`,
        method: 'patch',
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
      else {
        if (res.error) {
          form.setFields(Object.entries(res.error).map(([key, value]) => ({ name: key, errors: [value] })) as any);
        }
        throw new Error(res.error);
      }
    } catch (err: any) {
      notify?.error({
        message: 'Failed',
        description: 'Failed to save data',
      });
    }
  };

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
      title={<span className="text-2xl font-bold text-gray-800">Edit {name}</span>}
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
      <ProForm
      form={form}
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
            .filter(([name, item]: any) => item.readOnly !== true && item.writeOnly !== true)
            .map(([name, item]: any) => {
              return <InputBuilder
                key={name}
                item={item}
                name={name}
                rules={[createZodRule(zodSchema?.shape?.[name])]}
                withLabel
              />
            })
        }
      </ProForm>
      {isFormLoading && <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-sm">
        <Spin><div style={{ height: 200 }}>Loading form...</div></Spin>
      </div>}
    </Card>
  </div>;
};