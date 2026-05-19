import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/Stats";
import ContactSection from "../components/ContactSection";
import Footer from "../components/Footer";

export default function Home(){
  return(
    <div className="bg-white">
      <Navbar/>
      <div className="pt-24">
        <Hero/>
        <Features/>
        <HowItWorks/>
        <Stats/>
        <ContactSection/>
        <Footer/>
      </div>
    </div>
  );
}
