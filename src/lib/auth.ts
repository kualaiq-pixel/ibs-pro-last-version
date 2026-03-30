import bcrypt from 'bcryptjs';

// We'll use simple token-based auth stored in localStorage
// The API routes will verify tokens

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Generate Finnish bank reference number
export function generateFinnishReferenceNumber(baseNumber?: string): string {
  let num = baseNumber ? BigInt(baseNumber) : BigInt(Date.now().toString().slice(-10));
  const numStr = num.toString();
  const weights = [7, 3, 1];
  let sum = 0;
  for (let i = 0; i < numStr.length; i++) {
    sum += parseInt(numStr[i]) * weights[i % 3];
  }
  const checkDigit = (10 - (sum % 10)) % 10;
  return numStr + checkDigit.toString();
}
