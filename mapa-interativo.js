// ===========================================
// MAPA INTERATIVO DE RISCO - BRASIL
// D3.js v7 - Visualizacao com animacoes
// ===========================================

// Mapeamento de codigo IBGE para estados
const ESTADOS = {
  '11': { sigla: 'RO', nome: 'Rondonia' },
  '12': { sigla: 'AC', nome: 'Acre' },
  '13': { sigla: 'AM', nome: 'Amazonas' },
  '14': { sigla: 'RR', nome: 'Roraima' },
  '15': { sigla: 'PA', nome: 'Para' },
  '16': { sigla: 'AP', nome: 'Amapa' },
  '17': { sigla: 'TO', nome: 'Tocantins' },
  '21': { sigla: 'MA', nome: 'Maranhao' },
  '22': { sigla: 'PI', nome: 'Piaui' },
  '23': { sigla: 'CE', nome: 'Ceara' },
  '24': { sigla: 'RN', nome: 'Rio Grande do Norte' },
  '25': { sigla: 'PB', nome: 'Paraiba' },
  '26': { sigla: 'PE', nome: 'Pernambuco' },
  '27': { sigla: 'AL', nome: 'Alagoas' },
  '28': { sigla: 'SE', nome: 'Sergipe' },
  '29': { sigla: 'BA', nome: 'Bahia' },
  '31': { sigla: 'MG', nome: 'Minas Gerais' },
  '32': { sigla: 'ES', nome: 'Espirito Santo' },
  '33': { sigla: 'RJ', nome: 'Rio de Janeiro' },
  '35': { sigla: 'SP', nome: 'Sao Paulo' },
  '41': { sigla: 'PR', nome: 'Parana' },
  '42': { sigla: 'SC', nome: 'Santa Catarina' },
  '43': { sigla: 'RS', nome: 'Rio Grande do Sul' },
  '50': { sigla: 'MS', nome: 'Mato Grosso do Sul' },
  '51': { sigla: 'MT', nome: 'Mato Grosso' },
  '52': { sigla: 'GO', nome: 'Goias' },
  '53': { sigla: 'DF', nome: 'Distrito Federal' }
};

// Escala de cores para risco
const colorScale = d3.scaleLinear()
  .domain([0, 40, 80, 120, 160, 200])
  .range(["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b", "#8b0000"]);

// Cores para o card de risco (gradiente)
const riscoColors = {
  baixo: { main: '#2ecc71', dark: '#27ae60' },
  moderado: { main: '#f1c40f', dark: '#f39c12' },
  alto: { main: '#e67e22', dark: '#d35400' },
  muitoAlto: { main: '#e74c3c', dark: '#c0392b' },
  critico: { main: '#8b0000', dark: '#5c0000' }
};

// Classificacao textual do risco
function classificarRisco(valor) {
  if (valor < 40) return { texto: 'Baixo', colors: riscoColors.baixo };
  if (valor < 80) return { texto: 'Moderado', colors: riscoColors.moderado };
  if (valor < 120) return { texto: 'Alto', colors: riscoColors.alto };
  if (valor < 160) return { texto: 'Muito Alto', colors: riscoColors.muitoAlto };
  return { texto: 'Critico', colors: riscoColors.critico };
}

// Obter estado a partir do codigo IBGE
function getEstado(codigoIbge) {
  const codigoUf = String(codigoIbge).substring(0, 2);
  return ESTADOS[codigoUf] || { sigla: 'BR', nome: 'Brasil' };
}

