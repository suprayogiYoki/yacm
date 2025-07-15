import { Providers } from "@/provider/providers";
import '@/frontend/styles/global.scss';
import 'antd/dist/reset.css';
import { ConfigProvider, notification } from 'antd';
import enUS from 'antd/locale/en_US';
import NotificationProvider from "@/provider/notificationProvider";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider locale={enUS}>
          <NotificationProvider>
            <Providers>{children}</Providers>
          </NotificationProvider>
        </ConfigProvider>
      </body>
    </html>
  );
}