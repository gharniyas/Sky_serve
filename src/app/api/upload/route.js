import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import jwt from "jsonwebtoken";

const secretKey = process.env.SECRET_KEY;

export async function POST(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const authHeader = request.headers.get("authorization");
    const accessToken = authHeader?.split(" ")[1];

    if (!accessToken) {
      return NextResponse.json(
        {
          status: "forbidden",
          message: "Access token missing",
        },
        { status: 403 }
      );
    }

    let userDetails;
    try {
      userDetails = jwt.verify(accessToken, secretKey);
    } catch (error) {
      console.error("JWT Verification Failed:", error.message);
      return NextResponse.json(
        {
          status: "forbidden",
          message: "Invalid or expired token",
        },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("Geo-data");

    const body = await request.json();
    const jsonData = body.jsonData;

    if (!Array.isArray(jsonData)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid data format: jsonData should be an array",
        },
        { status: 400 }
      );
    }

    const dataWithUserId = jsonData.map((item) => ({
      ...item,
      userId,
    }));

    const result = await db.collection("datas").insertMany(dataWithUserId);

    return NextResponse.json({ success: true, data: result }, { status: 201 });
  } catch (error) {
    console.error("Error processing request:", error);
    return NextResponse.json(
      {
        success: false,
        message: error.message || "An error occurred",
      },
      { status: 500 }
    );
  }
}
