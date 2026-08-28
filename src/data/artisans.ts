export type Artisan = {
  id: string;
  craft: string;
  city: string;
  href?: string;
};

export const artisans: Artisan[] = [
  { id: "a1", craft: "Zhuang brocade", city: "Guantang" },
  { id: "a2", craft: "Tianqin", city: "Longzhou" },
  { id: "a3", craft: "Purple pottery", city: "Jianshui" },
  { id: "a4", craft: "Hmong textile", city: "Sapa" },
  { id: "a5", craft: "Silk", city: "Hanoi" },
];
