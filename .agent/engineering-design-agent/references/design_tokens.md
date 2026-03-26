# Design Tokens - Engineering Platform

## Paleta de Cores (Industrial/Technical)
| Token | Valor Hex | Descrição |
|-------|-----------|-----------|
| `primary` | #1B2A4A | Azul Naval (Autoridade) |
| `secondary` | #2563EB | Azul Elétrico (Ação/Links) |
| `accent` | #F59E0B | Âmbar (Alertas/Destaque) |
| `success` | #10B981 | Verde (Conforme) |
| `error` | #EF4444 | Vermelho (Não Conforme) |
| `background` | #F1F5F9 | Cinza Técnico (Slate 100) |
| `surface` | #FFFFFF | Branco Total |
| `border` | #E2E8F0 | Borda suave (Slate 200) |

## Tipografia
- **Títulos:** Inter / IBM Plex Sans (Semi-bold, weight 600)
- **Corpo:** Inter Regular (14px/1.6)
- **Dados:** JetBrains Mono / IBM Plex Mono (Tabelas e Cálculos)

## Tailwind Config (Extend)
```javascript
module.exports = {
  theme: {
    extend: {
      colors: {
        engineering: {
          navy: '#1B2A4A',
          electric: '#2563EB',
          amber: '#F59E0B',
          green: '#10B981',
          red: '#EF4444',
          slate: '#F1F5F9',
        }
      },
      fontFamily: {
        technical: ['Inter', 'sans-serif'],
        mono: ['IBM Plex Mono', 'monospace'],
      }
    }
  }
}
```
