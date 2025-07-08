// import { cookies } from 'next/headers';

// export async function getCurrentUser() {
//   const token = (await cookies()).get('auth-token')?.value;
//   if (!token) return null;

//   // Verifikasi token (contoh sederhana)
//   try {
//     const user = await prisma.user.findFirst({
//       where: { id: token.split('-')[1] }, // Contoh sederhana
//       select: { id: true, name: true, email: true, role: true }
//     });
//     return user;
//   } catch (error) {
//     return null;
//   }
// }

export async function signOut() {
  // (await cookies()).delete('auth-token');
  window.location.href = '/login';
}