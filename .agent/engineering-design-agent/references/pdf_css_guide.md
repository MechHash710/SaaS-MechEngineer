# PDF CSS Guide (WeasyPrint / xhtml2pdf)

Este guia define as propriedades CSS seguras para geração de PDFs profissionais de engenharia.

## Configuração de Página (@page)
```css
@page {
    size: A4;
    margin: 2.5cm 2cm 2.5cm 2cm;
    @bottom-right {
        content: "Página " counter(page) " de " counter(pages);
        font-family: 'Liberation Sans', sans-serif;
        font-size: 8pt;
    }
}
```

## Tabelas Técnicas (Safe-Subset)
Use `table-layout: fixed` para evitar quebras estranhas em WeasyPrint.
```css
table {
    width: 100%;
    border-collapse: collapse;
    page-break-inside: avoid;
    margin-bottom: 15pt;
}
th, td {
    border: 0.5pt solid #CBD5E1;
    padding: 8pt;
    font-size: 10pt;
    vertical-align: middle;
}
thead {
    display: table-header-group;
    background-color: #1B2A4A;
    color: white;
    font-weight: bold;
    text-transform: uppercase;
    letter-spacing: 0.5pt;
}
```

## Equações Matemáticas (CSS-only)
Para WeasyPrint, use estruturas HTML para simular notação matemática:

```css
.equation {
    display: table;
    margin: 10pt auto;
    font-family: 'Liberation Mono', monospace;
    font-size: 11pt;
}
.fraction {
    display: inline-table;
    vertical-align: middle;
    margin: 0 2pt;
}
.numerator {
    display: table-row;
    text-align: center;
    border-bottom: 0.5pt solid #0F172A;
}
.denominator {
    display: table-row;
    text-align: center;
}
```

## Propriedades a Evitar
- **Flexbox/Grid:** Suporte limitado em versões antigas. Use floats ou display table.
- **Animações/Transitions:** Serão ignoradas no PDF.
- **SVG Complexo:** Pode causar erros de renderização. Use JPG/PNG de alta resolução (300 DPI).

## Fontes Recomendadas
- `Liberation Sans`: Para corpo de texto e títulos.
- `Liberation Mono`: Para códigos e valores de cálculo.
