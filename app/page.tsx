import Hero from "@/components/sections/Hero";
import Showcase from "@/components/sections/Showcase";
import Marquee from "@/components/Marquee";
import Showroom from "@/components/sections/Showroom";
import ClassFlip from "@/components/sections/ClassFlip";
import SpecIndex from "@/components/sections/SpecIndex";
import Outro from "@/components/sections/Outro";

export default function Home() {
  return (
    <>
      <Showcase>
        <Hero />
        <Marquee
        items={[
          "CAN BUS",
          "LTE-M",
          "NB-IOT",
          "IP68",
          "GNSS",
          "SOLAR",
          "NFC",
          "QR",
          "5 YEAR BATTERY",
          "PLUG AND PLAY",
        ]}
        />
        <Showroom />
      </Showcase>
      <ClassFlip />
      <SpecIndex />
      <Outro />
    </>
  );
}
