import cloudinary from "@/app/lib/cloudinary";
import { connectDB } from "../../db/connectDB";
import { Image } from "../../models/image.model";
import { UploadImage } from "@/app/lib/upload-image";

interface UploadResult {
  secure_url: string;
  public_id: string;
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const image = await Image.findById(params.id);
        
        if (!image) {
            return Response.json({ message: "Image not found" }, { status: 404 });
        }

        return Response.json(image, { status: 200 });
    } catch (error) {
        console.error("Error fetching image:", error);
        return Response.json({ message: "Error retrieving image" }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
    await connectDB();

    try {
        const formData = await request.formData();
        const newImage = formData.get("image");

        if (!(newImage instanceof File)) {
            return Response.json({ message: "No valid image provided" }, { status: 400 });
        }

        // Find the existing image in DB
        const existingImage = await Image.findById(params.id);

        if (!existingImage) {
            return Response.json({ message: "Image not found in database" }, { status: 404 });
        }

        // Delete previous image from Cloudinary
        await cloudinary.uploader.destroy(existingImage.public_id);
        console.log("Previous image deleted from Cloudinary");

        // Upload the new image to Cloudinary
        const uploadResult = (await UploadImage(newImage, "fileupload")) as UploadResult;

        console.log("New image uploaded:", uploadResult);

        // Update the image in MongoDB
        const updatedImage = await Image.findByIdAndUpdate(
            params.id,
            {
                image_url: uploadResult.secure_url,
                public_id: uploadResult.public_id
            },
            { new: true }
        );

        return Response.json({ message: "Image updated successfully", image: updatedImage }, { status: 200 });
    } catch (error) {
        console.error("Error updating image:", error);
        return Response.json({ message: "Error updating image" }, { status: 500 });
    }
}

export async function DELETE(request: Request, {params}: {params: {id: string}}) {
    await connectDB();

    try {
         // Find the existing image in DB
         const existingImage = await Image.findById(params.id);

         if (!existingImage) {
             return Response.json({ message: "Image not found in database" }, { status: 404 });
         }
 
         // Delete previous image from Cloudinary
         await cloudinary.uploader.destroy(existingImage.public_id);
         console.log("Image deleted from Cloudinary");

        //delete from MongoDB
        const deletedImage = await Image.findByIdAndDelete(
            params.id,
        );
        return Response.json({message: "Image deleted succesfully!", image: deletedImage})
        
    } catch (error) {
        console.error("Error deleting image.", error);
        return Response.json({message: "Error deleting image."})
    }
}