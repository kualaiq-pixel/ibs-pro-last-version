import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

async function seed() {
  // Create admin user
  const adminPassword = await hashPassword('admin123');
  await db.admin.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
    },
  });

  // Create default contact info
  const defaultContacts = [
    { key: 'address', value: 'Business Street 123, Helsinki, Finland' },
    { key: 'phone', value: '+358 10 123 4567' },
    { key: 'email', value: 'info@ibs-pro.com' },
    { key: 'hours', value: 'Mon-Fri: 8:00-17:00' },
  ];

  for (const contact of defaultContacts) {
    await db.contactInfo.upsert({
      where: { key: contact.key },
      update: { value: contact.value },
      create: contact,
    });
  }

  console.log('Seed completed: Admin user created (username: admin, password: admin123)');
  console.log('Default contact info created');
}

seed()
  .catch(console.error)
  .finally(() => db.$disconnect());
