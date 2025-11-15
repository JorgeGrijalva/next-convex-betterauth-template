"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { PropsWithChildren, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Drawer, DrawerContent, DrawerTrigger, DrawerClose } from "@/components/ui/drawer"
import { Home, CreditCard, User, Users, DollarSign, Server, Shield, LogOut, Menu } from "lucide-react"

export function AppShell({ children }: PropsWithChildren) {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  if (pathname?.startsWith("/admin")) {
    return <>{children}</>
  }

  const isAdmin = session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN" || session?.user?.role === "VERIFIER"

  const navItems = [
    { title: "Inicio", href: "/", icon: Home },
    { title: "Planes", href: "/planes", icon: CreditCard },
    { title: "Dashboard", href: "/dashboard", icon: User, auth: true },
    { title: "Mis Pagos", href: "/pagos", icon: DollarSign, auth: true },
    { title: "Mi Cuenta IPTV", href: "/mi-cuenta", icon: Server, auth: true },
    { title: "Afiliados", href: "/afiliados", icon: Users, auth: true },
    ...(isAdmin ? [{ title: "Admin", href: "/admin", icon: Shield, auth: true }] : []),
  ]

  return (
    <div className="min-h-screen w-full bg-slate-900 text-white">
      <div className="border-b border-slate-800 bg-slate-900/95">
        <div className="px-4 md:px-6 h-14 flex items-center justify-between">
          <Link href="/" className="text-lg font-bold">Flutv</Link>
          <div className="hidden md:flex items-center gap-2">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-slate-300">{session.user.name}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                  <DropdownMenuItem onClick={() => signOut()} className="text-red-400"><LogOut className="mr-2 h-4 w-4" />Cerrar Sesión</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700"><Link href="/sign-in">Iniciar sesión</Link></Button>
            )}
          </div>
          <div className="md:hidden">
            <Drawer open={open} onOpenChange={setOpen}>
              <DrawerTrigger asChild>
                <Button variant="ghost" size="sm" className="text-slate-300"><Menu className="h-5 w-5" /></Button>
              </DrawerTrigger>
              <DrawerContent className="bg-slate-900 border-slate-800">
                <div className="p-4 flex items-center justify-between">
                  <span className="font-semibold">Flutv</span>
                  <DrawerClose asChild>
                    <Button variant="ghost" size="sm">Cerrar</Button>
                  </DrawerClose>
                </div>
                <div className="h-px bg-slate-800" />
                <div className="p-2 space-y-1 overflow-y-auto max-h-[70vh]">
                  {navItems.filter(i => !i.auth || !!session).map(item => {
                    const Icon = item.icon
                    const active = pathname === item.href
                    return (
                      <Button key={item.href} variant={active ? "default" : "ghost"} className="w-full justify-start" asChild onClick={() => setOpen(false)}>
                        <Link href={item.href}><Icon className="mr-2 h-4 w-4" />{item.title}</Link>
                      </Button>
                    )
                  })}
                  {session && (
                    <Button variant="outline" className="w-full justify-start border-red-600 text-red-400" onClick={() => { setOpen(false); signOut() }}>
                      <LogOut className="mr-2 h-4 w-4" />Cerrar Sesión
                    </Button>
                  )}
                  </div>
              </DrawerContent>
            </Drawer>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="hidden md:flex w-56 flex-col border-r border-slate-800 bg-slate-900">
          <div className="p-3 overflow-y-auto h-[calc(100vh-3.5rem)]">
            <div className="space-y-1">
              {navItems.filter(i => !i.auth || !!session).map(item => {
                const Icon = item.icon
                const active = pathname === item.href
                return (
                  <Button key={item.href} variant={active ? "default" : "ghost"} className="w-full justify-start" asChild>
                    <Link href={item.href}><Icon className="mr-2 h-4 w-4" />{item.title}</Link>
                  </Button>
                )
              })}
            </div>
            {session && (
              <div className="mt-4">
                <div className="h-px bg-slate-800" />
                <Button variant="outline" className="mt-3 w-full justify-start border-red-600 text-red-400" onClick={() => signOut()}>
                  <LogOut className="mr-2 h-4 w-4" />Cerrar Sesión
                </Button>
              </div>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <div className="px-4 md:px-6 py-6">
            <Card className="bg-transparent border-none shadow-none">
              {children}
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}