import { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import type { FormSchema, Operation } from '../interfaces/Question';

interface OperationsConfigModalProps {
    show: boolean;
    handleClose: () => void;
    schema: FormSchema;
    onSchemaChange: (updatedSchema: FormSchema) => void;
}

interface OperationFormGroupProps {
    operation: Operation;
    index: number;
    onChange: (index: number, field: keyof Operation, value: string) => void;
    onRemove: (index: number) => void;
    onInsert: (index: number, fn: string) => void;
}

const OPERATIONS = [
    'SUMAR', 'CONTAR', 'PROMEDIAR', 'MAX', 'MIN',
    'SUMARSI', 'CONTARSI', 'PROMEDIARSI', 'MAXSI', 'MINSI',
] as const;

const OperationFormGroup = ({ operation, index, onChange, onRemove, onInsert }: OperationFormGroupProps) => (
    <div className="mb-4 p-3 border rounded position-relative">
        <Button
            variant="danger"
            size="sm"
            className="position-absolute top-0 end-0 me-1 mt-1"
            onClick={() => onRemove(index)}
        >
            <i className="fa-solid fa-xmark"></i>
        </Button>

        <Form.Group className="mb-2">
            <Form.Label>Etiqueta</Form.Label>
            <Form.Control
                type="text"
                value={operation.label}
                onChange={(e) => onChange(index, 'label', e.target.value)}
            />
        </Form.Group>

        <Form.Group className="mb-2">
            <Form.Label>Expresión</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                value={operation.expression}
                placeholder="Ejemplos: SUMAR(variablex) + 20 · SUMAR(a) - SUMAR(b) · CONTARSI(tipo, tipo == 1)"
                onChange={(e) => onChange(index, 'expression', e.target.value)}
            />
        </Form.Group>

        <div className="d-flex flex-wrap gap-2">
            {OPERATIONS.map((op) => (
                <Button
                    key={op}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => onInsert(index, op)}
                >
                    {op}
                </Button>
            ))}
        </div>
    </div>
);

const OperationsConfigModal = ({ show, handleClose, schema, onSchemaChange }: OperationsConfigModalProps) => {
    const [operations, setOperations] = useState<Operation[]>(schema.operations ?? []);

    // Sincronizar si el schema cambia desde afuera
    useEffect(() => {
        setOperations(schema.operations ?? []);
    }, [schema]);

    const handleOperationChange = (index: number, field: keyof Operation, value: string) => {
        setOperations(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleAddOperation = () => {
        setOperations(prev => [...prev, { label: '', expression: '' }]);
    };

    const handleRemoveOperation = (index: number) => {
        setOperations(prev => prev.filter((_, i) => i !== index));
    };

    // Inserta la función al final de la expresión (antes la reemplazaba completa);
    // el motor soporta combinar varias funciones con aritmética.
    const handleInsertOperation = (index: number, fn: string) => {
        setOperations(prev => {
            const updated = [...prev];
            const current = updated[index].expression?.trim() ?? '';
            const snippet = fn.endsWith('SI') ? `${fn}(variable, condicion)` : `${fn}(variable)`;
            updated[index] = {
                ...updated[index],
                expression: current ? `${current} + ${snippet}` : snippet,
            };
            return updated;
        });
    };

    const handleSave = () => {
        try {
            const updatedSchema: FormSchema = { ...schema, operations };
            onSchemaChange(updatedSchema);
            handleClose();
        } catch (error) {
            console.error('Error al guardar las operaciones:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} size="lg" container={document.getElementById('bs-portal') ?? document.body}>
            <Modal.Header closeButton>
                <Modal.Title>Configuración de Operaciones</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    {operations.map((operation, index) => (
                        <OperationFormGroup
                            key={index}
                            operation={operation}
                            index={index}
                            onChange={handleOperationChange}
                            onRemove={handleRemoveOperation}
                            onInsert={handleInsertOperation}
                        />
                    ))}
                    <Button variant="primary" onClick={handleAddOperation}>
                        Agregar Operación
                    </Button>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" onClick={handleSave}>Guardar Configuración</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default OperationsConfigModal;