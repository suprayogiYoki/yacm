import { Providers } from "@/provider/providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center font-sans">{children}</div>;
}