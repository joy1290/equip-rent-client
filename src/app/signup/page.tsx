
"use client";

import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";

import { signUp, signIn } from "@/lib/auth-client";

/** Assignment rules: uppercase + lowercase + at least 6 characters. */
const validatePassword = (password: string): string | null => {
  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain an uppercase letter.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain a lowercase letter.";
  }
  return null;
};

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [photo, setPhoto] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast.error(passwordError);
      setMessage(passwordError);
      return;
    }

    setLoading(true);

    try {
      const { error } = await signUp.email({
        name,
        email,
        password,
        ...(photo.trim() ? { image: photo.trim() } : {}),
      });

      if (error) {
        setMessage(error.message || "Signup failed!");
        return;
      }

      toast.success("Account created successfully! Welcome to EquipRent.");
      window.location.replace("/");
    } catch {
      setMessage("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setMessage("");
    setGoogleLoading(true);

    try {
      await signIn.social({
        provider: "google",
        callbackURL: `${window.location.origin}/`,
        errorCallbackURL: `${window.location.origin}/signup`,
      });
    } catch {
      setMessage("Google signup failed! Please try again.");
      setGoogleLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-8">
      <form
        onSubmit={handleSignup}
        className="w-full max-w-md space-y-4 rounded-xl bg-white p-8 shadow"
      >
        <div className="text-center">
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="mt-2 text-sm text-gray-500">
            Join EquipRent today
          </p>
        </div>

        {/* Google Signup */}
        <button
          type="button"
          onClick={handleGoogleSignup}
          disabled={loading || googleLoading}
          className="flex w-full items-center justify-center gap-3 rounded-lg border p-3 font-medium transition hover:bg-gray-50 disabled:opacity-50"
        >
          <GoogleIcon />
          {googleLoading ? "Redirecting..." : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gray-200" />
          <span className="text-sm text-gray-400">OR</span>
          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Name */}
        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />

        {/* Email */}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />

        {/* Photo (direct image link) */}
        <input
          type="url"
          placeholder="Photo URL (optional)"
          value={photo}
          onChange={(e) => setPhoto(e.target.value)}
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete="new-password"
          className="w-full rounded-lg border p-3 outline-none focus:border-blue-500"
        />
        <p className="-mt-2 text-xs text-gray-500">
          Must contain an uppercase letter, a lowercase letter and be at
          least 6 characters.
        </p>

        {/* Signup Button */}
        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full rounded-lg bg-blue-600 p-3 font-medium text-white transition hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Creating Account..." : "Sign Up"}
        </button>

        {message && (
          <p className="text-center text-sm text-red-500">
            {message}
          </p>
        )}

        {/* Link to Login */}
        <p className="text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-blue-600 hover:underline"
          >
            Login
          </Link>
        </p>
      </form>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-5 w-5">
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6C44.4 37.96 46.98 31.8 46.98 24.55Z"
      />
      <path
        fill="#FBBC05"
        d="M10.53 28.59A14.4 14.4 0 0 0 9.75 24c0-1.59.27-3.13.76-4.59l-7.98 6.19A8.64 8.64 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.97-6.19Z"
      />
      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.9-5.8l-7.73-6c-2.14 1.44-4.88 2.3-8.17 2.3-6.26 0-11.57-4.22-13.46-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </svg>
  );
}
