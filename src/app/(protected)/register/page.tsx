'use client';
import RegistrationPost from '@/components/registration/RegistrationPost';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (email: string, password: string, name: string) => {
    await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    router.push('/login');
  };

  return <>
    <RegistrationPost />
    <div className='pt-3'>Already has an account? <Link href="/login">Login</Link></div>
  </>
  // return <RegisterForm onSubmit={handleRegister} />;
}