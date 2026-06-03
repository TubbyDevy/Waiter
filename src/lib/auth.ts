import { UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { checkRateLimitByKey } from "@/lib/rate-limit";

/** Bcrypt hash of random password — used to prevent timing leaks when email is unknown */
const DUMMY_PASSWORD_HASH =
  "$2a$12$Nk7BqEcHcO9ZLEhef61CxuIFYQhFDhQj6nSeSTjllhHrW9vsklNhm";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const email = credentials.email.toLowerCase().trim();
        if (email.length > 254 || credentials.password.length > 128) {
          return null;
        }

        if (checkRateLimitByKey(`login:${email}`, 10, 15 * 60 * 1000)) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email },
          include: { restaurant: true },
        });

        const valid = await bcrypt.compare(
          credentials.password,
          user?.passwordHash ?? DUMMY_PASSWORD_HASH
        );
        if (!user || !valid) return null;

        if (
          user.restaurant &&
          user.restaurant.status === "SUSPENDED" &&
          user.role !== UserRole.SUPER_ADMIN
        ) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          restaurantId: user.restaurantId,
          restaurantName: user.restaurant?.name ?? null,
          restaurantSlug: user.restaurant?.slug ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.restaurantId = user.restaurantId;
        token.restaurantName = user.restaurantName;
        token.restaurantSlug = user.restaurantSlug;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as UserRole;
        session.user.restaurantId = (token.restaurantId as string) ?? null;
        session.user.restaurantName = (token.restaurantName as string) ?? null;
        session.user.restaurantSlug = (token.restaurantSlug as string) ?? null;
      }
      return session;
    },
  },
};
