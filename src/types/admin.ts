import { DocumentBox } from './box';

export interface AdminDocumentBoxesRequest {
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
}
