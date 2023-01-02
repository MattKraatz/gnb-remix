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

  const users = [];

  users.push(
    await prisma.user.create({
      data: {
        email,
        name: "Matt Kraatz",
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    })
  );

  users.push(
    await prisma.user.create({
      data: {
        email: "fake1@fake.com",
        name: "Jane Doe",
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    })
  );

  users.push(
    await prisma.user.create({
      data: {
        email: "fake2@fake.com",
        name: "John Doe",
        password: {
          create: {
            hash: hashedPassword,
          },
        },
      },
    })
  );

  const game = await prisma.game.create({
    data: {
      title: "Solitaire",
      players: {
        create: users.map((u) => {
          return {
            score: 5,
            userId: u.id,
          };
        }),
      },
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
