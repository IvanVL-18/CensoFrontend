import { useState, useEffect } from "react";
import { X, MapPinned } from "lucide-react";

import type { CreateInstitutionDTO, UpdateInstitutionDTO } from "../institutions.types";
import { InstitutionSchema } from "../schemas/institutions.schema";
import { FormErrors } from "./FormErrors";

interface InstitutionModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  title: string;
  initialName?: string;
  initialMunicipality?: string;
  initialGeocode?: string;
  initialType?: string;
  isEditMode?: boolean;
  onEditLocation?: () => void;
  pendingCoords?: { lat: number; lon: number } | null;
  onClose: () => void;
  onSave: (formData: CreateInstitutionDTO | UpdateInstitutionDTO) => Promise<void>;
}

export function InstitutionModal({
  isOpen,
  isSubmitting,
  error,
  title,
  initialName = "",
  initialMunicipality = "",
  initialGeocode = "",
  initialType = "",
  isEditMode = false,
  onEditLocation,
  pendingCoords,
  onClose,
  onSave,
}: InstitutionModalProps) {
  const [name, setName] = useState(initialName);
  const [municipality, setMunicipality] = useState(initialMunicipality);
  const [geocode, setGeocode] = useState(initialGeocode);
  const [typeinst, setTypeinst] = useState(initialType);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setMunicipality(initialMunicipality);
      setGeocode(initialGeocode);
      setTypeinst(initialType);
      setFormErrors([]);
      setHasChanges(false);
    }
  }, [isOpen, initialName, initialMunicipality, initialGeocode, initialType]);

  const validateForm = (
    currentName: string,
    currentMunicipality: string,
    currentGeocode: string,
    currentTypeinst: string
  ) => {
    const result = InstitutionSchema.safeParse({
      name: currentName,
      municipality: currentMunicipality,
      geocode: currentGeocode,
      typeinst: currentTypeinst,
    });

    if (!result.success) {
      const errorMessages = result.error.issues.map((err) => err.message);
      setFormErrors(errorMessages);
      return false;
    }

    setFormErrors([]);
    return true;
  };

  useEffect(() => {
    if (!isOpen) return;


    const changed =
      name !== initialName ||
      municipality !== initialMunicipality ||
      geocode !== initialGeocode ||
      typeinst !== initialType ||
      !!pendingCoords;

    setHasChanges(changed);

    
    if (formErrors.length > 0) {
      validateForm(name, municipality, geocode, typeinst);
    }
  
  }, [
    name,
    municipality,
    geocode,
    typeinst,
    initialName,
    initialMunicipality,
    initialGeocode,
    initialType,
    pendingCoords,
    isOpen,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

   
    if (!validateForm(name, municipality, geocode, typeinst)) return;

  
    if (isEditMode) {
      const dataToSend: UpdateInstitutionDTO = {};

      if (name !== initialName) dataToSend.name = name;
      if (municipality !== initialMunicipality) dataToSend.municipality = municipality;
      if (geocode !== initialGeocode) dataToSend.geocode = geocode;
      if (typeinst !== initialType) dataToSend.typeinst = typeinst;

      if (pendingCoords) {
        dataToSend.lat = pendingCoords.lat;
        dataToSend.lon = pendingCoords.lon;
      }

      await onSave(dataToSend);
      return;
    }

    
    const createPayload: CreateInstitutionDTO = {
      name,
      municipality,
      geocode,
      typeinst,
      ...(pendingCoords ? { lat: pendingCoords.lat, lon: pendingCoords.lon } : {}),
    };

    await onSave(createPayload);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    if (id === "institutionName") setName(value);
    if (id === "municipality") setMunicipality(value);
    if (id === "geocode") setGeocode(value);
    if (id === "typeinst") setTypeinst(value);
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
          <div className="flex justify-between items-center p-4 bg-red-900">
            <h2 className="text-xl font-bold text-white">{title}</h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            <div className="p-6">
              <label
                htmlFor="institutionName"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nombre de la Institución:
              </label>
              <input
                type="text"
                id="institutionName"
                value={name || ""}
                onChange={handleInputChange}
                placeholder="Ingresar nombre..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${
                  formErrors.some((e) => e.toLowerCase().includes("nombre"))
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#DDC9A3]"
                }`}
                disabled={isSubmitting}
                autoFocus
              />

              <label
                htmlFor="municipality"
                className="block text-sm font-medium text-gray-700 mb-2 mt-4"
              >
                Municipalidad:
              </label>
              <input
                type="text"
                id="municipality"
                value={municipality || ""}
                onChange={handleInputChange}
                placeholder="Ingresar municipio..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${
                  formErrors.some((e) => e.toLowerCase().includes("municipal"))
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#DDC9A3]"
                }`}
                disabled={isSubmitting}
              />

              <label
                htmlFor="geocode"
                className="block text-sm font-medium text-gray-700 mt-4 mb-2"
              >
                Código Postal / Geocódigo:
              </label>
              <input
                type="text"
                id="geocode"
                value={geocode || ""}
                onChange={handleInputChange}
                placeholder="Ingresar código..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${
                  formErrors.some((e) => e.toLowerCase().includes("geoc"))
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#DDC9A3]"
                }`}
                disabled={isSubmitting}
              />

              <label
                htmlFor="typeinst"
                className="block text-sm font-medium text-gray-700 mb-2 mt-4"
              >
                Tipo:
              </label>
              <input
                type="text"
                id="typeinst"
                value={typeinst || ""}
                onChange={handleInputChange}
                placeholder="Ingresar tipo..."
                className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${
                  formErrors.some((e) => e.toLowerCase().includes("tipo"))
                    ? "border-red-500 focus:ring-red-400"
                    : "border-gray-300 focus:ring-[#DDC9A3]"
                }`}
                disabled={isSubmitting}
              />

              <div id="form-errors" className="mt-3">
                <FormErrors errors={formErrors} />
              </div>

              {error && (
                <div id="form-errors-server" className="mt-2">
                  <FormErrors errors={[error]} />
                </div>
              )}
            </div>

            <div className="flex justify-end items-center gap-4 p-4 bg-gray-50">
              {isEditMode && (
                <button
                  type="button"
                  onClick={onEditLocation}
                  disabled={isSubmitting}
                  className="w-10 h-10 flex items-center justify-center bg-white border border-[#691b31] text-[#691b31] rounded-lg hover:bg-gray-100 disabled:opacity-50"
                >
                  <MapPinned size={18} />
                </button>
              )}

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="bg-[#C3A67C] text-white font-bold py-2 px-6 rounded-lg hover:brightness-95 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || formErrors.length > 0 || !hasChanges}
                className="bg-white border border-[#691b31] text-[#691b31] font-bold py-2 px-6 rounded-lg hover:bg-gray-100 disabled:opacity-50"
              >
                {isSubmitting ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
