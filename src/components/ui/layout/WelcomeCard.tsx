// src/components/ui/layout/WelcomeCard.tsx
import '/src/assets/global-variables.css';


export default function WelcomeCard() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'var(--three-color-gradient)',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        animation: 'fadeIn 0.6s ease-out',
      }}
    >
      <h1
        style={{
          fontFamily: 'var(--secondary-font)',
          color: 'var(--pantone-7421)',
          fontSize: '3rem',
          marginBottom: '20px',
        }}
      >
        Prueba de Fuentes y Colores
      </h1>

      <p
        style={{
          fontFamily: 'var(--primary-font)',
          color: 'var(--pantone-424)',
          fontSize: '1.3rem',
          textAlign: 'center',
          maxWidth: '600px',
          lineHeight: '1.6',
        }}
      >
        Este texto usa la fuente <strong>GMX</strong> y muestra los colores
        definidos en tus variables globales. Si ves esta fuente diferente al
        título y los tonos del gradiente correctamente, ¡todo está funcionando!
      </p>

      <button
        style={{
          marginTop: '40px',
          fontFamily: 'var(--secondary-font)',
          fontWeight: 'bold',
          color: 'white',
          backgroundColor: 'var(--pantone-7421)',
          border: 'none',
          padding: '12px 24px',
          borderRadius: '8px',
          cursor: 'pointer',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          transition: 'background 0.3s ease, transform 0.2s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--pantone-7420)';
          e.currentTarget.style.transform = 'scale(1.05)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = 'var(--pantone-7421)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        Probar Montserrat
      </button>
    </div>
  );
}

