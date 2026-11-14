# Reto: Be An Earth System Trend Detective!

- **Evento**: 2026 NASA Space Apps Challenge
- **Dificultad**: Avanzada
- **Temas**: Earth Science, Software

## Resumen

El cambio ocurre constantemente en el sistema Tierra; cuando sigue una dirección consistente (subir/bajar, aumentar/disminuir, engrosar/adelgazar) las variables medidas lo reflejan. Pero una variable puede tener tendencia en un sentido en una región y en el opuesto en otra, aunque el mismo proceso cause ambas. La multitud de variables dificulta elegir cuáles indican cambio y luego analizarlas.

**Reto**: crear una herramienta que permita seleccionar variables medidas por misiones de ciencias de la Tierra o producidas por modelos, visualizar cómo cambian en el tiempo y determinar qué cambia, dónde, cuánto y si los cambios son lo que los científicos llaman "significativos".

## Contexto

- Satélites observan tierra, atmósfera y océano; modelos globales combinan esos datos.
- Dos partes del problema:
  1. Encontrar variables con tendencia (desde simples, como temperatura y lluvia, hasta complejas, como evaporación o caudal).
  2. Analizar tendencias en regiones concretas de tierra, océano o niveles de la atmósfera.
- Audiencia probable: estudiantes de secundaria y universidad, y público con base científica.
- Definiciones simples de las variables ayudarían mucho.
- Objetivo: que el usuario sea un "detective de datos": encontrar variables de interés y decidir si muestran tendencia y si es significativa.

## Enfoque sugerido

- Una serie corta de preguntas (qué/dónde investigar) cuyas respuestas guían la búsqueda de variables relacionadas.
- Incluir un par de **ejemplos de demostración** que el usuario pueda ver para entender la herramienta.
- Opcional: IA para identificar datos con potencial de mostrar tendencias en ciertas áreas (noticias, artículos científicos o características de la región: desierto, selva, estuario mareal, atmósfera sobre una gran ciudad).

## Trabajo con los datos

- Resoluciones temporales: horaria, 3-horaria, diaria, mensual. Diaria y mensual son las más fáciles.
- Una tendencia es interesante aunque no sea significativa; a veces solo necesita un periodo más largo.
- Considerar herramientas públicas de datos hidrológicos (p. ej. CUAHSI).
- El análisis puede ser complejo: tendencias no lineales, o no evidentes hasta remover ciclos regulares como el estacional. Análisis más complejos quedan fuera del alcance.

> Fuente: captura de la página oficial del reto (Details). Revisar pestaña *Resources* y añadir enlaces en `data-sources.md`.
