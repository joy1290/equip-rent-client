
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Mail, MapPin, MessageSquare, Send, Clock } from "lucide-react";

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

export default function ContactPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      toast.error("Please fill in your name, email and message.");
      return;
    }

    setSending(true);

    try {
      // Compose a mailto: draft — no backend mail route required
      const subject = encodeURIComponent(
        form.subject || "EquipRent contact form"
      );
      const body = encodeURIComponent(
        `${form.message}\n\n—\n${form.name}\n${form.email}`
      );

      window.location.href = `mailto:support@equiprent.com?subject=${subject}&body=${body}`;

      toast.success("Opening your email app to send the message...");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Could not open the email app. Please email us directly.");
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="min-h-[70vh] bg-gray-50 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-indigo-600 sm:text-sm">
            Contact Us
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            We&apos;d Love to Hear From You
          </h1>

          <p className="mt-4 text-sm leading-7 text-gray-600 sm:text-base">
            Questions about renting, listing equipment or your account?
            Send us a message and we will get back to you.
          </p>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">

          {/* Contact Info */}
          <div className="space-y-5">
            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mail size={23} />
              </div>

              <h2 className="mt-4 font-bold text-gray-900">Email</h2>

              <a
                href="mailto:support@equiprent.com"
                className="mt-2 block break-all text-sm text-gray-600 hover:text-indigo-600"
              >
                support@equiprent.com
              </a>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MapPin size={23} />
              </div>

              <h2 className="mt-4 font-bold text-gray-900">Location</h2>

              <p className="mt-2 text-sm text-gray-600">
                Dhaka, Bangladesh
              </p>
            </div>

            <div className="rounded-2xl border bg-white p-6 shadow-sm">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <Clock size={23} />
              </div>

              <h2 className="mt-4 font-bold text-gray-900">
                Support Hours
              </h2>

              <p className="mt-2 text-sm text-gray-600">
                Saturday – Thursday, 9:00 AM – 6:00 PM (GMT+6)
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form
            onSubmit={handleSubmit}
            className="rounded-2xl border bg-white p-6 shadow-sm sm:p-8 lg:col-span-2"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <MessageSquare size={22} />
              </div>

              <h2 className="text-xl font-bold text-gray-900">
                Send a Message
              </h2>
            </div>

            <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Your Name *
                </label>

                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm({ ...form, name: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Email Address *
                </label>

                <input
                  type="email"
                  value={form.email}
                  onChange={(e) =>
                    setForm({ ...form, email: e.target.value })
                  }
                  required
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Subject
                </label>

                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  placeholder="What is this about?"
                  className={inputClass}
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Message *
                </label>

                <textarea
                  rows={6}
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  placeholder="Write your message here..."
                  className={`${inputClass} resize-y`}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={17} />
              {sending ? "Opening Email..." : "Send Message"}
            </button>

            <p className="mt-3 text-xs text-gray-500">
              This form opens your default email app addressed to our
              support team.
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}
