import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getWishlist = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const list = await prisma.wishlist.findMany({
      where: { userId },
      include: {
        product: {
          include: {
            category: true,
            seller: { select: { id: true, name: true, email: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    // Format product Decimal values
    const formatted = list.map(item => ({
      ...item,
      product: {
        ...item.product,
        price: Number(item.product.price)
      }
    }));
    
    res.json(formatted);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ error: 'Failed to fetch wishlist' });
  }
};

export const toggleWishlist = async (req: any, res: Response) => {
  const userId = req.user.id;
  const productId = Number(req.params.productId);
  try {
    const existing = await prisma.wishlist.findUnique({
      where: {
        userId_productId: { userId, productId }
      }
    });

    if (existing) {
      await prisma.wishlist.delete({
        where: { id: existing.id }
      });
      res.json({ message: 'Removed from wishlist', wishlisted: false });
    } else {
      await prisma.wishlist.create({
        data: { userId, productId }
      });
      res.json({ message: 'Added to wishlist', wishlisted: true });
    }
  } catch (error) {
    console.error('Error toggling wishlist:', error);
    res.status(500).json({ error: 'Failed to update wishlist' });
  }
};
