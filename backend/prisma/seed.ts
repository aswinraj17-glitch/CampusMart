import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Clear any existing tables
  await prisma.meetup.deleteMany({});
  await prisma.exchangeRequest.deleteMany({});
  await prisma.notification.deleteMany({});
  await prisma.message.deleteMany({});
  await prisma.chat.deleteMany({});
  await prisma.wishlist.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.payment.deleteMany({});
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.cart.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.category.deleteMany({});
  await prisma.collegeVerification.deleteMany({});
  await prisma.user.deleteMany({});

  // 1. Create Users
  const buyerPassword = await bcrypt.hash('buyer123', 10);
  const sellerPassword = await bcrypt.hash('seller123', 10);
  const adminPassword = await bcrypt.hash('admin123', 10);
  const unverifiedPassword = await bcrypt.hash('test1234', 10);

  const buyer = await prisma.user.create({
    data: {
      name: 'Ashwin Buyer',
      email: 'buyer@campusmart.com',
      password: buyerPassword,
      role: 'buyer',
      phone: '9876543210',
      department: 'Computer Science',
      semester: 4,
      verificationStatus: 'Verified',
    },
  });

  const seller = await prisma.user.create({
    data: {
      name: 'Rahul Seller',
      email: 'seller@campusmart.com',
      password: sellerPassword,
      role: 'seller',
      phone: '8765432109',
      department: 'Electronics',
      semester: 6,
      verificationStatus: 'Verified',
    },
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@campusmart.com',
      password: adminPassword,
      role: 'admin',
      phone: '7654321098',
      verificationStatus: 'Verified',
    },
  });

  const unverified = await prisma.user.create({
    data: {
      name: 'Karan Newbie',
      email: 'unverified@campusmart.com',
      password: unverifiedPassword,
      role: 'buyer',
      phone: '6543210987',
      department: 'Mechanical',
      semester: 2,
      verificationStatus: 'Pending',
    },
  });

  console.log('✅ Users seeded');

  // 2. Create Verification details
  await prisma.collegeVerification.createMany({
    data: [
      {
        userId: buyer.id,
        collegeName: 'Anna University',
        department: 'Computer Science',
        yearOfStudy: 2,
        collegeEmail: 'ashwin@annauniv.edu',
        idCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        status: 'Verified',
      },
      {
        userId: seller.id,
        collegeName: 'Anna University',
        department: 'Electronics',
        yearOfStudy: 3,
        collegeEmail: 'rahul@annauniv.edu',
        idCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        status: 'Verified',
      },
      {
        userId: unverified.id,
        collegeName: 'IIT Madras',
        department: 'Mechanical',
        yearOfStudy: 1,
        collegeEmail: 'karan@iitm.ac.in',
        idCardUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400',
        status: 'Pending',
      },
    ],
  });

  console.log('✅ Verifications seeded');

  // 3. Create Categories
  const electronics = await prisma.category.create({ data: { name: 'Electronics' } });
  const books = await prisma.category.create({ data: { name: 'Books & Study Materials' } });
  const apparel = await prisma.category.create({ data: { name: 'Apparel & Lab Coats' } });
  const sports = await prisma.category.create({ data: { name: 'Sports & Recreation' } });
  const stationery = await prisma.category.create({ data: { name: 'Stationery' } });

  console.log('✅ Categories seeded');

  // 4. Create Products
  await prisma.product.createMany({
    data: [
      {
        name: 'HP Pavilion Laptop',
        description: 'Intel i5, 8GB RAM, 256GB SSD. Good condition. Perfect for coding assignments.',
        price: 28000.00,
        imageUrl: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=500',
        condition: 'Used',
        collegeName: 'Anna University',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'Sell',
        department: 'Computer Science',
        semester: 4,
        categoryId: electronics.id,
        sellerId: seller.id,
      },
      {
        name: 'Introduction to Algorithms (CLRS)',
        description: '3rd Edition, paperback. Essential core textbook for Computer Science. Donating to needy juniors.',
        price: 0.00,
        imageUrl: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500',
        condition: 'Used',
        collegeName: 'Anna University',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'Donate',
        department: 'Computer Science',
        semester: 4,
        categoryId: books.id,
        sellerId: seller.id,
      },
      {
        name: 'Casio fx-991EX Classwiz Calculator',
        description: 'Scientific calculator. Perfect condition. Looking to exchange for standard ECE lab components.',
        price: 0.00,
        imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=500',
        condition: 'Used',
        collegeName: 'Anna University',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'Exchange',
        department: 'Electronics',
        semester: 6,
        categoryId: electronics.id,
        sellerId: seller.id,
      },
      {
        name: 'Campus Winter Hoodie',
        description: 'Premium blue campus hoodie. Size L. Sell or Swap for tech accessories.',
        price: 1200.00,
        imageUrl: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500',
        condition: 'New',
        collegeName: 'IIT Madras',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'SellOrExchange',
        categoryId: apparel.id,
        sellerId: seller.id,
      },
      {
        name: 'Chemistry Lab Coat',
        description: 'Standard white lab coat, size M. Used for 1 semester. Free donation for biotechnology/chemistry freshmen.',
        price: 0.00,
        imageUrl: 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500',
        condition: 'Used',
        collegeName: 'PSG Tech',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'Donate',
        department: 'Biotechnology',
        semester: 1,
        categoryId: apparel.id,
        sellerId: seller.id,
      },
      {
        name: 'Spiral Bound Ruled Notebooks (Pack of 5)',
        description: 'Unused spirals, perfect for class notes.',
        price: 350.00,
        imageUrl: 'https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=500',
        condition: 'New',
        collegeName: 'Anna University',
        contactDetails: 'Rahul - 8765432109',
        listingType: 'Sell',
        categoryId: stationery.id,
        sellerId: seller.id,
      },
    ],
  });

  console.log('✅ Products seeded');
}

main()
  .catch((e) => {
    console.error('Error seeding data:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
