import HeroSection from "@/components/web/RequestPremiumProfile/HeroSection";
import { generatePageMetadata } from "@/lib/metadata";
import type { Metadata } from "next";

export const metadata: Metadata = generatePageMetadata({
  type: "page",
  data: {
    title: "Request a Premium Profile: Stand Out in BBR",
    description:
      "Upgrade to a premium residence profile for maximum visibility among luxury buyers. Request your Premium Property Profile with Best Brand Residences today.",
    slug: "request-premium-profile",
    keywords: [
      "request premium profile",
      "property profile",
      "luxury real estate",
      "branded residences",
      "residence profile",
    ],
  },
});

function Page() {
  return <HeroSection />;
}

export default Page;
