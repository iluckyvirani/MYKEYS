"use client";

import PropertyCard from "./PropertyCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";

export default function PropertyCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = dir === "left" ? -350 : 350;
    scrollRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 py-20">

      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="font-spartan text-3xl font-bold">
            Featured Properties
          </h2>
          <p className="text-gray-500">
            A great platform to buy, sell and rent your properties.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-white shadow rounded-full hover:bg-gray-100"
          >
            <ChevronLeft />
          </button>

          <button
            onClick={() => scroll("right")}
            className="p-2 bg-white shadow rounded-full hover:bg-gray-100"
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-8 overflow-x-auto scroll-smooth scrollbar-hide"
      >
        {[...Array(8)].map((_, i) => (
          <div key={i} className="min-w-[320px]">
            <PropertyCard />
          </div>
        ))}
      </div>

    </section>
  );
}
