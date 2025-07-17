'use client';
import { ucFirst } from "@/shared/string";
import { RootState } from "@/store/store";
import { Button, Card } from "antd";
import Link from "next/link";

import { useSelector } from 'react-redux';
export default function loggedLayout({ children }: { children: React.ReactNode }) {
  const user = useSelector((state: RootState) => state.auth.user);

  return <div className="min-h-screen bg-gray-100 p-8 font-sans flex justify-center">
    <div className="flex flex-col w-full max-w-5xl gap-2">
      <Card
        className="shadow-lg rounded-xl p-6 bg-white"
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
        <div className="flex justify-between items-end">
          <div className="flex items-end gap-2">
            <Link href="/"><h2>APP</h2></Link>
            <Link href="/table/user">User</Link>
          </div>
          <div className="flex justify-end gap-2">
            <span>{ucFirst(user?.username ?? 'Guest')}</span>
            <Link href="/auth/logout">Logout</Link>
          </div>
        </div>
      </Card>
      <Card
        className="shadow-lg rounded-xl p-6 bg-white"
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
        {children}
      </Card>
    </div>
  </div>;
};