export default function TopBar() {
  return (
    <div className="w-full bg-[var(--pantone-7421)] border-b border-black/10 shadow-sm py-2 flex justify-center items-center">
       <div className="flex justify-center items-center">
        <img
          src="/Hidalgo_log.svg"
          alt="Escudo del Estado de Hidalgo"
          className="max-h-6 w-auto object-contain"
        />
      </div>
    </div>
  );
}
