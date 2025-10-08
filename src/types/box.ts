import { DocFolder, ResolvedFolder } from './folder';
import { DocumentBoxScope, ISODate } from './shared';

export interface CreateDocumentBox {
  /**
   *  Scope of the document box to create
   */
  scope: DocumentBoxScope;
}

export interface CreatedDocumentBox {
  /**
   * The created document box
   */
  document_box: DocumentBox;
  /**
   * The root folder of the document box
   */
  root: DocFolder;
}

export interface DocumentBoxResponse {
  /**
   * The document box itself
   */
  document_box: DocumentBox;
  /**
   * The root folder of the document box
   */
  root: DocFolder;
  /**
   * Resolved children of the document box
   */
  children: ResolvedFolder;
}

/**
 * Stats for a document box
 */
export interface DocumentBoxStats {
  /**
   * Total number of files within the document box
   */
  total_files: number;
  /**
   * Total number of links within the document box
   */
  total_links: number;
  /**
   * Total number of folders within the document box
   */
  total_folders: number;
  /**
   * Total size of all files within the document box
   *
   * (Available as of v0.4.0)
   */
  file_size?: number;
}

export interface DocumentBox {
  /**
   * Scope of the document box
   */
  scope: DocumentBoxScope;

  /**
   * Timestamp the document box was created at
   */
  created_at: ISODate;
}
