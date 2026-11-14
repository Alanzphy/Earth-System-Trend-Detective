# Métodos científicos

## Pipeline propuesto

1. **Agregación espacial**: media ponderada por área (coseno de latitud) sobre la región.
2. **Agregación temporal**: diaria → mensual si hace falta.
3. **Desestacionalización**: anomalías respecto a la climatología mensual del periodo.
4. **Tendencia**: pendiente de Theil–Sen (robusta a outliers) en unidades/década.
5. **Significancia**: Mann–Kendall (no paramétrico), α = 0.05. Considerar corrección por autocorrelación (Hamed–Rao o pre-whitening).
6. **Reporte**: dirección, magnitud, p-valor, IC, n, periodo, método.

## Comunicación al usuario

- "Significativo" = es poco probable (p < 0.05) que la tendencia se deba al azar.
- Tendencia no significativa ≠ sin cambio: puede requerir un periodo más largo.

## Fuera de alcance

Tendencias no lineales, puntos de quiebre, descomposición STL avanzada (posibles extensiones).
