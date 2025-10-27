import InputField from "./InputField"
import ActionButtons from "./ActionButtons"
import ForgotPasswordLink from "./ForgotPasswordLink"
import { useState } from "react"

export default function LoginCard() {
  const [user, setUser] = useState("")
  const [pass, setPass] = useState("")

  const handleLogin = (e: React.FormEvent) => { 
    e.preventDefault()
    // TODO: conecta a tu API
    console.log({ user, pass })
  }

  return (
    <div className="w-[400px] max-w-[92vw] rounded-xl bg-white/98 shadow-xl text-[#2b2b2b]">
      <div className="p-6">
        <h2 className="font-semibold mb-3">Usuario:</h2>
        <form onSubmit={handleLogin} className="space-y-3">
          <InputField
            icon="@"
            type="text"
            placeholder="Ingresar usuario"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
          <InputField
            icon="*"
            type="password"
            placeholder="Contraseña"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />
          <ActionButtons onLogin={handleLogin} />
          <ForgotPasswordLink />
        </form>
      </div>
    </div>
  )
}
