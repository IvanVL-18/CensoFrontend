import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

const GraphicsSection = () => {
  const COLORS = ["#7B7BFF"];
  const dataPie = [{ name: "Centralizadas", value: 100 }];
  const dataBar = [
    { name: "Censo de prueba", preguntas: 15 },
    { name: "Censo Nacional", preguntas: 35 },
    { name: "Censo Yeob", preguntas: 30 },
    { name: "Censo Naci.", preguntas: 25 },
  ];

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <h2 className="bg-[#8B0015] text-white font-semibold text-lg rounded-t-md px-4 py-2 mb-4">
        Gráficas
      </h2>

      {/* Tipo de Instituciones */}
      <div className="flex flex-col lg:flex-row gap-6 items-center justify-center">
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold mb-2">Tipo de Instituciones</h3>
          <ResponsiveContainer width={180} height={180}>
            <PieChart>
              <Pie
                data={dataPie}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={70}
                dataKey="value"
              >
                {dataPie.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <p className="text-xs mt-1 text-[#7B7BFF]">Centralizadas</p>
        </div>

        {/* Cuestionarios */}
        <div className="flex-1">
          <h3 className="text-sm font-semibold mb-2 text-center">Cuestionarios</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dataBar}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="preguntas" fill="#CBAF87" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default GraphicsSection;
