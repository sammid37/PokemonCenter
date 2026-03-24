import { useState, useEffect, useRef } from 'react';
import { pokeApiService, PokeApiPokemon, PokeApiSearchResult } from '@/services/pokeapi.service';

const PAGE_SIZE = 8;

interface UsePokemonSearchReturn {
  query: string;
  suggestions: PokeApiSearchResult[];
  selectedPokemon: PokeApiPokemon | null;
  isSearching: boolean;
  hasMore: boolean;
  handleQueryChange: (value: string) => void;
  handleSelectSuggestion: (name: string) => Promise<void>;
  handleLoadMore: () => Promise<void>;
  clearSelection: () => void;
}

export function usePokemonSearch(
  onSelect: (pokemon: PokeApiPokemon) => void,
): UsePokemonSearchReturn {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<PokeApiSearchResult[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<PokeApiPokemon | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentQueryRef = useRef('');

  useEffect(() => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      currentQueryRef.current = query;
      setIsSearching(true);
      setPage(1);

      try {
        const { results, hasMore: more } = await pokeApiService.search(query, 1, PAGE_SIZE);

        if (currentQueryRef.current === query) {
          setSuggestions(results);
          setHasMore(more);
        }
      } finally {
        if (currentQueryRef.current === query) {
          setIsSearching(false);
        }
      }
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  async function handleLoadMore() {
    if (!hasMore || isSearching) return;

    const nextPage = page + 1;
    setIsSearching(true);

    try {
      const { results, hasMore: more } = await pokeApiService.search(query, nextPage, PAGE_SIZE);
      setSuggestions((prev) => [...prev, ...results]);
      setPage(nextPage);
      setHasMore(more);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSelectSuggestion(name: string) {
    setIsSearching(true);
    setSuggestions([]);
    setHasMore(false);

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
    if (selectedPokemon) setSelectedPokemon(null);
  }

  function clearSelection() {
    setQuery('');
    setSuggestions([]);
    setSelectedPokemon(null);
    setPage(1);
    setHasMore(false);
  }

  return {
    query,
    suggestions,
    selectedPokemon,
    isSearching,
    hasMore,
    handleQueryChange,
    handleSelectSuggestion,
    handleLoadMore,
    clearSelection,
  };
}