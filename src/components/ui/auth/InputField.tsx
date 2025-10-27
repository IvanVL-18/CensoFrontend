import type { ChangeEvent } from "react"


interface Props {
  icon: string
  type: string
  placeholder: string
  value: string
  onChange: (e: ChangeEvent<HTMLInputElement>) => void
}

export default function InputField({ icon, type, placeholder, value, onChange }: Props) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8c8c8c]">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full h-9 pl-8 pr-3 rounded-md border border-[#e6e6e6] focus:outline-none focus:ring-2 focus:ring-[#b4876e] focus:border-transparent text-sm"
      />
    </div>
  )
}
