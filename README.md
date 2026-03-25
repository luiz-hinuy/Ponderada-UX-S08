# Mapa Interativo de Risco de Incendio Florestal - Brasil

Ferramenta de visualizacao interativa para analise de risco de incendio florestal em municipios brasileiros, desenvolvida com D3.js v7.

## Descricao

Este projeto apresenta um mapa do Brasil em nivel municipal, permitindo aos operadores visualizar rapidamente areas com maior risco de incendio florestal. O indice de risco e calculado pelo modelo parametrico **FWI (Fire Weather Index)**, desenvolvido pelo Canadian Forest Service.

### Funcionalidades

- **Visualizacao por cores**: Municipios coloridos de acordo com o nivel de risco (verde a vermelho escuro)
- **Zoom e pan**: Navegacao interativa pelo mapa com scroll e arrastar
- **Detalhes ao clicar**: Modal com informacoes detalhadas do municipio selecionado
- **Dados meteorologicos**: Temperatura, umidade e velocidade do vento
- **Animacoes fluidas**: Transicoes suaves entre estados

### Niveis de Risco

| Cor | Nivel | Indice FWI |
|-----|-------|------------|
| Verde | Baixo | 0-40 |
| Amarelo | Moderado | 40-80 |
| Laranja | Alto | 80-120 |
| Vermelho | Muito Alto | 120-160 |
| Vermelho Escuro | Critico | 160-200 |

## Como Executar

1. Clone o repositorio
2. Abra o arquivo `index.html` em um navegador moderno

Nao e necessario servidor web - os dados geograficos estao embutidos no arquivo `geo.js`.

## Estrutura do Projeto

```
.
├── index.html          # Pagina principal com estilos CSS
├── mapa-interativo.js  # Logica do mapa D3.js com animacoes
├── heatmap.js          # Versao simplificada do heatmap
├── geo.js              # Dados GeoJSON dos municipios brasileiros
└── geo.json            # Arquivo fonte dos dados geograficos
```

## Tecnologias

- **D3.js v7** - Biblioteca de visualizacao de dados
- **GeoJSON** - Formato de dados geograficos
- **HTML5/CSS3** - Interface responsiva

## Referencia

Van Wagner, C.E. (1987). *Development and Structure of the Canadian Forest Fire Weather Index System*. Canadian Forestry Service, Forestry Technical Report 35. Ottawa.

## Autores

- **Davi Duarte**
- **Luiz Hinuy**

Desenvolvido para o Inteli - Modulo 5 (2026)
