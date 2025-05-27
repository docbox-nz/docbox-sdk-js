import {
  CreateFolder,
  DocFolderEditHistory,
  DocumentBoxScope,
  FolderId,
  FolderResponse,
  UpdateFolder,
} from '../types';
import { DocboxClient } from './client';

export class FolderService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Create a new folder
   *
   * @param scope Scope to create the folder within
   * @param data Configuration for creating the folder
   * @returns The created folder
   */
  create(scope: DocumentBoxScope, data: CreateFolder): Promise<FolderResponse> {
    return this.client.httpPost(`box/${scope}/folder`, data);
  }

  /**
   * Loads a specific folder
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to request
   * @returns The resolved folder
   */
  get(scope: DocumentBoxScope, folder_id: FolderId): Promise<FolderResponse> {
    return this.client.httpGet(`box/${scope}/folder/${folder_id}`);
  }

  /**
   * Update a folder details
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to update
   * @param data The folder update data
   */
  update(scope: DocumentBoxScope, folder_id: FolderId, data: UpdateFolder): Promise<void> {
    return this.client.httpPut(`box/${scope}/folder/${folder_id}`, data);
  }

  /**
   * Deletes the provided folder
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to delete
   */
  delete(scope: DocumentBoxScope, folder_id: FolderId): Promise<void> {
    return this.client.httpDelete(`box/${scope}/folder/${folder_id}`);
  }

  /**
   * Load the edit history of a folder
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to query
   * @returns The folder edit history
   */
  editHistory(scope: DocumentBoxScope, folder_id: FolderId): Promise<DocFolderEditHistory[]> {
    return this.client.httpGet(`box/${scope}/folder/${folder_id}/edit-history`);
  }
}
