// Escala de cores: 0 (verde) → 200 (vermelho escuro)
const colorScale = d3.scaleLinear()
  .domain([0, 40, 80, 120, 160, 200])
  .range(["#2ecc71", "#f1c40f", "#e67e22", "#e74c3c", "#c0392b", "#8b0000"]);

// Classificação textual do risco
function classificarRisco(valor) {
  if (valor < 40) return "Baixo";
  if (valor < 80) return "Moderado";
  if (valor < 120) return "Alto";
  if (valor < 160) return "Muito Alto";
  return "Crítico";
}

// Gera risco baseado na localização geográfica
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

// Renderizar mapa (usa variável global BRASIL_GEOJSON do geo.js)
const svg = d3.select("#map");
const tooltip = d3.select(".tooltip");

const projection = d3.geoMercator()
  .center([-55, -15])
  .scale(750)
  .translate([400, 320]);

const path = d3.geoPath().projection(projection);

// Adicionar risco a cada município
BRASIL_GEOJSON.features.forEach(feature => {
  feature.properties.risco = gerarRiscoSintetico(feature);
});

// Desenhar municípios
svg.selectAll("path")
  .data(BRASIL_GEOJSON.features)
  .enter()
  .append("path")
  .attr("d", path)
  .attr("fill", d => colorScale(d.properties.risco))
  .attr("stroke", "#333")
  .attr("stroke-width", 0.2)
  .on("mouseover", function(event, d) {
    tooltip
      .style("opacity", 1)
      .html(`<b>${d.properties.name}</b><br>Risco: ${d.properties.risco} (${classificarRisco(d.properties.risco)})`)
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 25) + "px");
  })
  .on("mousemove", function(event) {
    tooltip
      .style("left", (event.pageX + 10) + "px")
      .style("top", (event.pageY - 25) + "px");
  })
  .on("mouseout", function() {
    tooltip.style("opacity", 0);
  });

console.log("Mapa carregado:", BRASIL_GEOJSON.features.length, "municípios");
