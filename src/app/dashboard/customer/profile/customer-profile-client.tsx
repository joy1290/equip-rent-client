
"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Save,
  Loader2,
  Pencil,
  X,
  ShieldCheck,
} from "lucide-react";

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  image?: string | null;
  phone?: string;
  address?: string;
  role: string;
  emailVerified?: boolean;
  createdAt?: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function CustomerProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    address: "",
    image: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "GET",
        credentials: "include",
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to load profile.");
      }

      const user: UserProfile = result.user;

      setProfile(user);

      setFormData({
        name: user.name || "",
        phone: user.phone || "",
        address: user.address || "",
        image: user.image || "",
      });
    } catch (error) {
      console.error("Profile fetch error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to load profile."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.name.trim().length < 2) {
      toast.error("Name must contain at least 2 characters.");
      return;
    }

    try {
      setSaving(true);

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: formData.name.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          image: formData.image.trim() || null,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update profile.");
      }

      setProfile(result.user);
      setEditing(false);

      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update error:", error);

      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      name: profile.name || "",
      phone: profile.phone || "",
      address: profile.address || "",
      image: profile.image || "",
    });

    setEditing(false);
  };

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
        <User className="mb-4 h-12 w-12 text-gray-400" />

        <h2 className="text-xl font-bold text-gray-800">
          Profile Not Found
        </h2>

        <p className="mt-2 text-sm text-gray-500">
          Unable to load your profile information.
        </p>

        <button
          onClick={fetchProfile}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-white hover:bg-indigo-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
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
              Manage your personal information and account details.
            </p>
          </div>

          {!editing && (
            <button
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

          {/* Cover */}
          <div className="h-36 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 sm:h-44" />

          {/* Profile Image */}
          <div className="px-6 pb-6 sm:px-8">
            <div className="-mt-14 flex flex-wrap items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border-4 border-white bg-indigo-100 shadow-md">
                  {profile.image ? (
                    <img
                      src={profile.image}
                      alt={profile.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-12 w-12 text-indigo-600" />
                  )}
                </div>

                <div className="pb-2">
                  <h2 className="text-xl font-bold text-gray-900">
                    {profile.name}
                  </h2>

                  <p className="mt-1 text-sm capitalize text-gray-500">
                    {profile.role}
                  </p>
                </div>
              </div>

              <div className="mb-2 flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
                <ShieldCheck size={15} />
                Active Account
              </div>
            </div>

            <div className="mt-8 border-t border-gray-100 pt-7">

              {editing ? (
                <form onSubmit={handleUpdate} className="space-y-6">

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Full Name
                    </label>

                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      minLength={2}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Phone Number
                    </label>

                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      maxLength={20}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Address
                    </label>

                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      maxLength={300}
                      rows={3}
                      className="w-full resize-none rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="Enter your address"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-gray-700">
                      Profile Image URL
                    </label>

                    <input
                      type="url"
                      name="image"
                      value={formData.image}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-gray-200 px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>

                  <div className="flex flex-wrap gap-3 border-t border-gray-100 pt-5">
                    <button
                      type="submit"
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
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

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <User size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Full Name
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {profile.name || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Mail size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Email Address
                        </p>
                        <p className="mt-1 break-all font-semibold text-gray-800">
                          {profile.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Phone size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Phone Number
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {profile.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <MapPin size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Address
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {profile.address || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <ShieldCheck size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Account Role
                        </p>
                        <p className="mt-1 font-semibold capitalize text-gray-800">
                          {profile.role}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-indigo-50 p-3 text-indigo-600">
                        <Camera size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-gray-400">
                          Email Verification
                        </p>
                        <p className="mt-1 font-semibold text-gray-800">
                          {profile.emailVerified ? "Verified" : "Not verified"}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div className="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h3 className="mb-2 font-bold text-gray-900">
            Account Information
          </h3>

          <p className="text-sm text-gray-500">
            Your account role is managed by the platform. Contact an
            administrator if you need assistance with your account.
          </p>

          <p className="mt-4 text-xs text-gray-400">
            Account ID: {profile._id}
          </p>
        </div>

      </div>
    </div>
  );
}
