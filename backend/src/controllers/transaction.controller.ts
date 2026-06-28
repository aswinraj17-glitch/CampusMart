import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

// POST /api/transactions (protected)
export const createTransaction = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id || 1; // fallback to demo user
  console.log('Creating transaction for userId', userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const { items } = req.body; // only items destructured
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Items array required' });
  }

  try {
    // Load product data for each item
    const productData = await Promise.all(
      items.map((it: any) => prisma.product.findUnique({ where: { id: it.productId } }))
    );

    // Build transaction items and compute total amount
    let total = new Prisma.Decimal(0);
    const transactionItems = items.map((it: any, idx: number) => {
      const prod = productData[idx];
      if (!prod) {
        throw new Error(`Product ${it.productId} not found`);
      }
      const price = new Prisma.Decimal(prod.price as any);
      const lineTotal = price.mul(it.quantity);
      total = total.add(lineTotal);

      return {
        productId: prod.id,
        quantity: it.quantity,
        productName: prod.name,
        productPrice: Number(prod.price),
        productImage: prod.imageUrl,
      };
    });

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        totalAmount: total.toNumber(),
        addressLine: req.body.addressLine,
        city: req.body.city,
        state: req.body.state,
        zipCode: req.body.zipCode,
        deliveryDate: new Date(Date.now() + 3*24*60*60*1000), // 3 days from now
        items: { create: transactionItems },
      },
      include: { items: true },
    });

    res.status(201).json(transaction);
  } catch (error: any) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: error.message ?? 'Server error' });
  }
};

// GET /api/transactions/me (protected) – list current user's transactions
export const getUserTransactions = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  console.log('Fetching transactions for userId', userId);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  try {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: { items: true },
    }).then(txs => txs.map(tx => ({
      ...tx,
      totalAmount: typeof tx.totalAmount === 'string' ? parseFloat(tx.totalAmount) : tx.totalAmount,
    })));
    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};
