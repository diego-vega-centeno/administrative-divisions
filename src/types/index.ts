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

export interface JstreeNode {
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
}[];
export interface osmRel {
  bounds: Record<string, number>;
  id: number;
  members: object[];
  tags: Record<string, any>;
  type: string;
}

export interface ComputedDataRelType {
  admin_level: string;
  area: number;
  id: string;
  name: string;
  perimeter: number;
  popDensity: number;
  population: number;
}

export type ComputedDataRelsType = ComputedDataRelType[];

export interface JsTreeWrapperRefType {
  getSelected: () => any[];
  filter: (filter: string) => void;
  getNodePath: (id: string) => string;
  tree: (_: boolean) => any;
}

export interface formatOsmRel {
  bounds: Record<string, number>;
  id: string;
  members: object[];
  tags?: Record<string, any>;
  parent: number;
  parents: number[];
  children: number[];
  type: string;
  geometry: any;
}

export interface LeafletStateRefProps {
  type: string;
  tileLayer: L.TileLayer | null;
  baseLayer: L.GeoJSON | null;
  layerControl: L.Control.Layers | null;
  legendControl: L.Control | null;
  choroplethInfoPanel: L.Control | null;
  highlightedLayer: L.Layer | null;
  hoverHighlightedLayer: L.Layer | null;
  openedTooltip: L.Tooltip | undefined;
  mapControl: CustomMapControl | null;
  mapControlIsCollapsed: boolean;
  map: L.Map | null;
  centerBtn: L.Control | null;
  handleMapClick: (e: L.LeafletMouseEvent) => void;
}

export interface CustomMapControl extends L.Control {
  updateTagsPanel: (
    leafletState: LeafletStateRefProps,
    tags: Record<string, any>,
    featureId: string,
  ) => void;
  btn: HTMLButtonElement;
  table: HTMLTableElement;
  tbody: HTMLTableSectionElement;
}
