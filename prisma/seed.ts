import { PrismaClient, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const superAdminPassword = await bcrypt.hash("superadmin123", 12);

  await prisma.user.upsert({
    where: { email: "admin@tableflow.app" },
    update: {},
    create: {
      email: "admin@tableflow.app",
      name: "Platform Owner",
      passwordHash: superAdminPassword,
      role: UserRole.SUPER_ADMIN,
    },
  });

  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "demo-bistro" },
    update: {},
    create: {
      name: "Demo Bistro",
      slug: "demo-bistro",
      subscriptionStatus: "ACTIVE",
      settings: {
        create: {
          minOrderAmountCents: 500,
          requireFoodItem: true,
          currency: "EUR",
        },
      },
    },
  });

  const adminPassword = await bcrypt.hash("admin123", 12);
  const waiterPassword = await bcrypt.hash("waiter123", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@demobistro.com" },
    update: {},
    create: {
      email: "admin@demobistro.com",
      name: "Maria Admin",
      passwordHash: adminPassword,
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId: restaurant.id,
    },
  });

  const waiter = await prisma.user.upsert({
    where: { email: "waiter@demobistro.com" },
    update: {},
    create: {
      email: "waiter@demobistro.com",
      name: "James Waiter",
      passwordHash: waiterPassword,
      role: UserRole.WAITER,
      restaurantId: restaurant.id,
    },
  });

  const flowSteps = [
    { slug: "drinks", title: "What would you like to drink?", subtitle: "Pick a category or skip" },
    { slug: "food", title: "Ready for something to eat?", subtitle: "Explore our kitchen favorites" },
    { slug: "dessert", title: "Something sweet to finish?", subtitle: "Optional — treat yourself" },
  ];

  for (let i = 0; i < flowSteps.length; i++) {
    const fs = flowSteps[i];
    await prisma.menuFlowStep.upsert({
      where: {
        restaurantId_slug: {
          restaurantId: restaurant.id,
          slug: fs.slug,
        },
      },
      update: { title: fs.title, subtitle: fs.subtitle, sortOrder: i },
      create: {
        restaurantId: restaurant.id,
        slug: fs.slug,
        title: fs.title,
        subtitle: fs.subtitle,
        sortOrder: i,
      },
    });
  }

  const drinksStep = await prisma.menuFlowStep.findUniqueOrThrow({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: "drinks" } },
  });
  const foodStep = await prisma.menuFlowStep.findUniqueOrThrow({
    where: { restaurantId_slug: { restaurantId: restaurant.id, slug: "food" } },
  });

  const drinkCategories = [
    { name: "Soft Drinks", sortOrder: 0 },
    { name: "Beer", sortOrder: 1 },
    { name: "Hot Drinks", sortOrder: 2 },
    { name: "Water & Juices", sortOrder: 3 },
  ];

  const foodCategories = [
    { name: "Starters", sortOrder: 0 },
    { name: "Mains", sortOrder: 1 },
    { name: "Pizza", sortOrder: 2 },
    { name: "Sandwiches", sortOrder: 3 },
  ];

  for (const cat of drinkCategories) {
    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        flowStepId: drinksStep.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: `${cat.name} Item A`,
          description: "Refreshing choice",
          priceCents: 350,
          isFood: false,
          inStock: true,
        },
        {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: `${cat.name} Item B`,
          description: "House favorite",
          priceCents: 450,
          isFood: false,
          inStock: cat.name !== "Beer",
        },
      ],
    });
  }

  for (const cat of foodCategories) {
    const category = await prisma.menuCategory.create({
      data: {
        restaurantId: restaurant.id,
        flowStepId: foodStep.id,
        name: cat.name,
        sortOrder: cat.sortOrder,
      },
    });

    await prisma.menuItem.createMany({
      data: [
        {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: `Classic ${cat.name}`,
          description: "Chef's signature",
          priceCents: 1200,
          isFood: true,
          inStock: true,
        },
        {
          restaurantId: restaurant.id,
          categoryId: category.id,
          name: `Premium ${cat.name}`,
          description: "With seasonal sides",
          priceCents: 1650,
          isFood: true,
          inStock: true,
        },
      ],
    });
  }

  const tables = await Promise.all(
    ["1", "2", "3", "4", "5"].map((name, i) =>
      prisma.table.upsert({
        where: { qrToken: `demo-table-${name}` },
        update: {},
        create: {
          restaurantId: restaurant.id,
          name: `Table ${name}`,
          qrToken: `demo-table-${name}`,
          sortOrder: i,
        },
      })
    )
  );

  for (const table of tables.slice(0, 3)) {
    await prisma.waiterTableAssignment.upsert({
      where: {
        waiterId_tableId: { waiterId: waiter.id, tableId: table.id },
      },
      update: {},
      create: { waiterId: waiter.id, tableId: table.id },
    });
  }

  console.log("Seed complete!");
  console.log("Super admin: admin@tableflow.app / superadmin123");
  console.log("Restaurant admin: admin@demobistro.com / admin123");
  console.log("Waiter: waiter@demobistro.com / waiter123");
  console.log(`Customer QR demo: /order/demo-table-1`);
  console.log("Restaurant:", restaurant.name, admin.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
