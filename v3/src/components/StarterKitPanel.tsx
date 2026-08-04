import { useMemo } from 'react';
import { ClusterOverview } from './ClusterOverview';
import { buildResourceOpportunities } from '../core/acquisition/engine';
import { usePlayer } from '../core/player/PlayerProvider';
import { isTaskAllowedInRecommendedRoutes } from '../core/tasks/taskEngine';
import { acquisitionOptionsByItem } from '../data/acquisition';
import {
  itemById,
  items,
  toolBeltEligibleItems,
} from '../data/items';
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
  const activeToolBeltItems = toolBeltEligibleItems.filter((item) =>
    item.availability === 'starting-tool-belt' || player.toolBeltItemIds.includes(item.id),
  );
  const addableToolBeltItems = toolBeltEligibleItems.filter((item) => item.availability === 'tool-belt-addable');
  const unlockedTaskCount = new Set(suggestions.flatMap((suggestion) => suggestion.opportunityTaskIds)).size;

  return (
    <>
      <section className="panel starter-kit-panel">
        <div className="starter-kit-heading">
          <div>
            <p className="eyebrow">TOOL BELT & RESOURCE ENGINE</p>
            <h2>Useful setup</h2>
            <p>
              Starting tool-belt items are counted automatically. Only missing reusable tools that help the current task pool are suggested here.
            </p>
          </div>
          <div className="starter-kit-total">
            <strong>{activeToolBeltItems.length}</strong>
            <span>tools ready</span>
          </div>
        </div>

        <div className="tool-belt-status-strip">
          <span>
            <strong>Starting tool belt:</strong> {activeToolBeltItems
              .filter((item) => item.availability === 'starting-tool-belt')
              .map((item) => item.name)
              .join(', ') || 'No starting tools recorded'}
          </span>
          <small>These never appear as acquisition tasks.</small>
        </div>

        {suggestions.length === 0 ? (
          <div className="starter-kit-complete">
            <strong>Your current reusable-tool needs are covered.</strong>
            <span>New suggestions will appear only when migrated tasks actually need another tool.</span>
          </div>
        ) : (
          <div className="starter-kit-list">
            {suggestions.map((suggestion) => {
              const item = itemById.get(suggestion.itemId);
              const taskNames = suggestion.opportunityTaskIds
                .map((taskId) => taskById.get(taskId)?.name)
                .filter((name): name is string => Boolean(name));
              const isToolBeltItem = Boolean(item?.toolBeltEligible);

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
                    onClick={() => {
                      if (isToolBeltItem) {
                        dispatch({ type: 'set-tool-belt-item', itemId: suggestion.itemId, added: true });
                      } else {
                        dispatch({ type: 'set-asset-owned', itemId: suggestion.itemId, owned: true });
                      }
                    }}
                  >
                    {isToolBeltItem ? 'Confirm on belt' : 'Mark owned'}
                  </button>
                </article>
              );
            })}
          </div>
        )}

        <div className="starter-kit-footer">
          <span>{unlockedTaskCount} current task{unlockedTaskCount === 1 ? '' : 's'} reference the suggested tools.</span>
          <details className="owned-tool-manager">
            <summary>Manage Tool Belt ({activeToolBeltItems.length}/{toolBeltEligibleItems.length})</summary>
            <div className="tool-belt-manager-list">
              {addableToolBeltItems.map((item) => {
                const added = player.toolBeltItemIds.includes(item.id);
                return (
                  <button
                    type="button"
                    className={added ? 'tool-belt-toggle added' : 'tool-belt-toggle'}
                    key={item.id}
                    onClick={() => dispatch({ type: 'set-tool-belt-item', itemId: item.id, added: !added })}
                  >
                    {added ? '✓' : '+'} {item.name}
                  </button>
                );
              })}
            </div>
          </details>
        </div>
      </section>

      <ClusterOverview />
    </>
  );
}
