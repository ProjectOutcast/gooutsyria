import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { Role } from "@/generated/prisma/enums";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: Role;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

const providers = [
  Credentials({
    name: "credentials",
    credentials: {
      email: { label: "البريد الإلكتروني", type: "email" },
      password: { label: "كلمة المرور", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "").toLowerCase().trim();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;
      const user = await db.user.findUnique({ where: { email } });
      if (!user?.passwordHash) return null;
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) return null;
      return { id: user.id, name: user.name, email: user.email, image: user.image };
    },
  }),
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        Google({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
];

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  trustHost: true,
  pages: { signIn: "/login" },
  providers,
  callbacks: {
    async jwt({ token, user, account }) {
      // On first sign-in, resolve (or create, for Google) the DB user and embed id+role.
      if (user) {
        const email = user.email?.toLowerCase();
        if (account?.provider === "google" && email) {
          const dbUser = await db.user.upsert({
            where: { email },
            update: { image: user.image ?? undefined },
            create: {
              email,
              name: user.name ?? email.split("@")[0],
              image: user.image ?? null,
            },
          });
          token.uid = dbUser.id;
          token.role = dbUser.role;
        } else if (user.id) {
          const dbUser = await db.user.findUnique({ where: { id: user.id } });
          token.uid = user.id;
          token.role = dbUser?.role ?? "USER";
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (token.uid) {
        session.user.id = token.uid as string;
        session.user.role = (token.role as Role) ?? "USER";
      }
      return session;
    },
  },
});