// Gerar dados meteorologicos sinteticos baseados na localizacao
function gerarDadosMeteorologicos(feature) {
  try {
    let coords = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coords = coords[0];
    }
    const primeirosPontos = coords[0];
    const lon = primeirosPontos[0][0];
    const lat = primeirosPontos[0][1];

    // Temperatura: mais quente no norte/centro-oeste
    // Latitude brasileira: -34 (sul) a 5 (norte)
    const latNorm = (lat + 34) / 39; // 0 = sul, 1 = norte
    const tempBase = 18 + latNorm * 15; // 18-33 graus
    const tempVariacao = (Math.random() - 0.5) * 8;
    const temperatura = Math.round(tempBase + tempVariacao);

    // Umidade: mais umida na amazonia, menos no nordeste
    // Longitude brasileira: -74 (oeste) a -34 (leste)
    const lonNorm = (lon + 74) / 40; // 0 = oeste, 1 = leste
    let umidadeBase;
    if (lon < -55 && lat > -15) {
      // Amazonia - muito umido
      umidadeBase = 75 + Math.random() * 15;
    } else if (lat > -12 && lon > -42) {
      // Nordeste - mais seco
      umidadeBase = 35 + Math.random() * 25;
    } else {
      // Resto do pais
      umidadeBase = 50 + Math.random() * 30;
    }
    const umidade = Math.round(umidadeBase);

    // Velocidade do vento: maior no litoral e nordeste
    let ventoBase = 8 + Math.random() * 12;
    if (lon > -40) ventoBase += 5; // Litoral
    if (lat > -12 && lat < -3) ventoBase += 8; // Nordeste
    const vento = Math.round(ventoBase);

    return { temperatura, umidade, vento };
  } catch (e) {
    return {
      temperatura: Math.round(20 + Math.random() * 15),
      umidade: Math.round(40 + Math.random() * 40),
      vento: Math.round(5 + Math.random() * 20)
    };
  }
}

// Gera risco baseado na localizacao geografica
function gerarRiscoSintetico(feature) {
  try {
    let coords = feature.geometry.coordinates;
    if (feature.geometry.type === "MultiPolygon") {
      coords = coords[0];
    }
    const primeirosPontos = coords[0];
    if (!primeirosPontos || primeirosPontos.length === 0) {
      return Math.floor(Math.random() * 200);
    }

    const lon = primeirosPontos[0][0];
    const lat = primeirosPontos[0][1];

    // Norte = mais risco, Sul = menos risco
    const latNorm = ((lat + 34) / 39) * 100;
    const lonNorm = Math.abs(lon + 55);
    const ajusteLon = Math.max(0, 20 - lonNorm);
    const aleatorio = (Math.random() - 0.5) * 60;

    let risco = latNorm + ajusteLon + aleatorio;
    return Math.max(0, Math.min(200, Math.floor(risco)));
  } catch (e) {
    return Math.floor(Math.random() * 200);
  }
}

// ===========================================
// CONFIGURACAO DO MAPA
// ===========================================

const svg = d3.select("#map");
const tooltip = d3.select(".tooltip");
const modal = d3.select("#detailModal");
const detailPanel = d3.select("#detailPanel");
const flyingContainer = d3.select("#flyingMunicipio");

// Dimensoes
const containerRect = document.querySelector('.map-container').getBoundingClientRect();
const width = containerRect.width - 30;
const height = containerRect.height - 30;

svg.attr("width", width).attr("height", height);

// Projecao
const projection = d3.geoMercator()
  .center([-55, -15])
  .scale(Math.min(width, height) * 1.1)
  .translate([width / 2, height / 2]);

const path = d3.geoPath().projection(projection);

// Grupo principal para zoom
const g = svg.append("g");

// ===========================================
// ZOOM E PAN
// ===========================================

const zoom = d3.zoom()
  .scaleExtent([0.5, 15])
  .on("zoom", (event) => {
    g.attr("transform", event.transform);
  });

svg.call(zoom);

// Botoes de controle do zoom
d3.select("#zoom-in").on("click", () => {
  svg.transition().duration(300).call(zoom.scaleBy, 1.5);
});

d3.select("#zoom-out").on("click", () => {
  svg.transition().duration(300).call(zoom.scaleBy, 0.67);
});

d3.select("#zoom-reset").on("click", () => {
  svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
});

// ===========================================
// PREPARAR DADOS
// ===========================================

BRASIL_GEOJSON.features.forEach(feature => {
  feature.properties.risco = gerarRiscoSintetico(feature);
  const meteo = gerarDadosMeteorologicos(feature);
  feature.properties.temperatura = meteo.temperatura;
  feature.properties.umidade = meteo.umidade;
  feature.properties.vento = meteo.vento;
  feature.properties.estado = getEstado(feature.properties.id);
});

