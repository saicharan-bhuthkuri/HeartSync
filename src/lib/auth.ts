import { SignJWT, jwtVerify } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_for_development_must_change';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export interface UserSession {
  userId: string;
  email: string;
}

// Sign JWT for user sessions
export async function signJWT(payload: UserSession): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d') // 30 days session
    .sign(secretKey);
}

// Verify JWT and return payload
export async function verifyJWT(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey, {
      algorithms: ['HS256'],
    });
    return {
      userId: payload.userId as string,
      email: payload.email as string,
    };
  } catch (error) {
    console.error('JWT Verification failed:', error);
    return null;
  }
}

// Hash password using bcryptjs
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Compare plain text password with hashed password
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
