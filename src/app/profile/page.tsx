
"use client";

import { Suspense, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Loader2, LogOut, Save } from "lucide-react";

import RoleGuard from "@/components/auth/role-guard";
import { useSession, signOut, authClient } from "@/lib/auth-client";

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string | null;
  address?: string | null;
  role?: string;
}

function ProfileContent() {
  const { data: session, isPending, refetch } = useSession();

  const user = session?.user as ProfileUser | undefined;

  const [form, setForm] = useState({
    name: "",
    image: "",
    phone: "",
    address: "",
  });
  const [saving, setSaving] = useState(false);

  // Hydrate the form once the session loads
  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      image: user.image || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Name cannot be empty.");
      return;
    }

    setSaving(true);

    try {
      // Built as a variable so the extra fields (phone, address) pass
      // through Better Auth's loosely-typed updateUser client action.
      const payload = {
        name: form.name.trim(),
        image: form.image.trim(),
        phone: form.phone.trim(),
        address: form.address.trim(),
      };

      const { error } = await authClient.updateUser(payload);

      if (error) {
        throw new Error(error.message || "Could not update profile.");
      }

      await refetch();
      toast.success("Profile updated successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  if (isPending || !user) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="mr-2 animate-spin text-blue-600" />
        <span className="text-gray-600">Loading profile...</span>
      </div>
    );
  }

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">

        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-gray-500 sm:text-base">
          Keep your personal details up to date.
        </p>

        {/* Profile Card */}
        <form
          onSubmit={handleSave}
          className="mt-6 rounded-2xl bg-white p-6 shadow sm:p-8"
        >
          {/* Avatar + role */}
          <div className="flex items-center gap-4">
            {form.image ? (
              <img
                src={form.image}
                alt={user.name}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white">
                {(user.name || "U").charAt(0).toUpperCase()}
              </div>
            )}

            <div>
              <p className="font-semibold text-gray-900">
                {user.name}
              </p>

              <span className="mt-1 inline-block rounded-full bg-blue-50 px-3 py-0.5 text-xs font-medium capitalize text-blue-600">
                {user.role || "customer"}
              </span>
            </div>
          </div>

          {/* Fields */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
                required
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                value={user.email}
                readOnly
                className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Profile Image URL
              </label>

              <input
                type="url"
                value={form.image}
                onChange={(e) =>
                  setForm({ ...form, image: e.target.value })
                }
                placeholder="https://example.com/photo.jpg"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="tel"
                value={form.phone}
                onChange={(e) =>
                  setForm({ ...form, phone: e.target.value })
                }
                placeholder="01XXXXXXXXX"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Address
              </label>

              <input
                type="text"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                placeholder="Your address"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
            >
              {saving ? (
                <Loader2 size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => signOut()}
              className="flex items-center justify-center gap-2 rounded-lg border border-red-200 px-6 py-2.5 font-medium text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="mr-2 animate-spin text-blue-600" />
        </div>
      }
    >
      {/* Private route: any logged-in role may open their profile */}
      <RoleGuard>
        <ProfileContent />
      </RoleGuard>
    </Suspense>
  );
}
