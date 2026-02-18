async function seedAdminUser(prisma) {
  console.log('Seeding admin user...');

  
  const adminRole = await prisma.role.findUnique({ where: { name: 'ADMIN' } });

  await prisma.user.upsert({
    where: { email: 'admin@admin.com' },
    update: {},
    create: {
      email: 'admin@admin.com',
      password: 'admin_password', 
      level: 1,
      roles: {
        connect: [{ id: adminRole.id }]
      }
    },
  });

  console.log('Admin user seeded');
}

module.exports = { seedAdminUser };