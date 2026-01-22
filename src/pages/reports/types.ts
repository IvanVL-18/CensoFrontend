export type ReportItem = {
  id: string;
  name: string;        // "Censo nacional 2024"
  downloadUrl?: string; // si ya tienes endpoint listo
  createdAt?: string;   // opcional si luego lo ocupas
};
