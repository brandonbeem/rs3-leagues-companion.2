import { useMemo } from 'react';
import { buildResourceOpportunities } from '../core/acquisition/engine';
import { usePlayer } from '../core/player/PlayerProvider';
import { isTaskAllowedInRecommendedRoutes } from '../core/tasks/taskEngine';
import { acquisitionOptionsByItem } from '../data/acquisition';
import { itemById, items } from '../data/items';
import { taskById, tasks } from '../data/tasks';

function formatPathStatus(status: 'available' | 'manual' | 'review' | undefined): string {
  if (status === 'available') return 'Known path';
  if (status === 'manual') return 'Player check';
  if (status === 'review') return 'Path needs review';
  return 'Source needed';
}

export function StarterKitPanel() {
  const { player, dispatch } = usePlayer();
  const eligibleTasks = useMemo(
    () => tasks.filter((task) =>
      isTaskAllowedInRecommendedRoutes(task, player)
      && task.routePolicy !== 'manual-only'
      && task.reviewStatus !== 'placeholder',
    ),
    [player],
  );
  const suggestions = useMemo(
    () => buildResourceOpportunities(eligibleTasks, player, items, acquisitionOptionsByItem, 3),
    [eligibleTasks, player],
  );
  const ownedTools = items.filter((item) => item.persistent && player.ownedAssetIds.includes(item.id));
  const unlockedTaskCount = new Set(suggestions.flatMap((suggestion) => suggestion.opportunityTaskIds)).size;

  return (
    <section className="panel starter-kit-panel">
      <div className="starter-kit-heading">
        <div>
          <p className="eyebrow">RESOURCE ENGINE</p>
          <h2>Starter kit</h2>
          <p>
            Reusable tools are suggested only when they help with the current task pool. Mark one owned and the affected tasks update immediately.
          </p>
        </div>
        <div className="starter-kit-total">
          <strong>{suggestions.length}</strong>
          <span>suggested</span>
        </div>
      </div>

      {suggestions.length === 0 ? (
        <div className="starter-kit-complete">
          <strong>Your current reusable-tool needs are covered.</strong>
          <span>New suggestions will appear as more task dependencies are migrated.</span>
        </div>
      ) : (
        <div className="starter-kit-list">
          {suggestions.map((suggestion) => {
            const item = itemById.get(suggestion.itemId);
            const taskNames = suggestion.opportunityTaskIds
              .map((taskId) => taskById.get(taskId)?.name)
              .filter((name): name is string => Boolean(name));

            return (
              <article className="starter-kit-item" key={suggestion.itemId}>
                <div className="starter-kit-item-copy">
                  <div className="starter-kit-title-row">
                    <strong>{suggestion.itemName}</strong>
                    <span>{suggestion.opportunityCount} task{suggestion.opportunityCount === 1 ? '' : 's'}</span>
                  </div>
                  <p>{suggestion.bestOption?.label ?? item?.notes ?? 'Acquisition path still needs migration.'}</p>
                  <small>{formatPathStatus(suggestion.bestOption?.status)}</small>
                  <details>
                    <summary>Why this helps</summary>
                    <ul>
                      {taskNames.slice(0, 4).map((name) => <li key={name}>{name}</li>)}
                    </ul>
                  </details>
                </div>
                <button
                  type="button"
                  className="primary-button"
                  onClick={() => dispatch({ type: 'set-asset-owned', itemId: suggestion.itemId, owned: true })}
                >
                  Mark owned
                </button>
              </article>
            );
          })}
        </div>
      )}

      <div className="starter-kit-footer">
        <span>{unlockedTaskCount} current task{unlockedTaskCount === 1 ? '' : 's'} reference the suggested tools.</span>
        {ownedTools.length > 0 && (
          <details className="owned-tool-manager">
            <summary>{ownedTools.length} reusable tool{ownedTools.length === 1 ? '' : 's'} marked owned</summary>
            <div>
              {ownedTools.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => dispatch({ type: 'set-asset-owned', itemId: item.id, owned: false })}
                >
                  Remove {item.name}
                </button>
              ))}
            </div>
          </details>
        )}
      </div>
    </section>
  );
}
