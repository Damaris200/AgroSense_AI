import bcrypt from 'bcrypt';
import { Role } from '@prisma/client';

import { prisma } from '../config/prisma';

const adminEmail = 'admin@agrosense.ai';
const adminPassword = 'Admin123!';

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'AgroSense Admin',
      passwordHash,
      role: Role.admin,
      locale: 'en',
      isActive: true,
    },
    create: {
      name: 'AgroSense Admin',
      email: adminEmail,
      passwordHash,
      role: Role.admin,
      locale: 'en',
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
    },
  });

  console.log('Admin user is ready:');
  console.log(`email: ${admin.email}`);
  console.log(`password: ${adminPassword}`);
  console.log(`role: ${admin.role}`);
}

seedAdmin()
  .catch((error) => {
    console.error('Failed to seed admin user');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
