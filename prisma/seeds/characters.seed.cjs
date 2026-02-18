async function seedCharacters(prisma) {
  console.log('Seeding characters...');

  await prisma.character.createMany({
    data: [
      { name: 'Gandalf', hp: 100, baseHp: 100, attack: 20, levelRequired: 1 },
      { name: 'Sauron', hp: 150, baseHp: 150, attack: 25, levelRequired: 5 },
      { name: 'Legolas', hp: 80, baseHp: 80, attack: 15, levelRequired: 1 },
    ],
    skipDuplicates: true,
  });

  console.log('Characters seeded');
}

module.exports = { seedCharacters };