import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  const email = "matt.kraatz@gmail.com";

  // cleanup the existing database
  await prisma.user.delete({ where: { email } }).catch(() => {
    // no worries if it doesn't exist yet
  });

  const hashedPassword = await bcrypt.hash("strongpassword", 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: "Matt Kraatz",
      password: {
        create: {
          hash: hashedPassword,
        },
      },
    },
  });

  const game = await prisma.game.create({
    data: {
      title: "Solitaire",
    },
  });

  await prisma.player.create({
    data: {
      score: 5,
      gameId: game.id,
      userId: user.id,
    },
  });

  console.log(`Database has been seeded. 🌱`);
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
