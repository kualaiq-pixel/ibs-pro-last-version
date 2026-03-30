import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await hashPassword('admin123');
  const admin = await prisma.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });
  console.log(`✅ Admin user created: ${admin.username} (password: admin123)`);

  // Create default contact info
  const contacts = [
    { key: 'address', value: 'Business Street 123, Helsinki, Finland' },
    { key: 'phone', value: '+358 10 123 4567' },
    { key: 'email', value: 'info@ibs-pro.com' },
    { key: 'hours', value: 'Mon-Fri: 8:00-17:00' },
  ];

  for (const contact of contacts) {
    await prisma.contactInfo.upsert({
      where: { key: contact.key },
      update: { value: contact.value },
      create: contact,
    });
  }
  console.log('✅ Default contact info created');

  // Create default categories for first company (will be used when companies are created)
  console.log('✅ Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
