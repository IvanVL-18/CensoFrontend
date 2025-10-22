import { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";

type Row = { id:number; name:string; questions:number; };
const MOCK: Row[] = [
  {id:1,name:"Censo prueba",questions:15},
  {id:2,name:"Censo casa",questions:200},
  {id:3,name:"Censo nacional",questions:52},
  {id:4,name:"Censo juvenil",questions:101},
  {id:5,name:"Censo edad",questions:12},
  {id:6,name:"Censo deportes",questions:10},
  {id:7,name:"Censo alumbrado",questions:14},
  {id:8,name:"Censo estudios",questions:20},
];

export default function QuestionnairesTable(){
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const filtered = useMemo(
    ()=> MOCK.filter(r => r.name.toLowerCase().includes(q.toLowerCase())),
    [q]
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const data = filtered.slice((page-1)*pageSize, page*pageSize);

  return (
    <div className="space-y-3">
      {/* buscador + menú */}
      <div className="flex items-center justify-end gap-2">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-neutral-400"/>
          <input
            value={q}
            onChange={e=>{ setQ(e.target.value); setPage(1); }}
            placeholder="Buscar…"
            className="pl-8 pr-3 py-2 rounded-md border text-sm outline-none focus:ring-2 focus:ring-[#7A1828]/40"
          />
        </div>
      </div>

      {/* tabla */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left text-neutral-500 border-b">
              <th className="py-2 pr-2 w-12">#</th>
              <th className="py-2 pr-2">Nombre</th>
              <th className="py-2 pr-2">Número de preguntas</th>
              <th className="py-2 pr-2 w-24 text-right">Acción</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r)=>(
              <tr key={r.id} className="border-b last:border-0">
                <td className="py-2 pr-2">{r.id}</td>
                <td className="py-2 pr-2">{r.name}</td>
                <td className="py-2 pr-2">{r.questions}</td>
                <td className="py-2 pl-2">
                  <div className="flex justify-end">
                    <button
                      className="rounded-md bg-[#C9A54C] text-white p-1.5 hover:brightness-95"
                      title="Ver"
                      onClick={()=>alert(`Ver ${r.name}`)}
                    >
                      <Eye size={16}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length===0 && (
              <tr><td colSpan={4} className="py-6 text-center text-neutral-500">Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* paginación */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-neutral-500">
          Mostrando {(page-1)*pageSize + 1}-{Math.min(page*pageSize, filtered.length)} de {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <button disabled={page===1} onClick={()=>setPage(1)} className="px-2 py-1 rounded border disabled:opacity-40">«</button>
          <button disabled={page===1} onClick={()=>setPage(p=>p-1)} className="px-2 py-1 rounded border disabled:opacity-40">‹</button>
          <span className="px-2 text-sm">{page}/{totalPages}</span>
          <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)} className="px-2 py-1 rounded border disabled:opacity-40">›</button>
          <button disabled={page===totalPages} onClick={()=>setPage(totalPages)} className="px-2 py-1 rounded border disabled:opacity-40">»</button>
        </div>
      </div>
    </div>
  );
}
