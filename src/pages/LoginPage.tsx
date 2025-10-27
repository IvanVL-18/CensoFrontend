import TopBar from "../components/ui/layout/TopBar"
import LoginCard from "../components/ui/auth/LoginCard"
import Footer from "../components/ui/layout/Footer"
import FallingEmblems from "../components/ui/auth/FallingEmblems"

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#420c1a] text-white">
      <TopBar />

      {/* Zona con partículas */}
      <section className="relative pt-10 pb-6">
        <FallingEmblems />

        <header className="relative z-10 flex flex-col items-center gap-4">
          <h1
            className="text-center tracking-[0.05em] font-extrabold text-[#decba4] text-3xl md:text-2xl font-[Nunito]"
          >
            CENSOS DEL ESTADO DE HIDALGO
          </h1>
        </header>

        {/* Tarjeta encima de las partículas */}
        <div className="relative z-10 mt-4 flex items-start justify-center">
          <LoginCard />
        </div>
      </section>

      <Footer />
    </div>
  )
}