// ===========================================
// DESENHAR MUNICIPIOS
// ===========================================

let selectedMunicipio = null;

const municipios = g.selectAll("path.municipio")
  .data(BRASIL_GEOJSON.features)
  .enter()
  .append("path")
  .attr("class", "municipio")
  .attr("d", path)
  .attr("fill", d => colorScale(d.properties.risco))
  .attr("stroke", "#555")
  .attr("stroke-width", 0.15)
  .on("mouseover", function(event, d) {
    if (this === selectedMunicipio) return;

    d3.select(this)
      .transition()
      .duration(100)
      .attr("stroke-width", 1);

    const risco = classificarRisco(d.properties.risco);
    tooltip
      .style("opacity", 1)
      .html(`<strong>${d.properties.name}</strong> - ${d.properties.estado.sigla}<br>Risco: ${d.properties.risco} (${risco.texto})`);
  })
  .on("mousemove", function(event) {
    const mapRect = document.querySelector('.map-container').getBoundingClientRect();
    tooltip
      .style("left", (event.clientX - mapRect.left + 15) + "px")
      .style("top", (event.clientY - mapRect.top - 10) + "px");
  })
  .on("mouseout", function() {
    if (this !== selectedMunicipio) {
      d3.select(this)
        .transition()
        .duration(100)
        .attr("stroke-width", 0.15);
    }
    tooltip.style("opacity", 0);
  })
  .on("click", function(event, d) {
    event.stopPropagation();
    animarMunicipioParaModal(this, d);
  });

console.log("Mapa carregado:", BRASIL_GEOJSON.features.length, "municipios");

// ===========================================
// ANIMACAO DO MUNICIPIO VOANDO PARA O MODAL
// ===========================================

function animarMunicipioParaModal(element, data) {
  // Remover selecao anterior
  if (selectedMunicipio) {
    d3.select(selectedMunicipio)
      .classed("selected", false)
      .transition()
      .duration(200)
      .attr("stroke-width", 0.15);
  }

  selectedMunicipio = element;
  d3.select(element).classed("selected", true);

  // Calcular bounding box do municipio
  const bbox = element.getBBox();
  const transform = g.attr("transform") || "";
  const elementRect = element.getBoundingClientRect();

  // Posicao inicial (centro do municipio na tela)
  const startX = elementRect.left + elementRect.width / 2;
  const startY = elementRect.top + elementRect.height / 2;

  // Posicao final (centro da tela onde o modal vai aparecer)
  const endX = window.innerWidth / 2;
  const endY = window.innerHeight / 2 - 100;

  // Criar SVG voando
  const flyingSvg = flyingContainer.select("svg");

  // Copiar o path do municipio
  const pathData = d3.select(element).attr("d");

  // Calcular viewBox para centralizar o municipio no SVG
  const padding = 5;
  const viewBox = `${bbox.x - padding} ${bbox.y - padding} ${bbox.width + padding * 2} ${bbox.height + padding * 2}`;

  flyingSvg
    .attr("viewBox", viewBox)
    .html("")
    .append("path")
    .attr("d", pathData)
    .attr("fill", colorScale(data.properties.risco))
    .attr("stroke", "#333")
    .attr("stroke-width", 1);

  // Posicionar no inicio
  flyingContainer
    .style("display", "block")
    .style("left", startX - 60 + "px")
    .style("top", startY - 60 + "px")
    .style("opacity", 1)
    .style("transform", "scale(0.3) rotate(0deg)");

  // Animar o municipio voando
  flyingContainer
    .transition()
    .duration(600)
    .ease(d3.easeCubicOut)
    .style("left", endX - 60 + "px")
    .style("top", endY - 60 + "px")
    .style("transform", "scale(1.2) rotate(360deg)")
    .transition()
    .duration(200)
    .style("transform", "scale(1) rotate(360deg)")
    .on("end", () => {
      // Esconder municipio voando e mostrar modal
      flyingContainer
        .transition()
        .duration(200)
        .style("opacity", 0)
        .on("end", () => {
          flyingContainer.style("display", "none");
        });

      // Atualizar e mostrar modal
      atualizarModal(data, pathData, viewBox);
      mostrarModal();
    });
}

