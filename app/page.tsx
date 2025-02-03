"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useEffect, useState } from "react";

// Define ImageType for better typing
interface ImageType {
  _id: string;
  image_url: string;
}

export default function Home() {
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<ImageType[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/get-images")
      .then((response) => {
        if (!response.ok) throw new Error("Response was not ok!");
        return response.json();
      })
      .then((data: ImageType[]) => setImages(data))
      .catch((error) => console.error("Error fetching images:", error));
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setImage(e.target.files[0]);
    }
  };

  const onSubmit = async () => {
    if (!image) {
      alert("Please select an image!");
      return;
    }

    const formData = new FormData();
    formData.append("image", image);

    try {
      const response = await fetch("/api/upload-image", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Response was not ok.");
      }

      await response.json();
      alert("Image uploaded successfully!");
      router.refresh(); // Refresh page to show new image
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Failed to upload image!");
    }
  };

  return (
    <div className="">
      <h1 className="text-5xl font-bold text-center mb-4 mt-5">Image Upload</h1>

      <div className="max-w-screen-lg mx-auto p-6 sm:p-10 bg-gray-50 rounded-lg shadow-lg">
        <p className="text-gray-700">
          Welcome to the image upload app. Search your pc for an image you would
          like to upload, then click on the button below. Your image will be
          stored in Cloudinary. A reference to it will be stored in MongoDB. To
          edit or delete an image, please click on the corresponding image.
        </p>
        <br />
        <div className="mb-6">
          <input
            type="file"
            accept="image/*"
            onChange={handleChange}
            className="block w-full text-gray-700 border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <button
          onClick={onSubmit}
          className="w-full sm:w-auto bg-black text-white py-3 px-6 font-semibold rounded-lg shadow-md hover:bg-gray-800 transition duration-300 ease-in-out focus:ring-4 focus:ring-blue-300 focus:outline-none"
        >
          Upload Image
        </button>

        <div className="mt-12">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            All Images
          </h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {images.map((image) => (
              <Link key={image._id} href={`/update-image/${image._id}`}>
                <div className="overflow-hidden rounded-lg shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out">
                  <img
                    src={image.image_url}
                    alt="Uploaded Image"
                    className="w-full h-64 object-cover object-center"
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
