export default function FooterBar() {
  return (
    <div className="w-full bg-[#FFFFFF] py-3 flex items-center justify-center gap-5">
      <img
        src="/Estrella_header.svg"
        alt="Logo 1"
        className="h-12 object-contain"
      />

      {/* Texto alineado a la izquierda como en la imagen */}
      <div className="flex flex-col leading-tight">
        <span className="text-[#691B31] font-semibold text-lg md:text-xl">
          Gobierno del Estado de
        </span>
        <span className="text-[#691B31] font-semibold text-lg md:text-xl">
          Hidalgo
        </span>
      </div>

      <div className="h-10 w-[1px] bg-[#E6D8B5]" />
      <img src="/SNIEG.png" alt="Logo 2" className="h-14 object-contain" />

      <div className="h-10 w-[1px] bg-[#E6D8B5]" />
      <img src="/logo-inegi.png" alt="Logo 1" className="h-8 object-contain" />
    </div>
  );
}
