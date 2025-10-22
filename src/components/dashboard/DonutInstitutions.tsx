import { Pie, PieChart, Cell, ResponsiveContainer } from "recharts";

const data = [
  { name: "Centralizadas", value: 86 },
  { name: "Otras", value: 14 },
];
const COLORS = ["#5F71E2", "#E6E8F6"];

export default function DonutInstitutions(){
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={70}
            outerRadius={95}
            paddingAngle={1}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="text-sm text-neutral-600 text-center -mt-6">Tipo de Instituciones</div>
    </div>
  );
}
