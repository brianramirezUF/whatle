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
  const { currentUser, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Search Query:", searchQuery);
  };

  return (
    <nav className="flex items-center justify-between p-3 bg-white shadow-md">
      <div>
        <Link href="/home" passHref>
          <h1 className="text-lg font-bold">
            {<Logo />}
          </h1>
        </Link>
      </div>

      {/* Middle Section */}
      <div className="flex items-center space-x-6 ">
        <Link href="/home" passHref>
          <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            Popular
          </Button>
        </Link>
        <CategoriesDropdown></CategoriesDropdown>
        <form
          onSubmit={handleSearchSubmit}
          className="relative flex items-center">
          <Input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={handleSearchChange}
            className="h-8 w-48 rounded-md pr-10 text-sm"
          />
          <button type="submit" className="absolute right-2">
            <Search className="h-4 w-4 text-gray-500" />
          </button>
        </form>
      </div>
      {/* sign up, login cbuttons */}
      <div className="flex items-center space-x-4">
        {!currentUser ? (
          <>
            <Link href="/signup" passHref>
              <Button variant="default" className="text-sm">
                Sign Up
              </Button>
            </Link>
            <Link href="/login" passHref>
              <Button variant="outline" className="text-sm">
                Login
              </Button>
            </Link>
          </>
        ) :
          (
            <>
              <Link href="/play" passHref>
                <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  My Games
                </Button>
              </Link>
              <Link href="/history" passHref>
                <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                  History
                </Button>
              </Link>
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
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
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