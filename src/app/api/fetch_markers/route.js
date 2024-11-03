import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const { userId } = await req.json();

    const client = await clientPromise;
    const db = client.db("Geo-data");
    const items = await db
      .collection("markers")
      .find({ userId: userId })
      .toArray();

    return NextResponse.json({ success: true, datas: items });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
