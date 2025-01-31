import { deleteImageFromCloudinary } from "@/app/lib/delete-image";
import { connectDB } from "../db/connectDB";
import { Image } from "../models/image.model";

export async function DELETE(request: Request) {
  await connectDB();

  try {
    // Get image ID from the request body (you could also use URL parameters)
    const { imageId } = await request.json();

    if (!imageId) {
      return Response.json({ message: "Image ID is required" }, { status: 400 });
    }

    // Find the image in MongoDB to get the public_id
    const image = await Image.findById(imageId);

    if (!image) {
      return Response.json({ message: "Image not found" }, { status: 404 });
    }

    // Delete image from Cloudinary using its public_id
    const deleteResult = await deleteImageFromCloudinary(image.public_id);

    if (!deleteResult) {
      return Response.json({ message: "Error deleting image from Cloudinary" }, { status: 500 });
    }

    // Delete image entry from MongoDB
    await Image.findByIdAndDelete(imageId);

    return Response.json({ message: "Image deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting image:", error);
    return Response.json({ message: "Error deleting image" }, { status: 500 });
  }
}