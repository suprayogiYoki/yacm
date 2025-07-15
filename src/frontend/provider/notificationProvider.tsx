'use client';
import { notification } from 'antd';
import { NotificationInstance } from 'antd/es/notification/interface';
import { createContext, useContext } from 'react';

const NotificationContext = createContext<NotificationInstance | null>(null);

export const useNotifier = () => useContext(NotificationContext);

export default function NotificationProvider({ children }: any) {
  const [api, contextHolder] = notification.useNotification();

  return (
    <NotificationContext.Provider value={api}>
      {contextHolder}
      {children}
    </NotificationContext.Provider>
  );
}
