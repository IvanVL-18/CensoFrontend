import React, { useState, useEffect, useRef } from 'react';
import { Form, FormBuilder } from '@formio/react';
import { Card, Spinner, Toast, ToastContainer, Button, ProgressBar } from 'react-bootstrap';
import ReactJson from '@microlink/react-json-view';
import apiClient from '../axiosConfig'; // Configuración de Axios
import '../styles/Builder.css'; // Estilos personalizados
import ContainerCustom from '../custom-components/ContainerCutom';
import OperationsConfigModal from '../custom-components/OperationsConfigModal';

const Builder = () => {
  // Estado para almacenar el esquema JSON del formulario
  const [jsonSchema, setSchema] = useState({ components: [] });

  // Estado para controlar el estado de carga
  const [loading, setLoading] = useState(true);

  // Estado para almacenar el ID de la pregunta actual
  const [questionId, setQuestionId] = useState(null);

  // Estado para almacenar el enunciado de la pregunta
  const [questionText, setQuestionText] = useState('');

  // Estado para manejar errores
  const [error, setError] = useState(null);

  // Estado para manejar mensajes de éxito
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Estado para la barra de progreso
  const [progress, setProgress] = useState(0);

  // Estado para almacenar la unidad y la sección
  const [unit, setUnit] = useState('');
  const [section, setSection] = useState('');
  const [index, setIndex] = useState(null);

  // Ref para evitar guardados innecesarios durante la carga inicial
  const initialLoad = useRef(true);

  // Estado para el modal
  const [modalShow, setModalShow] = useState(false);

  const [showOperationsModal, setShowOperationsModal] = useState(false);

  const handleOpenOperationsModal = () => setShowOperationsModal(true);
  const handleCloseOperationsModal = () => setShowOperationsModal(false);


  // useEffect para cargar la estructura de la pregunta al montar el componente
  useEffect(() => {
    // Extraer el ID de la pregunta de la URL
    const pathArray = window.location.pathname.split('/');
    const id = pathArray[pathArray.length - 1]; // ID de la pregunta
    const questionaryId = pathArray[pathArray.length - 2]; // ID de la cuestionario
    setQuestionId(id);

    // Función para obtener la estructura de la pregunta desde el servidor
    const fetchQuestionStructure = async () => {
      setError(null); // Limpiar errores anteriores
      try {
        const response = await apiClient.get(`/questions/${id}/getsave_form?questionary_id=${questionaryId}`);
        if (response.data.json_schema) {
          setSchema(response.data.json_schema);
          setQuestionText(response.data.question || 'No se encontró el enunciado de la pregunta.');
          setUnit(response.data.unit_name || 'Unidad no encontrada');
          setSection(response.data.section_name || 'Sección no encontrada');
          setIndex(response.data.index || 'Sin índice');
          // Pasar el año del cuestionario
          const questionaryYear = response.data.questionary_year || '';
          // Realizar el reemplazo de {year} con el año del cuestionario
          setQuestionText(prevText => prevText.replace('{year}', questionaryYear));
        }
      } catch (error) {
        console.error('Error fetching question structure:', error);
        setError(error);
      }
      // Establecer el estado de carga en falso después de obtener los datos
      setLoading(false);
      // Marcar que la carga inicial ha terminado
      initialLoad.current = false;
    };

    // Llamar a la función de carga si se ha encontrado un ID
    if (id) {
      fetchQuestionStructure();
    } else {
      setLoading(false); // Si no hay ID, detener la carga
    }
  }, []);

  // Función para manejar los cambios en el formulario
  const onFormChange = async (schema) => {
    // Actualizar el estado con el nuevo esquema
    setSchema({ ...schema, components: [...schema.components] });
    // Verificar que el ID de la pregunta está definido y que no es la carga inicial
    if (!questionId || initialLoad.current) {
      return;
    }

    // Guardar el formulario solo si tiene componentes
    try {
      setProgress(10); // Inicia la barra de progreso
      const response = await apiClient.post(`/questions/${questionId}/save_form`, { json_schema: schema });
      console.log('Form schema saved:', response.data);
      setProgress(100); // Completa la barra de progreso
      setShowSuccessToast(true); // Mostrar mensaje de éxito al guardar el formulario
      setTimeout(() => setProgress(0), 800); // Restablece la barra de progreso después de un breve tiempo
    } catch (error) {
      console.error('Error saving form schema:', error);
      setProgress(0); // Restablece la barra de progreso en caso de error
    }
  };

  // Función para manejar la actualización del esquema desde ContainerCustom
  const handleSchemaUpdate = (updatedSchema) => {
    setSchema(updatedSchema);
  };

  // useEffect para actualizar el JSON cada vez que cambia el esquema
  useEffect(() => {
    console.log('JSON Schema updated:', jsonSchema);
  }, [jsonSchema]);

  // Mostrar un spinner mientras se está cargando la estructura del formulario
  if (loading) {
    return (
      <div className="text-center my-4">
        <Spinner animation="border" />
        <p>Loading...</p>
      </div>
    );
  }

  // Mostrar un mensaje de error si hubo un problema al cargar la estructura
  if (error) {
    return (
      <div className="text-center my-4">
        <p>Error fetching question structure: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="container my-4">
      {/* Contenedor para los mensajes emergentes (toasts) */}
      <ToastContainer position="top-end" className="p-3 fixed-toast">
        {/* Mensaje emergente para indicar que el formulario se guardó correctamente */}
        <Toast onClose={() => setShowSuccessToast(false)} show={showSuccessToast || progress > 0} delay={3000} autohide={!progress}>
          <Toast.Header>
            <strong className="me-auto">Notificación</strong>
          </Toast.Header>
          <Toast.Body>
            {progress > 0 ? (
              <ProgressBar now={progress} animated striped />
            ) : (
              "Formulario guardado correctamente."
            )}
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Icono de volver */}
      <div className="mb-4 d-flex">
        <Button variant="btn btn-primary me-auto" onClick={() => window.history.back()}>
          <i className="fa-solid fa-arrow-left"></i>
        </Button>
      </div>

      {/* Mostrar el enunciado de la pregunta con justificación */}
      <Card className="question-card mb-4">
        <Card.Body>
          <div className="row">
            <div className="column">
              <div className="column-title">Pregunta #{index}</div>
            </div>
            <div className="column">
              <div className="column-title">Unidad: {unit}</div>
            </div>
            <div className="column">
              <div className="column-title">Sección: {section}</div>
            </div>
          </div>
          <p className="question-text">{questionText}</p>
        </Card.Body>
      </Card>
      <Button variant="btn btn-secondary mb-3" onClick={() => setModalShow(true)}>
        Repetir <i class="fa-solid fa-repeat"></i>
      </Button>
      <Button variant="btn btn-secondary mb-3 ms-3" onClick={handleOpenOperationsModal}>
        Operaciones <i class="fa-solid fa-calculator"></i>
      </Button>

      {/* FormBuilder para construir el formulario */}
      <Card className="mb-4">
        <Card.Body>
          {/* Configuración del contenedor */}
          <ContainerCustom
            show={modalShow}
            handleClose={() => setModalShow(false)} schema={jsonSchema} onSchemaChange={onFormChange} />
          {/* FormBuilder con el esquema JSON */}
          
          <OperationsConfigModal
            show={showOperationsModal}
            handleClose={handleCloseOperationsModal}
            schema={jsonSchema} // Asegúrate de que `schema` tenga la estructura adecuada
            onSchemaChange={onFormChange}
          />    
          <FormBuilder form={jsonSchema} onChange={onFormChange} options={{ noDefaultSubmitButton: true }} />
        </Card.Body>
      </Card>

      {/* Card para mostrar el esquema JSON del formulario */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="text-center">As JSON Schema</Card.Title>
          <ReactJson src={jsonSchema} name={null} collapsed={true} />
        </Card.Body>
      </Card>

      {/* Card para mostrar el formulario renderizado */}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title className="text-center">As Rendered Form</Card.Title>
          <Form form={jsonSchema} options={{ noDefaultSubmitButton: true }} />
        </Card.Body>
      </Card>
    </div>
  );
};

export default Builder;
