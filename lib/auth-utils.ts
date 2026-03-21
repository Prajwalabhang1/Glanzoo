import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production';

// Password hashing
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

// JWT utilities
export function signToken(payload: string | object | Buffer, expiresIn: string = '7d'): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): string | jwt.JwtPayload | null {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch {
        return null;
    }
}

// Role checking
export function isAdmin(role: string): boolean {
    return role === 'ADMIN';
}

export function isCustomer(role: string): boolean {
    return role === 'CUSTOMER';
}

export function isVendor(role: string): boolean {
    return role === 'VENDOR';
}
