'use client';

import Image from 'next/image';
import { PokeApiPokemon } from '@/services/pokeapi.service';
import { usePokemonSearch } from '@/hooks/usePokemonSearch';

interface PokemonSearchProps {
  onSelect: (pokemon: PokeApiPokemon) => void;
  initialName?: string;
}

export default function PokemonSearch({ onSelect, initialName }: PokemonSearchProps) {
  const {
    query,
    suggestions,
    selectedPokemon,
    isSearching,
    handleQueryChange,
    handleSelectSuggestion,
    clearSelection,
  } = usePokemonSearch(onSelect);

  // URL da imagem oficial do pokémon selecionado
  const spriteUrl =
    selectedPokemon?.sprites.other['official-artwork'].front_default ??
    selectedPokemon?.sprites.front_default;

  return (
    <div className="form-control">
      <div className="label">
        <span className="label-text">Nome da espécie</span>
      </div>

      <div className="relative">
        <div className="flex gap-2 items-center">
          <input
            type="text"
            placeholder="Digite para buscar uma espécie Pokémon"
            className="input input-bordered input-sm w-full"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            autoComplete="off"
          />

          {/* Spinner de busca */}
          {isSearching && (
            <span className="loading loading-spinner loading-xs text-primary absolute right-3" />
          )}
        </div>

        {/* Lista de sugestões */}
        {suggestions.length > 0 && (
          <ul className="absolute z-50 w-full mt-1 bg-base-100 border border-base-300 rounded-box shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((suggestion) => (
              <li key={suggestion.name}>
                <button
                  type="button"
                  className="w-full text-left px-4 py-2 hover:bg-base-200 text-sm capitalize"
                  onClick={() => handleSelectSuggestion(suggestion.name)}
                >
                  {suggestion.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview do pokémon selecionado */}
      {selectedPokemon && spriteUrl && (
        <div className="flex items-center gap-3 mt-2 p-2 bg-base-200 rounded-box">
          <Image
            src={spriteUrl}
            alt={selectedPokemon.name}
            width={64}
            height={64}
            className="object-contain"
          />
          <div className="text-sm">
            <p className="font-semibold capitalize">{selectedPokemon.name}</p>
            <p className="text-base-content/50">
              #{String(selectedPokemon.id).padStart(3, '0')}
            </p>
            <p className="text-base-content/50">
              {pokeApiService.formatHeight(selectedPokemon.height)}m ·{' '}
              {pokeApiService.formatWeight(selectedPokemon.weight)}kg
            </p>
          </div>
          <button
            type="button"
            onClick={clearSelection}
            className="btn btn-ghost btn-xs ml-auto"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

import { pokeApiService } from '@/services/pokeapi.service';