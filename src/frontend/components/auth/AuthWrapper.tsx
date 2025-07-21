import { cookies, headers } from 'next/headers';
import { jwtVerify } from 'jose';
import { Providers } from '@/provider/providers';
import { AuthState, initialState } from '@/store/slices/auth_slice';

export default async function AuthWrapper({ children }: { children: React.ReactNode }) {
  const token = (await cookies()).get('token')?.value;


  const { payload } = (token
    ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET))
    : { payload: initialState }) as { payload: AuthState };

  return (
    <Providers initialState={{
      auth: payload
    }}>
      {children}
    </Providers>
  );
}