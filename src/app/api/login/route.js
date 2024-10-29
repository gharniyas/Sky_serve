import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

const secretKey = process.env.SECRET_KEY;
function generateToken(userDetails) {
  return jwt.sign(userDetails, secretKey);
}

export async function POST(req) {
  try {
    const val = await req.json();
    const client = await clientPromise;
    const db = client.db("Geo-data");

    const userfetch = await db.collection("user").findOne({
      username: val.username,
      email: val.email,
    });

    if (!userfetch) {
      return NextResponse.json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    const isMatch = await bcrypt.compare(val.password, userfetch.password);

    if (!isMatch) {
      return NextResponse.json({
        success: false,
        message: "Email or password is incorrect",
      });
    }

    const token = generateToken({
      username: userfetch.username,
      email: userfetch.email,
    });

    return NextResponse.json({
      success: true,
      datas: userfetch,
      token: token,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
