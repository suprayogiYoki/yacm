'use client';
import { InputBuilder } from '@/lib/builder/InputBuilder';
import { ProColumns, ProFormDateTimePicker, ProTable } from '@ant-design/pro-components';
import { Button, Card } from 'antd';
import { useEffect } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';

// Sample data for the table, explicitly typed as DataItem[]

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

export const Client = ({ table, schema, schemas }: any) => {
  useEffect(() => {
    console.info('openapi', table, schema, schemas);
  }, []);

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    ...Object.entries(schema.properties).map(([name, item]: any): ProColumns => {
      return ({
        title: name,
        dataIndex: name,
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: (schema.required ?? []).indexOf(name) !== -1,
            },
          ],
        },
        onCell: (record) => ({
          style: { maxWidth: '200px', backgroundColor: '#f0f0f0' }
        }),
        renderFormItem: (_schema, _config, _form, _action) => {
          return InputBuilder({ schemas, item, name });
        },
      });
    }),
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record, index) => ([
        <Button key={`edit-${index}`} type="link" onClick={() => console.log('Edit', record)} icon={<EditOutlined/>} />,
        <Button key={`delete-${index}`} type="link" onClick={() => console.log('Delete', record)} icon={<DeleteOutlined/>} />
      ]),
    },
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
            console.log('params', params);
            const { current, pageSize } = params
            return await fetcher({
              path: `/table/${table}`,
              method: 'get',
              queryJson: params,
            })
          }}
          options={{
            reload: true,
            density: true,
            setting: true,
            fullScreen: true,
          }}
          scroll={{ x: 'max-content' }}
          toolBarRender={(action, { selectedRows, }) => [
            <Button type="primary" icon={<PlusOutlined />}>Add</Button>
          ]}
        />
      </Card>
    </div>
  );
};
