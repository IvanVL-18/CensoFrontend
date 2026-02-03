type Drop = {
  left: string;
  top: string;
  size: string;
  delay: string;
};

const DROPS: Drop[] = [
  { left: "2%", top: "1%", size: "h-6 md:h-8", delay: "[animation-delay:0s]" },
  { left: "17%", top: "5%", size: "h-6 md:h-8", delay: "[animation-delay:0s]" },
  { left: "22%", top: "70%", size: "h-6 md:h-8", delay: "[animation-delay:0.6s]" },
  { left: "12%", top: "35%", size: "h-6 md:h-8", delay: "[animation-delay:0.2s]" },
  { left: "28%", top: "18%", size: "h-6 md:h-8", delay: "[animation-delay:0.3s]" },
  { left: "7%", top: "85%", size: "h-6 md:h-8", delay: "[animation-delay:1s]" },

  { left: "67%", top: "30%", size: "h-6 md:h-8", delay: "[animation-delay:0.6s]" },
  { left: "80%", top: "52%", size: "h-6 md:h-8", delay: "[animation-delay:0.6s]" },
  { left: "95%", top: "25%", size: "h-6 md:h-8", delay: "[animation-delay:0.6s]" },
  { left: "80%", top: "5%", size: "h-6 md:h-8", delay: "[animation-delay:0.6s]" },
  { left: "90%", top: "80%", size: "h-6 md:h-8", delay: "[animation-delay:0.4s]" },
  { left: "70%", top: "80%", size: "h-6 md:h-8", delay: "[animation-delay:0.4s]" },
];

export default function FallingEmblems() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {DROPS.map((d: Drop, i: number) => (
        <img
  key={i}
  src="/EstrellaB.svg"
  alt=""
  className={[
    "absolute object-contain opacity-70 animate-star-infinite",
    d.size,
    d.delay,
  ].join(" ")}
  style={{
    left: d.left,
    top: d.top,
  }}
/>

      ))}
    </div>
  );
}
