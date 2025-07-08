'use client';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/auth_slice';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const dispatch = useDispatch();

  const handleLogin = async (email: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    dispatch(setCredentials(data));
  };

  return <LoginForm onSubmit={handleLogin} />;
}