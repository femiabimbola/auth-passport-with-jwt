"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, User, LayoutDashboard, Settings, LogOut } from "lucide-react";

import useSWR from "swr";
import api from "@/lib/api2";
import { useRouter } from "next/navigation";

const fetcher = (url: string) => api.get(url).then((res) => res.data);

const Dashboard = () => {
  const router = useRouter();

  
  const { data: ruser, error, isLoading } = useSWR(`${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/profile`, fetcher);

  console.log(ruser)

  // console.log(ruser)
  // const user = {
  //   name: "Alex Johnson",
  //   email: "alex.j@example.com",
  // };

  // 1. ROUTE PROTECTION: Redirect if there is an error (e.g., 401 Unauthorized)
  // useEffect(() => {
  //   if (error && !isLoading) {
  //     router.push("/auth/login");
  //   }
  // }, [error, isLoading, router]);

  // 2. LOADING STATE: Show a spinner or skeleton while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <p className="text-muted-foreground animate-pulse">Loading dashboard...</p>
      </div>
    );
  }

  // If there is an error or no data yet, return null to prevent flashing the protected content
  if (error || !ruser) return null;

  // 3. USE REAL DATA: Map the API response to your UI
  const user = {
    name: ruser.name || "User", // Fallback if name is missing
    email: ruser.email,
    id: ruser.id
  };

 const initials = user.name ? user.name.split(" ").map((n: string) => n[0]).join("") : "U";

  return (
    <div className="flex h-screen bg-gray-50/50">

      {/* Sidebar */}
      <aside className="w-64 border-r bg-white p-6 hidden md:block">
        <h2 className="text-xl font-bold mb-8">MyApp</h2>
        <nav className="space-y-2">
          <button className="flex items-center gap-3 w-full p-2 bg-secondary rounded-lg text-sm font-medium">
            <LayoutDashboard size={18} /> Dashboard
          </button>
          <button className="flex items-center gap-3 w-full p-2 text-muted-foreground hover:bg-secondary/50 rounded-lg text-sm font-medium">
            <Settings size={18} /> Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8">
          <h1 className="text-lg font-semibold">Overview</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{user.email}</span>
            <Avatar>
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
          </div>
        </header>

        <div className="p-8 max-w-4xl mx-auto">
          <div className="grid gap-6">
            {/* Welcome Card */}
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {user.name}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Here is what's happening with your account today.
                </p>
              </CardContent>
            </Card>

            {/* Profile Info Cards */}
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <User className="text-blue-500" />
                  <CardTitle className="text-sm font-medium">Full Name</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.name}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  <Mail className="text-green-500" />
                  <CardTitle className="text-sm font-medium">Email Address</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{user.email}</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard