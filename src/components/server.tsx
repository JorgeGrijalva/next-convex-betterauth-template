"use client"

import { Button } from "@/components/ui/button";
import { Settings, Menu, X, Github } from "lucide-react";
import Image from "next/image";
import { PropsWithChildren } from "react";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
} from "@/components/ui/drawer";

export const UserProfile = ({
  user,
}: {
  user?: { name: string; image?: string | null; email: string } | null;
}) => {
  return (
    <div className="flex items-center space-x-2">
      {user?.image ? (
     
        <Image
          src={user.image}
          alt={user.name}
          width={40}
          height={40}
          className="rounded-full"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
          {user?.name?.[0].toUpperCase()}
        </div>
      )}
      <div>
        <h1 className="font-medium">{user?.name}</h1>
        <p className="text-sm text-neutral-500">{user?.email}</p>
      </div>
    </div>
  );
};

export const AppContainer = ({ children }: PropsWithChildren) => {
  return <div className="min-h-screen w-full p-4 space-y-8">{children}</div>;
};

export const AppHeader = ({ children }: PropsWithChildren) => {
  return (
    <header className="w-full bg-transparent">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-3">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <path d="M2 12L10 5v14L2 12z" fill="#0A5BFF" />
              <path d="M10 5l12 7-12 7V5z" fill="#0837C6" />
            </svg>
            <span className="font-bold text-lg tracking-tight">FLUTV</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 ml-6 text-sm text-muted-foreground">
            <a href="/" className="hover:underline">Inicio</a>
            <a href="/planes" className="hover:underline">Planes</a>
            <a href="/support" className="hover:underline">Soporte</a>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="md:hidden">
            <Drawer>
              <DrawerTrigger asChild>
                <button aria-label="Abrir menú" className="p-2 rounded-md hover:bg-muted">
                  <Menu />
                </button>
              </DrawerTrigger>

              <DrawerContent>
                <DrawerHeader>
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                        <path d="M2 12L10 5v14L2 12z" fill="#0A5BFF" />
                        <path d="M10 5l12 7-12 7V5z" fill="#0837C6" />
                      </svg>
                      <span className="font-semibold">FLUTV</span>
                    </div>
                    <DrawerClose asChild>
                      <button aria-label="Cerrar" className="p-2 rounded-md hover:bg-muted">
                        <X />
                      </button>
                    </DrawerClose>
                  </div>
                </DrawerHeader>

                <div className="p-4 space-y-4">
                  <a href="/" className="block text-lg">Inicio</a>
                  <a href="/planes" className="block text-lg">Planes</a>
                  <a href="/support" className="block text-lg">Soporte</a>
                  <a href="/dashboard" className="block text-lg">Dashboard</a>
                </div>

                <DrawerFooter>
                  <a href="/signin" className="w-full text-center px-4 py-2 rounded-md bg-primary text-primary-foreground">Iniciar sesión</a>
                </DrawerFooter>
              </DrawerContent>
            </Drawer>
          </div>

          <a href="/signin" className="hidden md:inline-block px-4 py-2 rounded-md text-sm bg-primary text-primary-foreground hover:opacity-95">Iniciar sesión</a>
        </div>
      </div>
      {children}
    </header>
  );
};

export const AppNav = ({ children }: PropsWithChildren) => {
  return <div className="flex items-center gap-2">{children}</div>;
};

export const SettingsButton = ({ children }: PropsWithChildren) => {
  return (
    <Button variant="ghost" size="sm" asChild>
      {children}
    </Button>
  );
};

export const SettingsButtonContent = () => {
  return (
    <div className="flex items-center gap-2">
      <Settings size={16} />
      Settings
    </div>
  );
};

