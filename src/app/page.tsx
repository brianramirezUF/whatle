"use client"
import { RedirectButton } from '@/components/Buttons'
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

export default function Home() {

  const authProvider = useAuth();

  useEffect(() => {
    console.log('AuthContext contents:', authProvider)
  }, []);


  return (
    <>
      <RedirectButton url="/create" text="create"></RedirectButton>
    </>
  );
}
