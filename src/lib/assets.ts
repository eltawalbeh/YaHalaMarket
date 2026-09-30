const publicAsset = (path: string) => {
  const base = import.meta.env.BASE_URL.endsWith("/")
    ? import.meta.env.BASE_URL
    : import.meta.env.BASE_URL + "/";
  return base + path.replace(/^\/+/, "");
};

export const assets = {
  loginCover: publicAsset("assets/figma/b472b.png"),
  offersEmpty: publicAsset("assets/figma/a5489.png"),
  planCover: publicAsset("assets/figma/0d235.png"),
  dashboardHero: publicAsset("assets/figma/8e6a9.png"),
} as const;
