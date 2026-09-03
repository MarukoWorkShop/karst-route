import { useEffect, useRef, useState } from "react";
import type { RouteId } from "@/types";
import { copy } from "@/i18n/copy";
import { useLocale } from "@/i18n/LocaleProvider";
import { ReviewsFold } from "@/components/itinerary/ReviewsFold";
import { downloadRouteItineraryPdf } from "@/lib/routeItineraryPdf";
import { IconDownload } from "@/components/plan/PlanUi";
import { IconChevron } from "@/components/icons";

export function ItineraryCtas({
  routeId,
  onPlanQuote,
}: {
  routeId: RouteId;
  onPlanQuote: (routeId: RouteId) => void;
}) {
  const { t, locale } = useLocale();
  const [pdfBusy, setPdfBusy] = useState(false);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const reviewsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReviewsOpen(false);
  }, [routeId]);

  async function handlePdf() {
    setPdfBusy(true);
    try {
      await downloadRouteItineraryPdf(routeId, t, locale);
    } finally {
      setPdfBusy(false);
    }
  }

  function handleReviews() {
    setReviewsOpen((open) => {
      const next = !open;
      if (next) {
        requestAnimationFrame(() => {
          reviewsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });
      }
      return next;
    });
  }

  return (
    <div className="mt-6 pb-3">
      <div className="flex flex-col gap-2.5">
        <button
          type="button"
          disabled={pdfBusy}
          onClick={handlePdf}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-line bg-surface px-4 py-[11px] text-[13px] font-medium text-ink transition-colors hover:border-cta/40 disabled:opacity-60"
        >
          <IconDownload />
          {pdfBusy ? t(copy.tours.book.downloadingPdf) : t(copy.tours.book.downloadRoutePdf)}
        </button>
        <button
          type="button"
          aria-expanded={reviewsOpen}
          onClick={handleReviews}
          className={`flex w-full items-center justify-center gap-1.5 rounded-lg border px-4 py-[11px] text-[13px] font-medium transition-colors ${
            reviewsOpen
              ? "border-cta bg-cta/8 text-cta"
              : "border-line bg-surface text-ink hover:border-cta/40"
          }`}
        >
          <StarMark />
          {t(copy.tours.book.routeReviews)}
          <IconChevron className={`h-3.5 w-3.5 transition ${reviewsOpen ? "rotate-180" : ""}`} />
        </button>
        <button
          type="button"
          onClick={() => onPlanQuote(routeId)}
          className="cta-sheen flex w-full items-center justify-center gap-2 rounded-lg bg-cta px-4 py-[11px] text-[13px] font-medium text-paper transition-colors hover:bg-cta-press"
        >
          {t(copy.tours.book.customizeQuote)}
          <IconChevron className="h-3.5 w-3.5 -rotate-90" />
        </button>
      </div>
      <div ref={reviewsRef}>
        <ReviewsFold
          routeId={routeId}
          open={reviewsOpen}
          onOpenChange={setReviewsOpen}
          hideTrigger
        />
      </div>
    </div>
  );
}

function StarMark() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="currentColor" aria-hidden>
      <path d="M6.5 1.5l1.35 2.74 3.02.44-2.19 2.13.52 3.02L6.5 8.25l-2.7 1.58.52-3.02L2.13 4.68l3.02-.44z" />
    </svg>
  );
}
