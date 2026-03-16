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

export interface CustomError extends Error {
  code: string;
  message: string;
}
