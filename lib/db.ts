import { PrismaClient } from "@/generated/prisma/client";
import { prisma } from "./prisma";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
