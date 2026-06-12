export function SearchBar({
  defaultValue = "",
  size = "md",
}: {
  defaultValue?: string;
  size?: "md" | "lg";
}) {
  return (
    <form action="/damascus/restaurants" method="GET" className="w-full">
      <div className="relative">
        <input
          type="search"
          name="q"
          defaultValue={defaultValue}
          placeholder="ابحث عن مطعم، كافيه، أو نوع طعام…"
          className={`w-full bg-white border border-stone-300 rounded-xl ps-4 pe-24 focus:outline-none focus:ring-2 focus:ring-primary-500 ${
            size === "lg" ? "py-3.5 text-base shadow-lg" : "py-2 text-sm"
          }`}
        />
        <button
          type="submit"
          className={`absolute end-1.5 top-1/2 -translate-y-1/2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold ${
            size === "lg" ? "px-5 py-2" : "px-3 py-1 text-sm"
          }`}
        >
          بحث
        </button>
      </div>
    </form>
  );
}
