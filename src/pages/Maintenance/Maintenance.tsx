import { useEffect } from "react";
import { Wrench } from "lucide-react";
import FallingEmblems from "../login/components/FallingEmblems";
import CensusNetwork from "./components/CensusNetwork";

export default function Maintenance() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Sistema en mantenimiento";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-[#691B31] text-white">
      {/* Fondo: retícula sutil, resplandor y estrellas */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgb(221_201_163/0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgb(221_201_163/0.06)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#A02142]/40 blur-3xl lg:left-[68%]"
      />
      <FallingEmblems />

      <header className="relative z-10 flex items-center justify-center p-4 sm:p-6">
        <img
          src="/logo_gobierno_gold.png"
          alt="Gobierno del Estado de Hidalgo"
          className="h-16 object-contain sm:h-20"
        />
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 flex-col-reverse items-center gap-8 px-4 pb-10 sm:px-6 lg:flex-row lg:gap-12">
        <section className="max-w-xl text-center lg:flex-1 lg:text-left">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#DDC9A3]/30 bg-[#DDC9A3]/10 px-3 py-1 font-montserrat text-xs font-medium text-[#DDC9A3]">
            <Wrench className="size-3.5" />
            Temporalmente fuera de servicio
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl">
            Sistema de Censos en mantenimiento
          </h1>

          <p className="mt-4 font-montserrat text-base text-pretty text-[#f3e9da]/85 sm:text-lg">
            Estamos realizando mejoras en la plataforma. El servicio no está
            disponible en este momento, pero trabajamos para restablecerlo lo
            antes posible. Tus respuestas guardadas están seguras.
          </p>

          <div className="mt-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/3 animate-[maintenance-progress_2.4s_ease-in-out_infinite] rounded-full bg-[linear-gradient(to_right,#B49060,#C3A67C,#D4C09B)] motion-reduce:animate-none" />
          </div>
        </section>

        <div className="relative aspect-square w-full max-w-[20rem] sm:max-w-md lg:max-w-none lg:flex-1">
          <CensusNetwork className="size-full" />
          <img
            src="/EstrellaB.svg"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute top-1/2 left-1/2 w-[9%] -translate-x-1/2 -translate-y-1/2 object-contain"
          />
        </div>
      </main>

      <footer className="relative z-10 border-t border-[#DDC9A3]/15 p-4 text-center font-montserrat text-xs text-[#f3e9da]/70 sm:p-6">
        Gracias por tu paciencia · © {new Date().getFullYear()} Gobierno del
        Estado de Hidalgo
      </footer>
    </div>
  );
}
