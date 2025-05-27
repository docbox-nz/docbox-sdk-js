/**
 * Alias of a string representing a user ID
 */
export type UserId = string;

/**
 * Alias of a string representing a tenant ID
 */
export type TenantId = string;

/**
 * Alias of a string representing a file ID
 */
export type FileId = string;

/**
 * Alias of a string representing a generated file ID
 */
export type GeneratedFileId = string;

/**
 * Alias of a string representing a folder ID
 */
export type FolderId = string;

/**
 * Alias of a string representing a link ID
 */
export type LinkId = string;

/**
 * Alias of a string representing a document box scope
 */
export type DocumentBoxScope = string;

/**
 * Alias of any docbox item ID (File, Folder, Link)
 */
export type DocboxItemId = FileId | FolderId | LinkId;

/**
 * Alias for a string representing a ISO date
 *
 * @example
 * This can be turned into a date using;
 * ```
 * const date = new Date(value);
 * ```
 */
export type ISODate = string;

export enum EditHistoryType {
  MoveToFolder = 'MoveToFolder',
  Rename = 'Rename',
  LinkValue = 'LinkValue',
}

/**
 * Edit history metadata for moving something from
 * one folder to another
 *
 * Can be seen on: Files, Folders, and Links
 */
export interface EditHistoryMetadataMoveToFolder {
  /**
   * ID of the original folder before moving
   */
  original_id: string;
  /**
   * ID of the folder after moving
   */
  target_id: string;
}

/**
 * Edit history metadata for renaming something
 *
 * Can be seen on: Files, Folders, and Links
 */
export interface EditHistoryMetadataRename {
  /**
   * Name of the file before renaming
   */
  original_name: string;
  /**
   * Name of the file after renaming
   */
  new_name: string;
}

/**
 * Edit history metadata for changing the value of
 * a link
 *
 * Can be seen on: Link
 */
export interface EditHistoryMetadataLinkValue {
  /**
   * Previous URL value of the link
   */
  previous_value: string;
  /**
   * New URL value of the link
   */
  new_value: string;
}
