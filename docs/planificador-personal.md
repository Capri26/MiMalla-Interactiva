# Mi ruta para terminar

## Objetivo del usuario

Mejorar mi malla personal con un planificador debajo de la propia malla que me pregunte cuántos créditos puedo tomar por semestre, o un intervalo de créditos, y recomiende qué ramos tomar para atrasarme lo menos posible. Tengo ramos atrasados. Más adelante se podrá trabajar en una versión global, pero por ahora el foco es mi malla personal. Quiero trabajar directamente sobre este repositorio.

## Origen y estado de la transferencia

- Proyecto original: Interactive Degree, https://replit.com/@leonardoveliz/Interactive-Degree
- Copia destinada a las mejoras: Interactive Degree (1), https://replit.com/@leonardoveliz/Interactive-Degree-1
- Destino: Capri26/MiMalla-Interactiva.
- Se enviaron dos solicitudes de implementación al agente de Replit. El usuario informó que no había cambios visibles. Las consultas posteriores devolvieron respuestas vacías. No se ha verificado ninguna implementación ni exportado archivos de Replit.
- Este documento traslada el contexto de la conversación y los requisitos; no acredita una migración del proyecto, de la malla personal ni del progreso académico.
- El repositorio actual contiene una aplicación Electron con edición de ramos, requisitos y almacenamiento local. Hay que comprobar su correspondencia con Replit antes de sustituir archivos.

## Requisitos principales expresados por el usuario

1. Sección de planificación debajo de la malla actual.
2. Cantidad máxima o intervalo de créditos por semestre.
3. Regla general y posibilidad de cargas distintas para semestres específicos.
4. Recomendaciones de ramos para reducir el atraso considerando los ramos pendientes.
5. Integración con la malla personal; versión global para más adelante.
6. Una mejora funcional y visible, implementada y comprobada, no únicamente una propuesta.

## Comportamiento propuesto para concretar la petición

- Usar estados reales de aprobados, pendientes y en curso. Proyectar la aprobación de ramos en curso solo como opción explícita.
- Respetar créditos, prerrequisitos, correquisitos y oferta semestral cuando estén disponibles. No inventar información académica.
- Priorizar cadenas de prerrequisitos, ramos que desbloquean otros y cuellos de botella.
- Tratar el mínimo de créditos como preferencia y explicar cuándo no se puede alcanzar. Nunca sobrepasar el máximo configurado.
- Mostrar tarjetas por semestre con ramos, créditos totales, motivos de recomendación y advertencias.
- Resumir créditos pendientes, semestres estimados y término estimado, indicando hipótesis. No prometer optimización exacta si se usa una aproximación.
- Permitir fijar o posponer ramos y recalcular, mostrando conflictos.
- Guardar preferencias y ruta. Recalcular cuando cambie el progreso.
- Comparar una alternativa de menor carga con otra más rápida cuando sea viable.
- Detectar datos faltantes, ciclos e imposibilidades sin generar planes inválidos ni cálculos interminables.
- Mantener la malla y el progreso existentes; interfaz en español y adaptable a móvil y escritorio si se trabaja en la versión web.

## Información pendiente de recuperar o confirmar

- Archivos completos de la copia de Replit y sus cambios reales.
- Malla personal: ramos, créditos, requisitos y oferta.
- Progreso personal y lugar donde se guarda: navegador, archivo o base de datos.
- Semestre inicial y preferencias de carga. Deben poder ingresarse en la interfaz, sin bloquear el desarrollo.
- Diferencias entre la aplicación Electron del repositorio y la aplicación web de Replit.

## Verificación esperada

Comprobar cadenas de requisitos con ramos atrasados, cargas distintas por semestre, límites demasiado bajos, datos incompletos, ciclos y actualización del progreso. Verificar visualmente que el planificador aparezca debajo de la malla y genere una ruta coherente. Confirmar la conservación del progreso y preferencias tras recargar.
