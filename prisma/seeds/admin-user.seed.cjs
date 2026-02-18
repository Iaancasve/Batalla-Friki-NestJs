const bcrypt = require('bcrypt');
async function seedAdminUser(prisma) {
  console.log('Seeding users...');

  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });
  const userRole = await prisma.role.findUnique({ where: { name: 'USER' } });
  
  const adminPassword = await bcrypt.hash('admin123', 10);
  const playerPassword = await bcrypt.hash('user123', 10);
  
  
  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {
        password: adminPassword, 
    },
    create: {
      email: 'admin@admin.com',
      password: adminPassword,
      level: 1,
      roles: {
        create: [
          { roleId: adminRole.id }
        ]
      }
    },
  });

  
  await prisma.user.upsert({
    where: { email: 'player@user.com' },
    update: {
        password: playerPassword,
    },
    create: {
      email: 'player@user.com',
      password: playerPassword,
      level: 1,
      roles: {
        create: [
          { roleId: userRole.id }
        ]
      }
    },
  });

  console.log('Admin and Player users seeded');
}

module.exports = { seedAdminUser };