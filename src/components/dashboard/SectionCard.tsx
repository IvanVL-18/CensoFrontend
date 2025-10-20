type Props = { title: string; right?: React.ReactNode; children: React.ReactNode; };

export default function SectionCard({ title, right, children }: Props){
  return (
    <section className="bg-white rounded-xl shadow-[0_6px_18px_rgba(0,0,0,.08)]">
      <header className="flex items-center justify-between px-4 py-2 rounded-t-xl bg-[#7A1828] text-white">
        <h3 className="font-semibold">{title}</h3>
        {right}
      </header>
      <div className="p-4">{children}</div>
    </section>
  );
}
