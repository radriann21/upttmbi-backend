import { PrismaClient } from '../src/generated/client';
import { Role } from '../src/generated/enums';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  console.log('📝 Creando pre-registros de estudiantes...');
  const preRegistrations = await Promise.all([
    prisma.preRegisteredStudent.upsert({
      where: { cedula: '12345678' },
      update: {},
      create: {
        cedula: '12345678',
        fullName: 'Juan Pérez García',
        isUsed: false,
      },
    }),
    prisma.preRegisteredStudent.upsert({
      where: { cedula: '23456789' },
      update: {},
      create: {
        cedula: '23456789',
        fullName: 'María González López',
        isUsed: false,
      },
    }),
    prisma.preRegisteredStudent.upsert({
      where: { cedula: '34567890' },
      update: {},
      create: {
        cedula: '34567890',
        fullName: 'Carlos Rodríguez Martínez',
        isUsed: false,
      },
    }),
    prisma.preRegisteredStudent.upsert({
      where: { cedula: '45678901' },
      update: {},
      create: {
        cedula: '45678901',
        fullName: 'Ana Fernández Sánchez',
        isUsed: false,
      },
    }),
    prisma.preRegisteredStudent.upsert({
      where: { cedula: '56789012' },
      update: {},
      create: {
        cedula: '56789012',
        fullName: 'Luis Martínez Díaz',
        isUsed: false,
      },
    }),
  ]);

  console.log(`✅ ${preRegistrations.length} pre-registros creados`);

  console.log('👥 Creando usuarios por defecto...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@upttmbi.edu.ve' },
    update: {},
    create: {
      email: 'admin@upttmbi.edu.ve',
      name: 'Administrador',
      lastName: 'Sistema',
      password: '$2a$10$YourHashedPasswordHere',
      role: Role.ADMIN,
    },
  });
  console.log(`✅ Usuario ADMIN creado: ${adminUser.email}`);

  const teacherUser = await prisma.user.upsert({
    where: { email: 'profesor@upttmbi.edu.ve' },
    update: {},
    create: {
      email: 'profesor@upttmbi.edu.ve',
      name: 'Pedro',
      lastName: 'Docente',
      password: '$2a$10$YourHashedPasswordHere',
      role: Role.TEACHER,
    },
  });
  console.log(`✅ Usuario TEACHER creado: ${teacherUser.email}`);

  const studentUser = await prisma.user.upsert({
    where: { email: 'estudiante@upttmbi.edu.ve' },
    update: {},
    create: {
      email: 'estudiante@upttmbi.edu.ve',
      name: 'Sofia',
      lastName: 'Estudiante',
      password: '$2a$10$YourHashedPasswordHere',
      role: Role.STUDENT,
      preRegId: preRegistrations[0].id,
    },
  });
  console.log(`✅ Usuario STUDENT creado: ${studentUser.email}`);

  await prisma.preRegisteredStudent.update({
    where: { id: preRegistrations[0].id },
    data: { isUsed: true },
  });

  console.log('📚 Creando materias de ejemplo...');
  const subjects = await Promise.all([
    prisma.subject.upsert({
      where: { code: 'MAT101' },
      update: {},
      create: {
        code: 'MAT101',
        name: 'Matemáticas I',
      },
    }),
    prisma.subject.upsert({
      where: { code: 'PROG101' },
      update: {},
      create: {
        code: 'PROG101',
        name: 'Programación I',
      },
    }),
    prisma.subject.upsert({
      where: { code: 'BD101' },
      update: {},
      create: {
        code: 'BD101',
        name: 'Bases de Datos I',
      },
    }),
  ]);
  console.log(`✅ ${subjects.length} materias creadas`);

  console.log('📋 Creando inscripciones de ejemplo...');
  await prisma.enrollment.upsert({
    where: {
      userId_subjectId_semester: {
        userId: studentUser.id,
        subjectId: subjects[0].id,
        semester: '2024-1',
      },
    },
    update: {},
    create: {
      userId: studentUser.id,
      subjectId: subjects[0].id,
      semester: '2024-1',
    },
  });
  console.log('✅ Inscripción creada');

  console.log('📰 Creando posts de ejemplo...');
  await prisma.post.create({
    data: {
      title: 'Bienvenidos al foro académico',
      content:
        'Este es un espacio para compartir información académica relevante.',
      type: 'NEWS',
      authorId: adminUser.id,
    },
  });

  await prisma.post.create({
    data: {
      title: 'Evaluación de Matemáticas I',
      content: 'La evaluación se realizará el próximo viernes a las 8:00 AM.',
      type: 'EVALUATION',
      authorId: teacherUser.id,
      subjectId: subjects[0].id,
    },
  });
  console.log('✅ Posts creados');

  console.log('🎉 Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(
    `   - ${preRegistrations.length} pre-registros (${preRegistrations.length - 1} disponibles para usar)`,
  );
  console.log('   - 3 usuarios (1 admin, 1 profesor, 1 estudiante)');
  console.log(`   - ${subjects.length} materias`);
  console.log('   - 1 inscripción');
  console.log('   - 2 posts');
  console.log('\n🔑 Credenciales de prueba:');
  console.log('   Admin: admin@upttmbi.edu.ve');
  console.log('   Profesor: profesor@upttmbi.edu.ve');
  console.log('   Estudiante: estudiante@upttmbi.edu.ve');
  console.log('   Password (todos): [Necesitas hashear una contraseña]');
  console.log('\n📝 Pre-registros disponibles:');
  preRegistrations.slice(1).forEach((pr) => {
    console.log(`   - Cédula: ${pr.cedula} - ${pr.fullName}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
