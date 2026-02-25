import ProfileMenu from "../pages/Profile/Profile";

export default function TopBar() {
  return (
    <div className="w-full bg-[var(--pantone-7421)] border-b border-black/10 shadow-sm py-3">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-end">
        <ProfileMenu />
      </div>
    </div>
  );
}
