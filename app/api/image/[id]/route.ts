import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/app/lib/cloudinary";
import { connectDB } from "../../db/connectDB";
import { Image } from "../../models/image.model";
import { UploadImage } from "@/app/lib/upload-image";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

// Corrected GET function
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const image = await Image.findById(params.id);
        
        if (!image) {
            return NextResponse.json({ message: "Image not found" }, { status: 404 });
        }

        return NextResponse.json(image, { status: 200 });
    } catch (error) {
        console.error("Error fetching image:", error);
        return NextResponse.json({ message: "Error retrieving image" }, { status: 500 });
    }
}

// Corrected POST function
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const formData = await request.formData();
        const newImage = formData.get("image");

        if (!(newImage instanceof File)) {
            return NextResponse.json({ message: "No valid image provided" }, { status: 400 });
        }

        const existingImage = await Image.findById(params.id);

        if (!existingImage) {
            return NextResponse.json({ message: "Image not found in database" }, { status: 404 });
        }

        await cloudinary.uploader.destroy(existingImage.public_id);
        console.log("Previous image deleted from Cloudinary");

        const uploadResult = (await UploadImage(newImage, "fileupload")) as UploadResult;

        console.log("New image uploaded:", uploadResult);

        const updatedImage = await Image.findByIdAndUpdate(
            params.id,
            {
                image_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
            { new: true }
        );

        return NextResponse.json({ message: "Image updated successfully", image: updatedImage }, { status: 200 });
    } catch (error) {
        console.error("Error updating image:", error);
        return NextResponse.json({ message: "Error updating image" }, { status: 500 });
    }
}

// Corrected DELETE function
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const existingImage = await Image.findById(params.id);

        if (!existingImage) {
            return NextResponse.json({ message: "Image not found in database" }, { status: 404 });
        }

        await cloudinary.uploader.destroy(existingImage.public_id);
        console.log("Image deleted from Cloudinary");

        const deletedImage = await Image.findByIdAndDelete(params.id);
        return NextResponse.json({ message: "Image deleted successfully!", image: deletedImage }, { status: 200 });
        
    } catch (error) {
        console.error("Error deleting image.", error);
        return NextResponse.json({ message: "Error deleting image." }, { status: 500 });
    }
}