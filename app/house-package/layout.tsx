import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "House & Land Package | D&E Property Pro",
  description:
    "Premium house and land package — Melbourne. Modern architecture, investment-grade positioning, immersive 360° experience."
};

export default function HousePackageLayout({ children }: { children: React.ReactNode }) {
  return children;
}
