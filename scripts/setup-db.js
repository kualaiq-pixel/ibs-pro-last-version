async function setup() {
  const { PrismaClient } = require('@prisma/client');
  const bcrypt = require('bcryptjs');

  const prisma = new PrismaClient({ 
    datasources: { db: { url: 'postgresql://postgres.zrddjzisqrpajeqrrezz:May1921Sul%40%40102030@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1' } }
  });
  
  try {
    const adminCount = await prisma.admin.count();
    if (adminCount === 0) {
      const hash = await bcrypt.hash('admin123', 10);
      await prisma.admin.create({ data: { username: 'admin', password: hash } });
      console.log('Created admin user');
    } else {
      console.log('Admin user exists (' + adminCount + ')');
    }
    
    const contactCount = await prisma.contactInfo.count();
    if (contactCount === 0) {
      await prisma.contactInfo.createMany({ data: [
        { key: 'address', value: 'Business Street 123, Helsinki, Finland' },
        { key: 'phone', value: '+358 10 123 4567' },
        { key: 'email', value: 'info@ibs-pro.com' },
        { key: 'hours', value: 'Mon-Fri: 8:00-17:00' },
      ]});
      console.log('Created default contact info');
    } else {
      console.log('Contact info exists (' + contactCount + ')');
    }
    
    console.log('Database ready!');
  } catch(e) {
    console.error('Setup error:', e.message);
  }
  await prisma.$disconnect();
}
setup();
