
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

interface ApiResponse {
  success: boolean;
  message?: string;
}

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/users`;

export default function UsersClient() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all users directly from Express backend
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      const response = await fetch(API_URL, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      const data: UsersResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to load users.");
      }

      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch (err) {
      console.error("Fetch users error:", err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Update user role directly through Express backend
  const handleRoleChange = async (
    user: User,
    newRole: UserRole
  ) => {
    if (user.role === newRole) return;

    if (user.role === "admin" && newRole !== "admin") {
      setError("Admin account role cannot be changed from this page.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to change ${user.name}'s role to ${newRole}?`
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
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ role: newRole }),
        }
      );

      const data: ApiResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to update user role.");
      }

      setUsers((previousUsers) =>
        previousUsers.map((item) =>
          item._id === user._id
            ? { ...item, role: newRole }
            : item
        )
      );

      setMessage(data.message || "User role updated successfully.");
    } catch (err) {
      console.error("Update role error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update role."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  // Search and role filtering
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch =
        user.name?.toLowerCase().includes(search.toLowerCase()) ||
        user.email?.toLowerCase().includes(search.toLowerCase());

      const matchesRole =
        roleFilter === "all" || user.role === roleFilter;

      return matchesSearch && matchesRole;
    });
  }, [users, search, roleFilter]);

  // Statistics
  const totalUsers = users.length;
  const totalCustomers = users.filter(
    (user) => user.role === "customer"
  ).length;
  const totalOwners = users.filter(
    (user) => user.role === "owner"
  ).length;
  const totalAdmins = users.filter(
    (user) => user.role === "admin"
  ).length;

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

  const formatDate = (date?: string) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "N/A";

    return parsedDate.toLocaleDateString("en-BD", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/dashboard/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-600"
            >
              <ArrowLeft size={16} />
              Back to Dashboard
            </Link>

            <h1 className="text-2xl font-bold text-gray-900">
              Manage All Users
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and manage all registered EquipRent users.
            </p>
          </div>

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Notifications */}
        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={20} />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError("")}>
              <XCircle size={18} />
            </button>
          </div>
        )}

        {message && (
          <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
            <CheckCircle size={20} />
            <span className="flex-1">{message}</span>
            <button onClick={() => setMessage("")}>
              <XCircle size={18} />
            </button>
          </div>
        )}

        {/* Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Users"
            value={totalUsers}
            icon={<Users size={22} />}
            color="bg-indigo-100 text-indigo-600"
          />

          <StatCard
            title="Customers"
            value={totalCustomers}
            icon={<UserRound size={22} />}
            color="bg-green-100 text-green-600"
          />

          <StatCard
            title="Owners"
            value={totalOwners}
            icon={<BriefcaseBusiness size={22} />}
            color="bg-blue-100 text-blue-600"
          />

          <StatCard
            title="Admins"
            value={totalAdmins}
            icon={<ShieldCheck size={22} />}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles</option>
            <option value="customer">Customers</option>
            <option value="owner">Owners</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {/* Users Table */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-gray-900">
                All Users
              </h2>
              <p className="text-xs text-gray-500">
                Showing {filteredUsers.length} of {totalUsers} users
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 items-center justify-center gap-3 text-gray-500">
              <Loader2 className="animate-spin" size={22} />
              Loading users...
            </div>
          ) : error && users.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-3 px-4 text-center">
              <AlertCircle size={32} className="text-red-500" />
              <p className="font-medium text-gray-700">
                Failed to load users.
              </p>
              <button
                onClick={fetchUsers}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Try Again
              </button>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex min-h-64 items-center justify-center text-sm text-gray-500">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px] text-left">
                <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">User</th>
                    <th className="px-5 py-4 font-semibold">Role</th>
                    <th className="px-5 py-4 font-semibold">Email Status</th>
                    <th className="px-5 py-4 font-semibold">Joined</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Change Role
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-gray-900">
                            {user.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {user.email}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getRoleStyle(user.role)}`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {user.emailVerified ? (
                          <span className="inline-flex items-center gap-1 text-sm text-green-600">
                            <CheckCircle size={15} />
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-500">
                            <XCircle size={15} />
                            Not verified
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        {user.role === "admin" ? (
                          <span className="text-xs font-medium text-gray-400">
                            Protected
                          </span>
                        ) : (
                          <select
                            value={user.role}
                            disabled={updatingId === user._id}
                            onChange={(event) =>
                              handleRoleChange(
                                user,
                                event.target.value as UserRole
                              )
                            }
                            className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm capitalize outline-none focus:border-indigo-500 disabled:opacity-50"
                          >
                            <option value="customer">Customer</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        )}

                        {updatingId === user._id && (
                          <Loader2
                            size={15}
                            className="ml-2 inline animate-spin text-indigo-600"
                          />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-gray-400">
          Only administrators can access and manage user accounts.
        </p>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="mt-2 text-2xl font-bold text-gray-900">
            {value}
          </p>
        </div>

        <div className={`rounded-xl p-3 ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}
