import { Button } from "@/components/ui/button";
import Link from "next/link";

const Home = () => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-sky-100 via-sky-200 to-blue-200 flex items-center justify-center">
      <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg py-12 gap-5 px-auto">
        <h1 className="text-2xl text-center font-semibold">The Authentication with Json Web Token</h1>
        <p className="text-gray-600 mt-2">
          This tutorial attempts to do authenication using Access Token and and refresh Tokem
        </p>
        <div className="flex justify-center gap-x-3 mt-5">
          <Button
            asChild
            className="rounded-none bg-blue-600 hover:bg-blue-700 text-white px-6 py-6 text-lg font-medium transition-colors duration-200"
          >
            <Link href={"/auth/register"}>Register</Link>
          </Button>
          <Button
            asChild
            className="rounded-none bg-green-900 hover:bg-green-700 text-white px-8 py-6 text-lg font-medium transition-colors duration-200"
          >
            <Link href={"/auth/login"}>Login</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;
