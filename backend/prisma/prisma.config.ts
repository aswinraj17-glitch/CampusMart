import { Config } from '@prisma/client/runtime';

export default {
  datasource: {
    db: {
      provider: 'mysql',
      url: process.env.DATABASE_URL,
    },
  },
} satisfies Config;
