import React from "react";
import mark from "../../public/Estrella_header.svg";

type LoadingProps = {
  size?: number;
  fullScreen?: boolean;
  center?: boolean;
  className?: string;
  speedSeconds?: number;
  ariaLabel?: string;
  src?: string;
};

export default function Loading({
  size = 56,
  fullScreen = false,
  center = true,
  className = "",
  speedSeconds = 1.1,
  ariaLabel = "Cargando",
  src,
}: LoadingProps) {
  const imgSrc = src ?? mark;

  const overlayStyle: React.CSSProperties = {
    width: size,
    height: size,
    animation: `loadingSpin ${speedSeconds}s linear infinite`,
  };

  const buildStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
    WebkitMaskImage: `conic-gradient(#000 0 var(--p, 0%), transparent 0)`,
    maskImage: `conic-gradient(#000 0 var(--p, 0%), transparent 0)`,
    animation: `loadingBuild ${speedSeconds}s ease-in-out infinite`,
  };

  const content = (
    <div
      className={[
        "flex items-center gap-3",
        center ? "justify-center" : "",
        className,
      ].join(" ")}
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={ariaLabel}
    >
      <span
        className="relative inline-block"
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        <img
          src={imgSrc}
          alt=""
          className="w-full h-full object-contain opacity-15 grayscale"
          draggable={false}
        />

        <span className="absolute inset-0" style={overlayStyle}>
          <img
            src={imgSrc}
            alt=""
            className="w-full h-full object-contain"
            style={buildStyle}
            draggable={false}
          />
        </span>
      </span>
      
      <style>{`
        @keyframes loadingSpin { to { transform: rotate(360deg); } }
        @keyframes loadingBuild {
          0%   { --p: 0%;   transform: scale(.92); opacity: .35; filter: blur(1.2px); }
          35%  { --p: 55%;  transform: scale(1.00); opacity: .95; filter: blur(0px); }
          100% { --p: 100%; transform: scale(1.00); opacity: 1; }
        }
      `}</style>
    </div>
  );

  if (!fullScreen) return content;

  return (
    <div className="fixed inset-0 z-[9999] grid place-items-center bg-black/10 backdrop-blur-sm">
      {content}
    </div>
  );
}