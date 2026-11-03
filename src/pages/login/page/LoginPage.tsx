import { Navigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import LoginCard from "../components/LoginCard";
import Footer from "../../../components/Footer";
import FallingEmblems from "../components/FallingEmblems";
import { useAuthContext } from "../../../context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, isHydrating } = useAuthContext();

  if (isHydrating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#691B31]">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-white border-t-transparent" />
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/inicio" replace />;

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#691B31] text-white">
      <TopBar />
      <section className="relative flex-grow pt-10 pb-16">
        <FallingEmblems />
        <div className="relative z-10 mt-4 flex items-start justify-center">
          <LoginCard />
        </div>
      </section>
      <Footer />
    </div>
  );
}
