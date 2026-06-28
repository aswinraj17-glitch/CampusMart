import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getDashboardStats = async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalProducts, totalOrders, orders] = await Promise.all([
      prisma.user.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.findMany({
        select: { totalAmount: true }
      })
    ]);

    const totalRevenue = orders.reduce((acc, ord) => acc + Number(ord.totalAmount), 0);

    res.json({
      totalUsers,
      totalProducts,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch admin stats' });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        verificationStatus: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch user list' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({ where: { id: Number(id) } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ error: 'Cannot delete an admin user' });
    }

    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};

export const getAllOrders = async (_req: Request, res: Response) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
        payments: true,
        meetup: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(ord => ({
      ...ord,
      totalAmount: Number(ord.totalAmount),
      items: ord.items.map(it => ({
        ...it,
        productPrice: Number(it.productPrice)
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error('Error fetching admin orders:', error);
    res.status(500).json({ error: 'Failed to fetch order list' });
  }
};

// Get all pending college verification requests
export const getPendingVerifications = async (_req: Request, res: Response) => {
  try {
    const verifications = await prisma.collegeVerification.findMany({
      where: { status: 'Pending' },
      include: {
        user: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(verifications);
  } catch (error) {
    console.error('Error fetching verifications:', error);
    res.status(500).json({ error: 'Failed to fetch pending verifications' });
  }
};

// Approve or reject a student college verification request
export const respondToVerification = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { status, rejectReason } = req.body; // "Verified" or "Rejected"

  if (status !== 'Verified' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Status must be Verified or Rejected' });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update verification record
      const verification = await tx.collegeVerification.update({
        where: { userId: Number(userId) },
        data: {
          status,
          rejectReason: status === 'Rejected' ? rejectReason : null
        }
      });

      // 2. Update user verificationStatus
      await tx.user.update({
        where: { id: Number(userId) },
        data: { verificationStatus: status }
      });

      return verification;
    });

    // 3. Dispatch alert notification to the student
    const msg = status === 'Verified'
      ? 'Congratulations! Your student ID verification is approved. You can now list, buy, swap, or donate essentials on CampusMart.'
      : `Your student verification was rejected. Reason: ${rejectReason || 'Invalid ID card image'}`;

    await prisma.notification.create({
      data: {
        userId: Number(userId),
        title: `Verification ${status}`,
        message: msg
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error updating verification:', error);
    res.status(500).json({ error: 'Failed to update student verification status' });
  }
};
