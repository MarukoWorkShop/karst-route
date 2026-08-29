import { useState } from "react";
import type { RouteId, ThemeId } from "@/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileDock } from "@/components/layout/MobileDock";
import { Hero } from "@/components/hero/Hero";
import { BoutiqueTours } from "@/components/tours/BoutiqueTours";
import { Timeline } from "@/components/itinerary/Timeline";
import { Experience } from "@/components/experience/Experience";
import { Explore } from "@/components/explore/Explore";
import { PlanSection } from "@/components/plan/PlanSection";
import { TravelTools } from "@/components/tools/TravelTools";
import { Partners } from "@/components/partners/Partners";

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const [route, setRoute] = useState<RouteId>("r1");
  const [intent, setIntent] = useState<"boutique" | "custom">("custom");
  const [theme, setTheme] = useState<ThemeId>("wild");
  const [filterOn, setFilterOn] = useState(false);
  const [experienceOpen, setExperienceOpen] = useState<ThemeId | null>(null);

  function onTheme(id: ThemeId) {
    if (id === theme && filterOn) {
      setFilterOn(false);
      return;
    }
    setTheme(id);
    setFilterOn(true);
  }

  function openExperienceArticle(id: ThemeId) {
    setTheme(id);
    setFilterOn(true);
    setExperienceOpen(id);
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
      <main className="bg-paper">
        <Hero
          onPlanOwn={() => {
            setIntent("custom");
          }}
          onOpenTheme={openExperienceArticle}
        />
        <BoutiqueTours route={route} onPick={pickRoute} onQuote={quoteBoutique} />
        <Timeline
          routeId={route}
          onRoute={(id) => {
            setRoute(id);
          }}
          themeId={theme}
          filterOn={filterOn}
        />
        <Experience
          openId={experienceOpen}
          onOpenId={setExperienceOpen}
          onPickTheme={onTheme}
        />
        <Explore />
        <PlanSection
          tab={intent}
          onTab={setIntent}
          route={route}
          browsedTheme={theme}
          themeFilterOn={filterOn}
        />
        <TravelTools />
        <Partners />
      </main>
      <Footer />
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
