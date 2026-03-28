'use client';

import { useState } from 'react';
import {
  Pokemon,
  User,
  PokemonAction,
  ActionStatus,
  ActionType,
  CreatePokemonDto,
  UpdatePokemonDto,
} from '@/types';
import { ModalState } from '@/hooks/useDashboard';

import PokemonCard from '@/components/pokemon/PokemonCard';
import PokemonModal from '@/components/pokemon/PokemonModal';
import ActionModal from '@/components/pokemon/ActionModal';
import ActionsList from '@/components/pokemon/ActionsList';
import ConfirmModal from '@/components/ui/ConfirmModal';

type ActiveTab = 'pokemons' | 'actions';

interface TrainerDashboardProps {
  pokemons: Pokemon[];
  actions: PokemonAction[];
  currentUser: User;
  error: string | null;
  setError: (error: string | null) => void;
  modal: ModalState;
  setModal: (state: ModalState) => void;
  actionTarget: Pokemon | null;
  setActionTarget: (pokemon: Pokemon | null) => void;
  deleteTarget: Pokemon | null;
  setDeleteTarget: (pokemon: Pokemon | null) => void;
  isSubmitting: boolean;
  handleCreate: (data: CreatePokemonDto | UpdatePokemonDto) => Promise<void>;
  handleEdit: (data: CreatePokemonDto | UpdatePokemonDto) => Promise<void>;
  handleDelete: () => Promise<void>;
  handleRequestAction: (type: ActionType, note?: string) => Promise<void>;
}

export default function TrainerDashboard({
  pokemons,
  actions,
  currentUser,
  error,
  setError,
  modal,
  setModal,
  actionTarget,
  setActionTarget,
  deleteTarget,
  setDeleteTarget,
  isSubmitting,
  handleCreate,
  handleEdit,
  handleDelete,
  handleRequestAction,
}: TrainerDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pokemons');

  const pendingCount = actions.filter((a) => a.status === ActionStatus.PENDING).length;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">🎒 Meus Pokémons</h1>
          <p className="text-base-content/50 text-sm">
            {pokemons.length} pokémon{pokemons.length !== 1 ? 's' : ''} cadastrado
            {pokemons.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setModal({ open: true, mode: 'create' })}
          className="btn btn-primary btn-sm"
        >
          + Novo Pokémon
        </button>
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
            <p className="text-lg">Nenhum pokémon cadastrado ainda.</p>
            <p className="text-sm mt-1">Clique em &quot;Novo Pokémon&quot; para começar!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pokemons.map((pokemon) => (
              <PokemonCard
                key={pokemon.id}
                pokemon={pokemon}
                currentUser={currentUser}
                onEdit={(p) => setModal({ open: true, mode: 'edit', pokemon: p })}
                onDelete={setDeleteTarget}
                onRequestAction={setActionTarget}
              />
            ))}
          </div>
        ))}

      {/* Aba de Solicitações */}
      {activeTab === 'actions' && (
        <ActionsList
          actions={actions}
          currentUser={currentUser}
          onReview={() => {}}
          isReviewing={false}
        />
      )}

      {/* Modais */}
      {modal.open && (
        <PokemonModal
          mode={modal.mode}
          pokemon={modal.mode === 'edit' ? modal.pokemon : undefined}
          isLoading={isSubmitting}
          onSubmit={modal.mode === 'create' ? handleCreate : handleEdit}
          onClose={() => setModal({ open: false })}
        />
      )}

      {actionTarget && (
        <ActionModal
          pokemon={actionTarget}
          isLoading={isSubmitting}
          onSubmit={handleRequestAction}
          onClose={() => setActionTarget(null)}
        />
      )}

      {deleteTarget && (
        <ConfirmModal
          title="Confirmar exclusão"
          message={
            <>
              Tem certeza que deseja excluir o{' '}
              <span className="font-semibold text-error">{deleteTarget.name}</span>? Essa ação não
              pode ser desfeita.
            </>
          }
          confirmText="Excluir"
          variant="error"
          isSubmitting={isSubmitting}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </main>
  );
}
