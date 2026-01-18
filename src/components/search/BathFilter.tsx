"use client";

import { Bath } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function BathFilter() {
  return (
    <Select>
      <SelectTrigger className="h-12 border-gray-200">
        <div className="flex items-center gap-2">
          <Bath className="w-4 h-4" />
          <SelectValue placeholder="Baths" />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="any">Any</SelectItem>
        <SelectItem value="1">1+ Bath</SelectItem>
        <SelectItem value="2">2+ Baths</SelectItem>
        <SelectItem value="3">3+ Baths</SelectItem>
        <SelectItem value="4">4+ Baths</SelectItem>
      </SelectContent>
    </Select>
  );
}