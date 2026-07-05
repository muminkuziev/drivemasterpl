import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const warsaw = await prisma.city.upsert({
    where: { name: 'Warszawa' },
    update: {},
    create: {
      name: 'Warszawa',
      difficultyScore: 2,
      notes: 'Navbat uzun, lekin imtihon adolatli o\'tkaziladi.',
    },
  });

  await prisma.psychCenter.create({
    data: {
      name: 'Przykładowe Centrum Psychologiczne',
      cityId: warsaw.id,
      rating: 4,
      notes: 'Tez navbat, yumshoq munosabat.',
    },
  });

  await prisma.instructor.create({
    data: {
      name: 'Namuna Instruktor',
      cityId: warsaw.id,
      isWarning: false,
      notes: 'O\'quvchilar tavsiya qiladi.',
    },
  });

  await prisma.theoryQuestion.create({
    data: {
      textPl: 'Czy kierowca musi ustąpić pierwszeństwa pieszemu na przejściu?',
      textUz: 'Haydovchi piyoda o\'tish joyida piyodaga yo\'l berishi shartmi?',
      category: 'Yo\'l belgilari',
      isPremium: false,
      options: {
        create: [
          { textPl: 'Tak', textUz: 'Ha', isCorrect: true },
          { textPl: 'Nie', textUz: "Yo'q", isCorrect: false },
        ],
      },
    },
  });

  await prisma.psychQuestion.create({
    data: {
      textPl: 'Jak reagujesz w sytuacjach stresowych?',
      textUz: 'Stressli vaziyatlarda o\'zingizni qanday tutasiz?',
      order: 1,
      options: {
        create: [
          { textPl: 'Spokojnie', textUz: 'Xotirjam', isCorrect: true },
          { textPl: 'Nerwowo', textUz: 'Asabiylashib', isCorrect: false },
        ],
      },
    },
  });

  console.log('Seed muvaffaqiyatli yakunlandi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
