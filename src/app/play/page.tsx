import { RedirectButton } from '@/components/Buttons'
import React from 'react';
import { NavBar } from '@/components/NavBar'
import DynamicGrid from "@/components/GameCards"

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      <DynamicGrid></DynamicGrid>
    </>
  );
}
