import { Providers } from "@/provider/providers";
import '@/frontend/styles/global.scss';
import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ConfigProvider locale={enUS}>
          <Providers>{children}</Providers>
        </ConfigProvider>
      </body>
    </html>
  );
}