import { Form, FormBuilder } from "@formio/react";
import type { FormType } from "@formio/react";
import { useState, useEffect, useRef, useDeferredValue } from "react";
import {
    Card,
    Spinner,
    Toast,
    ToastContainer,
    Button,
    ProgressBar,
    Alert,
} from "react-bootstrap";
import ReactJson from "@microlink/react-json-view";
import { useParams } from "react-router-dom";
import apiClient from "../services/axiosConfig";
import "../styles/Builder.css";
import type { FormSchema, QuestionResponse } from "../interfaces/Question";
import ContainerCustom from "./ContainerCustom";
import OperationsConfigModal from "./OperationsConfigModal";

// ─── Tipos ────────────────────────────────────────────────────────────────────

type SaveStatus = "idle" | "saving" | "saved" | "error";

interface FormioComponent {
    type: string;
    key?: string;
    label?: string;
    inputMask?: string | null;
    displayMask?: string | null;
    components?: FormioComponent[];
    columns?: FormioComponent[];
    rows?: FormioComponent[][];
    [key: string]: unknown;
}

// ─── Constantes ───────────────────────────────────────────────────────────────

const defaultSchema: FormSchema = {
    display: "form",
    components: [],
};

const DEBOUNCE_MS   = 700;
const INIT_GUARD_MS = 800;

// ─── Helpers de tipado ────────────────────────────────────────────────────────

/**
 * FormBuilder (v6) espera `initialForm: FormType` y Form espera `form: FormType`.
 * Nuestro FormSchema tiene `display?: string` mientras que FormType espera
 * `display?: FormDisplay` ("form" | "wizard" | "pdf").
 * El cast es seguro porque solo usamos valores válidos de FormDisplay.
 */
const asFormType = (schema: FormSchema): FormType =>
    schema as unknown as FormType;

// ─── Sanitización ─────────────────────────────────────────────────────────────

const sanitizeComponents = (components: FormioComponent[]): FormioComponent[] =>
    components.map((comp) => {
        const s: FormioComponent = { ...comp };

        if (s.inputMask   === null) s.inputMask   = "";
        if (s.displayMask === null) s.displayMask = "";

        if (Array.isArray(s.components)) s.components = sanitizeComponents(s.components);
        if (Array.isArray(s.columns))    s.columns    = sanitizeComponents(s.columns);
        if (Array.isArray(s.rows))       s.rows       = s.rows.map((row) => sanitizeComponents(row));

        return s;
    });

const sanitizeSchema = (schema: FormSchema): FormSchema => ({
    ...schema,
    display: schema.display ?? "form",
    components: sanitizeComponents((schema.components ?? []) as FormioComponent[]),
});

// ─── Sub-componente: Toast de guardado ────────────────────────────────────────

const SaveToast = ({
    status,
    onClose,
}: {
    status: SaveStatus;
    onClose: () => void;
}) => (
    <ToastContainer position="top-end" className="p-3 fixed-toast">
        <Toast
            onClose={onClose}
            show={status !== "idle"}
            delay={status === "saved" ? 3000 : undefined}
            autohide={status === "saved"}
        >
            <Toast.Header>
                <strong className="me-auto">
                    {status === "error" ? "⚠️ Error" : "Notificación"}
                </strong>
            </Toast.Header>
            <Toast.Body>
                {status === "saving" && (
                    <ProgressBar now={60} animated striped label="Guardando..." />
                )}
                {status === "saved"  && "Formulario guardado correctamente."}
                {status === "error"  && (
                    <span className="text-danger">
                        Error al guardar. Verifica tu conexión e intenta de nuevo.
                    </span>
                )}
            </Toast.Body>
        </Toast>
    </ToastContainer>
);

// ─── Componente principal ─────────────────────────────────────────────────────

