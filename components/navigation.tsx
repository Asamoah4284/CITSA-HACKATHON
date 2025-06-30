"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import {
  Menu,
  Search,
  ShoppingCart,
  Heart,
  User,
  Settings,
  LogOut,
  Store,
  BarChart3,
  Package,
  Bell,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useCart } from "@/hooks/use-cart"

export function Navigation() {
  const router = useRouter()
  const { user, isLoading, logout } = useAuth()
  const { cartCount } = useCart()
  const [isOpen, setIsOpen] = useState(false)
  const [notifications] = useState(2) // Mock notifications

  // Debug logging
  console.log('Navigation render:', { user, isLoading, cartCount })

  const handleLogout = () => {
    logout()
    router.push('/')
  }

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/marketplace", label: "Marketplace" },
    { href: "/entrepreneurs", label: "Entrepreneurs" },
    { href: "/about", label: "About" },
  ]

  const userMenuItems = [
    { icon: User, label: "Profile", href: "/profile" },
    { icon: BarChart3, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Orders", href: "/orders" },
    { icon: Heart, label: "Wishlist", href: "/wishlist" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  const entrepreneurMenuItems = [
    { icon: Store, label: "Dashboard", href: "/dashboard" },
    { icon: Package, label: "Products", href: "/products" },
    { icon: BarChart3, label: "Analytics", href: "/analytics" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ]

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="flex items-center justify-center w-8 h-8 bg-terracotta-500 rounded-lg">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-heading text-xl font-bold">Kola</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Search - Hidden on small screens */}
            <Button variant="ghost" size="icon" className="hidden lg:flex">
              <Search className="h-4 w-4" />
              <span className="sr-only">Search</span>
            </Button>

            {/* Theme Toggle - Hidden on small screens */}
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>

            {!isLoading && user ? (
              <>
                {/* Notifications - Hidden on small screens */}
                <Link href="/orders" className="hidden lg:block">
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    {notifications > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-terracotta-500">
                        {notifications}
                      </Badge>
                    )}
                    <span className="sr-only">Notifications</span>
                  </Button>
                </Link>

                {/* Cart - Hidden on small screens */}
                <Link href="/cart" className="hidden lg:block">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-terracotta-500">
                        {cartCount}
                      </Badge>
                    )}
                    <span className="sr-only">Shopping cart</span>
                  </Button>
                </Link>

                {/* User Menu - Hidden on small screens */}
                <div className="hidden lg:block">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                          <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">{user.name}</p>
                          <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                          {user.userType === 'artisan' && user.businessName && (
                            <p className="text-xs leading-none text-terracotta-600 font-medium">
                              {user.businessName}
                            </p>
                          )}
                        </div>
                      </DropdownMenuLabel>
                      {/* Dashboard quick link */}
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center font-medium">
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Dashboard
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      
                      {/* Customer Menu Items */}
                      {user.userType === 'customer' && (
                        <>
                          {userMenuItems.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href} className="flex items-center">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}

                      {/* Entrepreneur Menu Items */}
                      {user.userType === 'artisan' && (
                        <>
                          <DropdownMenuLabel>Entrepreneur</DropdownMenuLabel>
                          {entrepreneurMenuItems.map((item) => (
                            <DropdownMenuItem key={item.href} asChild>
                              <Link href={item.href} className="flex items-center">
                                <item.icon className="mr-2 h-4 w-4" />
                                <span>{item.label}</span>
                              </Link>
                            </DropdownMenuItem>
                          ))}
                        </>
                      )}

                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Log out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </>
            ) : !isLoading ? (
              <>
                {/* Cart for non-logged in users - Hidden on small screens */}
                <Link href="/cart" className="hidden lg:block">
                  <Button variant="ghost" size="icon" className="relative">
                    <ShoppingCart className="h-4 w-4" />
                    {cartCount > 0 && (
                      <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-terracotta-500">
                        {cartCount}
                      </Badge>
                    )}
                    <span className="sr-only">Shopping cart</span>
                  </Button>
                </Link>

                {/* Sign In/Up buttons - Hidden on small screens */}
                <div className="hidden lg:flex items-center space-x-2">
               
                  <Link href="/signup">
                    <Button size="sm" className="bg-terracotta-500 hover:bg-terracotta-600">
                      Sign Up
                    </Button>
                  </Link>
                </div>
              </>
            ) : null}

            {/* Mobile Menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                  <SheetDescription>Navigate through Kola marketplace</SheetDescription>
                </SheetHeader>
                <div className="grid gap-4 py-4">
                  {/* Theme Toggle in mobile menu */}
                  <div className="flex items-center justify-between px-2 py-1">
                    <span className="text-sm font-medium">Theme</span>
                    <ThemeToggle />
                  </div>
                  
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="block px-2 py-1 text-lg"
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                  
                  {/* Cart in mobile menu */}
                  <Link 
                    href="/cart" 
                    className="flex items-center px-2 py-1 text-lg"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShoppingCart className="mr-3 h-5 w-5" />
                    Cart
                    {cartCount > 0 && (
                      <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs bg-terracotta-500">
                        {cartCount}
                      </Badge>
                    )}
                  </Link>
                  
                  {/* User-specific mobile menu items */}
                  {user ? (
                    <>
                      <div className="border-t pt-4 mt-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src="/placeholder-user.jpg" alt={user.name} />
                            <AvatarFallback>{getUserInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        
                        {/* Notifications in mobile menu */}
                        <Link
                          href="/orders"
                          className="flex items-center px-2 py-2 text-lg"
                          onClick={() => setIsOpen(false)}
                        >
                          <Bell className="mr-3 h-5 w-5" />
                          Notifications
                          {notifications > 0 && (
                            <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 text-xs bg-terracotta-500">
                              {notifications}
                            </Badge>
                          )}
                        </Link>
                        
                        {user.userType === 'customer' && (
                          <>
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-2 py-2 text-lg"
                                onClick={() => setIsOpen(false)}
                              >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.label}
                              </Link>
                            ))}
                          </>
                        )}
                        
                        {user.userType === 'artisan' && (
                          <>
                            <p className="px-2 py-1 text-sm font-medium text-muted-foreground">Entrepreneur</p>
                            {entrepreneurMenuItems.map((item) => (
                              <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center px-2 py-2 text-lg"
                                onClick={() => setIsOpen(false)}
                              >
                                <item.icon className="mr-3 h-5 w-5" />
                                {item.label}
                              </Link>
                            ))}
                          </>
                        )}
                        
                        <button
                          onClick={() => {
                            handleLogout()
                            setIsOpen(false)
                          }}
                          className="flex items-center px-2 py-2 text-lg text-red-600 hover:text-red-700 w-full"
                        >
                          <LogOut className="mr-3 h-5 w-5" />
                          Log out
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <Link href="/signin" className="block px-2 py-1 text-lg" onClick={() => setIsOpen(false)}>
                        Sign In
                      </Link>
                      <Link href="/signup" className="block px-2 py-1 text-lg" onClick={() => setIsOpen(false)}>
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
