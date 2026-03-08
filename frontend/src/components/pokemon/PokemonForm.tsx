'use client';

import { useState } from 'react';
import { CreatePokemonDto, Pokemon, PokemonType, UpdatePokemonDto } from '@/types';

interface PokemonFormProps {
  initialData?: Pokemon;
  onSubmit: (data: CreatePokemonDto | UpdatePokemonDto) => Promise<void>;
  isLoading: boolean;
}

const ALL_TYPES = Object.values(PokemonType);

export default function PokemonForm({ initialData, onSubmit, isLoading }: PokemonFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    level: initialData?.level ?? 1,
    hp: initialData?.hp ?? 1,
    pokedexNumber: initialData?.pokedexNumber ?? 1,
    types: initialData?.types ?? [],
  });
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value,
    }));
  }

  function handleTypeToggle(type: PokemonType) {
    setFormData((prev) => {
      const alreadySelected = prev.types.includes(type);

      // Remove o tipo se já estiver selecionado
      if (alreadySelected) {
        return { ...prev, types: prev.types.filter((t) => t !== type) };
      }

      // Bloqueia seleção de mais de 2 tipos
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

    if (formData.types.length === 0) {
      setError('Selecione pelo menos 1 tipo');
      return;
    }

    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">

      {error && (
        <div role="alert" className="alert alert-error text-sm">
          <span>{error}</span>
        </div>
      )}

      {/* Nome */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Nome</span>
        </div>
        <input
          type="text"
          name="name"
          placeholder="Pikachu"
          className="input input-bordered input-sm w-full"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </label>

      {/* Número da Pokédex */}
      <label className="form-control">
        <div className="label">
          <span className="label-text">Número da Pokédex</span>
        </div>
        <input
          type="number"
          name="pokedexNumber"
          placeholder="25"
          className="input input-bordered input-sm w-full"
          value={formData.pokedexNumber}
          onChange={handleChange}
          min={1}
          required
        />
      </label>

      {/* Nível e HP lado a lado */}
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

      {/* Seleção de tipos */}
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