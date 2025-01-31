import { connectDB } from "../db/connectDB";
import { Image } from "../models/image.model";

export async function GET () {
    await connectDB();

    const images = await Image.find({});

    return Response.json(images, {status: 200})
}