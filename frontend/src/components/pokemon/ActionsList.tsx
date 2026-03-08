'use client';

import { PokemonAction, ActionStatus, ActionType, UserRole, User } from '@/types';

const STATUS_STYLE: Record<ActionStatus, { badge: string; label: string }> = {
  [ActionStatus.PENDING]:  { badge: 'badge-warning', label: '⏳ Pendente' },
  [ActionStatus.APPROVED]: { badge: 'badge-success', label: '✓ Aprovado' },
  [ActionStatus.REJECTED]: { badge: 'badge-error',   label: '✕ Recusado' },
};

const ACTION_LABEL: Record<ActionType, string> = {
  [ActionType.HEAL]: '💊 Recuperação de saúde',
  [ActionType.FEED]: '🍎 Alimentação',
};

interface ActionsListProps {
  actions: PokemonAction[];
  currentUser: User | null;
  onReview: (action: PokemonAction, approved: boolean) => void;
  isReviewing: boolean;
}

export default function ActionsList({
  actions,
  currentUser,
  onReview,
  isReviewing,
}: ActionsListProps) {
  const isNurse = currentUser?.role === UserRole.NURSE;

  if (actions.length === 0) {
    return (
      <div className="text-center py-8 text-base-content/50">
        <p>Nenhuma solicitação de cuidado ainda.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {actions.map((action) => {
        const statusStyle = STATUS_STYLE[action.status];
        const isPending = action.status === ActionStatus.PENDING;

        return (
          <div
            key={action.id}
            className="card bg-base-100 shadow-sm border border-base-300"
          >
            <div className="card-body py-3 px-4 gap-2">

              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">
                    {action.pokemon.nickname ?? action.pokemon.name}
                    <span className="text-base-content/50 text-xs ml-2">
                      #{String(action.pokemon.pokedexNumber).padStart(3, '0')}
                    </span>
                  </p>
                  <p className="text-sm text-base-content/70">
                    {ACTION_LABEL[action.type]}
                  </p>
                </div>
                <span className={`badge badge-sm ${statusStyle.badge}`}>
                  {statusStyle.label}
                </span>
              </div>

              {/* Treinador solicitante */}
              {isNurse && (
                <p className="text-xs text-base-content/50">
                  Solicitado por: {action.requestedBy.name}
                </p>
              )}

              {/* Observação do treinador */}
              {action.trainerNote && (
                <p className="text-xs bg-base-200 rounded p-2">
                  🎒 {action.trainerNote}
                </p>
              )}

              {/* Observação da enfermeira */}
              {action.nurseNote && (
                <p className="text-xs bg-base-200 rounded p-2">
                  🏥 {action.nurseNote}
                </p>
              )}

              {/* Botões de aprovação — apenas Enfermeira Joy em ações pendentes */}
              {isNurse && isPending && (
                <div className="flex gap-2 justify-end mt-1">
                  <button
                    onClick={() => onReview(action, false)}
                    className="btn btn-outline btn-error btn-xs"
                    disabled={isReviewing}
                  >
                    Recusar
                  </button>
                  <button
                    onClick={() => onReview(action, true)}
                    className="btn btn-success btn-xs"
                    disabled={isReviewing}
                  >
                    {isReviewing ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : (
                      'Aprovar'
                    )}
                  </button>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}