export default function Footer() {
  return (
    <>
      {/* 🔹 Franja superior con logos */}
      <section className="mt-25 bg-[#DDC9A3] backdrop-blur-sm flex justify-center items-center py-2">
        <h1 className="text-[#691B31] font-semibold mb-1 text-base">Dirección General de Tecnologías de la Información / Dirección De Desarrollo de Sistemas</h1>
      </section>


      {/* 🔹 Cuerpo del footer */}
      <footer className="bg-[#691B31] text-white py-8">
        <div className="max-w-screen-xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">

          {/* Logo izquierdo */}
          <div className="flex justify-center md:justify-start">
            <img
              src="/logohidalgo.sv"
              alt="Escudo del Estado de Hidalgo"
              className="h-30 object-contain"
            />
          </div>

          {/* Sección de contacto */}
          <div>
            <h3 className="text-[#C79D63] font-semibold mb-2 text-base">Ubicación</h3>
            <p className="text-sm leading-relaxed text-[#f3e9da]">
              CITNOVA | EDIFICIO INNOVACIÓN<br />
              Boulevard Circuito La Concepción #3<br />
              Colonia La Concepción, CP 42162,<br />
              San Agustín Tlaxiaca, Hidalgo
            </p>
          </div>

          {/* Redes sociales */}
          <div className="flex flex-col items-center md:items-end gap-3">
            <span className="text-[#C79D63] font-semibold">Síguenos en</span>
            <div className="flex gap-4">
              <a
                href="https://facebook.com"
                target="_blank"
                className="bg-[#7a2834] hover:bg-[#8c3341] p-2 rounded-md transition-colors"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f text-white text-lg"></i>
              </a>
              <a
                href="https://x.com"
                target="_blank"
                className="bg-[#7a2834] hover:bg-[#8c3341] p-2 rounded-md transition-colors"
                aria-label="X"
              >
                <i className="fab fa-x-twitter text-white text-lg"></i>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                className="bg-[#7a2834] hover:bg-[#8c3341] p-2 rounded-md transition-colors"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram text-white text-lg"></i>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                className="bg-[#7a2834] hover:bg-[#8c3341] p-2 rounded-md transition-colors"
                aria-label="YouTube"
              >
                <i className="fab fa-youtube text-white text-lg"></i>
              </a>
            </div>
          </div>
        </div>

        {/* Línea inferior */}
        <div className="text-center text-xs text-[#cfcfcf] mt-8 border-t border-[#74454b] pt-4">
          © 2025 Gobierno del Estado de Hidalgo
        </div>
      </footer>
    </>
  )
}
