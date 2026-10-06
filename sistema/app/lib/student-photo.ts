const studentPhotos = import.meta.glob("../../fotos/*.jpg", {
  eager: true,
  import: "default",
  query: "?url",
}) as Record<string, string>;

export function studentPhotoUrl(legajo: string) {
  return studentPhotos[`../../fotos/${legajo}.jpg`];
}
