
"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold tracking-tight text-red-500">
        !
      </p>
      <h1 className="mt-4 text-2xl font-bold">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-gray-500">
        An unexpected error occurred while loading this page. You can
        try again.
      </p>
      <button
        onClick={reset}
        className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 font-medium text-white transition hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  );
}
