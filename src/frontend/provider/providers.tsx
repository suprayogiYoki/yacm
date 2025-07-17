'use client';
import { Provider } from 'react-redux';
import { makeStore } from '@/store/store';
import { AuthState, initialState as authInitialState  } from '@/store/slices/auth_slice';
// import { cookies } from 'next/headers';

export function Providers({ children, initialState }: { children: React.ReactNode, initialState?: {
  auth?: AuthState
} }) {
  // const token = (await cookies()).get('token')?.value;
  // const { payload } = token ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) : { payload: null };
    
  return <Provider store={makeStore({
    auth: initialState?.auth ?? authInitialState
  })}>{children}</Provider>;
}