import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { generatePassword } from "@/lib/utils";

const DEFAULT_FLOW = [
  {
    slug: "drinks",
    title: "What would you like to drink?",
    subtitle: "Pick a category or skip",
  },
  {
    slug: "food",
    title: "Ready for something to eat?",
    subtitle: "Explore our kitchen favorites",
  },
  {
    slug: "dessert",
    title: "Something sweet to finish?",
    subtitle: "Optional — treat yourself",
  },
];

export async function bootstrapRestaurant(data: {
  name: string;
  slug: string;
  adminEmail: string;
  adminName: string;
}) {
  const adminPassword = generatePassword();

  const restaurant = await prisma.restaurant.create({
    data: {
      name: data.name,
      slug: data.slug,
      settings: {
        create: {
          minOrderAmountCents: null,
          requireFoodItem: false,
          currency: "EUR",
        },
      },
    },
  });

  for (let i = 0; i < DEFAULT_FLOW.length; i++) {
    const step = DEFAULT_FLOW[i];
    await prisma.menuFlowStep.create({
      data: {
        restaurantId: restaurant.id,
        slug: step.slug,
        title: step.title,
        subtitle: step.subtitle,
        sortOrder: i,
      },
    });
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  await prisma.user.create({
    data: {
      email: data.adminEmail.toLowerCase(),
      name: data.adminName,
      passwordHash,
      role: UserRole.RESTAURANT_ADMIN,
      restaurantId: restaurant.id,
    },
  });

  return { restaurant, adminPassword };
}
