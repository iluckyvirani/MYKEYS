// prisma.config.ts
import 'dotenv/config'; // <--- ADD THIS LINE
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    // env() will now be able to resolve DATABASE_URL from your .env file
    url: env('DATABASE_URL'), 
  },
});
