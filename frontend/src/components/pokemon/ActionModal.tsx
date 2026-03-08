'use client';

import { useState } from 'react';
import { ActionType, Pokemon } from '@/types';

interface ActionModalProps {
  pokemon: Pokemon;
  isLoading: boolean;
  onSubmit: (type: ActionType, note?: string) => Promise<void>;
  onClose: () => void;
}

export default function ActionModal({
  pokemon,
  isLoading,
  onSubmit,
  onClose,
}: ActionModalProps) {
  const [selectedType, setSelectedType] = useState<ActionType>(ActionType.HEAL);
  const [note, setNote] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit(selectedType, note.trim() || undefined);
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">
          Solicitar cuidado — {pokemon.nickname ?? pokemon.name}
        </h3>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">

          {/* Tipo de ação */}
          <div className="form-control">
            <div className="label">
              <span className="label-text">Tipo de cuidado</span>
            </div>
            <div className="flex gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={selectedType === ActionType.HEAL}
                  onChange={() => setSelectedType(ActionType.HEAL)}
                />
                <span>💊 Recuperação de saúde</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  className="radio radio-primary"
                  checked={selectedType === ActionType.FEED}
                  onChange={() => setSelectedType(ActionType.FEED)}
                />
                <span>🍎 Alimentação</span>
              </label>
            </div>
          </div>

          {/* Observação opcional */}
          <label className="form-control">
            <div className="label">
              <span className="label-text">
                Observação{' '}
                <span className="text-base-content/50 text-xs">(opcional)</span>
              </span>
            </div>
            <input
              type="text"
              placeholder="Ex: Meu Pikachu foi envenenado na batalha..."
              className="input input-bordered input-sm w-full"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </label>

          <button
            type="submit"
            className="btn btn-primary w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              'Solicitar cuidado'
            )}
          </button>

        </form>

        <div className="modal-action mt-2">
          <button onClick={onClose} className="btn btn-ghost btn-sm">
            Cancelar
          </button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </dialog>
  );
}