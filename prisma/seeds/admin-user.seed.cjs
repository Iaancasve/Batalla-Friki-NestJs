const bcrypt = require('bcrypt');
async function seedAdminUser(prisma) {
  console.log('Seeding admin user...');

  
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
        password: hashedPassword, 
    },
    create: {
      email: 'admin@admin.com',
      password: hashedPassword,
      level: 1,
      roles: {
        create: [
          { roleId: adminRole.id }
        ]
      }
    },
  });

  console.log('Admin user seeded');
}

module.exports = { seedAdminUser };