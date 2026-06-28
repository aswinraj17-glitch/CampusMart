import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_campus_mart_928';

export const register = async (req: Request, res: Response) => {
  const {
    name,
    email,
    password,
    role,
    phone,
    collegeName,
    department,
    yearOfStudy,
    collegeEmail,
    idCardUrl,
    semester
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Validate role
  const userRole = role === 'seller' || role === 'admin' ? role : 'buyer';

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Determine status (Admins are automatically verified, others start as Pending)
    const verificationStatus = userRole === 'admin' ? 'Verified' : 'Pending';

    // Calculate semester if not provided (e.g. Year of study * 2 - 1)
    const calcSemester = semester ? Number(semester) : (Number(yearOfStudy) ? Number(yearOfStudy) * 2 - 1 : 1);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        phone: phone || null,
        department: department || null,
        semester: calcSemester,
        verificationStatus,
      },
    });

    // Create Verification Record if they provided college details
    if (collegeName && yearOfStudy) {
      await prisma.collegeVerification.create({
        data: {
          userId: user.id,
          collegeName,
          department: department || '',
          yearOfStudy: Number(yearOfStudy),
          collegeEmail: collegeEmail || null,
          idCardUrl: idCardUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
          status: verificationStatus,
        }
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        semester: user.semester,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { verification: true }
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        department: user.department,
        semester: user.semester,
        verificationStatus: user.verificationStatus,
        verification: user.verification,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const getMe = async (req: any, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { verification: true }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error fetching user profile' });
  }
};

export const updateProfile = async (req: any, res: Response) => {
  const { name, email, phone, password, department, semester } = req.body;
  const userId = req.user.id;

  try {
    const updateData: any = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (department) updateData.department = department;
    if (semester !== undefined) updateData.semester = Number(semester);
    
    if (email) {
      // Check if email already taken
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Email already taken by another account' });
      }
      updateData.email = email;
    }

    if (password && password.trim() !== '') {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: { verification: true }
    });

    res.json(updatedUser);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error updating user profile' });
  }
};
