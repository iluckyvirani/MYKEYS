"use client";

import LegalDocumentPage from "@/components/legal/LegalDocumentPage";

export default function TermsPage() {
  return (
    <LegalDocumentPage
      page="terms"
      relatedLinks={[
        { href: "/privacy", label: "Privacy Policy" },
        { href: "/cookies", label: "Cookie Policy" },
        { href: "/contact", label: "Contact Us" },
      ]}
    />
  );
}
