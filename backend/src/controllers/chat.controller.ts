import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getChats = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const chats = await prisma.chat.findMany({
      where: {
        OR: [
          { buyerId: userId },
          { sellerId: userId }
        ]
      },
      include: {
        buyer: { select: { id: true, name: true, email: true } },
        seller: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true, imageUrl: true, price: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).json({ error: 'Failed to fetch chat list' });
  }
};

export const getMessages = async (req: any, res: Response) => {
  const userId = req.user.id;
  const chatId = Number(req.params.chatId);
  try {
    // 1. Fetch messages
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' }
    });

    // 2. Mark messages as read if recipient is current user
    await prisma.message.updateMany({
      where: {
        chatId,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch chat history' });
  }
};

export const sendMessage = async (req: any, res: Response) => {
  const senderId = req.user.id;
  const { recipientId, productId, text } = req.body;

  if (!recipientId || !text) {
    return res.status(400).json({ error: 'Recipient ID and text are required' });
  }

  if (senderId === Number(recipientId)) {
    return res.status(400).json({ error: 'You cannot message yourself' });
  }

  try {
    const pId = productId ? Number(productId) : null;
    
    // 1. Check if chat thread exists or create it
    // Chat unique constraint @@unique([buyerId, sellerId, productId])
    let chat = await prisma.chat.findFirst({
      where: {
        buyerId: senderId,
        sellerId: Number(recipientId),
        productId: pId
      }
    });

    if (!chat) {
      // Try opposite way (if user was already a buyer/seller on this product)
      chat = await prisma.chat.findFirst({
        where: {
          buyerId: Number(recipientId),
          sellerId: senderId,
          productId: pId
        }
      });
    }

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          buyerId: senderId,
          sellerId: Number(recipientId),
          productId: pId
        }
      });
    }

    // 2. Create the message
    const message = await prisma.message.create({
      data: {
        chatId: chat.id,
        senderId,
        text
      }
    });

    // 3. Dispatch notification for recipient
    await prisma.notification.create({
      data: {
        userId: Number(recipientId),
        title: 'New Chat Message',
        message: `You received a message from ${req.user.name}: "${text.substring(0, 40)}${text.length > 40 ? '...' : ''}"`
      }
    });

    res.status(201).json(message);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
};
