import { useState } from "react";
import type { RouteId, ThemeId } from "@/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileDock } from "@/components/layout/MobileDock";
import { Hero } from "@/components/hero/Hero";
import { BoutiqueTours } from "@/components/tours/BoutiqueTours";
import { ThemeRail } from "@/components/themes/ThemeRail";
import { ThemeMaterials } from "@/components/themes/ThemeMaterials";
import { Timeline } from "@/components/itinerary/Timeline";
import { Explore } from "@/components/explore/Explore";
import { QuoteForm } from "@/components/form/QuoteForm";
import { CustomPlanFlow } from "@/components/plan/CustomPlanFlow";
import { TravelTools } from "@/components/tools/TravelTools";

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const [route, setRoute] = useState<RouteId>("r1");
  const [intent, setIntent] = useState<"boutique" | "custom">("custom");
  const [theme, setTheme] = useState<ThemeId>("wild");
  const [filterOn, setFilterOn] = useState(false);

  function onTheme(id: ThemeId) {
    if (id === theme && filterOn) {
      setFilterOn(false);
      return;
    }
    setTheme(id);
    setFilterOn(true);
  }

  function pickRoute(id: RouteId) {
    setRoute(id);
    go("itinerary");
  }

  function quoteBoutique(id: RouteId) {
    setRoute(id);
    setIntent("boutique");
    go("plan");
  }

  return (
    <>
      <Header onPlan={() => setIntent("custom")} />
      <main className="pb-[calc(72px+env(safe-area-inset-bottom))] md:pb-0">
        <Hero
          onPlanOwn={() => {
            setIntent("custom");
          }}
        />
        <BoutiqueTours route={route} onPick={pickRoute} onQuote={quoteBoutique}>
          <ThemeRail selected={theme} onSelect={onTheme} />
          <ThemeMaterials themeId={theme} />
          <Timeline
            routeId={route}
            onRoute={(id) => {
              setRoute(id);
            }}
            themeId={theme}
            filterOn={filterOn}
          />
        </BoutiqueTours>
        <Explore />
        {intent === "custom" ? (
          <CustomPlanFlow
            browsedRoute={route}
            browsedTheme={theme}
            themeFilterOn={filterOn}
          />
        ) : (
          <QuoteForm route={route} presetNotes="" />
        )}
        <TravelTools />
        <Footer />
      </main>
      <MobileDock
        onTours={() => go("tours")}
        onPlan={() => {
          setIntent("custom");
          go("plan");
        }}
      />
    </>
  );
}
