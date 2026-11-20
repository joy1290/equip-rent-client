
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Loader2,
  ShieldCheck,
  UserRound,
  BriefcaseBusiness,
  AlertCircle,
  CheckCircle,
  XCircle,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type UserRole = "customer" | "owner" | "admin";

interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  createdAt?: string;
}

interface UsersResponse {
  success: boolean;
  total: number;
  users: User[];
  message?: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch All Users
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: UsersResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(data.users || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Search and Filter
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const searchMatch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const roleMatch =
        roleFilter === "all" || user.role === roleFilter;

      return searchMatch && roleMatch;
    });
  }, [users, search, roleFilter]);

  // Role Update
  const updateUserRole = async (
    user: User,
    newRole: UserRole
  ) => {
    if (user.role === newRole) return;

    const confirmed = window.confirm(
      `Change ${user.name}'s role from ${user.role} to ${newRole}?`
    );

    if (!confirmed) return;

    try {
      setUpdatingId(user._id);
      setError("");
      setMessage("");

      const response = await fetch(
        `${API_URL}/${user._id}/role`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Role update failed.");
      }

      setMessage(`${user.name}'s role updated to ${newRole}.`);

      await fetchUsers();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleStyle = (role: UserRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-700";

      case "owner":
        return "bg-blue-100 text-blue-700";

      default:
        return "bg-green-100 text-green-700";
    }
  };

  const roleCounts = {
    all: users.length,
    customer: users.filter((user) => user.role === "customer").length,
    owner: users.filter((user) => user.role === "owner").length,
    admin: users.filter((user) => user.role === "admin").length,
  };

  if (loading && users.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-9 w-9 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-7xl">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-purple-100 p-3">
              <Users className="h-7 w-7 text-purple-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Manage All Users
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                View registered users and manage their roles.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/admin"
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>

            <button
              onClick={fetchUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg border bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              title: "Total Users",
              value: roleCounts.all,
              icon: Users,
              color: "text-indigo-600",
              bg: "bg-indigo-50",
            },
            {
              title: "Customers",
              value: roleCounts.customer,
              icon: UserRound,
              color: "text-green-600",
              bg: "bg-green-50",
            },
            {
              title: "Owners",
              value: roleCounts.owner,
              icon: BriefcaseBusiness,
              color: "text-blue-600",
              bg: "bg-blue-50",
            },
            {
              title: "Admins",
              value: roleCounts.admin,
              icon: ShieldCheck,
              color: "text-purple-600",
              bg: "bg-purple-50",
            },
          ].map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      {stat.title}
                    </p>
                    <h2 className={`mt-3 text-3xl font-bold ${stat.color}`}>
                      {stat.value}
                    </h2>
                  </div>

                  <div className={`rounded-xl p-4 ${stat.bg}`}>
                    <Icon className={`h-7 w-7 ${stat.color}`} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Notifications */}
        {message && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            {message}
          </div>
        )}

        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <XCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* Search and Filter */}
        <div className="mt-8 rounded-xl border bg-white p-5 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full rounded-lg border py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full rounded-lg border px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            >
              <option value="all">All Roles</option>
              <option value="customer">Customers</option>
              <option value="owner">Owners</option>
              <option value="admin">Admins</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing <strong>{filteredUsers.length}</strong> of{" "}
            <strong>{users.length}</strong> users
          </div>
        </div>

        {/* Users Table */}
        <div className="mt-6 overflow-hidden rounded-xl border bg-white shadow-sm">
          {error && users.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-red-400" />
              <h3 className="mt-4 text-lg font-bold text-gray-900">
                Unable to Load Users
              </h3>
              <p className="mt-2 text-sm text-gray-500">{error}</p>

              <button
                onClick={fetchUsers}
                className="mt-5 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto h-12 w-12 text-gray-300" />

              <h3 className="mt-4 text-lg font-bold text-gray-900">
                No Users Found
              </h3>

              <p className="mt-2 text-sm text-gray-500">
                Try changing your search or role filter.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Email Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4">Manage Role</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user._id}
                      className="transition hover:bg-gray-50"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                            {user.name?.charAt(0)?.toUpperCase() || "U"}
                          </div>

                          <span className="font-semibold text-gray-900">
                            {user.name || "Unknown User"}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {user.emailVerified ? (
                          <span className="text-xs font-semibold text-green-600">
                            Verified
                          </span>
                        ) : (
                          <span className="text-xs font-semibold text-yellow-600">
                            Not Verified
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <select
                            value={user.role}
                            disabled={
                              updatingId !== null ||
                              user.role === "admin"
                            }
                            onChange={(e) =>
                              updateUserRole(
                                user,
                                e.target.value as UserRole
                              )
                            }
                            className="rounded-lg border px-3 py-2 text-sm capitalize outline-none focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:opacity-60"
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>

                          {updatingId === user._id && (
                            <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="mt-4 text-xs leading-5 text-gray-500">
          Admin accounts are locked in this interface. Role changes for
          other users should be protected by server-side authorization.
        </p>
      </div>
    </main>
  );
}
