import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

const OperationFormGroup = ({ operation, index, onChange, onRemove, onInsert }) => (
  <div className="mb-4 p-3 border rounded position-relative">
    <Button variant="danger btn-sm position-absolute top-0 end-0 me-1 mt-1" onClick={() => onRemove(index)} className="mb-2">
      <i class="fa-solid fa-xmark"></i>
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
        onChange={(e) => onChange(index, 'expression', e.target.value)}
        placeholder="Ejemplo: SUMAR(variablex) + 20"
      />
    </Form.Group>
    <div className="d-flex flex-wrap gap-2">
      <Button variant="outline-primary btn-sm" onClick={() => onInsert(index, 'SUMAR')}>SUMAR</Button>
      <Button variant="outline-primary btn-sm" onClick={() => onInsert(index, 'CONTAR')}>CONTAR</Button>
      <Button variant="outline-primary btn-sm" onClick={() => onInsert(index, 'PROMEDIAR')}>PROMEDIAR</Button>
      <Button variant="outline-primary btn-sm" onClick={() => onInsert(index, 'SUMARSI')}>SUMARSI</Button>
      <Button variant="outline-primary btn-sm" onClick={() => onInsert(index, 'CONTARSI')}>CONTARSI</Button>
    </div>
  </div>
);

const OperationsConfigModal = ({ show, handleClose, schema, onSchemaChange }) => {
  const [operations, setOperations] = useState(schema.operations || []);

  const handleOperationChange = (index, field, value) => {
    setOperations(prevOps => {
      const updatedOperations = [...prevOps];
      updatedOperations[index] = { ...updatedOperations[index], [field]: value };
      return updatedOperations;
    });
  };

  const handleAddOperation = () => {
    setOperations(prevOps => [...prevOps, { label: '', expression: '' }]);
  };

  const handleRemoveOperation = (index) => {
    setOperations(prevOps => prevOps.filter((_, i) => i !== index));
  };

  const handleInsertOperation = (index, operation) => {
    const newExpression = `${operation}(${getDefaultVariable()})`; // Example variable
    handleOperationChange(index, 'expression', newExpression);
  };

  const getDefaultVariable = () => 'variable'; // Default variable, you can modify this as needed

  const handleSave = () => {
    try {
      const updatedSchema = { ...schema, operations };
      onSchemaChange(updatedSchema);
      handleClose();
    } catch (error) {
      console.error('Error saving operations configuration:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg">
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
          <Button variant="primary" onClick={handleAddOperation}>Agregar Operación</Button>
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
