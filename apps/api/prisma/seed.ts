/**
 * Seed script — populates a realistic HVAC/ductwork catalog plus users, groups,
 * crews, jobs, and order custom-field definitions so every feature has data to
 * work against.
 */
import { PrismaClient, Prisma } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  // --- Users / groups / crews -------------------------------------------
  const estimatingGroup = await prisma.userGroup.create({
    data: { name: 'Estimating' },
  });
  const fieldGroup = await prisma.userGroup.create({
    data: { name: 'Field Operations' },
  });

  const admin = await prisma.user.create({
    data: {
      email: 'admin@webduct.test',
      passwordHash,
      name: 'Avery Admin',
      role: 'ADMIN',
      userGroupId: estimatingGroup.id,
    },
  });
  const foreman = await prisma.user.create({
    data: {
      email: 'foreman@webduct.test',
      passwordHash,
      name: 'Sam Foreman',
      role: 'USER',
      userGroupId: fieldGroup.id,
    },
  });
  const measurer = await prisma.user.create({
    data: {
      email: 'measurer@webduct.test',
      passwordHash,
      name: 'Jordan Measure',
      role: 'USER',
      userGroupId: fieldGroup.id,
    },
  });

  await prisma.crew.create({
    data: {
      name: 'Install Crew A',
      members: { connect: [{ id: foreman.id }, { id: measurer.id }] },
    },
  });
  await prisma.crew.create({
    data: { name: 'Fabrication Crew', members: { connect: [{ id: admin.id }] } },
  });

  // --- Jobs -------------------------------------------------------------
  await prisma.job.create({
    data: {
      name: 'Riverside Medical Center',
      number: 'JOB-1001',
      phase: 'Level 3 Mechanical',
      owner: { connect: { id: foreman.id } },
      address: {
        create: {
          name: 'Riverside Medical Center',
          line1: '1200 Riverside Dr',
          city: 'Portland',
          region: 'OR',
          postal: '97201',
          country: 'US',
          phone: '503-555-0100',
        },
      },
    },
  });
  await prisma.job.create({
    data: {
      name: 'Downtown Office Tower',
      number: 'JOB-1002',
      phase: 'Core & Shell',
      owner: { connect: { id: measurer.id } },
    },
  });

  // --- Catalog / categories / products ----------------------------------
  const catalog = await prisma.catalog.create({
    data: {
      name: 'Standard Ductwork',
      description: '<p>Galvanized sheet-metal duct fittings and straights.</p>',
    },
  });

  const rectangular = await prisma.category.create({
    data: { name: 'Rectangular Duct', catalogId: catalog.id },
  });
  const round = await prisma.category.create({
    data: { name: 'Round Duct', catalogId: catalog.id },
  });
  const fittings = await prisma.category.create({
    data: { name: 'Fittings', catalogId: catalog.id },
  });

  const products: Prisma.ProductCreateInput[] = [
    {
      sku: 'RECT-STR-24x12',
      name: 'Rectangular Straight 24x12',
      description: '<p>Galvanized rectangular straight duct, 24" x 12".</p>',
      type: 'WITH_ATTRIBUTES',
      installable: true,
      overrideType: 'PRICE_AND_WEIGHT',
      basePrice: new Prisma.Decimal('48.50'),
      weight: new Prisma.Decimal('14.200'),
      unit: 'EA',
      catalog: { connect: { id: catalog.id } },
      category: { connect: { id: rectangular.id } },
      attributes: {
        create: [
          { name: 'Length (in)', type: 'NUMBER', required: true, options: [], sortOrder: 0 },
          { name: 'Gauge', type: 'SELECT', required: true, options: ['26', '24', '22', '20'], sortOrder: 1 },
          { name: 'Insulation', type: 'SELECT', required: false, options: ['None', '1"', '1.5"', '2"'], sortOrder: 2 },
        ],
      },
      asset3d: {
        create: { meta: { shape: 'rectangular', width: 24, height: 12, length: 60 } },
      },
    },
    {
      sku: 'ROUND-STR-14',
      name: 'Round Straight 14"',
      description: '<p>Spiral round straight duct, 14" diameter.</p>',
      type: 'WITH_ATTRIBUTES',
      installable: true,
      overrideType: 'WEIGHT',
      basePrice: new Prisma.Decimal('32.00'),
      weight: new Prisma.Decimal('9.800'),
      unit: 'EA',
      catalog: { connect: { id: catalog.id } },
      category: { connect: { id: round.id } },
      attributes: {
        create: [
          { name: 'Length (in)', type: 'NUMBER', required: true, options: [], sortOrder: 0 },
          { name: 'Gauge', type: 'SELECT', required: true, options: ['26', '24', '22'], sortOrder: 1 },
        ],
      },
      asset3d: { create: { meta: { shape: 'round', diameter: 14, length: 60 } } },
    },
    {
      sku: 'ELBOW-90-24x12',
      name: '90° Elbow 24x12',
      description: '<p>Rectangular 90-degree elbow, 24" x 12".</p>',
      type: 'SIMPLE',
      installable: true,
      overrideType: 'NONE',
      basePrice: new Prisma.Decimal('72.25'),
      weight: new Prisma.Decimal('18.500'),
      unit: 'EA',
      catalog: { connect: { id: catalog.id } },
      category: { connect: { id: fittings.id } },
      asset3d: { create: { meta: { shape: 'elbow', angle: 90, width: 24, height: 12 } } },
    },
    {
      sku: 'TRANS-24x12-14R',
      name: 'Transition 24x12 to 14" Round',
      description: '<p>Rectangular-to-round transition fitting.</p>',
      type: 'SIMPLE',
      installable: false,
      overrideType: 'PRICE',
      basePrice: new Prisma.Decimal('64.00'),
      weight: new Prisma.Decimal('12.000'),
      unit: 'EA',
      catalog: { connect: { id: catalog.id } },
      category: { connect: { id: fittings.id } },
    },
  ];

  const created: { id: string }[] = [];
  for (const p of products) {
    created.push(await prisma.product.create({ data: p }));
  }

  // --- Fulfillment group ------------------------------------------------
  await prisma.fulfillmentGroup.create({
    data: {
      name: 'Shop Fabrication',
      products: {
        create: created.map((p) => ({ productId: p.id })),
      },
    },
  });

  // --- Order custom-field definitions -----------------------------------
  await prisma.customFieldDef.createMany({
    data: [
      { scope: 'ORDER', label: 'Cost Code', type: 'TEXT', required: false, options: [], sortOrder: 0 },
      { scope: 'ORDER', label: 'Rush Order', type: 'BOOLEAN', required: false, options: [], sortOrder: 1 },
      { scope: 'ORDER', label: 'Seal Class', type: 'SELECT', required: false, options: ['A', 'B', 'C'], sortOrder: 2 },
    ],
  });

  console.log('Seed complete:');
  console.log(`  users: 3, groups: 2, crews: 2, jobs: 2`);
  console.log(`  catalog: 1, categories: 3, products: ${created.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
