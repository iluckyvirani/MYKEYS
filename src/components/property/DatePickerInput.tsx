"use client";

import { useState, useRef, useEffect, useCallback, useId } from "react";
import { createPortal } from "react-dom";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";

interface DatePickerInputProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  label: string;
  /** Earliest selectable date as YYYY-MM-DD. Defaults to tomorrow. */
  minDate?: string;
  placeholder?: string;
  rangeEnd?: string;
  rangeStart?: string;
  /** Prefer calendar anchor: auto flips to stay in viewport */
  align?: "start" | "end" | "auto";
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAY_LABELS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
const CALENDAR_WIDTH = 300;
const CALENDAR_HEIGHT_ESTIMATE = 360;

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
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatInputHint(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Parse typed date: DD/MM/YYYY, DD-MM-YYYY, or YYYY-MM-DD */
function parseTypedDate(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const d = new Date(trimmed + "T00:00:00");
    return Number.isNaN(d.getTime()) ? null : trimmed;
  }

  const slash = trimmed.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (slash) {
    const day = parseInt(slash[1], 10);
    const month = parseInt(slash[2], 10);
    const year = parseInt(slash[3], 10);
    if (month < 1 || month > 12 || day < 1 || day > 31) return null;
    const d = new Date(year, month - 1, day);
    if (
      d.getFullYear() !== year ||
      d.getMonth() !== month - 1 ||
      d.getDate() !== day
    ) {
      return null;
    }
    return toYMD(d);
  }

  return null;
}

