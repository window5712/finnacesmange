"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "../../../supabase/client";
import { logger } from "@/utils/logger";

export function RealtimeSync() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    logger.info("RealtimeSync: Initializing subscriptions");

    const channel = supabase
      .channel("company_updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "income" },
        () => {
          logger.info("RealtimeSync: Change detected in income, refreshing...");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "expenses" },
        () => {
          logger.info("RealtimeSync: Change detected in expenses, refreshing...");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "salaries" },
        () => {
          logger.info("RealtimeSync: Change detected in salaries, refreshing...");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "investments" },
        () => {
          logger.info("RealtimeSync: Change detected in investments, refreshing...");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "partner_transactions" },
        () => {
          logger.info("RealtimeSync: Change detected in partner_transactions, refreshing...");
          router.refresh();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "activity_log" },
        () => {
          logger.info("RealtimeSync: Change detected in activity_log, refreshing...");
          router.refresh();
        }
      )
      .subscribe((status) => {
        logger.info(`RealtimeSync: Subscription status: ${status}`);
      });

    return () => {
      logger.info("RealtimeSync: Cleaning up subscriptions");
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  return null; // This component doesn't render anything
}
