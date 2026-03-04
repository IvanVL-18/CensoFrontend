import VerificationCard from "./components/VerificationCard";

export default function Verification() {
  return (
    <VerificationCard
      title="Verificación de código"
      destination="correo@ejemplo.com"
      onVerified={(code) => {
        console.log("Código verificado:", code);
      }}
    />
  );
}