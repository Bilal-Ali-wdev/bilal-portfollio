import Header from "@/components/Header";
import Hero from "@/components/sections/Hero";
import Intro from "@/components/sections/Intro";
import Works from "@/components/sections/Works";
import Experiments from "@/components/sections/Experiments";
import About from "@/components/sections/About";
import Stack from "@/components/sections/Stack";
import Quote from "@/components/sections/Quote";
import Footer from "@/components/sections/Footer";

export default function Home() {
  return (
    <>
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
        <div className="rule" />
        <Quote />
        <Footer />
      </main>
    </>
  );
}
