'use client'
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { auth } from '@/config/firebase';
import { signOut } from 'firebase/auth';
import { GameCardProps } from "@/components/GameCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function NavBar() {
  const [searchResults, setSearchResults] = useState<GameCardProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const anyGameHasIcon = searchResults.some(game => game.icon);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchResults([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSearchChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/searchGames?name=${encodeURIComponent(query)}`);
      const data: GameCardProps[] = await res.json();
      console.log("Search results:", data);
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    console.log("Search Query:", searchQuery);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-3 bg-white shadow-md">
      <div>
        <Link href="/" passHref>
          <h1 className="text-lg font-bold">
            {<Logo />}
          </h1>
        </Link>
      </div>

      {/* Middle Section */}
      <div className="flex items-center space-x-6">
        <Link href="/" passHref>
          <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            Popular
          </Button>
        </Link>
        <CategoriesDropdown></CategoriesDropdown>
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col" ref={searchRef}>
          <div className="flex items-center">
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
          </div>
          {searchResults.length > 0 && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border rounded shadow">
              {searchResults.map((game) => (
                <Link key={game.id} href={`/play/${game.id}`}>
                  <div className="px-4 py-2 flex items-center hover:bg-gray-100 cursor-pointer text-sm">
                    {game.icon && (
                      <img src={game.icon} alt={game.name} className="h-8 w-8 mr-4 object-contain" />
                    )}
                    <span className={`${anyGameHasIcon ? game.icon ? '' : 'ml-12' : ''} text-lg`}>{game.name}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </form>
      </div>

      {/* Sign up, login buttons */}
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
        ) : (
          <>
            <Link href="/create" passHref>
              <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                My Games
              </Button>
            </Link>
            <Link href="/history" passHref>
              <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
                History
              </Button>
            </Link>
            <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground" onClick={handleLogout}>
              Log out
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
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"
              }`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <DropdownMenuItem>
          <Link href="/categories/games" passHref>
            Games
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/categories/tvmovies" passHref>
            TV/Movies
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/categories/irl" passHref>
            IRL
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Link href="/categories/other" passHref>
            Other
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}