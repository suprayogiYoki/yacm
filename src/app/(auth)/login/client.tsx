'use client'
import { InputBuilder } from "@/lib/builder/InputBuilder";
import { fetcher } from "@/lib/fetcher";
import { useNotifier } from "@/provider/notificationProvider";
import { createZodRule, getZodSchema } from "@/shared/getZodSchema";
import { ProForm } from "@ant-design/pro-components";
import { Form } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";


export const Client = ({ name, schema }: { name:string, schema:any }) => {
  const router = useRouter();
  const formRef = useRef<any>({});
  const [form] = Form.useForm()

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
        path: `/auth/login`,
        method: 'post',
        bodyJson: values
      })

      if (res.success === true) {
        notify?.success({
          message: 'Success',
          description: 'Login successfully!',
        });
        setTimeout(() => {
          router.replace('/');
        }, 1000);
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
        description: 'Login Failed',
      });
    }
  };


  return <>
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
          .filter(([name, item]: any) => item.readOnly !== true)
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
    <div className='pt-3'>Already has an account? <Link href="/login">Login</Link></div>
  </>;
};