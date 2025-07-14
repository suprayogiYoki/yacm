'use client'
import { InputBuilder } from "@/lib/builder/InputBuilder";
import { ProForm } from "@ant-design/pro-components";
import { Spin } from "antd";
import { useEffect, useMemo, useRef, useState } from "react";
import z from "zod";

function getZodSchema({ schema }: { schema: any }) {
  const zodSchema: any = {}
  if (!schema) return z.object(zodSchema);

  const fields = Object.entries(schema.properties || {})
    .forEach(([key, val]: any) => {

      // Base type mapping
      switch (val.type) {
        case 'string':
          zodSchema[key] = z.string()
          if (val.format === 'email') zodSchema[key] = zodSchema[key].email()
          if (val.maxLength) zodSchema[key] = zodSchema[key].max(val.maxLength)
          if (val.minLength) zodSchema[key] = zodSchema[key].min(val.minLength)
          if (val.pattern) zodSchema[key] = zodSchema[key].regex(new RegExp(JSON.stringify(val.pattern)))
          break

        case 'integer':
          zodSchema[key] = z.number().int();
          break

        case 'number':
          zodSchema[key] = z.number();
          if (val.minimum !== undefined) zodSchema[key] = zodSchema[key].min(val.minimum);
          if (val.maximum !== undefined) zodSchema[key] = zodSchema[key].max(val.maximum);
          break

        case 'boolean':
          zodSchema[key] = z.boolean();
          break

        default:
          zodSchema[key] = z.any();
      }

      if (!(schema.required ?? []).includes(key) || val.readOnly) zodSchema[key] = zodSchema[key].optional();

    })

  return z.object(zodSchema)
}

const createZodRule = (schema: z.ZodTypeAny) => ({
  validator: (_: any, value: any) => {
    let formatted: { [key: string]: string[] } = {
      'date-time': [],
      date: [],
      time: [],
    };
    let transformed = value;
    // format date-time
    if (formatted['date-time'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD HH:mm:ss');
    }
    // format date
    else if (formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('YYYY-MM-DD');
    }
    // format time
    else if (formatted['date'].indexOf(_.field) !== -1) {
      transformed = value.format('HH:mm:ss');
    }
    const result = schema.safeParse(transformed);
    if (result.success) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(result.error.errors[0].message));
  },
});

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

export const Client = ({ name, id, schema, schemas }: any) => {
  const formRef = useRef<any>({});
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

  const handleSubmit = async (values: any) => {
    try {
      // Full schema validation on submit
      // const validatedData = schema.parse(values);
      console.log('Validated data:', values);
      // Submit to API here
    } catch (err: any) {
      // if (err instanceof ZodError) {
      //   console.error('Validation errors:', err.flatten());
      // }
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
            .filter(([name, item]: any) => item.readOnly !== true && item.writeOnly !== true)
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
      {isFormLoading && <div className="absolute top-0 left-0 w-full h-full flex justify-center items-center backdrop-blur-sm">
        <Spin tip="Loading form..." ><div style={{ height: 200 }}>Loading form...</div></Spin>
      </div>}
    </div>
  </div>;
};