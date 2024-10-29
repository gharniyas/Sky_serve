import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await req.json(); // Currently, this line does nothing, you can remove it

    const client = await clientPromise;
    const db = client.db("Geo-data");

    // Fetch data from "datas" collection
    const items = await db
      .collection("markers")
      .find({ userId: userId })
      .toArray();

    // Adjust the response structure
    return NextResponse.json({ success: true, datas: items });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
