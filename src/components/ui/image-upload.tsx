
"use client";

import { useRef, useState } from "react";
import toast from "react-hot-toast";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
}

/**
 * imgbb file upload (proxied through the backend so the API key never
 * reaches the browser) with a direct-URL fallback input.
 */
export default function ImageUpload({
  value,
  onChange,
  label = "Equipment Image",
  required = false,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5 MB.");
      return;
    }

    setUploading(true);

    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () =>
          reject(new Error("Could not read the selected file."));

        reader.readAsDataURL(file);
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/uploads/imgbb`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ image: dataUrl }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image upload failed.");
      }

      onChange(data.url);
      toast.success("Image uploaded successfully!");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Image upload failed."
      );
    } finally {
      setUploading(false);

      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      <label className="mb-2 block font-medium">{label}</label>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        disabled={uploading}
        className="w-full cursor-pointer rounded-lg border border-dashed border-gray-300 px-4 py-3 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-blue-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-blue-700 disabled:opacity-60"
      />

      {uploading && (
        <p className="text-sm font-medium text-blue-600">
          Uploading to imgbb...
        </p>
      )}

      {value && (
        <img
          src={value}
          alt="Preview"
          className="h-28 w-auto rounded-lg border border-gray-200 object-cover"
        />
      )}

      <input
        type="url"
        name="image"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://example.com/image.jpg"
        required={required}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500"
      />

      <p className="text-xs text-gray-500">
        Upload a file (imgbb) or paste a direct image link.
      </p>
    </div>
  );
}
