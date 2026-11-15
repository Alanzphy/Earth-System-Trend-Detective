# Método de tendencia y significancia

- **Estado**: aceptado
- **Fecha**: 2026-11-14
- **Autor**: @Alanzphy
- **Issues**: #21, #22

## Contexto

El reto pide decir si un cambio es "significativo". Las series mensuales de NASA POWER tienen ciclo estacional, valores extremos (El Niño, sequías) y autocorrelación (un mes se parece al anterior), que infla los falsos positivos de las pruebas clásicas. Los mapas de tendencia hacen miles de pruebas a la vez.

## Opciones

| Pieza | Opciones | Elegida |
|---|---|---|
| Estacionalidad | STL, regresión con armónicos, anomalías mensuales | **Anomalías respecto a la climatología mensual** (simple, explicable a estudiantes) |
| Pendiente | Mínimos cuadrados, Theil–Sen | **Theil–Sen** (robusta a outliers, sin suponer normalidad) |
| Significancia | t de la regresión, Mann–Kendall, MK con pre-whitening, MK Hamed–Rao | **Mann–Kendall con corrección Hamed–Rao** |
| Rezagos de Hamed–Rao | todos (por defecto en `pymannkendall`), 12 | **12** |
| Muchas pruebas (mapas) | ninguna, Bonferroni, Benjamini–Hochberg (FDR) | **Benjamini–Hochberg, α = 0.05** |

## Decisión

- Anomalías mensuales → Theil–Sen (pendiente/década, IC 95 %) → Mann–Kendall Hamed–Rao (`lag=12`), α = 0.05.
- `lag=12`: en simulaciones (540 meses), con todos los rezagos el falso positivo con ruido blanco fue ~11 %; con 12, ~6 %. Con AR(1) φ = 0.9 sin tendencia: MK original ~60 %, Hamed–Rao (12) ~11 %. Detalle en `docs/science.md`.
- Mapas: una prueba por celda de 2.5°; `significant` = descubrimiento tras Benjamini–Hochberg sobre todas las celdas del mapa.

## Consecuencias

- El IC de Theil–Sen no considera autocorrelación (cota inferior de la incertidumbre); la significancia se decide con el p-valor, no con el IC.
- Bonferroni se descartó por demasiado conservador con ~7 000 celdas; FDR controla la proporción de falsos descubrimientos, que es lo relevante en un mapa.
- Fuera de alcance: tendencias no lineales y puntos de quiebre.
