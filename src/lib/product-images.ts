import wp1 from "@/assets/women-product1.jpg";
import wp2 from "@/assets/women-product2.jpg";
import wp3 from "@/assets/women-product3.jpg";
import wp4 from "@/assets/women-product4.jpg";
import wp5 from "@/assets/women-product5.jpg";
import wp6 from "@/assets/women-product6.jpg";

const imageMap: Record<string, string> = {
  "/women-product1.jpg": wp1,
  "/women-product2.jpg": wp2,
  "/women-product3.jpg": wp3,
  "/women-product4.jpg": wp4,
  "/women-product5.jpg": wp5,
  "/women-product6.jpg": wp6,
};

export const getProductImage = (imageUrl: string | null): string => {
  if (!imageUrl) return wp1;
  return imageMap[imageUrl] || imageUrl;
};
