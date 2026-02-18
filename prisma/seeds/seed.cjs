const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');
const { seedCharacters } = require('./characters.seed.cjs');
const { seedRoles } = require('./roles.seed.cjs');
const { seedAdminUser } = require('./admin-user.seed.cjs');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seeding process...');

  await seedCharacters(prisma);
  await seedRoles(prisma);
  await seedAdminUser(prisma);

  console.log('Finished seeding');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });