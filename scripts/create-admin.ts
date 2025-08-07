import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

async function createAdmin() {
  const username = 'admin@rcew10';
  const password = 'admin@rcew10';
  
  const hashedPassword = await bcrypt.hash(password, 12);
  
  const admin = await prisma.admin.create({
    data: {
      username,
      password: hashedPassword,
    },
  });
  
  console.log('Admin created:', admin);
}

createAdmin();
