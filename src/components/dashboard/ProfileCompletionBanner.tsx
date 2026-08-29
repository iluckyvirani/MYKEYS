"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  getAgentProfileCompletion,
  getOwnerProfileCompletion,
  getProfileHref,
  getServiceProfileCompletion,
  getUserProfileCompletion,
  ProfileCompletionResult,
  ProfileRole,
} from "@/lib/profileCompleteness";
import { UserCircle2, X } from "lucide-react";

const DISMISS_KEY = "mykeys_profile_completion_dismissed";

interface ProfileCompletionBannerProps {
  role: ProfileRole;
}

export default function ProfileCompletionBanner({
  role,
}: ProfileCompletionBannerProps) {
  const [result, setResult] = useState<ProfileCompletionResult | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        if (typeof window !== "undefined") {
          const d = sessionStorage.getItem(`${DISMISS_KEY}_${role}`);
          if (d === "1") setDismissed(true);
        }

        if (role === "service") {
          const res = await api.get("/service/profile");
          const data = res.data?.data ?? res.data;
          if (!cancelled) setResult(getServiceProfileCompletion(data));
        } else {
          const res = await api.get("/auth/me");
          const data = res.data?.data ?? res.data;
          if (!cancelled) {
            setResult(
              role === "owner"
                ? getOwnerProfileCompletion(data)
                : role === "agent"
                  ? getAgentProfileCompletion(data)
                  : getUserProfileCompletion(data)
            );
          }
        }
      } catch (err) {
        console.error("Profile completion load failed:", err);
        if (!cancelled) setResult(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [role]);

  if (loading || !result || result.isComplete || dismissed) {
    return null;
  }

  const missingPreview = result.missing
    .slice(0, 3)
    .map((m) => m.label)
    .join(", ");
  const more =
    result.missing.length > 3 ? ` +${result.missing.length - 3} more` : "";

  const dismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(`${DISMISS_KEY}_${role}`, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="mb-5 rounded-[5px] border border-teal-200 bg-gradient-to-r from-teal-50 to-white p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-teal-100 p-2 text-[#339390]">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-sm font-semibold text-gray-900">
                Profile {result.percent}% complete
              </p>
              <p className="mt-0.5 text-xs text-gray-600">
                Optional — finish your profile for a better experience.
                {missingPreview
                  ? ` Still needed: ${missingPreview}${more}.`
                  : ""}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href={getProfileHref(role)}
                className="inline-flex items-center rounded-[5px] bg-[#339390] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#2a7a78]"
              >
                Complete profile
              </Link>
              <button
                type="button"
                onClick={dismiss}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                aria-label="Dismiss"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-teal-100">
            <div
              className="h-full rounded-full bg-[#339390] transition-all duration-500"
              style={{ width: `${Math.max(result.percent, 4)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] text-gray-500">
            {result.filled} of {result.total} profile details filled — no
            restriction if you skip this.
          </p>
        </div>
      </div>
    </div>
  );
}
