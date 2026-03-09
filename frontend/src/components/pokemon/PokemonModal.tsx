'use client';

import { Pokemon, CreatePokemonDto, UpdatePokemonDto } from '@/types';
import PokemonForm from './PokemonForm';

interface PokemonModalProps {
  mode: 'create' | 'edit';
  pokemon?: Pokemon;
  isLoading: boolean;
  onSubmit: (data: CreatePokemonDto | UpdatePokemonDto) => Promise<void>;
  onClose: () => void;
}

export default function PokemonModal({
  mode,
  pokemon,
  isLoading,
  onSubmit,
  onClose,
}: PokemonModalProps) {
  return (
    <dialog id="pokemon_modal" className="modal modal-open">
      <div className="modal-box w-11/12 max-w-lg h-150 overflow-y-auto">

        <h3 className="font-bold text-lg mb-4">
          {mode === 'create' ? 'Cadastrar Pokémon' : `Editar ${pokemon?.name}`}
        </h3>

        <PokemonForm
          initialData={mode === 'edit' ? pokemon : undefined}
          onSubmit={onSubmit}
          isLoading={isLoading}
        />

        {/* Botão de fechar */}
        <div className="modal-action mt-2">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancelar
          </button>
        </div>

      </div>

      {/* Clique fora do modal para fechar */}
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}