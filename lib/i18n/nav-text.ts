import type { Lang } from "./home-hero";

/** Global navigation copy — use `navText[lang].nav_home` etc. */
export const navText = {
  en: {
    nav_home: "Home",
    nav_about: "About",
    nav_services: "Services",
    nav_projects: "Projects",
    nav_properties: "Properties",
    nav_house_package: "House Package",
    nav_labs: "D&E Labs",
    nav_contact: "Contact",
    button_start: "Start 360"
  },
  zh: {
    nav_home: "首页",
    nav_about: "关于我们",
    nav_services: "服务",
    nav_projects: "项目",
    nav_properties: "房源",
    nav_house_package: "房源套餐",
    nav_labs: "D&E 实验室",
    nav_contact: "联系",
    button_start: "开始360"
  }
} as const;

export function navLabel(lang: Lang, key: keyof (typeof navText)["en"]): string {
  return navText[lang][key];
}
