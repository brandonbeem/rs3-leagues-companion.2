export type PageId =
  | 'dashboard'
  | 'tasks'
  | 'relics'
  | 'regions'
  | 'build'
  | 'friends'
  | 'route'
  | 'strategy';

export type RelicCategory =
  | 'Economy'
  | 'Support'
  | 'Production'
  | 'Magic'
  | 'Gathering'
  | 'Utility'
  | 'Combat'
  | 'Farming';

export interface RelicDetailSection {
  title: string;
  bullets: string[];
}

export interface Relic {
  id: string;
  name: string;
  category: RelicCategory;
  summary: string;
  plannerImpact: string;
  skills: string[];
  bestRegions: string[];
  stageValue: {
    early: number | null;
    mid: number | null;
    late: number | null;
  };
  rating: number | null;
  tierStatus: 'pending' | 'confirmed';
  details: RelicDetailSection[];
}
