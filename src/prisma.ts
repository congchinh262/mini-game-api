export * from './.prismaClient';
import { PrismaClient, Prisma } from './.prismaClient';

export const prismaClient = new PrismaClient({
  log: ["error", "warn"],
  errorFormat: "pretty"
});
export const prismaClientRo = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_RO_URL || process.env.DATABASE_URL
    }
  }
});
export const prisma = prismaClient;
export const prismaRo = prismaClientRo;

// check if can connect DB
prismaClient
  .$connect()
  .then(() => {
    console.log("Connect successful!")
  })
  .catch((e) => {
    console.error(`DB connection error!`, e);
    process.exit(1);
  });

// middleware to force close the proccess if connection to DB broken.
prismaClient.$use(async (params, next) => {
  return next(params)
    .catch((e) => {
      if (e instanceof Prisma.PrismaClientInitializationError || e instanceof Prisma.PrismaClientRustPanicError) {
        process.exit(1);
      }
      console.log(e);
      throw e;
    })
    .then((res) => res);
});
