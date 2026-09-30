import { db } from "@/lib/request";
export async function uploadImage(file: File, userId: string) {
  if (
    !["image/jpeg", "image/png", "image/webp", "image/avif"].includes(file.type)
  )
    throw new Error("Use PNG, JPG, WebP or AVIF");
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Maximum image size is 5 MB");
  const path =
    userId +
    "/" +
    crypto.randomUUID() +
    "." +
    {
      "image/jpeg": "jpg",
      "image/png": "png",
      "image/webp": "webp",
      "image/avif": "avif",
    }[file.type];
  const { error } = await db()
    .storage.from("market-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  return db().storage.from("market-media").getPublicUrl(path).data.publicUrl;
}
