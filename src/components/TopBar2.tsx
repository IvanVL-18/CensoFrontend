export default function TopBar() {
  return (
    <div className="w-full bg-[var(--pantone-7421)] border-b border-black/10 shadow-sm py-2 flex justify-center items-center">
      <img
        src="/logoHidalgo.png"
        alt="Escudo del Estado de Hidalgo"
        className="h-16 md:h-12 object-contain scale-250"
      />
    </div>
  );
}
