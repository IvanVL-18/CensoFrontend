import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";

const data = [
  { name:"Censo de prueba", total:14 },
  { name:"Censo Nacional", total:26 },
  { name:"Censo Yolo", total:22 },
  { name:"Censo Nac.", total:16 },
];

export default function BarQuestionnaires(){
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={30}>
          <CartesianGrid stroke="#eee" vertical={false}/>
          <XAxis dataKey="name" tick={{fontSize:12}} />
          <YAxis tick={{fontSize:12}} />
          <Tooltip />
          <Bar dataKey="total" fill="#C9A54C" radius={[6,6,0,0]} />
        </BarChart>
      </ResponsiveContainer>
      <div className="text-sm text-neutral-600 text-center -mt-2">Cuestionarios (Total de Preguntas)</div>
    </div>
  );
}
