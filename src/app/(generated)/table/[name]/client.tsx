'use client';
import { InputBuilder } from '@/lib/builder/InputBuilder';
import { ActionType, ProColumns, ProFormDateTimePicker, ProTable } from '@ant-design/pro-components';
import { Button, Card, Popconfirm } from 'antd';
import { useEffect, useMemo, useRef, useState } from 'react';
import Icon, { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from '@ant-design/icons';
import { useRouter } from 'next/navigation';
import { labelcase, ucFirst } from '@/shared/string';
import Link from 'next/link';

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
  const router = useRouter();
  const actionRef = useRef<ActionType>();
  const [deletingId, setDeletingId] = useState<number | null>(null);


  const handleDelete = async (id: number) => {
    setDeletingId(id); // Show loading on this row
    await fetcher({ path: `/delete/${table}/${id}`, method: 'DELETE' });
    setDeletingId(null);
    actionRef.current?.reload(); // Refresh table
  };

  const columns: ProColumns<any>[] = useMemo(() =>
  ([
    {
      dataIndex: 'index',
      valueType: 'indexBorder',
      width: 48,
    },
    ...Object.entries(schema.properties)
      .filter(([name, item]: any) => !item.writeOnly)
      .map(([name, item]: any): ProColumns => {
        return ({
          title: labelcase(name),
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
            return InputBuilder({ item, name });
          },
        });
      }),
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record: any, index) => ([

        <Link href={`/view/${table}/${record.id}`}>
          <Button key={`view-${index}`} type="link" onClick={() => router.push(`/view/${table}/${record.id}`)} icon={<EyeOutlined/>} />
        </Link>,

        <Link href={`/edit/${table}/${record.id}`}>
          <Button key={`edit-${index}`} type="link" onClick={() => router.push(`/edit/${table}/${record.id}`)} icon={<EditOutlined />} />
        </Link>,

        <Popconfirm
          title="Are you sure to delete?"
          onConfirm={() => handleDelete(record.id)}
          okButtonProps={{ loading: deletingId === record.id }}
        >
          <Link href={`/edit/${table}/${record.id}`}>
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              loading={deletingId === record.id}
            />
          </Link>
        </Popconfirm>
      ]),
    },
  ]), [schema, schemas]);


  return (
    <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">
      <Card
        title={<span className="text-2xl font-bold text-gray-800">{ucFirst(table)} Data Table</span>}
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
          actionRef={actionRef}
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
            <Link href={`/add/${table}`}><Button type="primary" icon={<PlusOutlined />} onClick={() => router.push(`/add/${table}`)}>Add</Button></Link>
          ]}
        />
      </Card>
    </div>
  );
};
