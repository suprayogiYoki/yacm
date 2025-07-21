import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

export async function getPayload(req: NextRequest){
  const token = req.cookies.get('token')?.value
  const { payload } = token ? await jwtVerify(token, new TextEncoder().encode(process.env.JWT_SECRET)) : { payload: null };
  return payload
}