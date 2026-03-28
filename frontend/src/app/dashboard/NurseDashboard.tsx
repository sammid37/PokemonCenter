'use client';

import { useState } from 'react';
import { Pokemon, User, PokemonAction, ActionStatus } from '@/types';

import PokemonCard from '@/components/pokemon/PokemonCard';
import ActionsList from '@/components/pokemon/ActionsList';

type ActiveTab = 'pokemons' | 'actions';

interface NurseDashboardProps {
  pokemons: Pokemon[];
  actions: PokemonAction[];
  currentUser: User;
  error: string | null;
  setError: (error: string | null) => void;
  isReviewing: boolean;
  handleReview: (action: PokemonAction, approved: boolean) => Promise<void>;
}

export default function NurseDashboard({
  pokemons,
  actions,
  currentUser,
  error,
  setError,
  isReviewing,
  handleReview,
}: NurseDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pokemons');

  const pendingCount = actions.filter((a) => a.status === ActionStatus.PENDING).length;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🏥 Centro Pokémon</h1>
          <p className="text-base-content/50 text-sm">
            {pokemons.length} pokémon{pokemons.length !== 1 ? 's' : ''} sob cuidados
          </p>
        </div>
      </div>

      {/* Alerta de erro */}
      {error && (
        <div role="alert" className="alert alert-error mb-4">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="btn btn-ghost btn-xs">
            ✕
          </button>
        </div>
      )}

      {/* Abas */}
      <div role="tablist" className="tabs tabs-bordered mb-6">
        <button
          role="tab"
          className={`tab ${activeTab === 'pokemons' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('pokemons')}
        >
          Pokémons
        </button>
        <button
          role="tab"
          className={`tab ${activeTab === 'actions' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('actions')}
        >
          Solicitações
          {pendingCount > 0 && (
            <span className="badge badge-warning badge-sm ml-2">{pendingCount}</span>
          )}
        </button>
      </div>

      {/* Aba de Pokémons */}
      {activeTab === 'pokemons' &&
        (pokemons.length === 0 ? (
          <div className="text-center py-16 text-base-content/50">
            <p className="text-lg">Nenhum pokémon no centro no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pokemons.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                currentUser={currentUser}
                onEdit={() => {}}
                onDelete={() => {}}
                onRequestAction={() => {}}
              />
            ))}
          </div>
        ))}

      {/* Aba de Solicitações */}
      {activeTab === 'actions' && (
        <ActionsList
          actions={actions}
          currentUser={currentUser}
          onReview={handleReview}
          isReviewing={isReviewing}
        />
      )}
    </main>
  );
}
