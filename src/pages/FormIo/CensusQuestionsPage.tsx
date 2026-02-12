import { useState, useMemo } from "react";
import { Form } from "@formio/react";
import { ToastProvider, useToast } from "../../context/ToastContext";
import { Toast } from "../../components/Toast";
import "formiojs/dist/formio.full.min.css";

// Fix para TypeScript con Form.io
const FormAny = Form as any;

const JSON_DB = {
  components: [
    {
      label: "Table",
      cellAlignment: "left",
      key: "table",
      type: "table",
      numRows: 17, // Ajustado a las filas reales detectadas
      numCols: 5,
      input: false,
      tableView: false,
      rows: [
        // FILA 1: ENCABEZADOS
        [
          {
            components: [
              {
                label: "Área",
                content: "<b>Área</b>",
                key: "areaLabel",
                type: "htmlelement",
                input: false,
                tableView: false,
              },
            ],
          },
          {
            components: [
              {
                label: "¿Existió el área?",
                content:
                  "<b>¿Existió el área?</b><br>(1.Sí / 2.No / 9.No sabe)",
                key: "existioLabel",
                type: "htmlelement",
                input: false,
                tableView: false,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                content: "<b>Total</b>",
                key: "totalLabel",
                type: "htmlelement",
                input: false,
                tableView: false,
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                content: "<b>Hombres</b>",
                key: "hombresLabel",
                type: "htmlelement",
                input: false,
                tableView: false,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                content: "<b>Mujeres</b>",
                key: "mujeresLabel",
                type: "htmlelement",
                input: false,
                tableView: false,
              },
            ],
          },
        ],
        // FILA 2: Dirección
        [
          {
            components: [
              {
                content: "1. Dirección",
                key: "labelDireccion",
                type: "htmlelement",
                input: false,
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                tableView: true,
                dataSrc: "url",
                data: {
                  url: "http://p-sigeh.hidalgo.gob.mx/get-catalog/81",
                },
                idPath: "id",
                template: "<span>{{ item.label }}</span>",
                key: "select",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total1",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres1'] || 0) + (data['mujeres1'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres1",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres1",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 3: Atención al público
        [
          {
            components: [
              {
                content: "2. Atención al público",
                key: "labelAtencion",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select2",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total2",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres2'] || 0) + (data['mujeres2'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres2",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres2",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 4: Archivo
        [
          {
            components: [
              {
                content: "3. Archivo",
                key: "labelArchivo",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select3",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total3",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres3'] || 0) + (data['mujeres3'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres3",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres3",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 5: Cartografía
        [
          {
            components: [
              {
                content: "4. Cartografía",
                key: "labelCartografia",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select4",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total4",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres4'] || 0) + (data['mujeres4'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres4",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres4",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 6: Área técnica
        [
          {
            components: [
              {
                content: "5. Área técnica (brigadas de medición)",
                key: "labelTecnica",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select5",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total5",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres5'] || 0) + (data['mujeres5'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres5",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres5",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 7: Valuación
        [
          {
            components: [
              {
                content: "6. Valuación (avalúos)",
                key: "labelValuacion",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select6",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total6",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres6'] || 0) + (data['mujeres6'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres6",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres6",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 8: Geomática
        [
          {
            components: [
              {
                content: "7. Geomática",
                key: "labelGeomatica",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select7",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total7",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres7'] || 0) + (data['mujeres7'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres7",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres7",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 9: Informática
        [
          {
            components: [
              {
                content: "8. Informática",
                key: "labelInformatica",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select8",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total8",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres8'] || 0) + (data['mujeres8'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres8",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres8",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 10: Área jurídica
        [
          {
            components: [
              {
                content: "9. Área jurídica",
                key: "labelJuridica",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select9",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total9",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres9'] || 0) + (data['mujeres9'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres9",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres9",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 11: Área administrativa
        [
          {
            components: [
              {
                content: "10. Área administrativa",
                key: "labelAdmin",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select10",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total10",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres10'] || 0) + (data['mujeres10'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres10",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres10",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 12: Notificaciones
        [
          {
            components: [
              {
                content: "11. Notificaciones",
                key: "labelNotificaciones",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select11",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total11",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres11'] || 0) + (data['mujeres11'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres11",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres11",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 13: Traslado de dominio
        [
          {
            components: [
              {
                content: "12. Traslado de dominio",
                key: "labelTraslado",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select12",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total12",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres12'] || 0) + (data['mujeres12'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres12",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres12",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 14: Coordinación y seguimiento
        [
          {
            components: [
              {
                content: "13. Coordinación y seguimiento",
                key: "labelCoord",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select13",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total13",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres13'] || 0) + (data['mujeres13'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres13",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres13",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 15: Delegaciones
        [
          {
            components: [
              {
                content: "14. Delegaciones catastrales/oficinas regionales",
                key: "labelDelegaciones",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select14",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total14",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres14'] || 0) + (data['mujeres14'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres14",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres14",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 16: Área de estadística
        [
          {
            components: [
              {
                content: "15. Área de estadística",
                key: "labelEstadistica",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select15",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total15",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres15'] || 0) + (data['mujeres15'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres15",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres15",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
        // FILA 17: Otra (especifique)
        [
          {
            components: [
              {
                content: "16. Otra (especifique)",
                key: "labelOtra",
                type: "htmlelement",
              },
            ],
          },
          {
            components: [
              {
                label: "Select",
                widget: "choicesjs",
                data: {
                  values: [
                    { label: "Sí", value: "1" },
                    { label: "No", value: "2" },
                    { label: "No se sabe", value: "9" },
                  ],
                },
                key: "select16",
                type: "select",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Total",
                key: "total16",
                type: "number",
                input: true,
                hideLabel: true,
                disabled: true,
                calculateValue:
                  "value = (data['hombres16'] || 0) + (data['mujeres16'] || 0);",
              },
            ],
          },
          {
            components: [
              {
                label: "Hombres",
                key: "hombres16",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
          {
            components: [
              {
                label: "Mujeres",
                key: "mujeres16",
                type: "number",
                input: true,
                hideLabel: true,
              },
            ],
          },
        ],
      ],
    },
    // COLUMNAS DE TOTALES GENERALES
    {
      label: "Columns",
      columns: [
        { components: [], width: 3, currentWidth: 3 },
        {
          components: [
            {
              content: "<b>TOTAL GENERAL</b>",
              key: "labelTotalGeneral",
              type: "htmlelement",
            },
          ],
          width: 3,
          currentWidth: 3,
        },
        {
          components: [
            {
              label: "Gran Total",
              key: "number",
              type: "number",
              input: true,
              hideLabel: true,
              disabled: true,
              calculateValue:
                "value = (data['total1']||0) + (data['total2']||0) + (data['total3']||0) + (data['total4']||0) + (data['total5']||0) + (data['total6']||0) + (data['total7']||0) + (data['total8']||0) + (data['total9']||0) + (data['total10']||0) + (data['total11']||0) + (data['total12']||0) + (data['total13']||0) + (data['total14']||0) + (data['total15']||0) + (data['total16']||0);",
            },
          ],
          width: 2,
          currentWidth: 2,
        },
        {
          components: [
            {
              label: "Total Hombres",
              key: "number1",
              type: "number",
              input: true,
              hideLabel: true,
              disabled: true,
              calculateValue:
                "value = (data['hombres1']||0) + (data['hombres2']||0) + (data['hombres3']||0) + (data['hombres4']||0) + (data['hombres5']||0) + (data['hombres6']||0) + (data['hombres7']||0) + (data['hombres8']||0) + (data['hombres9']||0) + (data['hombres10']||0) + (data['hombres11']||0) + (data['hombres12']||0) + (data['hombres13']||0) + (data['hombres14']||0) + (data['hombres15']||0) + (data['hombres16']||0);",
            },
          ],
          width: 2,
          currentWidth: 2,
        },
        {
          components: [
            {
              label: "Total Mujeres",
              key: "number2",
              type: "number",
              input: true,
              hideLabel: true,
              disabled: true,
              calculateValue:
                "value = (data['mujeres1']||0) + (data['mujeres2']||0) + (data['mujeres3']||0) + (data['mujeres4']||0) + (data['mujeres5']||0) + (data['mujeres6']||0) + (data['mujeres7']||0) + (data['mujeres8']||0) + (data['mujeres9']||0) + (data['mujeres10']||0) + (data['mujeres11']||0) + (data['mujeres12']||0) + (data['mujeres13']||0) + (data['mujeres14']||0) + (data['mujeres15']||0) + (data['mujeres16']||0);",
            },
          ],
          width: 2,
          currentWidth: 2,
        },
      ],
      key: "columns",
      type: "columns",
      input: false,
      tableView: false,
    },
    // CAMPOS DE TEXTO ADICIONALES
    {
      label: "Otra área: (especifique)",
      labelPosition: "top",
      widget: { type: "input" },
      key: "otraAreaEspecifique",
      type: "textfield",
      input: true,
    },
    {
      label:
        "En caso de tener algún comentario u observación al dato registrado en la respuesta de la presente pregunta...",
      labelPosition: "top",
      widget: { type: "input" },
      key: "comentarios",
      type: "textarea",
      rows: 3,
      input: true,
    },
  ],
  // CONFIGURACIÓN DE REPETICIÓN (MANTENIDA DEL ORIGINAL)
  repeat_config: {
    repeat: true,
    data_repeat_type: "array",
    data_repeat_config: [
      { value: "4028", label: "AGENCIA DE DESARROLLO VALLE DE PLATA " },
      { value: "4081", label: "AGENCIA ESTATAL DE ENERGIA DE HIDALGO" },
      { value: "4055", label: "BACHILLERATO DEL ESTADO DE HIDALGO" },
      {
        value: "4082",
        label: "CENTRO DE CONCILIACION LABORAL DEL ESTADO DE HIDALGO",
      },
      {
        value: "4070",
        label: "CENTRO DE JUSTICIA PARA MUJERES DEL ESTADO DE HIDALGO",
      },
      {
        value: "4014",
        label: "CENTRO ESTATAL DE MAQUINARIA PARA EL DESARROLLO",
      },
      { value: "4080", label: "CIUDAD DE LAS MUJERES" },
      { value: "4054", label: "COLEGIO DE BACHILLERES DEL ESTADO DE HIDALGO" },
      {
        value: "4057",
        label: "COLEGIO DE EDUCACION PROFESIONAL TECNICA DEL ESTADO DE HIDALGO",
      },
      {
        value: "4056",
        label:
          "COLEGIO DE ESTUDIOS CIENTIFICOS Y TECNOLOGICOS DEL ESTADO DE HIDALGO",
      },
      {
        value: "4019",
        label: "COMISION DE AGUA Y ALCANTARILLADO DE SISTEMAS INTERMUNICIPALES",
      },
      {
        value: "4020",
        label:
          "COMISION DE AGUA Y ALCANTARILLADO DEL SISTEMA VALLE DEL MEZQUITAL",
      },
      { value: "4083", label: "COMISION ESTATAL DE BIODIVERSIDAD DE HIDALGO" },
      { value: "4016", label: "COMISION ESTATAL DE VIVIENDA" },
      { value: "4018", label: "COMISION ESTATAL DEL AGUA Y ALCANTARILLADO" },
      {
        value: "5003",
        label:
          "COMISION ESTATAL PARA EL DESARROLLO SOSTENIBLE DE LOS PUEBLOS INDIGENAS (CEDSPI)",
      },
      {
        value: "5004",
        label:
          "CONSEJO DE CIENCIA, TECNOLOGIA E INNOVACION DE HIDALGO (CITNOVA)",
      },
      {
        value: "5008",
        label:
          "CONSEJO EJECUTIVO DEL COMPLEJO CIENTIFICO Y TECNOLOGICO SINCROTRON EN EL ESTADO DE HIDALGO",
      },
      {
        value: "4034",
        label: "CONSEJO ESTATAL PARA LA CULTURA Y LAS ARTES DE HIDALGO",
      },
      {
        value: "5009",
        label:
          "COORDINACION GENERAL DEL DISTRITO DE EDUCACION, SALUD, CIENCIA, TECNOLOGIA E INNOVACION",
      },
      {
        value: "4024",
        label: "CORPORACION DE FOMENTO DE INFRAESTRUCTURA INDUSTRIAL",
      },
      { value: "4023", label: "CORPORACION INTERNACIONAL HIDALGO" },
      { value: "4058", label: "EL COLEGIO DEL ESTADO DE HIDALGO" },
      { value: "4059", label: "ESCUELA DE MUSICA DEL ESTADO DE HIDALGO" },
      { value: "4005", label: "INSTITUTO CATASTRAL DEL ESTADO DE HIDALGO" },
      {
        value: "4068",
        label:
          "INSTITUTO DE CAPACITACION PARA EL TRABAJO DEL ESTADO DE HIDALGO",
      },
      {
        value: "4021",
        label:
          "INSTITUTO DE VIVIENDA, DESARROLLO URBANO Y ASENTAMIENTOS HUMANOS",
      },
      {
        value: "4063",
        label: "INSTITUTO HIDALGUENSE A LA INFRAESTRUCTURA FISICA EDUCATIVA",
      },
      {
        value: "4027",
        label: "INSTITUTO HIDALGUENSE DE COMPETITIVIDAD EMPRESARIAL",
      },
      { value: "4036", label: "INSTITUTO HIDALGUENSE DE EDUCACION" },
      {
        value: "4038",
        label: "INSTITUTO HIDALGUENSE DE EDUCACION PARA ADULTOS",
      },
      {
        value: "4060",
        label: "INSTITUTO HIDALGUENSE DE FINANCIAMIENTO A LA EDUCACIN SUPERIOR",
      },
      { value: "4008", label: "INSTITUTO HIDALGUENSE DE LA JUVENTUD" },
      { value: "4007", label: "INSTITUTO HIDALGUENSE DE LAS MUJERES" },
      { value: "4061", label: "INSTITUTO HIDALGUENSE DEL DEPORTE" },
      {
        value: "4003",
        label: "INSTITUTO HIDALGUENSE PARA EL DESARROLLO MUNICIPAL",
      },
      {
        value: "4009",
        label:
          "INSTITUTO PARA LA ATENCION DE LAS Y LOS ADULTOS MAYORES DEL ESTADO DE HIDALGO",
      },
      { value: "4050", label: "INSTITUTO TECNOLOGICO SUPERIOR DE HUICHAPAN" },
      {
        value: "4051",
        label:
          "INSTITUTO TECNOLOGICO SUPERIOR DE OCCIDENTE DEL ESTADO DE HIDALGO",
      },
      {
        value: "4052",
        label:
          "INSTITUTO TECNOLOGICO SUPERIOR DE ORIENTE DEL ESTADO DE HIDALGO",
      },
      {
        value: "5006",
        label:
          'MUSEO INTERACTIVO PARA LA NIÑEZ Y LA JUVENTUD HIDALGUENSE "EL REHILETE"',
      },
      { value: "2900", label: "OFICIALIA MAYOR" },
      { value: "1000", label: "OFICINA DEL GOBERNADOR" },
      { value: "4026", label: "OPERADORA DE EVENTOS DEL ESTADO DE HIDALGO" },
      {
        value: "4069",
        label: "POLICIA INDUSTRIAL BANCARIA DEL ESTADO DE HIDALGO",
      },
      { value: "3000", label: "PROCURADURIA GENERAL DE JUSTICIA" },
      { value: "4001", label: "RADIO Y TELEVISION DE HIDALGO" },
      { value: "2000", label: "SECRETARIA DE CONTRALORIA" },
      { value: "2700", label: "SECRETARIA DE CULTURA" },
      { value: "1800", label: "SECRETARIA DE DESARROLLO AGROPECUARIO" },
      { value: "1700", label: "SECRETARIA DE DESARROLLO ECONOMICO" },
      { value: "1300", label: "SECRETARIA DE DESARROLLO SOCIAL" },
      { value: "2100", label: "SECRETARIA DE EDUCACION PUBLICA" },
      { value: "1200", label: "SECRETARIA DE FINANZAS" },
      { value: "1100", label: "SECRETARIA DE GOBIERNO" },
      {
        value: "1600",
        label: "SECRETARIA DE MEDIO AMBIENTE Y RECURSOS NATURALES",
      },
      { value: "2600", label: "SECRETARIA DE MOVILIDAD Y TRANSPORTE" },
      {
        value: "1500",
        label: "SECRETARIA DE OBRAS PUBLICAS Y ORDENAMIENTO TERRITORIAL ",
      },
      { value: "2200", label: "SECRETARIA DE SALUD" },
      { value: "2300", label: "SECRETARIA DE SEGURIDAD PUBLICA" },
      { value: "1900", label: "SECRETARIA DE TURISMO" },
      { value: "2400", label: "SECRETARIA DEL TRABAJO Y PREVISION SOCIAL" },
      {
        value: "5001",
        label:
          "SECRETARIA TECNICA DEL SISTEMA ESTATAL ANTICORRUPCION DE HIDALGO",
      },
      { value: "4065", label: "SERVICIOS DE SALUD DE HIDALGO" },
      { value: "4071", label: "SISTEMA DE TRANSPORTE CONVENCIONAL DE HIDALGO" },
      {
        value: "4072",
        label: "SISTEMA INTEGRADO DE TRANSPORTE MASIVO DE HIDALGO",
      },
      {
        value: "5002",
        label:
          "SISTEMA PARA EL DESARROLLO INTEGRAL DE LA FAMILIA DEL ESTADO DE HIDALGO",
      },
      { value: "2800", label: "UNIDA DE PLANEACION Y PROSPECTIVA" },
      { value: "4084", label: "UNIVERSIDAD DIGITAL DEL ESTADO DE HIDALGO" },
      {
        value: "4053",
        label: "UNIVERSIDAD INTERCULTURAL DEL ESTADO DE HIDALGO",
      },
      { value: "4041", label: "UNIVERSIDAD POLITECNICA DE FRANSCICO I MADERO" },
      { value: "4042", label: "UNIVERSIDAD POLITECNICA DE HUEJUTLA" },
      { value: "4077", label: "UNIVERSIDAD POLITECNICA DE LA ENERGIA" },
      { value: "4040", label: "UNIVERSIDAD POLITECNICA DE PACHUCA" },
      { value: "4039", label: "UNIVERSIDAD POLITECNICA DE TULANCINGO" },
      {
        value: "4043",
        label: "UNIVERSIDAD POLITECNICA METROPOLITANA DE HIDALGO",
      },
      {
        value: "4046",
        label: "UNIVERSIDAD TECNOLOGICA DE LA HUASTECA HIDALGUENSE",
      },
      {
        value: "4048",
        label: "UNIVERSIDAD TECNOLOGICA DE LA SIERRA HIDALGUENSE",
      },
      {
        value: "4049",
        label:
          "UNIVERSIDAD TECNOLOGICA DE LA ZONA METROPOLITANA DEL VALLE DE MEXICO",
      },
      {
        value: "4076",
        label: "UNIVERSIDAD TECNOLOGICA DE MINERAL DE LA REFORMA",
      },
      { value: "4044", label: "UNIVERSIDAD TECNOLOGICA DE TULA-TEPEJI" },
      { value: "4045", label: "UNIVERSIDAD TECNOLOGICA DE TULANCINGO" },
      {
        value: "4047",
        label: "UNIVERSIDAD TECNOLOGICA DEL VALLE DEL MEZQUITAL",
      },
      { value: "4073", label: "UNIVERSIDAD TECNOLOGICA MINERA DE ZIMAPAN" },
    ],
  },
};

function ToastContainer() {
  const { toasts, removeToast } = useToast();
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2">
      {toasts.map((t) => (
        <Toast
          key={t.id}
          message={t.message}
          type={t.type}
          onDismiss={() => removeToast(t.id)}
        />
      ))}
    </div>
  );
}

const UniversalViewer = ({ jsonSchema }: { jsonSchema: any }) => {
  const { addToast } = useToast();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [allAnswers, setAllAnswers] = useState<Record<string, any>>({});
  const [currentBuffer, setCurrentBuffer] = useState<any>(null);

  const items = useMemo(() => {
    return jsonSchema.repeat_config?.data_repeat_config || [];
  }, [jsonSchema]);

  const currentInstitution = items[currentIndex];
  const totalItems = items.length;

  const submissionData = useMemo(() => {
    if (!currentInstitution) return null;
    const existingData = allAnswers[currentInstitution.value];
    // NOTA IMPORTANTE: Hemos quitado los valores por defecto (number-1, etc)
    // porque el nuevo formulario usa claves distintas (hombres1, mujeres1...).
    // Form.io inicializará los campos vacíos automáticamente.
    return {
      data: existingData || {
        label: currentInstitution.label,
      },
    };
  }, [currentInstitution, allAnswers]);

  const onFormChange = (submission: any) => {
    if (submission && submission.data) {
      setCurrentBuffer(submission.data);
    }
  };

  const saveCurrentData = () => {
    const dataToSave = currentBuffer || submissionData?.data;
    setAllAnswers((prev) => ({
      ...prev,
      [currentInstitution.value]: dataToSave,
    }));
    return dataToSave;
  };

  const handlePrev = () => {
    saveCurrentData();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
    setCurrentBuffer(null);
  };

  const handleNext = () => {
    saveCurrentData();
    setCurrentIndex((prev) => Math.min(totalItems - 1, prev + 1));
    setCurrentBuffer(null);
  };

  const handleFinalize = () => {
    saveCurrentData();
    console.log("ENVÍO FINAL:", allAnswers);
    addToast("¡Censo completado y enviado exitosamente!", "success");
  };

  if (items.length === 0) return <div>Cargando...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto shadow-xl rounded-lg overflow-hidden bg-white border border-gray-200">
      {/* 1. HEADER COMPACTO */}
      <div className="bg-white border-b border-gray-100 p-5 pb-0">
        <div className="flex justify-between items-start mb-2">
          <div>
            <span className="inline-block py-0.5 px-2 mb-1 rounded bg-gray-100 text-gray-500 text-[10px] font-bold tracking-wider uppercase">
              ID: {currentInstitution?.value}
            </span>
            <h2 className="text-xl font-bold text-gray-800 leading-tight">
              {currentInstitution?.label}
            </h2>
          </div>
          <div className="flex flex-col items-end pl-4">
            <span className="text-2xl font-bold text-[#691B31]">
              {currentIndex + 1}
            </span>
            <span className="text-gray-400 text-xs font-medium">
              de {totalItems}
            </span>
          </div>
        </div>

        {/* Barra de progreso sutil pegada al borde */}
        <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-3">
          <div
            className="bg-[#691B31] h-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / totalItems) * 100}%` }}
          />
        </div>
      </div>

      {/* 2. CUERPO DE CONTENIDO */}
      <div className="px-6 py-4">
        <FormAny
          key={currentIndex}
          form={jsonSchema}
          submission={submissionData}
          onChange={onFormChange}
          options={{ noAlerts: true, hide: { submit: true } }}
        />
      </div>

      {/* 3. FOOTER DE NAVEGACIÓN */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
        {/* Botón Anterior */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className={`flex items-center gap-1 px-4 py-2 rounded text-sm font-medium transition-colors ${
            currentIndex === 0
              ? "text-gray-300 cursor-not-allowed"
              : "text-gray-600 hover:bg-white hover:text-gray-900 hover:shadow-sm border border-transparent hover:border-gray-200"
          }`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
              clipRule="evenodd"
            />
          </svg>
          Anterior
        </button>

        {/* Botón Siguiente / Finalizar */}
        {currentIndex < totalItems - 1 ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#691B31] text-white rounded shadow-sm hover:shadow hover:bg-opacity-90 font-medium transition-all text-sm"
          >
            Guardar y Siguiente
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        ) : (
          <button
            onClick={handleFinalize}
            className="flex items-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded shadow-sm hover:shadow hover:bg-green-700 font-bold transition-all text-sm"
          >
            ✓ Finalizar Censo
          </button>
        )}
      </div>
    </div>
  );
};

export default function CensusQuestionsPage() {
  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
        <ToastContainer />
        <UniversalViewer jsonSchema={JSON_DB} />
      </div>
    </ToastProvider>
  );
}
