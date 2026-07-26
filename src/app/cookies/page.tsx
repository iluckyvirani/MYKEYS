"use client";

import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export default function CookiesPage() {
  return (
    <LegalDocumentPage
      page="cookies"
      relatedLinks={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/terms", label: "Terms of Service" },
      ]}
    />
  );
}
