import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const secretKey = process.env.SECRET_KEY;
const saltRounds = 10;

function generateToken(userDetails) {
  return jwt.sign(userDetails, secretKey, { expiresIn: "1h" });
}

export async function POST(req) {
  try {
    const val = await req.json();
    const client = await clientPromise;
    const db = client.db("Geo-data");

    const userfetch = await db
      .collection("user")
      .findOne({ username: val.username });

    if (userfetch) {
      return NextResponse.json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(val.password, saltRounds);

    const userDetails = {
      username: val.username,
      email: val.email,
      password: hashedPassword,
    };

    console.log(userDetails);
    const items = await db.collection("user").insertOne(userDetails);

    const token = generateToken({ username: val.username });

    return NextResponse.json({
      success: true,
      datas: items,
      token: token,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: error.message,
    });
  }
}
