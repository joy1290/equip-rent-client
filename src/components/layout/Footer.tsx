
import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 bg-gray-950 text-gray-300">
      {/* Main Footer */}
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8 lg:py-16">

        {/* Brand */}
        <div>
          <Link href="/" className="text-2xl font-extrabold text-white">
            EquipRent<span className="text-indigo-400">.</span>
          </Link>

          <p className="mt-4 max-w-sm text-sm leading-7 text-gray-400">
            Rent the equipment you need, when you need it.
            EquipRent makes equipment rental simple, convenient,
            and accessible for everyone.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Quick Links</h3>
          <ul className="space-y-3 text-sm">
            <li><Link href="/" className="hover:text-indigo-400">Home</Link></li>
            <li><Link href="/equipment" className="hover:text-indigo-400">Browse Equipment</Link></li>
            <li><Link href="/login" className="hover:text-indigo-400">Login</Link></li>
            <li><Link href="/signup" className="hover:text-indigo-400">Create Account</Link></li>
          </ul>
        </div>

        {/* Customer Support */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Customer Support</h3>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/dashboard/customer/bookings" className="hover:text-indigo-400">
                My Bookings
              </Link>
            </li>
            <li>
              <Link href="/dashboard/customer/favorites" className="hover:text-indigo-400">
                My Favorites
              </Link>
            </li>
            <li>
              <Link href="/equipment" className="hover:text-indigo-400">
                Find Equipment
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="mb-5 text-lg font-bold text-white">Contact Information</h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <MapPin size={18} className="mt-0.5 shrink-0 text-indigo-400" />
              <span>Bangladesh</span>
            </li>

            <li className="flex items-start gap-3">
              <Mail size={18} className="mt-0.5 shrink-0 text-indigo-400" />
              <a href="mailto:support@equiprent.com" className="break-all hover:text-indigo-400">
                support@equiprent.com
              </a>
            </li>

            <li className="flex items-start gap-3">
              <Phone size={18} className="mt-0.5 shrink-0 text-indigo-400" />
              <span>Contact support by email</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-center text-xs text-gray-500 sm:px-6 md:flex-row md:text-left lg:px-8">
          <p>
  © 2026 EquipRent. All rights reserved.
</p>
          <p>Equipment Rental Platform</p>
        </div>
      </div>
    </footer>
  );
}
