"use client";

import { useParams, useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

const UpdateImage = () => {
  const params = useParams();
  const router = useRouter();
  const [image, setImage] = useState<{ image_url: string } | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

  // Fetch the existing image
  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await fetch(
          // `http://localhost:3000/api/image/${params.id}`
          `${apiURL}/api/image/${params.id}`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch image.");
        }
        const data = await response.json();
        setImage(data);
      } catch (err) {
        setError("Error fetching image.");
        console.error(err);
      }
    };

    if (params.id) {
      fetchImage();
    }
  }, [params.id]);

  // Handle file selection
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Preview the selected image
      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
    }
  };

  // Handle image update
  const handleUpdate = async () => {
    if (!selectedImage) {
      alert("Please select an image!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedImage);

      const response = await fetch(
        // `http://localhost:3000/api/image/${params.id}`,
        `${apiURL}/api/image/${params.id}`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update image.");
      }

      const data = await response.json();
      setImage(data); // Update UI with new image
      setPreview(null); // Remove preview

      alert("Image updated successfully!");
      router.push("/");
    } catch (err) {
      setError("Error updating image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle image deletion
  const handleDelete = async () => {
    if (!params.id) {
      alert("No image selected for deletion!");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        // `http://localhost:3000/api/image/${params.id}`,
        `${apiURL}/api/image/${params.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete image.");
      }

      alert("Image deleted successfully!");
      router.push("/"); // Redirect to homepage after delete
    } catch (err) {
      setError("Error deleting image.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-gray-900">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-md">
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

        {/* Image Preview */}
        <div className="flex flex-col items-center">
          {preview ? (
            <img
              src={preview}
              alt="New Preview"
              className="w-72 h-72 object-cover rounded-lg border-2 border-gray-300"
            />
          ) : image ? (
            <img
              src={image.image_url}
              alt="Current Image"
              className="w-72 h-72 object-cover rounded-lg border-2 border-gray-300"
            />
          ) : (
            <p className="text-gray-500">Loading image...</p>
          )}
        </div>

        {/* File Input */}
        <div className="mt-4 w-full">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-700 cursor-pointer"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          {/* Update Button */}
          <button
            onClick={handleUpdate}
            disabled={loading}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg transition-all flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Update Image"
            )}
          </button>

          {/* Delete Button */}
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-all flex justify-center items-center"
          >
            {loading ? (
              <Loader2 className="animate-spin w-5 h-5" />
            ) : (
              "Delete Image"
            )}
          </button>
        </div>
        <p className="text-gray-700 mt-4">
          To edit the image, just browse and select a new one, then click the
          &apos;Update image&apos; button above. To remove an image, just click
          the &apos;Delete image&apos; button.{" "}
        </p>
      </div>
    </div>
  );
};

export default UpdateImage;
