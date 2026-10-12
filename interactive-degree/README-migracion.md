# Interactive Degree — MiMalla de Minas

Aplicación web importada desde Replit y mejorada directamente en este repositorio. La aplicación Electron anterior se conserva en la raíz del repositorio.

## Planificador personal

Debajo de la malla, «Mi ruta para terminar» genera semestres a partir de los ramos aprobados. Permite elegir año y período de inicio, semestre de carrera, intervalo de créditos y cargas diferentes en semestres específicos. Cada ramo puede tener una oferta confirmada (primer o segundo período) y un semestre mínimo de inicio.

Se comparan una estrategia que aprovecha el máximo permitido y otra que apunta al mínimo. Ambas priorizan cadenas de prerrequisitos y ramos atrasados. Las tarjetas muestran créditos, motivos y advertencias. Un ramo pesado puede elevar la carga de la estrategia ligera hasta el máximo configurado. Nunca se excede el máximo ni se permite satisfacer un prerrequisito dentro del mismo semestre.

Es una simulación aproximada, no una garantía de duración mínima. Supone aprobación de los ramos propuestos y oferta en ambos períodos cuando no se ha especificado otra. No se han inventado datos de oferta, horarios, cupos ni correquisitos. El horizonte es de 40 semestres; los ramos imposibles quedan identificados.

## Progreso y respaldos

Se conserva la clave original de aprobados, malla_minas_v1. Las preferencias usan una clave separada. Se puede descargar un JSON con progreso, preferencias y ruta y restaurarlo desde el planificador. Las rutas se recalculan al cambiar los aprobados o la configuración.

El progreso de tu navegador de Replit no venía en el ZIP original. Puedes exportarlo desde esa web y usar «Importar progreso» aquí; se aceptan la lista JSON original o un respaldo con el campo completed.

## Desarrollo

Usar Node.js 24 y pnpm 11 o superior, desde este directorio:

- pnpm install
- pnpm --filter @workspace/malla-minas dev
- pnpm --filter @workspace/malla-minas typecheck
- pnpm --filter @workspace/malla-minas test
- pnpm --filter @workspace/malla-minas build

La web usa el puerto 5173 y la base / por defecto. PORT y BASE_PATH siguen funcionando para Replit. Se retiraron las exclusiones de dependencias de Windows que impedían ejecutar el proyecto fuera de Linux.

## Verificación

10 pruebas del motor cubren malla completa, aprobaciones parciales, prerrequisitos, créditos diferentes por semestre, oferta, postergación, trabajo de título, ciclos, datos incompletos y exámenes de cero créditos. Se verificaron compilación, tipos, página en escritorio y móvil de 390 px, actualización de límites, persistencia al recargar, descarga y restauración del respaldo. No se ha desplegado en Replit.

## Siguientes ampliaciones

No se han agregado estados de ramos en curso, fijación exacta a un semestre ni una edición general de datos académicos. La oferta se puede configurar por ramo y las postergaciones funcionan como semestre mínimo. La versión global sigue fuera de esta etapa.
