import ProfileMenu from "../pages/Profile/Profile";

export default function TopBar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-[var(--pantone-7421)] border-b border-black/10 shadow-sm">
      <div className="w-full h-14 px-4 flex items-center justify-end">
        <ProfileMenu />
      </div>
    </header>
  );
}