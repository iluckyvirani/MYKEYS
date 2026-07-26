"use client";

import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export default function PrivacyPage() {
  return (
    <LegalDocumentPage
      page="privacy"
      relatedLinks={[
        { href: "/terms", label: "Terms of Service" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/contact", label: "Contact Us" },
      ]}
    />
  );
}