const Builder = () => {
    const { id } = useParams<{ id: string }>();

    const [jsonSchema,   setJsonSchema]   = useState<FormSchema>(defaultSchema);
    const [loading,      setLoading]      = useState<boolean>(true);
    const [fetchError,   setFetchError]   = useState<string | null>(null);
    const [saveStatus,   setSaveStatus]   = useState<SaveStatus>("idle");
    const [questionName, setQuestionName] = useState<string>("");
    const [instructions, setInstructions] = useState<string | null>(null);
    const [modalShow,    setModalShow]    = useState<boolean>(false);
    const [showOperationsModal, setShowOperationsModal] = useState<boolean>(false);

    /**
     * FIX — FormBuilder no es controlado: lee `initialForm` solo en el
     * primer mount. Si el schema llega del API después del primer render,
     * el canvas queda vacío. Solución: cambiar `builderKey` tras el fetch
     * para que React desmonte y remonte el FormBuilder con el schema correcto.
     */
    const [builderKey, setBuilderKey] = useState<number>(0);

    const initialLoad     = useRef<boolean>(true);
    const loadedSchemaRef = useRef<FormSchema>(defaultSchema);
    const saveTimer       = useRef<ReturnType<typeof setTimeout> | null>(null);

    const renderedSchema = useDeferredValue(jsonSchema);

    // ── Carga inicial ─────────────────────────────────────────────────
    useEffect(() => {
        if (!id) {
            setFetchError("No se encontró el ID de la pregunta en la URL.");
            setLoading(false);
            return;
        }

        setJsonSchema(defaultSchema);
        loadedSchemaRef.current = defaultSchema;
        setQuestionName("");
        setInstructions(null);
        setFetchError(null);
        setSaveStatus("idle");
        setLoading(true);
        initialLoad.current = true;

        const fetchQuestion = async () => {
            try {
                const response = await apiClient.get<QuestionResponse>(
                    `/questions/${id}/getForm`
                );
                const data = response.data;

                setQuestionName(data.name || "Sin nombre");
                setInstructions(data.instructions || null);

                if (data.json_schema) {
                    const clean = sanitizeSchema(data.json_schema);
                    setJsonSchema(clean);
                    loadedSchemaRef.current = clean;
                }

                // Remount del FormBuilder con el schema correcto del API
                setBuilderKey((prev) => prev + 1);
            } catch {
                setFetchError("No se pudo cargar la estructura del formulario.");
            } finally {
                setLoading(false);
            }
        };

        fetchQuestion();
    }, [id]);

    // ── Desactivar guard tras estabilización del FormBuilder ──────────
    useEffect(() => {
        if (!loading && initialLoad.current) {
            const timer = setTimeout(() => {
                initialLoad.current = false;
            }, INIT_GUARD_MS);
            return () => clearTimeout(timer);
        }
    }, [loading]);

    // ── Persistencia en el backend ────────────────────────────────────
    const persistSchema = async (schema: FormSchema) => {
        if (!id) return;
        try {
            setSaveStatus("saving");
            const { display: _display, ...schemaToSave } = schema;
            await apiClient.post(`/questions/${id}/saveForm`, {
                json_schema: schemaToSave,
            });
            setSaveStatus("saved");
            setTimeout(() => setSaveStatus("idle"), 3000);
        } catch {
            setSaveStatus("error");
        }
    };

    // ── Handler del FormBuilder (con debounce) ────────────────────────
    // NO en useCallback a propósito: FormBuilder es sensible a cambios de
    // referencia en onChange y puede perder la barra de componentes.
    const onFormChange = (schema: FormSchema) => {
        setJsonSchema({
            ...schema,
            components: [...(schema.components ?? [])],
        });

        if (!id || initialLoad.current) return;

        const incomingEmpty    = !schema.components || schema.components.length === 0;
        const loadedHadComponents =
            loadedSchemaRef.current.components &&
            loadedSchemaRef.current.components.length > 0;

        if (incomingEmpty && loadedHadComponents) {
            console.warn("Guardado bloqueado: onChange con components vacío (inicialización de FormBuilder)");
            return;
        }

        loadedSchemaRef.current = schema;

        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => {
            persistSchema(schema);
        }, DEBOUNCE_MS);
    };

    // ── Handler para cambios desde modales ────────────────────────────
    const handleSchemaUpdate = (updatedSchema: FormSchema) => {
        setJsonSchema(updatedSchema);
        loadedSchemaRef.current = updatedSchema;

        if (saveTimer.current) clearTimeout(saveTimer.current);
        persistSchema(updatedSchema);

        // Remount del FormBuilder para que refleje los cambios del modal
        setBuilderKey((prev) => prev + 1);
    };

    // ── Estados de carga y error ──────────────────────────────────────
    if (loading) {
        return (
            <div className="text-center my-4">
                <Spinner animation="border" />
                <p>Cargando...</p>
            </div>
        );
    }

    if (fetchError) {
        return (
            <div className="text-center my-4">
                <Alert variant="danger">{fetchError}</Alert>
            </div>
        );
    }

    // ── Render ────────────────────────────────────────────────────────
    return (
        <div className="container my-4">

            <SaveToast
                status={saveStatus}
                onClose={() => setSaveStatus("idle")}
            />

            {/* Botón volver */}
            <div className="mb-4 d-flex">
                <Button variant="primary" onClick={() => window.history.back()}>
                    <i className="fa-solid fa-arrow-left"></i>
                </Button>
            </div>

            {/* Card con info de la pregunta */}
            <Card className="question-card mb-4">
                <Card.Body>
                    <div className="row">
                        <div className="column">
                            <div className="column-title">Pregunta</div>
                        </div>
                        {instructions && (
                            <div className="column">
                                <div className="column-title">
                                    Instrucciones: {instructions}
                                </div>
                            </div>
                        )}
                    </div>
                    <p className="question-text">{questionName}</p>
                </Card.Body>
            </Card>

            {/* Botones de modales */}
            <Button
                variant="secondary"
                className="mb-3"
                onClick={() => setModalShow(true)}
            >
                Repetir <i className="fa-solid fa-repeat"></i>
            </Button>
            <Button
                variant="secondary"
                className="mb-3 ms-3"
                onClick={() => setShowOperationsModal(true)}
            >
                Operaciones <i className="fa-solid fa-calculator"></i>
            </Button>

            {/* Form Builder */}
            <Card className="mb-4">
                <Card.Body>
                    <ContainerCustom
                        show={modalShow}
                        handleClose={() => setModalShow(false)}
                        schema={jsonSchema}
                        onSchemaChange={handleSchemaUpdate}
                    />
                    <OperationsConfigModal
                        show={showOperationsModal}
                        handleClose={() => setShowOperationsModal(false)}
                        schema={jsonSchema}
                        onSchemaChange={handleSchemaUpdate}
                    />

                    {/*
                     * key={builderKey}: fuerza remount cuando llega el schema del API.
                     * initialForm: prop correcta en @formio/react v6 para FormBuilder.
                     * asFormType(): cast seguro FormSchema → FormType para satisfacer TS.
                     */}
                    <FormBuilder
                        key={builderKey}
                        initialForm={asFormType(jsonSchema)}
                        onChange={onFormChange}
                        options={{ noDefaultSubmitButton: true } as object}
                    />
                </Card.Body>
            </Card>

            {/* JSON Schema viewer */}
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title className="text-center">As JSON Schema</Card.Title>
                    <ReactJson src={jsonSchema} name={null} collapsed={true} />
                </Card.Body>
            </Card>

            {/* Form renderizado */}
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title className="text-center">As Rendered Form</Card.Title>
                    <Form
                        form={asFormType(renderedSchema)}
                        options={{ noDefaultSubmitButton: true } as object}
                    />
                </Card.Body>
            </Card>

        </div>
    );
};

export default Builder;