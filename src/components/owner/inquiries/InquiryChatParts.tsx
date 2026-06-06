"use client";

import UserAvatar from "@/components/common/UserAvatar";
import type { GuestProfile } from "@/lib/user/profileFields";
import {
  formatAgeDisplay,
  formatChatTimestamp,
  formatGender,
  formatLastActive,
  formatMemberSince,
} from "@/lib/inquiries/inquiryDisplay";
import { MapPin, PoundSterling, Calendar } from "lucide-react";

export interface TenantProfileData {
  guestName: string;
  guestProfile: GuestProfile | null;
  type?: string;
  budget?: number | null;
}

export function TenantProfileGrid({ tenant }: { tenant: TenantProfileData }) {
  const profile = tenant.guestProfile;
  const ageLabel = formatAgeDisplay(profile?.birthDate);
  const location = [profile?.city, profile?.country].filter(Boolean).join(", ");

  const items = [
    { label: "Age", value: ageLabel },
    { label: "Gender", value: formatGender(profile?.gender) },
    { label: "Last active", value: formatLastActive(profile?.lastLoginAt) },
    { label: "Member since", value: formatMemberSince(profile?.createdAt) },
  ];

  return (
    <div className="mt-3 pt-3 border-t border-sky-200/80">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {items.map((item) => (
          <div key={item.label}>
            <p className="text-[11px] text-sky-700/70 font-medium">{item.label}</p>
            <p className="text-sm font-semibold text-sky-950">{item.value}</p>
          </div>
        ))}
      </div>
      {(location || tenant.budget) && (
        <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-sky-200/60">
          {location && (
            <div className="flex items-center gap-1.5 text-xs text-sky-800">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {location}
            </div>
          )}
          {tenant.budget != null && tenant.budget > 0 && (
            <div className="flex items-center gap-1.5 text-xs text-sky-800">
              <PoundSterling className="w-3.5 h-3.5 shrink-0" />
              Budget: £{tenant.budget.toLocaleString()}
            </div>
          )}
          {tenant.type && (
            <div className="flex items-center gap-1.5 text-xs text-sky-800 capitalize">
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              {tenant.type.replace(/_/g, " ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface InquiryEntryCardProps {
  tenant: TenantProfileData;
  message: string;
  timestamp: string;
  isNew?: boolean;
}

export function InquiryEntryCard({ tenant, message, timestamp, isNew }: InquiryEntryCardProps) {
  const avatar = tenant.guestProfile?.avatar;

  return (
    <div className={`flex gap-3 justify-start ${isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-500" : ""}`}>
      <UserAvatar name={tenant.guestName} src={avatar} size="md" className="mt-1" />
      <div className="max-w-[85%] min-w-0">
        <p className="text-sm font-semibold text-gray-900 mb-1.5">{tenant.guestName}</p>
        <div
          className={`bg-sky-50 border border-sky-200 text-gray-900 rounded-xl rounded-tl-sm px-4 py-3 shadow-sm ${
            isNew ? "ring-2 ring-green-400 ring-offset-1" : ""
          }`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
          <p className="text-xs text-sky-600/80 text-right mt-2">{formatChatTimestamp(timestamp)}</p>
          <TenantProfileGrid tenant={tenant} />
        </div>
      </div>
    </div>
  );
}

interface ChatMessageBubbleProps {
  content: string;
  senderName: string;
  senderAvatar?: string | null;
  timestamp: string;
  isMe: boolean;
  isNew?: boolean;
}

export function ChatMessageBubble({
  content,
  senderName,
  senderAvatar,
  timestamp,
  isMe,
  isNew,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex gap-3 ${isMe ? "flex-row-reverse" : "flex-row"} ${
        isNew ? "animate-in fade-in slide-in-from-bottom-2 duration-300" : ""
      }`}
    >
      <UserAvatar
        name={isMe ? "You" : senderName}
        src={senderAvatar}
        size="sm"
        className="mt-1"
        ring={isNew}
      />
      <div className={`max-w-[75%] min-w-0 ${isMe ? "items-end" : "items-start"} flex flex-col`}>
        <p className={`text-xs font-medium text-gray-500 mb-1 ${isMe ? "text-right" : "text-left"}`}>
          {isMe ? "You" : senderName}
        </p>
        <div
          className={`rounded-xl px-4 py-3 shadow-sm ${
            isMe
              ? "bg-green-600 text-white rounded-tr-sm"
              : "bg-gray-100 text-gray-900 rounded-tl-sm"
          } ${isNew ? "ring-2 ring-green-400 ring-offset-1" : ""}`}
        >
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{content}</p>
        </div>
        <span className={`text-xs text-gray-400 mt-1 ${isMe ? "text-right" : "text-left"}`}>
          {formatChatTimestamp(timestamp)}
        </span>
      </div>
    </div>
  );
}
