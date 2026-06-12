import { db } from "@/lib/db";
import { setUserRole } from "@/actions/admin";
import { formatDateAr } from "@/lib/format";

export const metadata = { title: "المستخدمون" };

const ROLE_AR = { USER: "مستخدم", OWNER: "صاحب مطعم", ADMIN: "مدير" } as const;

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const users = await db.user.findMany({
    where: q
      ? {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { email: { contains: q, mode: "insensitive" } },
          ],
        }
      : undefined,
    include: { _count: { select: { reviews: true, restaurants: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold">المستخدمون</h1>
        <form action="/admin/users" className="flex gap-2">
          <input
            name="q"
            defaultValue={q ?? ""}
            placeholder="بحث بالاسم أو البريد…"
            className="border border-stone-300 rounded-lg px-3 py-1.5 text-sm bg-white"
          />
          <button className="text-xs rounded-lg px-3 border border-stone-300 bg-white hover:border-primary-500">
            بحث
          </button>
        </form>
      </div>

      <div className="space-y-2">
        {users.map((u) => (
          <div
            key={u.id}
            className="bg-white border border-stone-200 rounded-xl p-3 flex flex-wrap items-center justify-between gap-2 text-sm"
          >
            <div>
              <span className="font-bold">{u.name}</span>
              <span className="text-stone-500 ms-2">{u.email}</span>
              <div className="text-xs text-stone-400 mt-0.5">
                {ROLE_AR[u.role]} · {u._count.reviews} تقييم ·{" "}
                {u._count.restaurants} مطعم · انضم {formatDateAr(u.createdAt)}
              </div>
            </div>
            <form action={setUserRole} className="flex gap-2 items-center">
              <input type="hidden" name="id" value={u.id} />
              <select
                name="role"
                defaultValue={u.role}
                className="border border-stone-300 rounded-lg px-2 py-1 text-xs bg-white"
              >
                {Object.entries(ROLE_AR).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v}
                  </option>
                ))}
              </select>
              <button className="text-xs rounded-lg px-2.5 py-1 border border-stone-300 hover:border-primary-500">
                حفظ
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
