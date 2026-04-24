"use client";

import * as React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { addDays, format, subMonths, startOfMonth, endOfMonth, startOfYear, endOfYear, subDays } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTimeframe = searchParams.get("timeframe") || "this_month";
  const startParam = searchParams.get("start");
  const endParam = searchParams.get("end");

  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startParam ? new Date(startParam) : undefined,
    to: endParam ? new Date(endParam) : undefined,
  });

  // Keep local state for open popup so we can close it automatically when user selects valid range
  const [isCalendarOpen, setIsCalendarOpen] = React.useState(false);

  const updateURLParams = React.useCallback(
    (params: Record<string, string | null>) => {
      const newSearchParams = new URLSearchParams(searchParams.toString());
      Object.entries(params).forEach(([key, value]) => {
        if (value === null) {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, value);
        }
      });
      router.push(`${pathname}?${newSearchParams.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleTimeframeChange = (timeframe: string) => {
    if (timeframe === "custom") {
      updateURLParams({ timeframe });
      return;
    }

    updateURLParams({
      timeframe,
      start: null,
      end: null,
    });
  };

  const handleCustomDateSelect = (range: DateRange | undefined) => {
    setDate(range);
    if (range?.from && range?.to) {
      updateURLParams({
        timeframe: "custom",
        start: format(range.from, "yyyy-MM-dd"),
        end: format(range.to, "yyyy-MM-dd"),
      });
      setIsCalendarOpen(false);
    }
  };

  const timeframes = [
    { value: "this_month", label: "This Month" },
    { value: "last_month", label: "Last Month" },
    { value: "this_year", label: "This Year" },
    { value: "all_time", label: "All Time" },
    { value: "custom", label: "Custom Dates" },
  ];

  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-white p-2 rounded-xl shadow-sm border border-gray-100 mb-6">
      <div className="flex flex-wrap items-center gap-1">
        {timeframes.map((tf) => (
          <Button
            key={tf.value}
            variant={currentTimeframe === tf.value ? "default" : "ghost"}
            size="sm"
            onClick={() => handleTimeframeChange(tf.value)}
            className="rounded-lg text-sm font-medium"
          >
            {tf.label}
          </Button>
        ))}
      </div>

      {currentTimeframe === "custom" && (
        <div className="flex items-center ml-auto">
          <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                size="sm"
                className={cn(
                  "w-[260px] justify-start text-left font-normal rounded-lg",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "LLL dd, y")} -{" "}
                      {format(date.to, "LLL dd, y")}
                    </>
                  ) : (
                    format(date.from, "LLL dd, y")
                  )
                ) : (
                  <span>Pick a date range</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleCustomDateSelect}
                numberOfMonths={2}
              />
            </PopoverContent>
          </Popover>
        </div>
      )}
    </div>
  );
}
