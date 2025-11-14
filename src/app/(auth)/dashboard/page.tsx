"use client";

import Link from "next/link";
import { Toaster } from "sonner";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

// Temporary: using inline components instead of server components
// import {
//   AppContainer,
//   AppHeader,
//   AppNav,
//   SettingsButton,
//   SettingsButtonContent,
//   UserProfile,
// } from "@/components/server";
import { SignOutButton } from "@/components/client";
import { api } from "@/utils/api";
import { TodoList } from "@/components/todo-list";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import Image from "next/image";

// Header Component - Shows user profile and navigation
const Header = () => {
  const router = useRouter();
  const { data: session } = useSession();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  return (
    <header className="flex items-center justify-between max-w-2xl mx-auto">
      <div className="flex items-center space-x-2">
        {session?.user?.image ? (
          <Image
            src={session.user.image}
            alt={session.user.name || "User"}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-600 dark:text-orange-200 font-medium">
            {session?.user?.name?.[0]?.toUpperCase() || "U"}
          </div>
        )}
        <div>
          <h1 className="font-medium">{session?.user?.name}</h1>
          <p className="text-sm text-neutral-500">{session?.user?.email}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings">
            <div className="flex items-center gap-2">
              <Settings size={16} />
              Settings
            </div>
          </Link>
        </Button>
        <SignOutButton onClick={handleSignOut} />
      </div>
    </header>
  );
};

// Stat Card Component - Reusable card for displaying metrics
const StatCard = ({
  label,
  value,
  description,
}: {
  label: string;
  value: string | number;
  description?: string;
}) => {
  return (
    <div className="border rounded-lg p-6">
      <div className="text-sm text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-semibold mb-1">{value}</div>
      {description && (
        <div className="text-xs text-muted-foreground">{description}</div>
      )}
    </div>
  );
};

// Quick Actions Component - Common actions users might take
const QuickActions = () => {
  const actions = [
    { label: "Documentation", href: "/documentation", description: "Learn how to use this template" },
    { label: "API Reference", href: "/api-reference", description: "Explore available functions" },
  ];

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Quick Actions</h2>
      <div className="space-y-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            href={action.href}
            className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
          >
            <div className="font-medium text-sm">{action.label}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {action.description}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

// Recent Activity Component - Shows recent user activity
const RecentActivity = () => {
  const { data: todos } = api.todo.getAll.useQuery();
  
  // Transform recent todos into activity items
  const activities = todos?.slice(0, 5).map((todo) => ({
    action: `${todo.completed ? "Completed" : "Created"} todo: "${todo.text}"`,
    time: new Date(todo.updatedAt).toLocaleString(),
  })) || [];

  return (
    <div className="border rounded-lg p-6">
      <h2 className="text-lg font-medium mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span>{activity.action}</span>
            <span className="text-muted-foreground text-xs">{activity.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Dashboard Content
const DashboardContent = () => {
  const { data: session } = useSession();
  const { data: todos } = api.todo.getAll.useQuery();
  const totalTodos = todos?.length || 0;
  const completedTodos = todos?.filter(todo => todo.completed).length || 0;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Welcome back, {session?.user?.name || session?.user?.email}
        </p>
      </div>

      {/* Stats Grid - Real metrics from tRPC */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard label="Total Todos" value={totalTodos} description="All todos created" />
        <StatCard label="Completed" value={completedTodos} description="Finished todos" />
        <StatCard label="Pending" value={totalTodos - completedTodos} description="Remaining todos" />
      </div>

      {/* Two Column Layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>

      {/* Todo Management Section */}
      <TodoList />

      {/* Getting Started Section (Remove this after setup) */}
      <div className="border rounded-lg p-6 bg-muted/30">
        <h2 className="text-lg font-medium mb-3">Getting Started</h2>
        <p className="text-sm text-muted-foreground mb-4">
          This is a boilerplate dashboard. Customize it by:
        </p>
        <ul className="text-sm space-y-2 list-disc list-inside text-muted-foreground">
          <li>Replacing StatCard values with your own tRPC queries</li>
          <li>Adding your own components and sections</li>
          <li>Creating new pages in the /dashboard directory</li>
          <li>Customizing the layout to fit your needs</li>
        </ul>
        <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
          Edit this file: <code className="bg-muted px-1.5 py-0.5 rounded">src/app/(auth)/dashboard/page.tsx</code>
        </div>
      </div>
    </div>
  );
};

// Main Page Export
export default function DashboardPage() {
  return (
    <div className="min-h-screen w-full p-4 space-y-8">
      <Header />
      <DashboardContent />
      <Toaster />
    </div>
  );
}