// ===========================================
// MODAL DE DETALHES
// ===========================================

function atualizarModal(data, pathData, viewBox) {
  const props = data.properties;
  const risco = classificarRisco(props.risco);

  // Nome e estado
  d3.select("#municipioNome").text(props.name);
  d3.select("#municipioEstado").text(`${props.estado.nome} (${props.estado.sigla})`);

  // Shape do municipio no modal
  const shapeSvg = d3.select("#municipioShape");
  shapeSvg
    .attr("viewBox", viewBox)
    .html("")
    .append("path")
    .attr("d", pathData)
    .attr("fill", colorScale(props.risco))
    .attr("stroke", "#fff")
    .attr("stroke-width", 1.5);

  // Risco
  const riscoCard = d3.select("#riscoCard");
  riscoCard
    .style("--risco-color", risco.colors.main)
    .style("--risco-color-dark", risco.colors.dark);

  d3.select("#riscoValor").text(props.risco);
  d3.select("#riscoClassificacao").text(risco.texto);

  // Dados meteorologicos
  d3.select("#temperatura").text(props.temperatura);
  d3.select("#umidade").text(props.umidade);
  d3.select("#vento").text(props.vento);
  d3.select("#codigoIbge").text(props.id);
}

function mostrarModal() {
  modal.classed("active", true);

  // Animar entrada do panel
  detailPanel
    .style("transform", "scale(0.9)")
    .style("opacity", 0);

  setTimeout(() => {
    detailPanel
      .style("transform", "scale(1)")
      .style("opacity", 1);
  }, 50);
}

function fecharModal() {
  // Animar saida
  detailPanel
    .style("transform", "scale(0.9)")
    .style("opacity", 0);

  setTimeout(() => {
    modal.classed("active", false);

    // Remover selecao do municipio
    if (selectedMunicipio) {
      d3.select(selectedMunicipio)
        .classed("selected", false)
        .transition()
        .duration(200)
        .attr("stroke-width", 0.15);
      selectedMunicipio = null;
    }
  }, 250);
}

// Fechar modal ao clicar no X
d3.select("#closeModal").on("click", fecharModal);

// Fechar modal ao clicar fora
modal.on("click", function(event) {
  if (event.target === this) {
    fecharModal();
  }
});

// Fechar com ESC
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && modal.classed("active")) {
    fecharModal();
  }
});

// ===========================================
// DRAG DO MODAL
// ===========================================

const dragModal = d3.drag()
  .on("start", function(event) {
    d3.select(this).style("cursor", "grabbing");
  })
  .on("drag", function(event) {
    const panel = d3.select(this);
    const currentTransform = panel.style("transform");

    // Obter posicao atual
    const rect = this.getBoundingClientRect();
    const newLeft = rect.left + event.dx;
    const newTop = rect.top + event.dy;

    // Aplicar nova posicao usando margin (mantendo centralizacao base)
    const marginLeft = parseFloat(panel.style("margin-left")) || 0;
    const marginTop = parseFloat(panel.style("margin-top")) || 0;

    panel
      .style("margin-left", (marginLeft + event.dx) + "px")
      .style("margin-top", (marginTop + event.dy) + "px");
  })
  .on("end", function() {
    d3.select(this).style("cursor", "move");
  });

detailPanel.call(dragModal);

// ===========================================
// RESPONSIVIDADE
// ===========================================

window.addEventListener("resize", () => {
  const newRect = document.querySelector('.map-container').getBoundingClientRect();
  const newWidth = newRect.width - 30;
  const newHeight = newRect.height - 30;

  svg.attr("width", newWidth).attr("height", newHeight);

  projection
    .scale(Math.min(newWidth, newHeight) * 1.1)
    .translate([newWidth / 2, newHeight / 2]);

  municipios.attr("d", path);
});
