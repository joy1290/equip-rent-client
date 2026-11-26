
"use client";

import { Suspense, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Save,
  Loader2,
  Pencil,
  X,
  ShieldCheck,
  Settings,
  LogOut,
} from "lucide-react";

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
  emailVerified?: boolean;
}

function ProfileContent() {
  const { data: session, isPending, refetch } = useSession();

  const user = session?.user as ProfileUser | undefined;

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    image: "",
    phone: "",
    address: "",
  });

  useEffect(() => {
    if (!user) return;

    setForm({
      name: user.name || "",
      image: user.image || "",
      phone: user.phone || "",
      address: user.address || "",
    });
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (form.name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    try {
      setSaving(true);

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

      setEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!user) return;

    setForm({
      name: user.name || "",
      image: user.image || "",
      phone: user.phone || "",
      address: user.address || "",
    });

    setEditing(false);
  };

  if (isPending || !user) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  const role = user.role || "customer";

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <Link
              href="/dashboard/customer"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition hover:text-indigo-600"
            >
              <ArrowLeft size={17} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              My Profile
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              Manage your personal account information.
            </p>
          </div>

          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              <Pencil size={16} />
              Edit Profile
            </button>
          )}
        </div>

        {/* Profile Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

          {/* Gradient Cover */}
          <div className="h-36 bg-gradient-to-r from-indigo-700 via-violet-700 to-purple-700 sm:h-44" />

          <div className="px-6 pb-6 sm:px-8">

            {/* Avatar and User Info */}
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">

                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 shadow-md">
                  {form.image ? (
                    <img
                      src={form.image}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-indigo-600" />
                  )}
                </div>

                <div className="pb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {editing ? form.name || user.name : user.name}
                  </h2>

                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {role}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-semibold capitalize text-indigo-700">
                <ShieldCheck size={15} />
                {role}
              </div>
            </div>

            {/* Personal Information */}
            <div className="mt-8 border-t border-gray-100 pt-7">

              {editing ? (
                <form onSubmit={handleSave} className="space-y-6">

                  <h3 className="text-lg font-bold text-gray-900">
                    Edit Personal Information
                  </h3>

                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Full Name
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      minLength={2}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Email Address
                    </label>

                    <input
                      id="email"
                      type="email"
                      value={user.email}
                      readOnly
                      className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-gray-500"
                    />
                  </div>

                  {/* Phone */}
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Phone Number
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      maxLength={20}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Address
                    </label>

                    <textarea
                      id="address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      maxLength={300}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your address"
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label
                      htmlFor="image"
                      className="mb-2 block text-sm font-semibold text-gray-700"
                    >
                      Profile Image URL
                    </label>

                    <input
                      id="image"
                      type="url"
                      name="image"
                      value={form.image}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">

                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
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
                      onClick={handleCancel}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                    >
                      <X size={17} />
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div>
                  <h3 className="mb-5 text-lg font-bold text-gray-900">
                    Personal Information
                  </h3>

                  <div className="grid gap-6 sm:grid-cols-2">

                    {/* Name */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <User size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Full Name
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {user.name || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Mail size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Email Address
                        </p>
                        <p className="mt-1 break-all font-semibold text-gray-800">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Phone size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Phone Number
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Address */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <MapPin size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Address
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {user.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Role */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Settings size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Account Role
                        </p>
                        <p className="mt-1 font-semibold capitalize text-gray-800">
                          {role}
                        </p>
                      </div>
                    </div>

                    {/* Verification */}
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <ShieldCheck size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Email Verification
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {user.emailVerified ? "Verified" : "Not verified"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Customer Account Information */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-bold text-gray-900">
            Customer Account
          </h3>

          <p className="text-sm text-gray-500">
            Your EquipRent account allows you to explore equipment,
            manage bookings, save favorites, and track your rentals.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            Account ID: {user.id}
          </p>

          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => signOut()}
              className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

      </div>
    </main>
  );
}

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[70vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        </div>
      }
    >
      <RoleGuard>
        <ProfileContent />
      </RoleGuard>
    </Suspense>
  );
}
