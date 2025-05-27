import {
  EditHistoryMetadataLinkValue,
  EditHistoryMetadataMoveToFolder,
  EditHistoryMetadataRename,
  EditHistoryType,
  FolderId,
  ISODate,
  LinkId,
} from './shared';
import { User } from './user';

/**
 * Link stored within docbox
 */
export interface DocLink {
  /**
   * Unique ID of the link
   */
  id: LinkId;
  /**
   * Name of the link
   */
  name: string;
  /**
   * URL value of the link
   */
  value: string;
  /**
   * ID of the folder this link is stored within.
   */
  folder_id: FolderId;
  /**
   * Timestamp of when the link was created
   */
  created_at: ISODate;
  /**
   * User who created the link if the user was known
   * at the point of creation
   */
  created_by: User | null;
  /**
   * Timestamp of when the link was last modified
   */
  last_modified_at: ISODate | null;
  /**
   * User who last modified the link if the user was
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
export interface DocLinkEditHistoryBase {
  /**
   * ID of the specific entry
   */
  id: string;
  /**
   * ID of the link the edit history belongs to
   */
  link_id: LinkId;
  /**
   * User who performed the edit, if available at the
   * time of the edit
   */
  user: User | null;
  /**
   * Timestamp the edit was performed at
   */
  created_at: ISODate;
}

export type DocLinkEditHistoryData =
  | { type: EditHistoryType.MoveToFolder; metadata: EditHistoryMetadataMoveToFolder }
  | { type: EditHistoryType.Rename; metadata: EditHistoryMetadataRename }
  | { type: EditHistoryType.LinkValue; metadata: EditHistoryMetadataLinkValue };

export type DocLinkEditHistory = DocLinkEditHistoryBase & DocLinkEditHistoryData;

/**
 * Metadata resolved from looking up a website
 */
export interface LinkMetadata {
  /**
   * Website <title/> tag contents if available
   */
  title: string | null;
  /**
   * OGP metadata title if available
   */
  og_title: string | null;
  /**
   * OGP metadata description if available
   */
  og_description: string | null;
  /**
   * Whether a favicon was determined to be available
   */
  favicon: boolean;
  /**
   * Whether an OGP image was determined to be available
   */
  image: boolean;
}

export interface CreateLink {
  /**
   * Name of the link
   */
  name: string;
  /**
   * URL value of the link
   */
  value: string;
  /**
   * ID of the folder to create the link within
   */
  folder_id: FolderId;
}

export interface UpdateLink {
  /**
   * Optional new name of the link.
   *
   * leave undefined or specify null to not update this field
   */
  name?: string | null;
  /**
   * Optional new folder to move the link to.
   *
   * leave undefined or specify null to not update this field
   */
  folder_id?: FolderId | null;
  /**
   * Optional new URL value for the link
   *
   * leave undefined or specify null to not update this field
   */
  value?: string | null;
}
