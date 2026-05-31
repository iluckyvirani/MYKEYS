"use client";

import { useCurrentUser } from "@/lib/hooks/useCurrentUser";
import { cn } from "@/lib/utils";

interface DashboardGreetingProps {
  subtitle?: string;
  className?: string;
  titleClassName?: string;
}

export default function DashboardGreeting({
  subtitle,
  className,
  titleClassName,
}: DashboardGreetingProps) {
  const { firstName, loading } = useCurrentUser();

  return (
    <div className={cn("mb-5", className)}>
      <h1
        className={cn(
          "text-xl md:text-2xl font-bold text-gray-900",
          titleClassName
        )}
      >
        Hello, {loading ? "..." : firstName}! 👋
      </h1>
      {subtitle && (
        <p className="text-gray-600 text-sm mt-2">{subtitle}</p>
      )}
    </div>
  );
}
