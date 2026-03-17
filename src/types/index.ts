export interface RelationsType {
  id: string;
  layer_id: string;
  layer_title: string;
  admin_level: string;
}

export interface RelationsUserLayersType {
  id: string;
  layer_id: string;
  layer_title: string;
  osm_relation_id: string;
  admin_level: string;
  osm_relation_name: string;
  parents_names: string;
}

interface JstreeNode {
  id: string;
  text: string;
  icon: boolean;
  parent: string;
  parents: string[];
  children: string[];
  children_d: string[];
  state: Record<string, boolean>;
  li_attr: Record<string, string>;
  a_attr: Record<string, string>;
  original: {
    id: string;
    parent: string;
    text: string;
    admin_level: string;
    state: {};
  };
}

export type SelectedNodesType = JstreeNode[];
export interface CustomError extends Error {
  code: string;
  message: string;
}

export type FormattedRelsType = {
  relId: string;
  relName: string;
  adminLevel: string;
  parentsNames: string | undefined;
}[]
