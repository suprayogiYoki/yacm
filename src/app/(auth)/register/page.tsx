'use client';
import { useRouter } from 'next/navigation';
import RegisterForm from '@/components/auth/RegisterForm';

export default function RegisterPage() {
  const router = useRouter();

  const handleRegister = async (email: string, password: string, name: string) => {
    await fetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    router.push('/login');
  };

  return <RegisterForm onSubmit={handleRegister} />;
}