# Interactive Degree — importación desde Replit

Este directorio contiene el proyecto web recibido en Interactive-Degree.zip el 12 de octubre de 2026. Se conserva la aplicación Electron del repositorio en la raíz.

## Contenido

La malla web está en artifacts/malla-minas y los ramos, créditos y requisitos en src/data/courses.ts dentro de esa aplicación. Se incluyen los paquetes compartidos, los archivos de configuración, recursos y el lockfile originales. Se excluyeron el historial .git, la carpeta vacía de habilidades y los resultados de compilación regenerables.

El progreso de ramos aprobados se guarda en localStorage en el navegador. No se incluyó una exportación de ese progreso en el ZIP, por lo que no se ha migrado.

## Ejecución

El proyecto usa pnpm y Node.js. La configuración original requiere PORT y BASE_PATH; para desarrollo local se pueden establecer PORT=5173 y BASE_PATH=/. Desde este directorio se instalan las dependencias con pnpm install y se ejecuta pnpm --filter @workspace/malla-minas dev.

La configuración de dependencias original contiene exclusiones de plataformas distintas de Linux propias de Replit. Antes de ejecutar en Windows deben adaptarse esas exclusiones. La importación conserva los archivos originales: todavía no se ha verificado la compilación ni el funcionamiento fuera de Replit.

## Próxima mejora

Los requisitos del planificador personal están en ../docs/planificador-personal.md. El ZIP no contiene la nueva sección de planificación solicitada; su implementación queda pendiente.
