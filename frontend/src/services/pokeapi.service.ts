export interface PokeApiSearchResult {
  name: string;
  url: string;
}

export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number; // retornado em decímetros, converte para metros
  weight: number; // retornado em hectogramas, converte para kg
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

export const pokeApiService = {
  // Busca pokémons pelo nome parcial
  async search(query: string): Promise<PokeApiSearchResult[]> {
    if (!query || query.length < 2) return [];

    const response = await fetch(
      'https://pokeapi.co/api/v2/pokemon?limit=2000',
    );
    const data = await response.json();

    return (data.results as PokeApiSearchResult[]).filter((pokemon) =>
      pokemon.name.toLowerCase().includes(query.toLowerCase()),
    );
  },

  async getByName(name: string): Promise<PokeApiPokemon> {
    const response = await fetch(
      `https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`,
    );

    if (!response.ok) {
      throw new Error(`Pokémon "${name}" não encontrado na PokéAPI`);
    }

    return response.json();
  },

  formatName(name: string): string {
    return name.charAt(0).toUpperCase() + name.slice(1);
  },

  // Converte altura de decímetros para metros (ex: 4 → 0.4)
  formatHeight(height: number): number {
    return parseFloat((height / 10).toFixed(1));
  },

  // Converte peso de hectogramas para quilogramas (ex: 60 → 6.0)
  formatWeight(weight: number): number {
    return parseFloat((weight / 10).toFixed(1));
  },
};