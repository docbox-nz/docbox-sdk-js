import { DocFile } from './file';
import { DocFolder, FolderPathSegment } from './folder';
import { DocLink } from './link';
import { DocboxItemId, DocumentBoxScope, FolderId, UserId } from './shared';

/**
 * Possible search result item types
 */
export enum SearchResultItemType {
  FILE = 'File',
  FOLDER = 'Folder',
  LINK = 'Link',
}

// Underlying data for the search result
export type DocboxSearchResultData =
  | ({ type: SearchResultItemType.FILE } & DocFile)
  | ({ type: SearchResultItemType.FOLDER } & DocFolder)
  | ({ type: SearchResultItemType.LINK } & DocLink);

export type DocboxSearchResult = {
  /**
   * Score the search result obtained
   */
  score: number;
  /**
   * Matches within pages of the content
   */
  page_matches: PageMatch[];
  /**
   * Resolved path to the item
   */
  path: FolderPathSegment[];
  /**
   * Total number of search "hits"
   */
  total_hits: number;
} & DocboxSearchResultData;

export type DocboxSearchResultAdmin = DocboxSearchResult & { scope: DocumentBoxScope };

export interface DocboxSearchResponse {
  /**
   * Total number of hits
   */
  total_hits: number;

  /**
   * Results from the search
   */
  results: DocboxSearchResult[];
}

export interface DocboxSearchResponseAdmin {
  /**
   * Total number of hits
   */
  total_hits: number;

  /**
   * Results from the search
   */
  results: DocboxSearchResultAdmin[];
}

export interface PageMatch {
  /**
   * Page number
   */
  page: number;
  /**
   * Matched content results
   */
  matches: string[];
}

export type DocboxAdminSearchRequest = DocboxSearchRequest & {
  scopes: DocumentBoxScope[];
};

export interface DocboxFileSearchRequest {
  /**
   * Search query to search for
   */
  query?: string | null;
  /**
   * Number of results to skip
   */
  offset?: number;
  /**
   * Maximum number of results to return
   */
  limit?: number;
}

export interface DocboxSearchRequest {
  /**
   * Search query to search for
   */
  query?: string | null;
  /**
   * Whether to use neural searching
   */
  neural?: boolean;
  /**
   * Mime type to filter search by
   */
  mime?: string | null;
  /**
   * Whether to include the item name when searching
   */
  include_name?: boolean;
  /**
   * Whether to perform full text search over the contents
   * of files, links, ...etc
   */
  include_content?: boolean;
  /**
   * Filter to a specific created at range
   */
  created_at?: DateRange | null;
  /**
   * Filter to a specific date modified range
   */
  modified?: DateRange | null;
  /**
   * Filter to a specific user who created
   */
  created_by?: UserId | null;
  /**
   * Filter to only results within the children of a specific
   * folder by ID
   */
  folder_id?: FolderId | null;
  /**
   * Filter results to only results for a specific item
   *
   * (i.e searching full text within a specific file)
   *
   * @deprecated Use dedicated file search API instead
   */
  item_id?: DocboxItemId | null;
  /**
   * Number of results to obtain
   */
  size?: number;
  /**
   * Number of results to skip
   */
  offset?: number;
  /**
   * Number of pages of content results to obtain
   */
  max_pages?: number;
  /**
   * Number of pages of content results to skip
   *
   * @deprecated Use dedicated file search API instead
   */
  pages_offset?: number;
}

/**
 * Searchable date range, must have either a start
 * or end date or both, cannot be both null
 */
export interface DateRange {
  /**
   * Start date, leave undefined/null for the beginning of time
   */
  start?: string | null;
  /**
   * End date, leave undefined/null for the end of time
   */
  end?: string | null;
}
