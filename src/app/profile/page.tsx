
"use client";

import { useSession, signOut } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <p className="p-10 text-center">Loading...</p>;
  }

  if (!session) {
    return (
      <p className="p-10 text-center">
        Please login first.
      </p>
    );
  }

  return (
    <div className="mx-auto max-w-lg p-10">
      <h1 className="mb-6 text-2xl font-bold">
        My Profile
      </h1>

      <p>Name: {session.user.name}</p>
      <p>Email: {session.user.email}</p>

      <button
        onClick={() => signOut()}
        className="mt-6 rounded-lg bg-red-600 px-5 py-2 text-white"
      >
        Logout
      </button>
    </div>
  );
}
