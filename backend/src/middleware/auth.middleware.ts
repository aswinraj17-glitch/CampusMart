import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_campus_mart_928';

export const verifyToken = (req: any, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};

export const verifySeller = (req: any, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    next();
  });
};

export const verifyAdmin = (req: any, res: Response, next: NextFunction) => {
  verifyToken(req, res, () => {
    if (req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin privileges required.' });
    }
  });
};

// Check if user verificationStatus is "Verified"
export const verifyStudentStatus = (req: any, res: Response, next: NextFunction) => {
  verifyToken(req, res, async () => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { verificationStatus: true, role: true }
      });
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      if (user.role === 'admin' || user.verificationStatus === 'Verified') {
        next();
      } else {
        res.status(403).json({ error: 'Access denied. Only verified college students can perform this action.' });
      }
    } catch (err) {
      console.error('Student status verification error:', err);
      res.status(500).json({ error: 'Internal verification check failed' });
    }
  });
};
