import TopBar from "../components/TopBar";
import LoginCard from "../components/LoginCard";
import Footer from "../components/Footer";
import FallingEmblems from "../components/FallingEmblems";

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
