'use client';
import { useDispatch } from 'react-redux';
import { setCredentials } from '@/store/slices/auth_slice';
import LoginPost from '@/components/auth/login/LoginPost';
import Link from 'next/link';

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

  return <>
    <LoginPost />
    
    <div className='pt-3'>Doesn't have an account? <Link href="/register">Register</Link></div>
  </>;
}