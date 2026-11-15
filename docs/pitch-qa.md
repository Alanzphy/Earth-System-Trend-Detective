# Preguntas del jurado: respuestas preparadas

> Para ensayar antes del pitch (4 min + preguntas). Respuestas cortas, en español, con cifras que se pueden comprobar en la app o con el código del repo. Regla: si no sabemos algo, se dice "no lo sabemos todavía" y qué haríamos para saberlo.

## Frase de cierre

**"Los teléfonos se hicieron para consumir. Con 45 años de datos de NASA, cada estudiante de Chihuahua puede convertir el suyo en un instrumento científico."**

Retoma la diapositiva 2 (el problema) y cierra el círculo. Alternativas si el equipo prefiere otra:

- "Tu pueblo cambió. Ahora puedes probarlo."
- "No es un pueblo: es todo Chihuahua. Y cualquier estudiante puede comprobarlo."

## La cifra del gancho: cómo decirla bien

- **Decir**: "El estado de Chihuahua está en el **4 %** de los lugares del mapa que más rápido se calientan: **+2.1 °C desde 1981**."
- **No decir**: "más rápido que el promedio del planeta". El mapa cubre 60°S–70°N, **incluye océano** (que se calienta más lento) y su promedio es simple, no ponderado por área. Por eso "2.5 veces el promedio" solo vale como "el promedio **de nuestro mapa**".
- Comprobación: Chihuahua +0.476 °C/década; promedio de las 7,488 celdas del mapa +0.183 (≈ 2.6×); solo el 2.8 % de las celdas se calienta igual o más rápido. La app dice "top 4 %" y "about 2.5 times", del lado prudente.

## Preguntas probables

### Sobre el impacto

**¿Ya lo probaron con estudiantes?**
Todavía no, y no vamos a decir que sí. Es un hackathon de 48 horas. Lo que sí tenemos es el canal: ya damos talleres en secundarias y prepas públicas de Chihuahua. El siguiente paso es un piloto ahí, y la prueba de éxito es concreta: que un estudiante elija su zona y explique, con cifras y su significancia, qué cambió desde 1981.

**¿Qué cambia para un estudiante después de usarlo?**
Pasa de "dicen que hace más calor" a "en Delicias subió 2.4 °C desde 1981 y no es azar, p < 0.001". Y se lleva una tarjeta con su hallazgo y su alias. Esa tarjeta es el producto de su investigación, no un contenido que consumió.

**¿Cómo lo van a sostener después del hackathon?**
Cuesta cero. Datos públicos de NASA POWER, frontend en Vercel y API en Render en planes gratuitos. Los lugares, los casos y los mapas son archivos precalculados que funcionan aunque la API esté apagada. Lo que hace falta es tiempo de taller, y eso ya lo hacemos.

**¿Esto es para agricultores?**
No directamente. Es para estudiantes de escuelas públicas de Chihuahua, que es donde ya damos talleres. Pero muchos de ellos van a heredar la tierra y el agua del estado, o vienen de familias del campo. Por eso las variables son las que importan en el campo: calor, lluvia, humedad del suelo y evaporación. Llevarlo a escuelas agrícolas y a productores, con el apoyo de agronomía de la UACH, sería un paso natural después del piloto.

**¿Por qué Chihuahua?**
Es nuestra región: agrícola, golpeada por la sequía y con datos contundentes. Las 8 zonas se calentaron entre +2.0 y +2.4 °C y perdieron entre 28 y 39 % de su lluvia, todo estadísticamente significativo. Y la herramienta sirve para cualquier lugar del mundo.

### Sobre la ciencia

**¿La caída de lluvia no es solo la sequía de los últimos años?**
Lo comprobamos quitando los años de sequía. Con datos solo hasta 2019:
- en el **estado** sigue siendo significativa: −25 mm/año por década, p = 0.028;
- en **Delicias** también: −21, p = 0.044;
- en **Cuauhtémoc deja de serlo**: p = 0.14. Ahí la sequía reciente sí pesa, y lo decimos.

Además, la app nunca atribuye causas: describe qué cambió, no por qué.

**¿Qué significa "estadísticamente significativo"?**
Que es muy poco probable que una tendencia así salga por azar si en realidad no hubiera cambio. Usamos la prueba de Mann–Kendall con la corrección de Hamed–Rao, porque un mes se parece al anterior y sin esa corrección exageraríamos la certeza, con α = 0.05. La pendiente es Theil–Sen, que resiste valores extremos, y se reporta con intervalo de confianza del 95 %.

**¿Por qué quitan las estaciones?**
Porque el ciclo verano–invierno es mucho más grande que el cambio de décadas y lo esconde. Restamos a cada mes su promedio de 1981–2025 y analizamos lo que queda. En la app se puede ver el antes y el después con un toque.

**¿Son datos de estaciones o de satélite?**
Son de NASA POWER: el reanálisis MERRA-2, que combina observaciones de satélite y de superficie con un modelo, más radiación solar de CERES/GEWEX. La resolución es de unos 0.5°: describe la región, no una parcela. Validar contra estaciones locales es justo el trabajo que queremos hacer con expertos (UACH).

**¿Es un pronóstico?**
No. Describe 1981–2025. No dice qué va a pasar ni da consejos de siembra o riego.

**¿Hay algo que no salga significativo?**
Sí, y la app lo dice: el vapor de agua en Delicias sale como "No clear trend". Mostrar también lo que no cambia es parte del rigor.

### Sobre la herramienta

**¿Por qué está en inglés si es para Chihuahua?**
Space Apps exige el proyecto en inglés. Los textos de la app son cortos y se pensaron para traducirse; la versión en español es el primer paso del piloto. Y en el taller, cada término lleva una definición simple.

**¿En qué se diferencia de otras herramientas de clima?**
Las que conocemos muestran datos o mapas. Esta responde directamente las cuatro preguntas del reto: qué cambia, dónde, cuánto y si es significativo. Lo hace para un lugar que el estudiante elige, en unidades que entiende, con la evidencia a un toque, y termina en una tarjeta que el estudiante se lleva. Está pensada para usarse en un taller con el teléfono.

**¿Qué pasa con los datos de los estudiantes?**
Nada sale del teléfono. La tarjeta se genera en el dispositivo con un alias o nombre de pila y la escuela. No hay cuentas ni registro.

**¿Cómo usaron IA?**
Como asistente de programación (agentes con modelos Claude) para código, pruebas y documentación. Cada cambio pasó por pruebas automáticas y lo revisó el equipo. Si el video del pitch lo compuso una IA, lleva una marca de agua visible, como exige Space Apps.

**¿Por qué estas 8 zonas?**
Son cuadros de 2° × 2° centrados en las principales ciudades y regiones agrícolas del estado: Chihuahua, Ciudad Juárez, Cuauhtémoc, Delicias, Parral, Nuevo Casas Grandes, Jiménez y Ojinaga. Además está el estado completo, y cualquier área se puede dibujar en el mapa.

## Si no sabemos algo

"Buena pregunta. No lo hemos medido todavía. Para responderla haríamos ___, y es parte del piloto con expertos."
