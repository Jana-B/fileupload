import { UploadImage } from "@/app/lib/upload-image";
import { connectDB } from "../db/connectDB";
import { Image } from "../models/image.model";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

export async function POST(request: Request) {
  await connectDB();

  try {
    const formData = await request.formData();
    const image = formData.get("image");

    if (!(image instanceof File)) {
      return Response.json({ message: "Invalid image file" }, { status: 400 });
    }

    // Upload the image to Cloudinary
    const uploadResult = (await UploadImage(image, "fileupload")) as UploadResult;

    console.log("Image upload result:", uploadResult);

    // Save image details to MongoDB
    await Image.create({
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    });

    return Response.json({ message: "Image uploaded successfully" }, { status: 201 });
  } catch (error) {
    console.error("Error uploading image:", error);
    return Response.json({ message: "Error uploading image" }, { status: 500 });
  }
}