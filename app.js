// ─── CONSTANTES ────────────────────────────────────────────────────────────────
const API_URL = 'https://pokeapi.co/api/v2/pokemon/';

const STAT_NAMES = {
  hp:               'HP',
  attack:           'Ataque',
  defense:          'Defensa',
  'special-attack': 'Sp. Atk',
  'special-defense':'Sp. Def',
  speed:            'Velocidad',
};

// ─── ELEMENTOS DEL DOM ────────────────────────────────────────────────────────
const input      = document.getElementById('search-input');
const btn        = document.getElementById('search-btn');
const resultDiv  = document.getElementById('result');
const chips      = document.querySelectorAll('.example-chip');

// ─── FUNCIÓN PRINCIPAL ────────────────────────────────────────────────────────
async function buscarPokemon(nombre) {
  if (!nombre.trim()) return;

  // Estado: cargando
  mostrarMensaje('⏳', 'Buscando...', `Consultando la PokéAPI para "${nombre}"`);
  btn.disabled = true;

  try {
    // 1. Llamada a la API
    const respuesta = await fetch(API_URL + nombre.toLowerCase().trim());

    // 2. Verificar que la respuesta fue exitosa
    if (!respuesta.ok) {
      throw new Error(`Pokémon no encontrado (código ${respuesta.status})`);
    }

    // 3. Convertir a JSON
    const data = await respuesta.json();

    // 4. Mostrar el resultado
    mostrarPokemon(data);

  } catch (error) {
    // Manejo de errores
    if (error.message.includes('404') || error.message.includes('no encontrado')) {
      mostrarMensaje('🔍', 'No encontrado', `No existe ningún Pokémon llamado "${nombre}". Verifica el nombre o número.`);
    } else {
      mostrarMensaje('⚠️', 'Error de conexión', 'No se pudo conectar con la PokéAPI. Revisa tu internet e intenta de nuevo.');
    }
  } finally {
    btn.disabled = false;
  }
}

// ─── RENDERIZAR TARJETA ───────────────────────────────────────────────────────
function mostrarPokemon(data) {
  const nombre   = data.name;
  const id       = String(data.id).padStart(3, '0');
  const imagen   = data.sprites.other['official-artwork'].front_default
                || data.sprites.front_default;
  const tipos    = data.types.map(t => t.type.name);
  const altura   = (data.height / 10).toFixed(1) + ' m';
  const peso     = (data.weight / 10).toFixed(1) + ' kg';
  const stats    = data.stats;
  const habs     = data.abilities.map(a => a.ability.name);

  resultDiv.innerHTML = `
    <div class="card">
      <div class="card-header" data-id="#${id}">
        <div class="poke-img-wrap">
          <img class="poke-img" src="${imagen}" alt="${nombre}"
               onerror="this.src='https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png'">
        </div>
        <div class="poke-info">
          <div class="poke-name">${nombre}</div>
          <div class="types">
            ${tipos.map(t => `<span class="type-badge type-${t}">${t}</span>`).join('')}
          </div>
          <div class="poke-meta">
            <span><strong>${altura}</strong>Altura</span>
            <span><strong>${peso}</strong>Peso</span>
            <span><strong>#${id}</strong>ID</span>
          </div>
        </div>
      </div>

      <div class="card-body">
        <div class="section-label">Estadísticas base</div>
        ${stats.map(s => renderStat(s)).join('')}

        <div class="abilities-section">
          <div class="section-label">Habilidades</div>
          <div class="ability-chips">
            ${habs.map(h => `<span class="ability-chip">${h}</span>`).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── RENDERIZAR UNA BARRA DE STAT ─────────────────────────────────────────────
function renderStat(stat) {
  const nombre = STAT_NAMES[stat.stat.name] || stat.stat.name;
  const valor  = stat.base_stat;
  const pct    = Math.min((valor / 150) * 100, 100); // máx ~150 en base stats

  return `
    <div class="stat-row">
      <span class="stat-name">${nombre}</span>
      <span class="stat-val">${valor}</span>
      <div class="stat-bar-wrap">
        <div class="stat-bar" style="width: ${pct}%"></div>
      </div>
    </div>
  `;
}

// ─── MOSTRAR MENSAJE DE ESTADO ────────────────────────────────────────────────
function mostrarMensaje(emoji, titulo, descripcion) {
  resultDiv.innerHTML = `
    <div class="state-msg">
      <span class="emoji">${emoji}</span>
      <strong>${titulo}</strong>
      ${descripcion}
    </div>
  `;
}

// ─── EVENTOS ──────────────────────────────────────────────────────────────────

// Botón buscar
btn.addEventListener('click', () => {
  buscarPokemon(input.value);
});

// Enter en el input
input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') buscarPokemon(input.value);
});

// Chips de ejemplo
chips.forEach(chip => {
  chip.addEventListener('click', () => {
    input.value = chip.dataset.name;
    buscarPokemon(chip.dataset.name);
  });
});

// ─── INICIO: cargar un Pokémon por defecto ────────────────────────────────────
buscarPokemon('pikachu');
