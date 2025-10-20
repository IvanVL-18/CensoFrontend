interface Props {
  onLogin: (e: React.FormEvent) => void
}

export default function ActionButtons({ onLogin }: Props) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        className="h-8 px-4 rounded-md text-[#5b1d27] bg-[#efe4cf] hover:bg-[#e6d9c2] transition-colors text-sm"
      >
        Nuevo
      </button>

      <button
        type="submit"
        onClick={onLogin}
        className="h-8 px-4 rounded-md bg-[#5b1d27] text-white hover:opacity-90 transition-opacity text-sm"
      >
        Acceder
      </button>
    </div>
  )
}
