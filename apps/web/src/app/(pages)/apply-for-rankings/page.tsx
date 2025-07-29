import HeroSection from "@/components/web/ApplyRanking/HeroSection";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Apply Now: Get Listed Among the Best Branded Residences",
    description:
      "Apply for luxury property rankings and showcase your high-end residence. Submit your property for consideration in the Best Brand Residences exclusive rankings.",
    slug: "apply-for-rankings",
    keywords: [
      "apply for rankings",
      "property submission",
      "luxury real estate",
      "branded residences",
      "residence rankings",
    ],
  },
});

export default function Page() {
  return <HeroSection />;
}
