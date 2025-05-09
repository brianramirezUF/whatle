'use client'
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import Link from "next/link";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Search, Menu, ChevronDown } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { nanoid } from "nanoid";
import { cn } from "@/lib/utils";
import { useAuth } from '@/contexts/AuthContext';

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuIndicator,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
  navigationMenuTriggerStyle
} 
from "@/components/ui/navigation-menu"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} 
from "@/components/ui/dropdown-menu";
import React from "react";

export default function NavBar() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Search Query:", searchQuery);
  };
  const { currentUser, loading } = useAuth();
  return (
    <nav className="flex items-center justify-between p-3 bg-white shadow-md">
      <div>
        <Link href="/" passHref>
          <h1 className="text-lg font-bold">
            {<Logo/>} 
          </h1>
        </Link>
      </div>

      {/* Middle Section */}
      <div className="flex items-center space-x-6 ">
        <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">

          <Link href="/" passHref> 
              Popular
          </Link>
        </Button>
        <CategoriesDropdown></CategoriesDropdown>
      </div>
      {/* sign up, login buttons */}
      
      <div className="flex items-center space-x-4"> 
        {!currentUser ? (
          <>
        <Button variant="default" className="text-sm">
        <Link href="/signup" passHref> 
              Sign Up
          </Link>
        </Button>
        <Button variant="outline" className="text-sm">
        <Link href="/login" passHref> 
              Login
          </Link>
        </Button>   
        </>
        ) :
        (
          <>
            <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <Link href="/play" passHref> 
                  My Games
              </Link>
            </Button>
            <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
              <Link href="/history" passHref> 
                  History
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  );
}
export { NavBar };

export function CategoriesDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={(open) => setIsOpen(open)}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="link"
          className="text-sm flex items-center select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          Categories
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
          />
        </Button>
      </DropdownMenuTrigger>
          <DropdownMenuContent className="">
            <DropdownMenuItem>
              <Link href="/games" passHref> 
                Games
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <Link href="/tvmovies" passHref> 
                TV/Movies
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <Link href="/irl" passHref> 
                IRL
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem>
            <Link href="/other" passHref> 
                Other
              </Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
    </DropdownMenu>
  );
}