"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
  /** Earliest selectable date as YYYY-MM-DD. Defaults to tomorrow. */
  minDate?: string;
  placeholder?: string;
  /** Highlight range end for visual range indication */
  rangeEnd?: string;
  /** Highlight range start for visual range indication */
  rangeStart?: string;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function getTomorrow(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return toYMD(d);
}

function formatDisplay(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function DatePickerInput({
  value,
  onChange,
  label,
  minDate,
  placeholder = "Select date",
  rangeStart,
  rangeEnd,
}: DatePickerInputProps) {
  const effectiveMin = minDate || getTomorrow();

  const getInitialMonth = () => {
    if (value) return new Date(value + "T00:00:00").getMonth();
    return new Date(effectiveMin + "T00:00:00").getMonth();
  };
  const getInitialYear = () => {
    if (value) return new Date(value + "T00:00:00").getFullYear();
    return new Date(effectiveMin + "T00:00:00").getFullYear();
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth);
  const [currentYear, setCurrentYear] = useState(getInitialYear);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync displayed month when value changes externally
  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

  /** Monday-first offset */
  const getFirstDayOffset = (m: number, y: number) => {
    const day = new Date(y, m, 1).getDay(); // 0=Sun
    return (day + 6) % 7;
  };

  const makeDayStr = (day: number) =>
    `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isDisabled = (day: number) => makeDayStr(day) < effectiveMin;

  const isSelected = (day: number) => makeDayStr(day) === value;

  const isToday = (day: number) => makeDayStr(day) === toYMD(new Date());

  const isInRange = (day: number) => {
    if (!rangeStart || !rangeEnd) return false;
    const dStr = makeDayStr(day);
    return dStr > rangeStart && dStr < rangeEnd;
  };

  const isRangeEdge = (day: number) => {
    const dStr = makeDayStr(day);
    return dStr === rangeStart || dStr === rangeEnd;
  };

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    onChange(makeDayStr(day));
    setIsOpen(false);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const offset = getFirstDayOffset(currentMonth, currentYear);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Pad to complete last row
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    cells.push(...Array(7 - remainder).fill(null));
  }

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        className={`w-full flex items-center gap-2.5 px-3.5 py-3 bg-white border-2 rounded-xl text-left transition-all focus:outline-none
          ${isOpen ? "border-green-500 ring-2 ring-green-100" : "border-gray-200 hover:border-green-400"}`}
      >
        <CalendarDays className="w-4 h-4 text-green-600 shrink-0" />
        <span className={`text-sm ${value ? "text-gray-900 font-semibold" : "text-gray-400"}`}>
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 z-100 bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 w-[288px] select-none">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-5">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Previous month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-bold text-gray-900 text-sm">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              aria-label="Next month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="grid grid-cols-7 mb-1">
            {DAY_LABELS.map(d => (
              <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-y-1">
            {cells.map((day, idx) => {
              if (day === null) return <div key={`e-${idx}`} />;

              const disabled = isDisabled(day);
              const selected = isSelected(day);
              const inRange = isInRange(day);
              const rangeEdge = isRangeEdge(day);
              const todayFlag = isToday(day);

              return (
                <button
                  key={day}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleDayClick(day)}
                  className={[
                    "relative h-9 w-9 mx-auto text-[13px] rounded-full font-medium transition-all",
                    selected
                      ? "bg-green-600 text-white shadow-md shadow-green-200 scale-105"
                      : rangeEdge && !selected
                      ? "bg-green-500 text-white"
                      : inRange
                      ? "bg-green-50 text-green-800 rounded-none"
                      : !disabled
                      ? "hover:bg-green-50 hover:text-green-700 text-gray-800"
                      : "text-gray-300 cursor-not-allowed",
                    todayFlag && !selected
                      ? "font-bold underline decoration-green-500 decoration-2"
                      : "",
                    !disabled ? "cursor-pointer" : "",
                  ].join(" ")}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center gap-3 text-[11px] text-gray-400">
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-green-600 inline-block" />
              Selected
            </span>
            <span className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-gray-200 inline-block" />
              Unavailable
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
