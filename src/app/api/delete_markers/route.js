import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function DELETE(req) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({
        success: false,
        message: "Marker ID is required",
      });
    }

    const client = await clientPromise;
    const db = client.db("Geo-data");

    const result = await db
      .collection("markers")
      .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Marker not found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Marker deleted successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
