import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";
import MarketingSolutionsClient from "./MarketingSolutionClient";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Marketing Solutions: Elevate Your Luxury Real Estate Brand",
    description:
      "Elevate your luxury real estate brand with Best Brand Residences. Use our marketing solutions to showcase your property to discerning buyers worldwide.",
    slug: "marketing-solutions",
    keywords: ["marketing solutions", "luxury residences", "company info"],
  },
});

const MarketingSolutionsPage = () => {
  return <MarketingSolutionsClient />;
};

export default MarketingSolutionsPage;
