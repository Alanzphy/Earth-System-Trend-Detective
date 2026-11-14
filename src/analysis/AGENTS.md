# Área: analysis

Dueño: @Alanzphy · Doc: [`docs/science.md`](../../docs/science.md)

- Consume series del contrato de serie temporal y produce el contrato de resultado de tendencia.
- Funciones puras: sin red ni I/O; la descarga es responsabilidad de `data`.
- Sigue el pipeline de `science.md` (anomalías, Theil–Sen, Mann–Kendall). Si cambias un método, actualiza el doc y crea un ADR.
- Valida los métodos con datos sintéticos de tendencia conocida (con y sin estacionalidad).
- Nunca marques `significant=true` sin p-valor < α.
