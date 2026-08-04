import { useMemo } from 'react';
import type { ItemId } from '../core/ids';
import { resolveItemAcquisition } from '../core/acquisition/engine';
import { resolveTaskDependencies } from '../core/dependency/engine';
import type { DependencyNode, DependencyStatus } from '../core/dependency/types';
import { usePlayer } from '../core/player/PlayerProvider';
import type { TaskDefinition } from '../core/tasks/types';
import { acquisitionOptionsByItem } from '../data/acquisition';
import { itemById } from '../data/items';
import { taskById } from '../data/tasks';

const statusLabels: Record<DependencyStatus, string> = {
  satisfied: 'Met',
  actionable: 'Can plan',
  unresolved: 'Needs data',
  manual: 'Player choice',
  blocked: 'Blocked',
  review: 'Needs review',
};

function DependencyBranch({ node, depth = 0 }: { node: DependencyNode; depth?: number }) {
  return (
    <li className={`dependency-node status-${node.status}`}>
      <div className="dependency-node-row">
        <span className="dependency-connector" aria-hidden="true">{depth === 0 ? '◆' : '↳'}</span>
        <div className="dependency-node-copy">
          <div>
            <strong>{node.label}</strong>
            <span className={`dependency-status status-${node.status}`}>{statusLabels[node.status]}</span>
          </div>
          {node.description && <small>{node.description}</small>}
        </div>
      </div>
      {node.children.length > 0 && (
        <ul className="dependency-children">
          {node.children.map((child) => (
            <DependencyBranch node={child} depth={depth + 1} key={child.id} />
          ))}
        </ul>
      )}
    </li>
  );
}

export function DependencyInspector({ task }: { task: TaskDefinition }) {
  const { player } = usePlayer();
  const resolution = useMemo(
    () => resolveTaskDependencies(task, player, {
      taskById,
      itemName: (itemId) => itemById.get(itemId as ItemId)?.name ?? itemId.replace('item:', '').replaceAll('-', ' '),
      resolveItem: (itemId, quantity) => {
        const item = itemById.get(itemId);
        return item ? resolveItemAcquisition(item, quantity, player, acquisitionOptionsByItem) : null;
      },
    }),
    [player, task],
  );

  const headline = resolution.root.status === 'satisfied'
    ? 'Already satisfied'
    : resolution.canAutoResolve
      ? 'Automatic dependency path available'
      : resolution.summary.manual > 0
        ? 'Player-controlled step required'
        : 'Dependency data still needed';

  return (
    <details className="dependency-inspector">
      <summary>
        <span>
          <strong>Dependency details</strong>
          <small>{headline}</small>
        </span>
        <span className={resolution.canAutoResolve ? 'dependency-readiness ready' : 'dependency-readiness limited'}>
          {resolution.canAutoResolve ? 'Ready' : 'Review'}
        </span>
      </summary>

      <div className="dependency-summary-grid">
        <div><span>Graph nodes</span><strong>{resolution.summary.total}</strong></div>
        <div><span>Already met</span><strong>{resolution.summary.satisfied}</strong></div>
        <div><span>Actionable</span><strong>{resolution.summary.actionable}</strong></div>
        <div><span>Manual/review</span><strong>{resolution.summary.manual + resolution.summary.review + resolution.summary.unresolved + resolution.summary.blocked}</strong></div>
      </div>

      {resolution.manualReasons.length > 0 && (
        <div className="dependency-policy-note manual">
          <strong>Kept out of automatic routes</strong>
          <span>{resolution.manualReasons.join(' · ')}</span>
        </div>
      )}

      {resolution.unresolvedReasons.length > 0 && (
        <div className="dependency-policy-note review">
          <strong>Needs more migration data</strong>
          <span>{resolution.unresolvedReasons.join(' · ')}</span>
        </div>
      )}

      <ul className="dependency-tree">
        <DependencyBranch node={resolution.root} />
      </ul>
    </details>
  );
}
