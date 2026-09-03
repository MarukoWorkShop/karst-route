import { useEffect, useState } from "react";
import type { RouteId, ThemeId } from "@/types";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { MobileDock } from "@/components/layout/MobileDock";
import { Hero } from "@/components/hero/Hero";
import { BoutiqueTours } from "@/components/tours/BoutiqueTours";
import { Timeline } from "@/components/itinerary/Timeline";
import { Experience } from "@/components/experience/Experience";
import { About } from "@/components/about/About";
import { Explore } from "@/components/explore/Explore";
import { PlanSection } from "@/components/plan/PlanSection";
import { Faq } from "@/components/faq/Faq";
import { Partners } from "@/components/partners/Partners";

function go(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

export default function App() {
  const [route, setRoute] = useState<RouteId>("r1");
  const [intent, setIntent] = useState<"boutique" | "custom">("boutique");
  const [experienceOpen, setExperienceOpen] = useState<ThemeId | null>(null);

  // 首屏（Hero）占据视野时收起底部导航，让画面整屏呈现
  const [heroInView, setHeroInView] = useState(true);

  useEffect(() => {
    const el = document.getElementById("top");
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setHeroInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  function openItinerary(id: RouteId) {
    setRoute(id);
    go("itinerary");
  }

  return (
    <>
      <Header onPlan={() => setIntent("custom")} />
      <main className="bg-paper">
        <Hero
          onPlanOwn={() => {
            setIntent("custom");
          }}
        />
        <BoutiqueTours
          route={route}
          onSelect={setRoute}
          onOpenItinerary={openItinerary}
        />
        <Timeline
          routeId={route}
          onRoute={(id) => {
            setRoute(id);
          }}
          onPlanQuote={(id) => {
            setRoute(id);
            setIntent("boutique");
            go("plan");
          }}
        />
        <Experience openId={experienceOpen} onOpenId={setExperienceOpen} />
        <About />
        <PlanSection tab={intent} onTab={setIntent} route={route} />
        <Explore />
        <Faq />
        <Partners />
      </main>
      <Footer />
      <MobileDock
        hidden={heroInView}
        onTours={() => go("tours")}
        onPlan={() => {
          setIntent("custom");
          go("plan");
        }}
      />
    </>
  );
}
