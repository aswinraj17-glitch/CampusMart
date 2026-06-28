import { Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const getExchangeRequests = async (req: any, res: Response) => {
  const userId = req.user.id;
  try {
    const incoming = await prisma.exchangeRequest.findMany({
      where: { receiverId: userId },
      include: {
        sender: { select: { id: true, name: true, email: true, phone: true } },
        proposedProduct: { select: { id: true, name: true, imageUrl: true, price: true, condition: true } },
        requestedProduct: { select: { id: true, name: true, imageUrl: true, price: true, condition: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const outgoing = await prisma.exchangeRequest.findMany({
      where: { senderId: userId },
      include: {
        receiver: { select: { id: true, name: true, email: true, phone: true } },
        proposedProduct: { select: { id: true, name: true, imageUrl: true, price: true, condition: true } },
        requestedProduct: { select: { id: true, name: true, imageUrl: true, price: true, condition: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Format prices
    const formatReqs = (list: any[]) => list.map(req => ({
      ...req,
      proposedProduct: { ...req.proposedProduct, price: Number(req.proposedProduct.price) },
      requestedProduct: { ...req.requestedProduct, price: Number(req.requestedProduct.price) }
    }));

    res.json({
      incoming: formatReqs(incoming),
      outgoing: formatReqs(outgoing)
    });
  } catch (error) {
    console.error('Error fetching exchange requests:', error);
    res.status(500).json({ error: 'Failed to fetch swap requests' });
  }
};

export const proposeExchange = async (req: any, res: Response) => {
  const senderId = req.user.id;
  const { receiverId, proposedProductId, requestedProductId } = req.body;

  if (!receiverId || !proposedProductId || !requestedProductId) {
    return res.status(400).json({ error: 'Receiver ID, proposed product ID, and requested product ID are required' });
  }

  try {
    // Check if swap proposal already exists
    const existing = await prisma.exchangeRequest.findFirst({
      where: {
        senderId,
        proposedProductId: Number(proposedProductId),
        requestedProductId: Number(requestedProductId)
      }
    });

    if (existing) {
      return res.status(400).json({ error: 'Exchange proposal already sent for these items' });
    }

    const swap = await prisma.exchangeRequest.create({
      data: {
        senderId,
        receiverId: Number(receiverId),
        proposedProductId: Number(proposedProductId),
        requestedProductId: Number(requestedProductId)
      },
      include: {
        proposedProduct: true,
        requestedProduct: true
      }
    });

    // Dispatch notification
    await prisma.notification.create({
      data: {
        userId: Number(receiverId),
        title: 'New Exchange Proposal',
        message: `${req.user.name} proposed exchanging their "${swap.proposedProduct.name}" for your "${swap.requestedProduct.name}".`
      }
    });

    res.status(201).json(swap);
  } catch (error) {
    console.error('Error proposing exchange:', error);
    res.status(500).json({ error: 'Failed to send exchange proposal' });
  }
};

export const respondToExchange = async (req: any, res: Response) => {
  const userId = req.user.id;
  const requestId = Number(req.params.requestId);
  const { status } = req.body; // "Accepted" or "Rejected"

  if (status !== 'Accepted' && status !== 'Rejected') {
    return res.status(400).json({ error: 'Status must be Accepted or Rejected' });
  }

  try {
    const swap = await prisma.exchangeRequest.findUnique({
      where: { id: requestId },
      include: {
        proposedProduct: true,
        requestedProduct: true
      }
    });

    if (!swap) {
      return res.status(404).json({ error: 'Exchange request not found' });
    }

    if (swap.receiverId !== userId) {
      return res.status(403).json({ error: 'Unauthorized to respond to this request' });
    }

    if (swap.status !== 'Pending') {
      return res.status(400).json({ error: 'Request already processed' });
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Update swap status
      const updatedSwap = await tx.exchangeRequest.update({
        where: { id: requestId },
        data: { status }
      });

      if (status === 'Accepted') {
        // 2. Mark both products as unavailable
        await tx.product.update({
          where: { id: swap.proposedProductId },
          data: { isAvailable: false }
        });

        await tx.product.update({
          where: { id: swap.requestedProductId },
          data: { isAvailable: false }
        });

        // 3. Reject other swap proposals containing either of these products
        await tx.exchangeRequest.updateMany({
          where: {
            id: { not: requestId },
            status: 'Pending',
            OR: [
              { proposedProductId: swap.proposedProductId },
              { proposedProductId: swap.requestedProductId },
              { requestedProductId: swap.proposedProductId },
              { requestedProductId: swap.requestedProductId }
            ]
          },
          data: { status: 'Rejected' }
        });
      }

      return updatedSwap;
    });

    // Send notification to sender
    await prisma.notification.create({
      data: {
        userId: swap.senderId,
        title: `Exchange Proposal ${status}`,
        message: `${req.user.name} has ${status.toLowerCase()} your swap request for "${swap.requestedProduct.name}".`
      }
    });

    res.json(result);
  } catch (error) {
    console.error('Error processing exchange response:', error);
    res.status(500).json({ error: 'Failed to process exchange response' });
  }
};
