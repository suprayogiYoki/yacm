'use client';
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

const Client = ({ openapi, schemaResponse }: any) => {


  useEffect(() => {
    console.info('openapi', openapi);
  }, []);

  const columns: ProColumns<any>[] = [
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    ...Object.entries(schemaResponse.items.properties).map(([name, item]: any): ProColumns => {
      return ({
        title: name,
        dataIndex: name,
        ellipsis: true,
        formItemProps: {
          rules: [
            {
              required: (schemaResponse.items.required ?? []).indexOf(name) !== -1,
            },
          ],
        },
        renderFormItem: (schema, config, form, action) => {
          if (item.format === 'date-time') {
            return <ProFormDateTimePicker
              name={schema.dataIndex}
              placeholder={name}
            />;
          }
          return config.defaultRender(schema);
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
          dataSource={initialData}
          rowKey="key"
          search={{
            labelWidth: 'auto',
          }}
          pagination={{
            defaultPageSize: 5,
            showSizeChanger: false,
          }}
          request={async (params) => {
            await new Promise((resolve) => {
              setTimeout(() => {
                resolve(true);
              }, 2000);
            });
            return {
              success: true,
              data: initialData,
              total: 6,
            };
          }}
        />
      </Card>
    </div>
  );
};

export default Client;
