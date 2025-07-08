"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push("/properties");
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-4">Loading Properties...</h1>
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--solid-sales-theme-5d51e2)]"></div>
      </div>
    </main>
  );
}
