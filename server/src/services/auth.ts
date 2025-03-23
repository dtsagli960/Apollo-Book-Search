import type { Request } from 'express';
import jwt from 'jsonwebtoken';

import dotenv from 'dotenv';
dotenv.config();

interface JwtPayload {
  _id: unknown;
  username: string;
  email: string,
}

export const authenticateToken = (req: Request): JwtPayload | null => {
  const authHeader = req.headers.authorization;
  console.log("authHeader ",authHeader)
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    const secretKey = process.env.JWT_SECRET_KEY || '';

    try {
      const user = jwt.verify(token, secretKey) as JwtPayload;
      return user; // Return the user object
    } catch (err) {
      throw new Error('Invalid or expired token'); // Throw an error instead of sending a response
    }
  } else {
    throw new Error('Authorization header missing'); // Throw an error if the header is missing
  }
};


export const signToken = (username: string, email: string, _id: unknown) => {
  const payload = { username, email, _id };
  const secretKey = process.env.JWT_SECRET_KEY || '';

  return jwt.sign(payload, secretKey, { expiresIn: '1h' });
};
