import { useState, useEffect, useRef } from 'react';
import { pokeApiService, PokeApiPokemon, PokeApiSearchResult } from '@/services/pokeapi.service';

interface UsePokemonSearchReturn {
  query: string;
  suggestions: PokeApiSearchResult[];
  selectedPokemon: PokeApiPokemon | null;
  isSearching: boolean;
  handleQueryChange: (value: string) => void;
  handleSelectSuggestion: (name: string) => Promise<void>;
  clearSelection: () => void;
}

export function usePokemonSearch(
  onSelect: (pokemon: PokeApiPokemon) => void,
): UsePokemonSearchReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PokeApiSearchResult[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokeApiPokemon | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Evita chamadas excessivas à PokéAPI ao digitar
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Limpa sugestões se o campo estiver vazio
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }

    // Debounce de 300ms para não buscar a cada tecla pressionada
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await pokeApiService.search(query);
        // Limita a 8 sugestões para não poluir a interface
        setSuggestions(results.slice(0, 8));
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleSelectSuggestion(name: string) {
    setIsSearching(true);
    setSuggestions([]);

    try {
      const pokemon = await pokeApiService.getByName(name);
      setSelectedPokemon(pokemon);
      setQuery(pokeApiService.formatName(name));
      onSelect(pokemon);
    } finally {
      setIsSearching(false);
    }
  }

  function handleQueryChange(value: string) {
    setQuery(value);
    // Limpa a seleção se o usuário editar o campo manualmente
    if (selectedPokemon) setSelectedPokemon(null);
  }

  function clearSelection() {
    setQuery('');
    setSuggestions([]);
    setSelectedPokemon(null);
  }

  return {
    query,
    suggestions,
    selectedPokemon,
    isSearching,
    handleQueryChange,
    handleSelectSuggestion,
    clearSelection,
  };
}