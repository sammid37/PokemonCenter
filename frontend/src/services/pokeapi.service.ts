const POKEAPI_BASE = 'https://pokeapi.co/api/v2';
const NAMES_CACHE_KEY = 'pokeapi_names_cache';
const NAMES_CACHE_TTL_MS = 24 * 60 * 60 * 1000;

export interface PokeApiSearchResult {
  name: string;
  url: string;
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  sprites: {
    front_default: string;
    other: {
      'official-artwork': {
        front_default: string;
      };
    };
  };
  types: {
    slot: number;
    type: {
      name: string;
    };
  }[];
}

interface NamesCache {
  names: PokeApiSearchResult[];
  cachedAt: number;
}

async function fetchAllNames(): Promise<PokeApiSearchResult[]> {
  const stored = sessionStorage.getItem(NAMES_CACHE_KEY);

  if (stored) {
    const cache: NamesCache = JSON.parse(stored);
    if (Date.now() - cache.cachedAt < NAMES_CACHE_TTL_MS) {
      return cache.names;
    }
  }

  const response = await fetch(`${POKEAPI_BASE}/pokemon?limit=2000&offset=0`);
  const data = await response.json();
  const names: PokeApiSearchResult[] = data.results;

  sessionStorage.setItem(
    NAMES_CACHE_KEY,
    JSON.stringify({ names, cachedAt: Date.now() } satisfies NamesCache),
  );

  return names;
}

export const pokeApiService = {
  async search(
    query: string,
    page = 1,
    pageSize = 8,
  ): Promise<{ results: PokeApiSearchResult[]; hasMore: boolean }> {
    if (!query || query.length < 2) return { results: [], hasMore: false };

    const allNames = await fetchAllNames();

    const filtered = allNames.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    );

    const start = (page - 1) * pageSize;
    const results = filtered.slice(start, start + pageSize);
    const hasMore = start + pageSize < filtered.length;

    return { results, hasMore };
  },

  async getByName(name: string): Promise<PokeApiPokemon> {
    const response = await fetch(
      `${POKEAPI_BASE}/pokemon/${name.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error(`Pokémon "${name}" não encontrado na PokéAPI`);
    }

    const raw = await response.json();

    return {
      id: raw.id,
      name: raw.name,
      height: raw.height,
      weight: raw.weight,
      sprites: {
        front_default: raw.sprites.front_default,
        other: {
          'official-artwork': {
            front_default: raw.sprites.other?.['official-artwork']?.front_default ?? '',
          },
        },
      },
      types: (raw.types as { slot: number; type: { name: string } }[]).map((t) => ({
        slot: t.slot,
        type: { name: t.type.name },
      })),
    };
  },

  formatName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

  // Converte altura de decímetros para metros (ex: 4 → 0.4)
  formatHeight(height: number): number {
    return parseFloat((height / 10).toFixed(1));
  },

  // Converte peso de hectogramas para quilogramas (ex: 4 → 0.4)
  formatWeight(weight: number): number {
    return parseFloat((weight / 10).toFixed(1));
  },
};