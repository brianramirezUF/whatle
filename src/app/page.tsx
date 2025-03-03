import { RedirectButton } from '@/components/Buttons'
import React from 'react';
import { NavBar } from '@/components/NavBar'

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      <RedirectButton url="/create" text="create"></RedirectButton>

    </>
  );
}
