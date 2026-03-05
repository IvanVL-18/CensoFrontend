import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import ReactJson from '@microlink/react-json-view';

const ContainerCustom = ({ show, handleClose, schema, onSchemaChange }) => {
  const [config, setConfig] = useState({
    repeat_config: {
      repeat: schema.repeat_config?.repeat || false,
      data_repeat_type: schema.repeat_config?.data_repeat_type || 'array',
      data_repeat_config: Array.isArray(schema.repeat_config?.data_repeat_config)
        ? schema.repeat_config.data_repeat_config
        : [], // Default to empty array
      data_repeat_url_false: schema.repeat_config?.data_repeat_url_false || '',
      data_repeat_number: schema.repeat_config?.data_repeat_number || null,
    },
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig(prevConfig => ({
      repeat_config: {
        ...prevConfig.repeat_config,
        [name]: type === 'checkbox' ? checked : value,
      }
    }));
  };

  const handleJsonChange = (updatedJson) => {
    if (Array.isArray(updatedJson)) {
      setConfig(prevConfig => ({
        repeat_config: {
          ...prevConfig.repeat_config,
          data_repeat_config: updatedJson,
        }
      }));
    }
  };

  const handleSave = () => {
    try {
      const updatedSchema = {
        ...schema,
        repeat_config: {
          ...config.repeat_config,
          data_repeat_config: config.repeat_config.data_repeat_config, // Keep as array
        },
      };
      onSchemaChange(updatedSchema);
      handleClose();
    } catch (error) {
      console.error('Error processing JSON:', error);
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text');
    try {
      const json = JSON.parse(paste);
      if (Array.isArray(json)) {
        handleJsonChange(json);
      } else {
        console.error('Pasted content is not a valid JSON array');
      }
    } catch (error) {
      console.error('Error parsing pasted JSON:', error);
    }
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Configuración de las repeticiones</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="repeat"
              name="repeat"
              label="Repetir"
              checked={config.repeat_config.repeat}
              onChange={handleChange}
            />
          </Form.Group>
          {config.repeat_config.repeat && (
            <>
              <Form.Group className="mb-3">
                <Form.Label>Tipo de Datos de Repetición</Form.Label>
                <Form.Control
                  as="select"
                  name="data_repeat_type"
                  value={config.repeat_config.data_repeat_type}
                  onChange={handleChange}
                >
                  <option value="array">Array (JSON)</option>
                  <option value="fixed">Cantidad Fija</option>
                </Form.Control>
              </Form.Group>
              {config.repeat_config.data_repeat_type === 'array' && (
                <>
                  <Form.Group className="mb-3">
                    <Form.Label>Configuración de Repetición (JSON)</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      placeholder='Pega aquí el array JSON'
                      onPaste={handlePaste}
                      value={JSON.stringify(config.repeat_config.data_repeat_config, null, 2)}
                      onChange={(e) => {
                        try {
                          const parsed = JSON.parse(e.target.value);
                          if (Array.isArray(parsed)) {
                            handleJsonChange(parsed);
                          }
                        } catch (error) {
                          console.error('Error parsing JSON from textarea:', error);
                        }
                      }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <div style={{ height: '300px', overflow: 'auto', minHeight: '300px' }}>
                      <ReactJson
                        src={config.repeat_config.data_repeat_config}
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
              {config.repeat_config.data_repeat_type === 'fixed' && (
                <Form.Group className="mb-3">
                  <Form.Label>Número de Repeticiones</Form.Label>
                  <Form.Control
                    type="number"
                    name="data_repeat_number"
                    value={config.repeat_config.data_repeat_number || ''}
                    onChange={handleChange}
                  />
                </Form.Group>
              )}
            </>
          )}
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cerrar
        </Button>
        <Button variant="primary" onClick={handleSave}>
          Guardar Configuración
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ContainerCustom;
