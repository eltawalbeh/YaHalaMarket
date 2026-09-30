import { db, request } from "@/lib/request";
export async function listAll<T>(
  table: string,
  filter?: (query: any) => any,
): Promise<T[]> {
  const rows: T[] = [];
  for (let start = 0; ; start += 1000) {
    let query = db()
      .from(table)
      .select("*")
      .order("created_at", { ascending: false })
      .order("id")
      .range(start, start + 999);
    if (filter) query = filter(query);
    const page = (await request(query)) as T[];
    rows.push(...page);
    if (page.length < 1000) return rows;
  }
}
