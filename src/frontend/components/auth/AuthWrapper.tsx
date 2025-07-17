import { cookies, headers } from 'next/headers';
import { jwtVerify } from 'jose';
import { Providers } from '@/provider/providers';

export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('token')?.value;


  const { payload } = token
    ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    : { payload: null };

  return (
    <Providers initialState={{
      auth: {
        user: payload && {
          id: `${payload.id}`,
          username: `${payload.username}`
        }
      }
    }}>
      {children}
    </Providers>
  );
}