import { DocumentBox } from './box';

export interface AdminDocumentBoxesRequest {
  /**
   * Optional query to search document boxes with
   *
   * (Use * or % for wildcard matching)
   */
  query?: string | null;
  /**
   * Number of items to include in the response
   */
  size: number;
  /**
   * Offset to start providing results from
   */
  offset: number;
}

export interface AdminDocumentBoxesResponse {
  results: DocumentBox[];

  /**
   * Total number of document boxes (or total matching results for queries)
   */
  total?: number;
}

export interface TenantStatsResponse {
  /**
   * Size of all files within the tenant
   */
  file_size: number;
}
