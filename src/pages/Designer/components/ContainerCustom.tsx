import React, { useState, useEffect } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ReactJson from '@microlink/react-json-view';
import type { FormSchema, RepeatConfig } from '../interfaces/Question';

interface ContainerCustomProps {
    show: boolean;
    handleClose: () => void;
    schema: FormSchema;
    onSchemaChange: (updatedSchema: FormSchema) => void;
}

const defaultRepeatConfig: RepeatConfig = {
    repeat: false,
    data_repeat_type: 'array',
    data_repeat_config: [],
    data_repeat_url_false: '',
    data_repeat_number: null,
};

const ContainerCustom = ({ show, handleClose, schema, onSchemaChange }: ContainerCustomProps) => {
    const [config, setConfig] = useState<RepeatConfig>(
        schema.repeat_config ?? defaultRepeatConfig
    );

    // Sincronizar si el schema cambia desde afuera
    useEffect(() => {
        setConfig(schema.repeat_config ?? defaultRepeatConfig);
    }, [schema]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const target = e.target as HTMLInputElement;
        const { name, value, type } = target;
        setConfig(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? target.checked : value,
        }));
    };

    const handleJsonChange = (updatedJson: unknown) => {
        if (Array.isArray(updatedJson)) {
            setConfig(prev => ({
                ...prev,
                data_repeat_config: updatedJson,
            }));
        }
    };

    const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('text');
        try {
            const json = JSON.parse(paste);
            if (Array.isArray(json)) {
                handleJsonChange(json);
            } else {
                console.error('El contenido pegado no es un array JSON válido');
            }
        } catch (error) {
            console.error('Error al parsear el JSON pegado:', error);
        }
    };

    const handleSave = () => {
        try {
            const updatedSchema: FormSchema = {
                ...schema,
                repeat_config: config,
            };
            onSchemaChange(updatedSchema);
            handleClose();
        } catch (error) {
            console.error('Error al guardar la configuración:', error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Configuración de Repeticiones</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            id="repeat"
                            name="repeat"
                            label="Repetir"
                            checked={config.repeat}
                            onChange={handleChange}
                        />
                    </Form.Group>

                    {config.repeat && (
                        <>
                            <Form.Group className="mb-3">
                                <Form.Label>Tipo de Repetición</Form.Label>
                                <Form.Select
                                    name="data_repeat_type"
                                    value={config.data_repeat_type}
                                    onChange={handleChange}
                                >
                                    <option value="array">Array (JSON)</option>
                                    <option value="fixed">Cantidad Fija</option>
                                </Form.Select>
                            </Form.Group>

                            {config.data_repeat_type === 'array' && (
                                <>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Configuración de Repetición (JSON)</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={6}
                                            placeholder="Pega aquí el array JSON"
                                            onPaste={handlePaste}
                                            value={JSON.stringify(config.data_repeat_config, null, 2)}
                                            onChange={(e) => {
                                                try {
                                                    const parsed = JSON.parse(e.target.value);
                                                    if (Array.isArray(parsed)) {
                                                        handleJsonChange(parsed);
                                                    }
                                                } catch {
                                                    // JSON incompleto mientras escribe, ignorar
                                                }
                                            }}
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <div style={{ height: '300px', overflow: 'auto' }}>
                                            <ReactJson
                                                src={config.data_repeat_config}
                                                onEdit={(edit) => handleJsonChange(edit.updated_src)}
                                                onAdd={(add) => handleJsonChange(add.updated_src)}
                                                onDelete={(del) => handleJsonChange(del.updated_src)}
                                                theme="monokai"
                                                displayDataTypes={false}
                                                enableClipboard={true}
                                                iconStyle="square"
                                                style={{ overflow: 'auto', height: '300px' }}
                                            />
                                        </div>
                                    </Form.Group>
                                </>
                            )}

                            {config.data_repeat_type === 'fixed' && (
                                <Form.Group className="mb-3">
                                    <Form.Label>Número de Repeticiones</Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="data_repeat_number"
                                        value={config.data_repeat_number ?? ''}
                                        onChange={handleChange}
                                    />
                                </Form.Group>
                            )}
                        </>
                    )}
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cerrar</Button>
                <Button variant="primary" onClick={handleSave}>Guardar Configuración</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ContainerCustom;