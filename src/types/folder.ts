import { DocFile } from './file';
import { DocLink } from './link';
import {
  ISODate,
  FolderId,
  EditHistoryType,
  EditHistoryMetadataRename,
  EditHistoryMetadataMoveToFolder,
} from './shared';
import { User } from './user';

/**
 * Folder within docbox
 */
export interface DocFolder {
  /**
   * Unique ID of the folder
   */
  id: FolderId;
  /**
   * Name of the folder
   */
  name: string;
  /**
   * ID of the folder this folder is contained within. This
   * is null if the folder is the root folder of a document
   * box
   */
  folder_id: FolderId | null;
  /**
   * Timestamp of when the folder was created
   */
  created_at: ISODate;
  /**
   * User who created the folder if the user was known
   * at the point of creation
   */
  created_by: User | null;
  /**
   * Timestamp of when the folder was last modified
   */
  last_modified_at: ISODate | null;
  /**
   * User who last modified the folder if the user was
   * known at the point of modification
   *
   * NOTE: This is the user for the most recent modification, not the
   * most recent modification with a user
   */
  last_modified_by: User | null;
}

/**
 * Entry within an edit history for a file
 */
export interface DocFolderEditHistoryBase {
  /**
   * ID of the specific entry
   */
  id: string;
  /**
   * ID of the folder the edit history belongs to
   */
  folder_id: FolderId;
  /**
   * User who performed the edit, if available at the.
   * time of the edit
   */
  user: User | null;
  /**
   * Timestamp the edit was performed at.
   */
  created_at: ISODate;
}

export type DocFolderEditHistoryData =
  | { type: EditHistoryType.MoveToFolder; metadata: EditHistoryMetadataMoveToFolder }
  | { type: EditHistoryType.Rename; metadata: EditHistoryMetadataRename };

export type DocFolderEditHistory = DocFolderEditHistoryBase & DocFolderEditHistoryData;

/**
 * Create a new folder
 */
export interface CreateFolder {
  /**
   * Name of the folder, must be at minimum 1 character long.
   */
  name: string;
  /**
   * ID of the parent folder to create the folder within.
   */
  folder_id: FolderId;
}

/**
 * Perform partial updates on a specific folder, such
 * as changing the folder name or moving it to another folder
 */
export interface UpdateFolder {
  /**
   * Optional new name of the folder.
   *
   * leave undefined or specify null to not update this field
   */
  name?: string | null;
  /**
   * Optional new folder to move the folder to.
   *
   * leave undefined or specify null to not update this field
   */
  folder_id?: FolderId | null;
}

/**
 * Named segment from a folder path
 */
export interface FolderPathSegment {
  /**
   * ID of the folder for this segment
   */
  id: FolderId;
  /**
   * Name of the folder for this segment
   */
  name: string;
}

/**
 * Resolved details about a folder such as the path
 * to the folder and its children
 */
export interface ResolvedFolder {
  /**
   * Path to get to the folder itself
   */
  path: FolderPathSegment[];

  /**
   * Folders contained within the folder
   */
  folders: DocFolder[];

  /**
   * Files contained within the folder
   */
  files: DocFile[];

  /**
   * Links contained within the folder
   */
  links: DocLink[];
}

/**
 * Response from requesting a folder
 */
export interface FolderResponse {
  /**
   * The folder itself
   */
  folder: DocFolder;
  /**
   * The resolved folder details
   */
  children: ResolvedFolder;
}
