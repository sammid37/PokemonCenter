'use client';

import { useState } from 'react';
import {
  CreatePokemonDto,
  Pokemon,
  PokemonGender,
  PokemonHealthStatus,
  PokemonType,
  UpdatePokemonDto,
} from '@/types';

import { PokeApiPokemon, pokeApiService } from '@/services/pokeapi.service';
import PokemonSearch from './PokemonSearch';

interface PokemonFormProps {
  initialData?: Pokemon;
  onSubmit: (data: CreatePokemonDto | UpdatePokemonDto) => Promise<void>;
  isLoading: boolean;
}

const ALL_TYPES = Object.values(PokemonType);

const POKEAPI_TYPE_MAP: Record<string, PokemonType> = {
  normal: PokemonType.NORMAL,
  fire: PokemonType.FIRE,
  water: PokemonType.WATER,
  grass: PokemonType.GRASS,
  electric: PokemonType.ELECTRIC,
  ice: PokemonType.ICE,
  fighting: PokemonType.FIGHTING,
  poison: PokemonType.POISON,
  ground: PokemonType.GROUND,
  flying: PokemonType.FLYING,
  psychic: PokemonType.PSYCHIC,
  bug: PokemonType.BUG,
  rock: PokemonType.ROCK,
  ghost: PokemonType.GHOST,
  dragon: PokemonType.DRAGON,
  steel: PokemonType.STEEL,
  dark: PokemonType.DARK,
  fairy: PokemonType.FAIRY,
};

export default function PokemonForm({ initialData, onSubmit, isLoading }: PokemonFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    nickname: initialData?.nickname ?? '',
    level: initialData?.level ?? 1,
    hp: initialData?.hp ?? 1,
    pokedexNumber: initialData?.pokedexNumber ?? 1,
    height: initialData?.height ?? 0.1,
    weight: initialData?.weight ?? 0.1,
    types: initialData?.types ?? [],
    gender: initialData?.gender ?? PokemonGender.MALE,
    healthStatus: initialData?.healthStatus ?? PokemonHealthStatus.HEALTHY,
  });
  const [error, setError] = useState<string | null>(null);

  // Preenche os campos automaticamente ao selecionar um pokémon da PokéAPI
  function handlePokeApiSelect(pokemon: PokeApiPokemon) {
    const mappedTypes = pokemon.types
      .map((t) => POKEAPI_TYPE_MAP[t.type.name])
      .filter(Boolean) as PokemonType[];

    setFormData((prev) => ({
      ...prev,
      name: pokeApiService.formatName(pokemon.name),
      pokedexNumber: pokemon.id,
      height: pokeApiService.formatHeight(pokemon.height),
      weight: pokeApiService.formatWeight(pokemon.weight),
      types: mappedTypes,
    }));
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  function handleTypeToggle(type: PokemonType) {
    setFormData((prev) => {
      const alreadySelected = prev.types.includes(type);

      if (alreadySelected) {
        return { ...prev, types: prev.types.filter((t) => t !== type) };
      }

      if (prev.types.length >= 2) {
        setError('Um pokémon pode ter no máximo 2 tipos');
        return prev;
      }

      setError(null);
      return { ...prev, types: [...prev.types, type] };
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim()) {
      setError('Selecione um pokémon pelo campo de busca');
      return;
    }

    if (formData.types.length === 0) {
      setError('Selecione pelo menos 1 tipo');
      return;
    }

    const payload = {
      ...formData,
      nickname: formData.nickname.trim() || undefined,
    };

    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Busca na PokéAPI com autocomplete */}
      <PokemonSearch
        onSelect={handlePokeApiSelect}
        initialName={initialData?.name}
      />

      {/* Apelido */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">
            Apelido{' '}
            <span className="text-base-content/50 text-xs">(opcional)</span>
          </span>
        </div>
        <input
          type="text"
          name="nickname"
          placeholder="Apelido do seu pokémon"
          className="input input-bordered input-sm w-full"
          value={formData.nickname}
          onChange={handleChange}
        />
      </label>

      {/* Número da Pokédex — preenchido automaticamente */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Número da Pokédex</span>
        </div>
        <input
          type="number"
          name="pokedexNumber"
          className="input input-bordered input-sm w-full"
          value={formData.pokedexNumber}
          onChange={handleChange}
          min={1}
          required
        />
      </label>

      {/* Nível e HP */}
      <div className="grid grid-cols-2 gap-3">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Nível</span>
          </div>
          <input
            type="number"
            name="level"
            className="input input-bordered input-sm w-full"
            value={formData.level}
            onChange={handleChange}
            min={1}
            max={100}
            required
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">HP</span>
          </div>
          <input
            type="number"
            name="hp"
            className="input input-bordered input-sm w-full"
            value={formData.hp}
            onChange={handleChange}
            min={1}
            max={255}
            required
          />
        </label>
      </div>

      {/* Altura e Peso — preenchidos automaticamente */}
      <div className="grid grid-cols-2 gap-3">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Altura (m)</span>
          </div>
          <input
            type="number"
            name="height"
            className="input input-bordered input-sm w-full"
            value={formData.height}
            onChange={handleChange}
            min={0.1}
            step={0.1}
            required
          />
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Peso (kg)</span>
          </div>
          <input
            type="number"
            name="weight"
            className="input input-bordered input-sm w-full"
            value={formData.weight}
            onChange={handleChange}
            min={0.1}
            step={0.1}
            required
          />
        </label>
      </div>

      {/* Sexo e Status de saúde */}
      <div className="grid grid-cols-2 gap-3">
        <label className="form-control">
          <div className="label">
            <span className="label-text">Sexo</span>
          </div>
          <select
            name="gender"
            className="select select-bordered select-sm w-full"
            value={formData.gender}
            onChange={handleChange}
            required
          >
            <option value={PokemonGender.MALE}>♂ Macho</option>
            <option value={PokemonGender.FEMALE}>♀ Fêmea</option>
          </select>
        </label>

        <label className="form-control">
          <div className="label">
            <span className="label-text">Status de saúde</span>
          </div>
          <select
            name="healthStatus"
            className="select select-bordered select-sm w-full"
            value={formData.healthStatus}
            onChange={handleChange}
            required
          >
            <option value={PokemonHealthStatus.HEALTHY}>✓ Saudável</option>
            <option value={PokemonHealthStatus.POISONED}>☠ Envenenado</option>
            <option value={PokemonHealthStatus.BADLY_POISONED}>☠☠ Env. Grave</option>
            <option value={PokemonHealthStatus.BURNED}>🔥 Queimado</option>
            <option value={PokemonHealthStatus.PARALYZED}>⚡ Paralisado</option>
            <option value={PokemonHealthStatus.ASLEEP}>💤 Dormindo</option>
            <option value={PokemonHealthStatus.FROZEN}>❄ Congelado</option>
            <option value={PokemonHealthStatus.FAINTED}>✕ Desmaiado</option>
          </select>
        </label>
      </div>

      {/* Tipos — preenchidos automaticamente mas editáveis */}
      <div className="form-control">
        <div className="label">
          <span className="label-text">
            Tipos{' '}
            <span className="text-base-content/50 text-xs">(mín. 1, máx. 2)</span>
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ALL_TYPES.map((type) => {
            const isSelected = formData.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => handleTypeToggle(type)}
                className={`btn btn-xs ${isSelected ? 'btn-primary' : 'btn-outline'}`}
              >
                {type}
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary w-full mt-2"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="loading loading-spinner loading-sm" />
        ) : initialData ? (
          'Salvar alterações'
        ) : (
          'Cadastrar Pokémon'
        )}
      </button>

    </form>
  );
}