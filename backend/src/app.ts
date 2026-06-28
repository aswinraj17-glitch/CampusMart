import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRouter from './routes/auth.routes';
import productRouter from './routes/product.routes';
import categoryRouter from './routes/category.routes';
import cartRouter from './routes/cart.routes';
import orderRouter from './routes/order.routes';
import adminRouter from './routes/admin.routes';
import chatRouter from './routes/chat.routes';
import exchangeRouter from './routes/exchange.routes';
import wishlistRouter from './routes/wishlist.routes';
import notificationRouter from './routes/notification.routes';

dotenv.config();

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Health Check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Core API endpoints
app.use('/api/auth', authRouter);
app.use('/api/products', productRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRouter);
app.use('/api/transactions', orderRouter); 
app.use('/api/admin', adminRouter);
app.use('/api/chats', chatRouter);
app.use('/api/exchange', exchangeRouter);
app.use('/api/wishlist', wishlistRouter);
app.use('/api/notifications', notificationRouter);

export default app;
