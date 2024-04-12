import { sign, verify, JwtPayload } from "jsonwebtoken";

function generateToken(payload: JwtPayload): string {
  return sign(payload, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRY,
  });
}

function generateRefreshToken(payload: JwtPayload): string {
  return sign(payload, process.env.REFRESH_SECRET!, {
    expiresIn: process.env.REFRESH_EXPIRY,
  });
}

function verifyToken(token: string): string | JwtPayload {
  return verify(token, process.env.JWT_SECRET!);
}

function decodeToken(token: string): string | JwtPayload {
  return verify(token, process.env.JWT_SECRET!, { ignoreExpiration: true });
}

export { generateToken, generateRefreshToken, verifyToken, decodeToken };
