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

const MAX_LENGTH_NAME = 90;
const MAX_LENGTH_MUNICIPALITY = 40;
const MAX_LENGTH_GEOCODE = 15;
const MAX_LENGTH_TYPE = 20;

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

  const [nameCharCount, setNameCharCount] = useState(initialName.length);
  const [municipalityCharCount, setMunicipalityCharCount] = useState(initialMunicipality.length);
  const [geocodeCharCount, setGeocodeCharCount] = useState(initialGeocode.length);
  const [typeCharCount, setTypeCharCount] = useState(initialType.length);

  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (isOpen) {
      setName(initialName);
      setMunicipality(initialMunicipality);
      setGeocode(initialGeocode);
      setTypeinst(initialType);
      setNameCharCount(initialName.length);
      setMunicipalityCharCount(initialMunicipality.length);
      setGeocodeCharCount(initialGeocode.length);
      setTypeCharCount(initialType.length);
      setFormErrors([]);
      setHasChanges(false);
      setTouched({});
    }
  }, [isOpen, initialName, initialMunicipality, initialGeocode, initialType]);

  const validateForm = (
    currentName: string,
    currentMunicipality: string,
    currentGeocode: string,
    currentTypeinst: string,
    validateAll = false
  ) => {
    const result = InstitutionSchema.safeParse({
      name: currentName,
      municipality: currentMunicipality,
      geocode: currentGeocode,
      typeinst: currentTypeinst,
    });

    if (!result.success) {
      const errorMessages = result.error.issues
        .filter((issue) => {
          if (validateAll) return true;
          const path = issue.path[0];
          return touched[path as string];
        })
        .map((err) => err.message);
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

    if (changed || formErrors.length > 0) {
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
    touched,
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      name: true,
      municipality: true,
      geocode: true,
      typeinst: true,
    });

    if (!validateForm(name, municipality, geocode, typeinst, true)) return;

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

  const getInputBorderColor = (fieldError: boolean, charCount: number, maxLength: number) => {
    if (fieldError) return 'border-red-500 focus:ring-red-400';
    if (charCount >= maxLength) return 'border-red-300 focus:ring-red-400';
    if (charCount >= maxLength - 10) return 'border-amber-300 focus:ring-amber-400';
    return 'border-gray-300 focus:ring-[#DDC9A3]';
  };

  const getProgressBarColor = (charCount: number, maxLength: number) => {
    if (charCount >= maxLength) return 'bg-red-600';
    if (charCount >= maxLength - 10) return 'bg-amber-500';
    return 'bg-[#DDC9A3]';
  };

  const getCharCountColor = (charCount: number, maxLength: number) => {
    if (charCount >= maxLength) return 'text-red-600';
    if (charCount >= maxLength - 10) return 'text-amber-600';
    return 'text-gray-500';
  };

  const hasFieldError = (fieldKeyword: string) =>
    formErrors.some((e) => e.toLowerCase().includes(fieldKeyword));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;

    const fieldMap: Record<string, string> = {
      institutionName: "name",
      municipality: "municipality",
      geocode: "geocode",
      typeinst: "typeinst",
    };
    if (fieldMap[id]) {
      setTouched((prev) => ({ ...prev, [fieldMap[id]]: true }));
    }

    if (id === "institutionName") {
      if (value.length <= MAX_LENGTH_NAME) {
        setName(value);
        setNameCharCount(value.length);
      }
    }
    if (id === "municipality") {
      if (value.length <= MAX_LENGTH_MUNICIPALITY) {
        setMunicipality(value);
        setMunicipalityCharCount(value.length);
      }
    }
    if (id === "geocode") {
      if (value.length <= MAX_LENGTH_GEOCODE) {
        setGeocode(value);
        setGeocodeCharCount(value.length);
      }
    }
    if (id === "typeinst") {
      if (value.length <= MAX_LENGTH_TYPE) {
        setTypeinst(value);
        setTypeCharCount(value.length);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-blue bg-opacity-90 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      ></div>

      <div className="fixed inset-0 bg-[#000000ab] z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
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

          <form onSubmit={handleSubmit} noValidate className="flex-1 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="institutionName" className="block text-sm font-medium text-gray-700">
                    Nombre de la Institución:
                  </label>
                  <span className={`text-xs font-medium ${getCharCountColor(nameCharCount, MAX_LENGTH_NAME)}`}>
                    {nameCharCount}/{MAX_LENGTH_NAME} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="institutionName"
                  value={name}
                  onChange={handleInputChange}
                  placeholder="Ingresar nombre..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                    hasFieldError("nombre"),
                    nameCharCount,
                    MAX_LENGTH_NAME
                  )}`}
                  disabled={isSubmitting}
                  autoFocus
                />
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(nameCharCount, MAX_LENGTH_NAME)}`}
                    style={{ width: `${(nameCharCount / MAX_LENGTH_NAME) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="municipality" className="block text-sm font-medium text-gray-700">
                    Municipalidad:
                  </label>
                  <span className={`text-xs font-medium ${getCharCountColor(municipalityCharCount, MAX_LENGTH_MUNICIPALITY)}`}>
                    {municipalityCharCount}/{MAX_LENGTH_MUNICIPALITY} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="municipality"
                  value={municipality}
                  onChange={handleInputChange}
                  placeholder="Ingresar municipio..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                    hasFieldError("municipal"),
                    municipalityCharCount,
                    MAX_LENGTH_MUNICIPALITY
                  )}`}
                  disabled={isSubmitting}
                />
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(municipalityCharCount, MAX_LENGTH_MUNICIPALITY)}`}
                    style={{ width: `${(municipalityCharCount / MAX_LENGTH_MUNICIPALITY) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="geocode" className="block text-sm font-medium text-gray-700">
                    Código Postal / Geocódigo:
                  </label>
                  <span className={`text-xs font-medium ${getCharCountColor(geocodeCharCount, MAX_LENGTH_GEOCODE)}`}>
                    {geocodeCharCount}/{MAX_LENGTH_GEOCODE} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="geocode"
                  value={geocode}
                  onChange={handleInputChange}
                  placeholder="Ingresar código..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                    hasFieldError("geoc"),
                    geocodeCharCount,
                    MAX_LENGTH_GEOCODE
                  )}`}
                  disabled={isSubmitting}
                />
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(geocodeCharCount, MAX_LENGTH_GEOCODE)}`}
                    style={{ width: `${(geocodeCharCount / MAX_LENGTH_GEOCODE) * 100}%` }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="typeinst" className="block text-sm font-medium text-gray-700">
                    Tipo:
                  </label>
                  <span className={`text-xs font-medium ${getCharCountColor(typeCharCount, MAX_LENGTH_TYPE)}`}>
                    {typeCharCount}/{MAX_LENGTH_TYPE} caracteres
                  </span>
                </div>
                <input
                  type="text"
                  id="typeinst"
                  value={typeinst}
                  onChange={handleInputChange}
                  placeholder="Ingresar tipo..."
                  className={`border rounded-lg p-2 w-full focus:outline-none focus:ring-2 ${getInputBorderColor(
                    hasFieldError("tipo"),
                    typeCharCount,
                    MAX_LENGTH_TYPE
                  )}`}
                  disabled={isSubmitting}
                />
                <div className="mt-1 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${getProgressBarColor(typeCharCount, MAX_LENGTH_TYPE)}`}
                    style={{ width: `${(typeCharCount / MAX_LENGTH_TYPE) * 100}%` }}
                  />
                </div>
              </div>

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