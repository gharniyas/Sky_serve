import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
const jwt = require("jsonwebtoken");
const secretKey = process.env.SECRET_KEY;

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const client = await clientPromise;
    if (!client) {
      throw new Error("Failed to connect to MongoDB");
    }

    const db = client.db("Geo-data");

    const body = await request.json();
    const markers = Array.isArray(body.docs) ? body.docs : [];
    console.log("Markers to be inserted:", markers);
    const dataWithUserId = markers.map((item) => ({
      ...item,
      userId,
    }));
    const result = await db.collection("markers").insertMany(dataWithUserId);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("Server Error:", error.message);
    return NextResponse.json({
      success: false,
      message: error.message || "An error occurred",
    });
  }
}
