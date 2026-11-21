
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-7xl font-bold tracking-tight text-blue-600">
        404
      </p>
      <h1 className="mt-4 text-2xl font-bold">Page Not Found</h1>
      <p className="mt-2 max-w-md text-gray-500">
        The page you are looking for doesn&apos;t exist or has been
        moved. Let&apos;s get you back on track.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Back to Home
        </Link>
        <Link
          href="/equipment"
          className="rounded-lg border bg-white px-5 py-2.5 font-medium transition hover:bg-gray-50"
        >
          Browse Equipment
        </Link>
      </div>
    </div>
  );
}