export function DatePickerInput({
  value,
  onChange,
  label,
  minDate,
  placeholder = "DD/MM/YYYY",
  rangeStart,
  rangeEnd,
  align = "auto",
}: DatePickerInputProps) {
  const effectiveMin = minDate || getTomorrow();
  const inputId = useId();

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
  const [textValue, setTextValue] = useState(value ? formatInputHint(value) : "");
  const [inputError, setInputError] = useState("");
  const [calendarPos, setCalendarPos] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setTextValue(value ? formatInputHint(value) : "");
    setInputError("");
  }, [value]);

  useEffect(() => {
    if (value) {
      const d = new Date(value + "T00:00:00");
      setCurrentMonth(d.getMonth());
      setCurrentYear(d.getFullYear());
    }
  }, [value]);

  const updateCalendarPosition = useCallback(() => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const padding = 8;
    let left =
      align === "end"
        ? rect.right - CALENDAR_WIDTH
        : align === "start"
        ? rect.left
        : rect.left;

    if (align === "auto" || align === "start") {
      if (left + CALENDAR_WIDTH > window.innerWidth - padding) {
        left = window.innerWidth - CALENDAR_WIDTH - padding;
      }
      if (left < padding) left = padding;
    }
    if (align === "end") {
      if (left < padding) left = padding;
    }

    let top = rect.bottom + padding;
    if (top + CALENDAR_HEIGHT_ESTIMATE > window.innerHeight - padding) {
      top = Math.max(padding, rect.top - CALENDAR_HEIGHT_ESTIMATE - padding);
    }

    setCalendarPos({ top, left });
  }, [align]);

  useEffect(() => {
    if (!isOpen) return;

    updateCalendarPosition();
    const onScrollOrResize = () => updateCalendarPosition();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);

    const handlePointerDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        calendarRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      document.removeEventListener("mousedown", handlePointerDown);
    };
  }, [isOpen, updateCalendarPosition]);

  const getDaysInMonth = (m: number, y: number) => new Date(y, m + 1, 0).getDate();

  const getFirstDayOffset = (m: number, y: number) => {
    const day = new Date(y, m, 1).getDay();
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
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else setCurrentMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else setCurrentMonth((m) => m + 1);
  };

  const applyDate = (ymd: string) => {
    if (ymd < effectiveMin) {
      setInputError(`Date must be on or after ${formatInputHint(effectiveMin)}`);
      return;
    }
    setInputError("");
    onChange(ymd);
    setTextValue(formatInputHint(ymd));
    setIsOpen(false);
  };

  const handleDayClick = (day: number) => {
    if (isDisabled(day)) return;
    applyDate(makeDayStr(day));
  };

  const commitTypedValue = () => {
    if (!textValue.trim()) {
      setInputError("");
      onChange("");
      return;
    }
    const parsed = parseTypedDate(textValue);
    if (!parsed) {
      setInputError("Use DD/MM/YYYY (e.g. 15/06/2026)");
      return;
    }
    applyDate(parsed);
  };

  const openCalendar = () => {
    updateCalendarPosition();
    setIsOpen(true);
  };

  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const offset = getFirstDayOffset(currentMonth, currentYear);
  const cells: (number | null)[] = [
    ...Array(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  const remainder = cells.length % 7;
  if (remainder !== 0) {
    cells.push(...Array(7 - remainder).fill(null));
  }

  const calendarPanel = isOpen && mounted && (
    <div
      ref={calendarRef}
      role="dialog"
      aria-label={`${label} calendar`}
      className="fixed z-[200] bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-5 select-none max-w-[calc(100vw-16px)]"
      style={{
        top: calendarPos.top,
        left: calendarPos.left,
        width: CALENDAR_WIDTH,
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={prevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
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
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 mb-1">
        {DAY_LABELS.map((d) => (
          <div key={d} className="text-center text-[11px] font-bold text-gray-400 py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-0.5">
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
                  ? "bg-green-600 text-white shadow-md shadow-green-200"
                  : rangeEdge && !selected
                  ? "bg-green-500 text-white"
                  : inRange
                  ? "bg-green-50 text-green-800 rounded-none w-full"
                  : !disabled
                  ? "hover:bg-green-50 hover:text-green-700 text-gray-800 cursor-pointer"
                  : "text-gray-300 cursor-not-allowed",
                todayFlag && !selected
                  ? "ring-1 ring-green-400 ring-inset"
                  : "",
              ].join(" ")}
            >
              {day}
            </button>
          );
        })}
      </div>

      <p className="mt-3 pt-3 border-t border-gray-100 text-[11px] text-gray-500 text-center">
        Tap a date or type {placeholder} in the field
      </p>
    </div>
  );

  return (
    <div className="relative min-w-0" ref={containerRef}>
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5"
      >
        {label}
      </label>

      <div
        ref={triggerRef}
        className={`flex items-stretch bg-white border-2 rounded-xl overflow-hidden transition-all
          ${isOpen || inputError ? "border-green-500 ring-2 ring-green-100" : "border-gray-200 hover:border-green-400"}`}
      >
        <input
          id={inputId}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder={placeholder}
          value={textValue}
          onChange={(e) => {
            setTextValue(e.target.value);
            setInputError("");
          }}
          onBlur={commitTypedValue}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              commitTypedValue();
            }
            if (e.key === "Escape") setIsOpen(false);
          }}
          className="flex-1 min-w-0 px-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none bg-transparent"
          aria-invalid={Boolean(inputError)}
          aria-describedby={inputError ? `${inputId}-error` : undefined}
        />
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
          className="shrink-0 px-3 border-l border-gray-100 text-green-600 hover:bg-green-50 transition-colors"
          aria-label={`Open calendar for ${label}`}
          aria-expanded={isOpen}
        >
          <CalendarDays className="w-5 h-5" />
        </button>
      </div>

      {value && !inputError && (
        <p className="mt-1 text-[11px] text-gray-500 truncate" title={formatDisplay(value)}>
          {formatDisplay(value)}
        </p>
      )}

      {inputError && (
        <p id={`${inputId}-error`} className="mt-1 text-xs text-red-600">
          {inputError}
        </p>
      )}

      {mounted && calendarPanel && createPortal(calendarPanel, document.body)}
    </div>
  );
}
