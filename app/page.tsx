import { redirect } from 'next/navigation';

export default function Home() {
  // Jab koi main URL open karega, wo automatically dashboard par chala jayega
  redirect('/dashboard');
}
