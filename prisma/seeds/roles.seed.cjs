async function seedRoles(prisma) {
  console.log('Seeding roles...');

  await prisma.role.createMany({
    data: [
      { name: 'ADMIN' },
      { name: 'USER' },
    ],
    skipDuplicates: true,
  });

  console.log('Roles seeded');
}

module.exports = { seedRoles };