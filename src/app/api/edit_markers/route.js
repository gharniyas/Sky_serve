import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PUT(req) {
  try {
    const { id, updatedData } = await req.json();

    if (!id || !updatedData) {
      return NextResponse.json({
        success: false,
        message: "Marker ID and updated data are required",
      });
    }

    const client = await clientPromise;
    const db = client.db("Geo-data");

    const result = await db
      .collection("markers")
      .updateOne({ _id: new ObjectId(id) }, { $set: updatedData });

    if (result.matchedCount === 0) {
      return NextResponse.json({
        success: false,
        message: "Marker not found",
      });
    }

    return NextResponse.json({
      success: true,
      message: "Marker updated successfully",
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
