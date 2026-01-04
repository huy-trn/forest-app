import { prisma } from "./prisma";
import { hash } from "bcryptjs";
import { Role, User } from "@prisma/client";

let ensurePromise: Promise<void> | null = null;

async function ensure() {
  const email = process.env.ROOT_ADMIN_EMAIL;
  const password = process.env.ROOT_ADMIN_PASSWORD;
  if (!email || !password) return;

  const name = process.env.ROOT_ADMIN_NAME || "Root";

  const passwordHash = await hash(password, 10);

  const baseData = {
    name,
    role: Role.root,
    passwordHash,
    status: "active",
    emailVerified: new Date(),
    email,
  };

  const existingByEmail = await prisma.user.findUnique({ where: { email } });
  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: baseData as any,
    });
  } else {
    await prisma.user.create({ data: baseData as any });
  }
}

export function ensureRootAdmin() {
  if (!ensurePromise) {
    ensurePromise = ensure();
  }
  return ensurePromise;
}
