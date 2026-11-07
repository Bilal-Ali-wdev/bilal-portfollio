import Preloader from "@/components/Preloader";
import BookCallModal from "@/components/BookCallModal";
import ScrollRail from "@/components/ScrollRail";
import WeatherSky from "@/components/WeatherSky";
import ScrollFX from "@/components/ScrollFX";
import VelocityMarquee from "@/components/VelocityMarquee";
import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Works from "@/components/sections/Works";
import Experiments from "@/components/sections/Experiments";
import About from "@/components/sections/About";
import Stack from "@/components/sections/Stack";
import Quote from "@/components/sections/Quote";
import Footer from "@/components/sections/Footer";
import { marquee } from "@/data/site";

export default function Home() {
  return (
    <>
      <Preloader />
      <ScrollFX />
      <BookCallModal />
      <ScrollRail />
      <WeatherSky />
      <Header />
      <main className="frame-main">
        <div className="rule-bleed" />
        <span className="corner corner-l" aria-hidden="true" />
        <span className="corner corner-r" aria-hidden="true" />

        <Hero />
        <div className="rule" />
        <Intro />
        <div className="rule" />
        <Works />
        <div className="rule" />
        <Experiments />
        <div className="rule" />
        <About />
        <div className="rule" />
        <Stack />
        <VelocityMarquee items={marquee} />
        <Quote />
        <Footer />
      </main>
    </>
  );
}
