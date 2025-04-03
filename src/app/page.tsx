import { RedirectButton } from '@/components/Buttons'
import React from 'react';
import { NavBar } from '@/components/NavBar'

export default function Home() {
  return (
    <>
      <NavBar></NavBar>
      <ul>
        <li className='underline table'>Testing Buttons:</li>
        <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/create-game" text="create" /></li>
        <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/play" text="play" /></li>
      </ul>
    </>
  );
}
