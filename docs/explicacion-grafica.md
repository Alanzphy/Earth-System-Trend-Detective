# Cómo explicar la gráfica "How we know it's real"

> Guía para el equipo: qué muestra la gráfica principal de la herramienta, cómo leerla y qué responder si los jueces preguntan. El ejemplo es el **estado de Chihuahua** (+0.476 °C por década, 1981–2025).

## En una frase

> *"Cada línea gris es un mes desde 1981, comparado con lo normal para ese mes. La línea naranja muestra hacia dónde va todo junto: sube casi medio grado cada diez años."*

## Parte por parte

### 1. El eje vertical: "Anomaly (°C)"

- **No es la temperatura.** Es **cuánto se alejó cada mes de lo normal** para ese mes.
- **0 = un mes normal.** Arriba de 0, más caliente de lo normal; abajo de 0, más frío.
- Ejemplo: si un julio sale en **+2**, ese julio fue 2 grados más caliente que el promedio de todos los julios de 1981 a 2025.

### 2. La línea gris: "Monthly anomaly"

- **Cada pico es un mes**: son 540 meses en total.
- Sube y baja mucho porque hay meses raros: un invierno muy frío, una ola de calor…
- **Cómo leerla:** en los años 80 la mayoría de los meses están **abajo de 0** (más fríos que lo normal) y en los 2020 la mayoría están **arriba** (más calientes). Los picos más altos, cerca de +4, están todos al final.

### 3. La línea naranja: "Trend"

- Es **la tendencia**: la dirección general, ignorando el sube y baja de cada mes.
- Empieza cerca de **−1.1** en 1981 y termina cerca de **+1.0** en 2025. La diferencia es de **unos 2.1 grados**: es el **+2.1 °C** del estado.
- **Cruza el 0 a mitad del periodo**, alrededor de 2003, porque "lo normal" es el promedio de todo 1981–2025. Lo de antes queda abajo y lo de después, arriba.

### 4. ¿Por qué "Without seasons"?

- Si graficáramos la temperatura tal cual (botón **"Raw monthly values"**), se verían **olas enormes de verano e invierno**, de unos 20 grados, que tapan el cambio lento.
- Por eso a cada mes se le resta su promedio: a cada enero, el enero promedio; a cada julio, el julio promedio. Así queda solo el cambio de fondo.

## Los cuatro números de abajo

| En la app | Qué significa | Cómo decirlo |
|---|---|---|
| **Change per decade: +0.476 °C** | La pendiente de la línea naranja | *"Sube casi medio grado cada 10 años."* |
| **95% confidence: 0.40 to 0.55** | El rango donde casi seguro está el valor real | *"Aun en el escenario más bajo, sube 0.4 grados por década. No hay forma de que sea cero."* |
| **p-value: p < 0.001** | Qué tan probable sería ver esta tendencia por pura casualidad, si en realidad no cambiara nada | *"Menos de 1 en 1,000. No es suerte."* |
| **Months analyzed: 540** | Cuántos datos se usaron | *"45 años, mes por mes."* |

**De dónde sale el +2.1 °C:** 0.476 °C por década × 4.5 décadas (de 1981 a 2025) ≈ **2.1 grados**.

## Preguntas que pueden hacer los jueces

**"¿Por qué no grafican la temperatura directamente?"**
Porque las estaciones son mucho más grandes que el cambio. El verano y el invierno mueven la temperatura unos 20 grados; el calentamiento es de 2 grados en 45 años. Si no quitamos las estaciones, el cambio no se ve. En la app se puede ver la versión cruda con un clic.

**"¿Cómo saben que no son solo los últimos años de calor?"**
El método que usamos (Theil–Sen) no se deja llevar por unos cuantos años extremos: es una especie de mediana de todas las pendientes posibles. Además, probamos con periodos distintos, por ejemplo hasta 2018, y el calentamiento sigue siendo claro y significativo. Las estaciones del gobierno (INECC, 1985–2018) también lo confirman.

**"¿Qué significa p < 0.001?"**
Que si en realidad la temperatura no estuviera cambiando, la probabilidad de ver una tendencia así sería menor a 1 en 1,000. Es como lanzar una moneda muchas veces y que salga águila casi siempre: puede ser suerte, pero es muy poco probable.

**"¿La línea naranja predice el futuro?"**
No. Describe lo que pasó entre 1981 y 2025. No dice cuánto va a subir después.

**"¿De dónde salen los datos?"**
De NASA POWER, que combina mediciones de satélite y de superficie con un modelo, mes a mes desde 1981. Es el promedio de toda la región, no una sola estación.

**"¿Por qué la línea es recta si el clima no cambia en línea recta?"**
Es una simplificación para resumir la dirección general en un solo número: cuántos grados por década. No dice que cada año suba exactamente lo mismo, solo hacia dónde va el conjunto.

## Para Delicias (si muestran esa gráfica)

| Dato | Estado de Chihuahua | Delicias |
|---|---|---|
| Cambio por década | +0.476 °C | +0.527 °C |
| Rango de confianza 95 % | 0.40 a 0.55 | 0.44 a 0.61 |
| Cambio total 1981–2025 | +2.1 °C | +2.4 °C |
| p-valor | < 0.001 | < 0.001 |
