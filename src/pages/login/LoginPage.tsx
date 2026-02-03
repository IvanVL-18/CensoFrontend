import TopBar from "./TopBar";
import LoginCard from "./LoginCard";
import Footer from "./Footer";
import FallingEmblems from "./FallingEmblems";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#691B31] text-white">
      <TopBar />

      <section className="relative pt-10 pb-6">
        <FallingEmblems />
        <div className="relative z-10 mt-4 flex items-start justify-center">
          <LoginCard />
        </div>
      </section>

      <Footer />
    </div>
  );
}
