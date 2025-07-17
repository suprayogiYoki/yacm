import '@/frontend/styles/global.scss';
import 'antd/dist/reset.css';
import { ConfigProvider, notification } from 'antd';
import enUS from 'antd/locale/en_US';
import NotificationProvider from "@/provider/notificationProvider";
import AuthWrapper from "@/components/auth/AuthWrapper";
import { Providers } from '@/provider/providers';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider locale={enUS}>
          <NotificationProvider>
            {/* <Providers>{children}</Providers> */}
            <AuthWrapper>{children}</AuthWrapper>
          </NotificationProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}