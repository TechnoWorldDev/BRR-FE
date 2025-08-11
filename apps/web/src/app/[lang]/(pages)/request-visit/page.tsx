import HeroSection from "@/components/web/RequestVisit/HeroSection";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Request a Visit: Showcase Your Property to BBR Experts",
    description:
      "Request a visit from our experts to showcase your luxury property. Schedule a tour to highlight your branded residence's unique features and appeal.",
    slug: "request-visit",
    keywords: [
      "request visit",
      "property visit",
      "luxury real estate",
      "branded residences",
      "residence visit",
    ],
  },
});

function Page() {
  return <HeroSection />;
}

export default Page;
