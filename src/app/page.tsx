"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = false; // Replace this with your actual authentication logic

    if (!isAuthenticated) {
      router.push("/signin"); // Redirect to /signin if not authenticated
    }
  }, [router]);
  return (
    <div></div>
  );
}
