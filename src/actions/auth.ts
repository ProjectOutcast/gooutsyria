"use server";

import { AuthError } from "next-auth";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth, signIn, signOut } from "@/lib/auth";

export type AuthFormState = { error?: string };
export type AccountFormState = { error?: string; ok?: boolean };

export async function loginAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  try {
    await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirectTo: "/",
    });
    return {};
  } catch (err) {
    if (isRedirectError(err)) throw err;
    if (err instanceof AuthError) {
      return { error: "البريد الإلكتروني أو كلمة المرور غير صحيحة" };
    }
    throw err;
  }
}

const registerSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(60),
  email: z.string().trim().toLowerCase().email("بريد إلكتروني غير صالح"),
  password: z.string().min(8, "كلمة المرور يجب أن تكون 8 أحرف على الأقل"),
});

export async function registerAction(
  _prev: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }
  const { name, email, password } = parsed.data;

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "هذا البريد الإلكتروني مسجَّل مسبقاً" };

  await db.user.create({
    data: { name, email, passwordHash: await bcrypt.hash(password, 10) },
  });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
    return {};
  } catch (err) {
    if (isRedirectError(err)) throw err;
    return { error: "تم إنشاء الحساب — سجّل الدخول الآن" };
  }
}

export async function googleSignIn() {
  await signIn("google", { redirectTo: "/" });
}

export async function logoutAction() {
  await signOut({ redirectTo: "/" });
}

const accountSchema = z.object({
  name: z.string().trim().min(2, "الاسم قصير جداً").max(60),
});

export async function updateAccount(
  _prev: AccountFormState,
  formData: FormData
): Promise<AccountFormState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "يجب تسجيل الدخول أولاً" };
  const userId = session.user.id;

  const parsed = accountSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const newPassword = String(formData.get("newPassword") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const currentPassword = String(formData.get("currentPassword") ?? "");

  const data: { name: string; passwordHash?: string } = { name: parsed.data.name };

  if (newPassword) {
    if (newPassword.length < 8) {
      return { error: "كلمة المرور الجديدة يجب أن تكون 8 أحرف على الأقل" };
    }
    if (newPassword !== confirmPassword) {
      return { error: "كلمتا المرور غير متطابقتين" };
    }
    const dbUser = await db.user.findUnique({ where: { id: userId } });
    if (dbUser?.passwordHash) {
      const valid =
        !!currentPassword && (await bcrypt.compare(currentPassword, dbUser.passwordHash));
      if (!valid) return { error: "كلمة المرور الحالية غير صحيحة" };
    }
    data.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  await db.user.update({ where: { id: userId }, data });
  revalidatePath("/account");
  return { ok: true };
}
