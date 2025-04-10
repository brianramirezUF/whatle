"use client"
import { RedirectButton } from '@/components/Buttons'
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import React from 'react';

export default function Home() {

  const authProvider = useAuth();

  useEffect(() => {
    console.log('AuthContext contents:', authProvider)
  }, []);


  return (
    <>
      <ul>
        <li className='underline table'>Testing Buttons:</li>
        <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/upload" text="upload" /></li>
        <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/create" text="create" /></li>
        <li className='rounded mb-1 table bg-gray-200'><RedirectButton url="/play" text="play" /></li>
      </ul>
    </>
  );
}
