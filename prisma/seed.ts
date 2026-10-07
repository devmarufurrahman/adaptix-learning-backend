import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with Roles, Permissions, and Users...');

  // 1. Setup Roles & Permissions Data
  const rolesData = [
    {
      name: 'SUPER_ADMIN',
      description: 'Highest tier, can do everything.',
      permissions: [
        { action: 'MANAGE', module: 'ALL' }
      ]
    },
    {
      name: 'INSTRUCTOR',
      description: 'Can manage their own courses and media.',
      permissions: [
        { action: 'CREATE', module: 'COURSE' },
        { action: 'READ', module: 'COURSE' },
        { action: 'UPDATE', module: 'COURSE' },
        { action: 'CREATE', module: 'MEDIA' },
        { action: 'READ', module: 'MEDIA' },
        { action: 'UPDATE', module: 'MEDIA' }
      ]
    },
    {
      name: 'STUDENT',
      description: 'Can read courses.',
      permissions: [
        { action: 'READ', module: 'COURSE' }
      ]
    }
  ];

  const createdRoles: Record<string, string> = {};

  // Upsert Roles & Permissions
  for (const role of rolesData) {
    const upsertedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: {
        name: role.name,
        description: role.description,
      },
    });

    createdRoles[role.name] = upsertedRole.id;

    for (const perm of role.permissions) {
      await prisma.permission.upsert({
        where: {
          module_action_roleId: {
            module: perm.module,
            action: perm.action,
            roleId: upsertedRole.id,
          }
        },
        update: {}, // Do nothing if it already exists
        create: {
          module: perm.module,
          action: perm.action,
          roleId: upsertedRole.id,
        }
      });
    }
  }

  // 2. Setup Default Users
  const defaultPassword = await bcrypt.hash('password123', 10);

  const usersData = [
    {
      email: 'superadmin@lms.com',
      name: 'Super Admin',
      password: defaultPassword,
      roleId: createdRoles['SUPER_ADMIN']
    },
    {
      email: 'instructor@lms.com',
      name: 'Instructor',
      password: defaultPassword,
      roleId: createdRoles['INSTRUCTOR']
    },
    {
      email: 'student@lms.com',
      name: 'Student',
      password: defaultPassword,
      roleId: createdRoles['STUDENT']
    }
  ];

  for (const user of usersData) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: { 
        name: user.name,
        roleId: user.roleId,
        password: user.password
      },
      create: {
        email: user.email,
        name: user.name,
        password: user.password,
        roleId: user.roleId,
        isProfileComplete: true, // Mark them as active
      }
    });
  }

  console.log('Seeding completed successfully! Default users are ready.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
