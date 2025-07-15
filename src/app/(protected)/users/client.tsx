'use client';
import { InputBuilder } from '@/lib/builder/InputBuilder';
import { ProColumns, ProFormDateTimePicker, ProTable } from '@ant-design/pro-components';
import { Card } from 'antd';
import { useEffect } from 'react';

// Sample data for the table, explicitly typed as DataItem[]
const initialData: any[] = [
  {
    id: '1',
    email: 'John Brown',
  },
  {
    id: '2',
    email: 'John Brown 2',
  },
  {
    id: '3',
    email: 'John Brown 3',
  },
  {
    id: '4',
    email: 'John Brown 4',
  },
  {
    id: '5',
    email: 'John Brown 5',
  },
];

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

const TableGenerator = ({ schema, schemas, reqOpt, resOpt, path, method }: any) => {
  useEffect(() => {
    console.info('openapi', schema, schemas, reqOpt, resOpt, path, method);
  }, []);

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    ...Object.entries(resOpt.items.properties).map(([name, item]: any): ProColumns => {
      return ({
        title: name,
        dataIndex: name,
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: (resOpt.items.required ?? []).indexOf(name) !== -1,
            },
          ],
        },
        renderFormItem: (schema, config, form, action) => {
          return InputBuilder({ schemas, item, name });
        },
      });
    })
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <Card
        title={<span className="text-2xl font-bold text-gray-800">Dynamic Data Table</span>}
        className="w-full max-w-5xl shadow-lg rounded-xl p-6 bg-white"
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
        <ProTable
          columns={columns}
          rowKey={record => record.id}
          search={{
            labelWidth: 'auto',
          }}
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: false,
          }}
          request={async (params) => {
            let ret = {
              success: false,
              data: [],
              total: 0,
            };
            await fetcher({
              path: path,
              method: method,
            }).then((res) => {
              ret = {
                success: true,
                data: res.user_data,
                total: res.user_data.length,
              };
            });
            return ret ;
          }}
        />
      </Card>
    </div>
  );
};

export default TableGenerator;
