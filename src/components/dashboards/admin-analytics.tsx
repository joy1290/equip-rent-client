"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { Loader2 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface AnalyticsProps {
  dashboardData?: {
    totalUsers: number;
    totalEquipment: number;
    totalBookings: number;
    pendingEquipment: number;
    approvedEquipment: number;
    rejectedEquipment: number;
    paidBookings: number;
    totalRevenue: number;
    monthlyBookings: number;
  };
}

const AdminAnalytics = ({ dashboardData }: AnalyticsProps = {}) => {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        const url = dashboardData
          ? `/api/dashboard/owner?ownerId=${dashboardData}`
          : `/api/dashboard/stats`;
        const response = await fetch(url, {
          credentials: "include",
        });
        if (!response.ok) throw new Error("Failed to load analytics data.");
        const data = await response.json();
        setAnalytics(data);
      } catch (err) {
        console.error("Error fetching analytics:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 60000);
    return () => clearInterval(interval);
  }, [dashboardData]);

  if (loading) {
    return <div className="h-64 w-full flex items-center justify-center">
      <Loader2 className="mr-2 animate-spin text-blue-600" />
      <span className="text-gray-600">Loading analytics...</span>
    </div>;
  }
  if (!analytics) {
    return <div className="h-64 w-full p-8 text-center">
      <div className="text-sm text-gray-500">No analytics data available.</div>
    </div>;
  }
  const { totalUsers, totalEquipment, totalBookings, paidBookings, totalRevenue, monthlyBookings } = analytics;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Users</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalUsers}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Equipment</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalEquipment}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Bookings</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{totalBookings}</p>
        </div>
        <div className="rounded-xl border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Paid Revenue</p>
          <p className="mt-1 text-2xl font-bold text-emerald-600">
            ৳{totalRevenue.toLocaleString("en-BD")}
          </p>
        </div>
      </div>
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-bold text-gray-900">Booking Status Distribution</h3>
        {analytics && (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart data={[
              { name: "Confirmed", count: totalBookings > 0 ? 40 : 0 },
              { name: "Pending", count: totalBookings > 0 ? 30 : 0 },
              { name: "Cancelled", count: totalBookings > 0 ? 20 : 0 },
              { name: "Paid", count: paidBookings },
            ]}>
              <Pie>
                {["Confirmed", "Pending", "Cancelled", "Paid"].map((name, i) => (
                  <Cell key={name} fill={["#8884d8", "#82ca9d", "#8fb9f1", "#f6ad55"][i]} />
                ))}
              </Pie>
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default AdminAnalytics;