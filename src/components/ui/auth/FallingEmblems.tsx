type Drop = {
  left: string;   // posición horizontal
  top: string;    // posición vertical
  size: string;   // tamaño (e.g. "h-10")
  delay: string;  // retardo para la animación
};

const DROPS: Drop[] = [
  { left: "10%", top: "15%", size: "h-12 md:h-16", delay: "[animation-delay:0s]" },
  { left: "25%", top: "40%", size: "h-10 md:h-14", delay: "[animation-delay:0.8s]" },
  { left: "45%", top: "20%", size: "h-14 md:h-20", delay: "[animation-delay:1.2s]" },
  { left: "65%", top: "50%", size: "h-12 md:h-16", delay: "[animation-delay:0.6s]" },
  { left: "80%", top: "30%", size: "h-10 md:h-14", delay: "[animation-delay:1.6s]" },
  { left: "15%", top: "70%", size: "h-10 md:h-14", delay: "[animation-delay:1s]" },
  { left: "75%", top: "75%", size: "h-14 md:h-20", delay: "[animation-delay:1.4s]" },
  { left: "50%", top: "80%", size: "h-10 md:h-14", delay: "[animation-delay:0.4s]" },
];

export default function FallingEmblems() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {DROPS.map((d, i) => (
        <img
          key={i}
          src="/public/estrella.png" // ← tu mini-logo
          alt=""
          className={[
            "absolute object-contain opacity-70 animate-[zoomIn_4s_ease-in-out_infinite]",
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
