const GraphicsSection = () => {
  return (
    <div className="w-full">
      {/* Header vino */}
      <div className="bg-[#691B31] text-white px-4 py-3 rounded-t-lg shadow-sm">
        <h2 className="text-2xl font-semibold tracking-wide">Gráficas</h2>
      </div>

      <div className="p-6 space-y-10 bg-white rounded-b-lg">
        {/* Donut “dummy” */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Tipo de Instituciones
          </h3>

          {/* Leyenda */}
          <div className="flex items-center gap-4 mb-4">
            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: "#6F7CF6" }}
              />
              Centralizadas
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-gray-700">
              <span
                className="inline-block w-3 h-3 rounded-sm"
                style={{ background: "#EDEDED" }}
              />
              Paraestatales
            </span>
          </div>

          {/* Donut */}
          <div className="mt-4 flex justify-center">
            <div className="relative group transition-transform duration-300 hover:scale-105">
              <svg width="180" height="180" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="16"
                  fill="#EDEDED"
                  className="transition-colors duration-300 group-hover:fill-[#DDD]"
                />
                <circle cx="18" cy="18" r="9" fill="white" />
                <path
                  d="M18 2 A16 16 0 0 1 34 18 L18 18 Z"
                  fill="#6F7CF6"
                  className="transition-opacity duration-300 group-hover:opacity-80"
                />
              </svg>

              {/* Etiqueta central */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold text-gray-800">72%</span>
                <span className="text-xs text-gray-500">Centralizadas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Barras “dummy” */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4 border-b border-gray-200 pb-2">
            Cuestionarios
          </h3>

          <div className="grid grid-cols-5 gap-4 items-end h-44">
            {[40, 85, 70, 55, 45].map((h, i) => (
              <div
                key={i}
                className="bg-[#B49060] rounded-md shadow-sm transition-all duration-300 hover:brightness-90"
                style={{
                  height: `${h}%`,
                  transitionDelay: `${i * 80}ms`,
                }}
              />
            ))}
          </div>

          {/* Etiquetas inferiores */}
          <div className="grid grid-cols-5 mt-3 text-xs text-gray-700 text-center">
            <span>Enero</span>
            <span>Febrero</span>
            <span>Marzo</span>
            <span>Abril</span>
            <span>Mayo</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicsSection;
