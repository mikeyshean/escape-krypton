import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const taunt1 = await prisma.taunt.upsert({
    where: {
      id: 'clcjkdooh000008mde8pb8mbx'
    },
    update: {},
    create: {
      text: 'HaHa!',
    }
  })
  const taunt2 = await prisma.taunt.upsert({
    where: {
      id: 'clcjkex29000108md0ir68c5b'
    },
    update: {},
    create: {
      text: 'Sorry!',
    }
  })
  const taunt3 = await prisma.taunt.upsert({
    where: {
      id: 'clcjkf0e8000208mdh49d05h0'
    },
    update: {},
    create: {
      text: 'Gotcha!',
    }
  })
  console.log({ taunt1, taunt2, taunt3})
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })