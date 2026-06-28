import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to get or create cart
const getOrCreateCart = async (userId: number) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: {
      items: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          }
        }
      }
    });
  }
  return cart;
};

export const getCart = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const cart = await getOrCreateCart(userId);
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

export const addToCart = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { productId, quantity } = req.body;

  if (!productId) {
    return res.status(400).json({ error: 'Product ID is required' });
  }

  const qty = Number(quantity) || 1;

  try {
    const cart = await getOrCreateCart(userId);
    
    // Check if product exists
    const product = await prisma.product.findUnique({ where: { id: Number(productId) } });
    if (!product) {
      return res.status(444).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = cart.items.find(item => item.productId === Number(productId));

    if (existingItem) {
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + qty }
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId: Number(productId),
          quantity: qty
        }
      });
    }

    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ error: 'Failed to add item to cart' });
  }
};

export const updateCartItem = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity === undefined || Number(quantity) < 0) {
    return res.status(400).json({ error: 'Valid quantity is required' });
  }

  try {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find(it => it.productId === Number(productId));

    if (!item) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    if (Number(quantity) === 0) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    } else {
      await prisma.cartItem.update({
        where: { id: item.id },
        data: { quantity: Number(quantity) }
      });
    }

    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Failed to update cart item' });
  }
};

export const removeCartItem = async (req: any, res: Response) => {
  const userId = req.user.id;
  const { productId } = req.params;

  try {
    const cart = await getOrCreateCart(userId);
    const item = cart.items.find(it => it.productId === Number(productId));

    if (item) {
      await prisma.cartItem.delete({ where: { id: item.id } });
    }

    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error deleting cart item:', error);
    res.status(500).json({ error: 'Failed to delete cart item' });
  }
};

export const clearCart = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const cart = await getOrCreateCart(userId);
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    
    const updatedCart = await getOrCreateCart(userId);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ error: 'Failed to clear cart' });
  }
};
