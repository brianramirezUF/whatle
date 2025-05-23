'use client'
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { Logo } from "./Logo";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, Menu, X } from "lucide-react";
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
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export default function NavBar() {
  const [searchResults, setSearchResults] = useState<GameCardProps[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const { currentUser } = useAuth();
  const router = useRouter();
  const searchRef = useRef<HTMLFormElement>(null);
  const anyGameHasIcon = searchResults.some(game => game.icon);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 0
  );

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
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
    setShowSearchDropdown(true);

    if (query.length === 0) {
      setSearchResults([]);
      return;
    }

    try {
      const res = await fetch(`/api/searchGames?name=${encodeURIComponent(query)}`);
      const data: GameCardProps[] = await res.json();
      setSearchResults(data);
    } catch (err) {
      console.error("Search error:", err);
      setSearchResults([]);
    }
  };

  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setShowSearchDropdown(false);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
      if (windowWidth < 768) {
        setMobileMenuOpen(false);
      }
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-3 bg-white shadow-md">
      <div className="flex items-center">
        <Link href="/" passHref>
          <h1 className="text-lg font-bold">
            <Logo />
          </h1>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-6">
        <Link href="/" passHref>
          <Button variant="link" className="text-sm select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground">
            Popular
          </Button>
        </Link>
        <CategoriesDropdown />
        <form onSubmit={handleSearchSubmit} className="relative flex flex-col" ref={searchRef}>
          <div className="flex items-center">
            <Input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              onClick={() => setShowSearchDropdown(true)}
              className="h-8 w-48 rounded-md pr-10 text-sm"
            />
            <button type="submit" className="absolute right-2">
              <Search className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          {(searchResults.length > 0 && showSearchDropdown) && (
            <div className="absolute z-50 top-full left-0 mt-1 w-64 bg-white border rounded shadow">
              {searchResults.map((game) => (
                <Link key={game.id} href={`/play/${game.id}`} onClick={handleSearchSubmit}>
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

      {/* Desktop Authentication Buttons */}
      <div className="hidden md:flex items-center space-x-4">
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
                Create
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

      {/* Mobile Menu Button */}
      <div className="md:hidden flex items-center">
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>

          <SheetContent side="right" className="w-[80%] sm:w-[350px]">
            <SheetTitle>
              Menu
            </SheetTitle>
            <div className="mt-6 flex flex-col gap-4">
              {/* Mobile Search */}
              <form onSubmit={handleSearchSubmit} className="relative w-full mb-4" ref={searchRef}>
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onClick={() => setShowSearchDropdown(true)}
                    className="h-10 w-full pr-10"
                  />
                  <button type="submit" className="absolute right-3">
                    <Search className="h-4 w-4 text-gray-500" />
                  </button>
                </div>
                {(searchResults.length > 0 && showSearchDropdown) && (
                  <div className="absolute z-50 top-full left-0 mt-1 w-full bg-white border rounded shadow">
                    {searchResults.map((game) => (
                      <Link key={game.id} href={`/play/${game.id}`} onClick={() => {
                        handleSearchSubmit;
                        setMobileMenuOpen(false);
                      }}>
                        <div className="px-4 py-2 flex items-center hover:bg-gray-100 cursor-pointer">
                          {game.icon && (
                            <img src={game.icon} alt={game.name} className="h-8 w-8 mr-4 object-contain" />
                          )}
                          <span className={`${anyGameHasIcon ? game.icon ? '' : 'ml-12' : ''}`}>{game.name}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </form>

              {/* Mobile Navigation Links */}
              <Link href="/" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start text-lg">Popular</Button>
              </Link>
              
              <div className="border-t border-gray-200 my-2"></div>
              
              <h3 className="font-semibold ml-3 mt-2">Categories</h3>
              <Link href="/categories/games" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start pl-6">Games</Button>
              </Link>
              <Link href="/categories/tvmovies" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start pl-6">TV/Movies</Button>
              </Link>
              <Link href="/categories/irl" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start pl-6">IRL</Button>
              </Link>
              <Link href="/categories/other" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start pl-6">Other</Button>
              </Link>
              
              <div className="border-t border-gray-200 my-2"></div>
              
              {/* Mobile Authentication Buttons */}
              {!currentUser ? (
                <>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="default" className="w-full">Sign Up</Button>
                  </Link>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Login</Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/create" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">My Games</Button>
                  </Link>
                  <Link href="/history" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start">History</Button>
                  </Link>
                  <Button variant="ghost" className="w-full justify-start" onClick={handleLogout}>
                    Log out
                  </Button>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
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
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="">
        <Link href="/categories/games" passHref>
          <DropdownMenuItem>
            Games
          </DropdownMenuItem>
        </Link>
        <Link href="/categories/tvmovies" passHref>
          <DropdownMenuItem>
            TV/Movies
          </DropdownMenuItem>
        </Link>
        <Link href="/categories/irl" passHref>
          <DropdownMenuItem>
            IRL
          </DropdownMenuItem>
        </Link>
        <Link href="/categories/other" passHref>
          <DropdownMenuItem>
            Other
          </DropdownMenuItem>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}