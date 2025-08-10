import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

async function createAdmin() {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username) {
    console.log("Please set admin username is env file");
    return;
  }
  if (!password) {
    console.log("Please set admin password is env file");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  });

  console.log("Admin created:", admin);
}

createAdmin();
