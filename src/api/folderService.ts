import { isAxiosError } from 'axios';
import {
  CreateFolder,
  DocFolderEditHistory,
  DocumentBoxScope,
  FolderId,
  FolderResponse,
  PresignedDownloadResponse,
  UpdateFolder,
  UploadTaskResponse,
  ZipFolderRequest,
} from '../types';
import { DocboxClient } from './client';
import { FolderNotFoundError } from './error';

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
  async get(scope: DocumentBoxScope, folder_id: FolderId): Promise<FolderResponse> {
    try {
      return this.client.httpGet(`box/${scope}/folder/${folder_id}`);
    } catch (err) {
      if (isAxiosError(err) && err.response?.status === 404) {
        throw new FolderNotFoundError();
      }

      throw err;
    }
  }

  /**
   * Loads a specific folder returning null if the folder does not exist
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to request
   * @returns The resolved folder
   */
  async getOrNull(scope: DocumentBoxScope, folder_id: FolderId): Promise<FolderResponse | null> {
    try {
      return await this.get(scope, folder_id);
    } catch (err) {
      if (err instanceof FolderNotFoundError) {
        return null;
      }

      throw err;
    }
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

  /**
   * Create a zip creation task within the folder
   *
   * Use {@link FolderService.zip} to automatically handle the
   * produced task to get the ZIP download link
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to query
   * @param options Options for the created ZIP
   * @returns The task response
   */
  createZipTask(
    scope: DocumentBoxScope,
    folder_id: FolderId,
    options: ZipFolderRequest = {},
    abort?: AbortController
  ): Promise<UploadTaskResponse> {
    return this.client.httpPost(`box/${scope}/folder/${folder_id}`, options, {
      signal: abort?.signal,
    });
  }

  /**
   * Create a zip file out of the folder contents
   *
   * This will create the zip task and wait for the task
   * to complete
   *
   * @param scope Scope the folder resides within
   * @param folder_id ID of the folder to query
   * @param options Options for the created ZIP
   * @returns The presigned download response for downloading the created ZIP file
   */
  async zip(
    scope: DocumentBoxScope,
    folder_id: FolderId,
    options: ZipFolderRequest = {},
    abort?: AbortController
  ): Promise<PresignedDownloadResponse> {
    const task = await this.createZipTask(scope, folder_id, options, abort);
    return await this.client.task.finished(scope, task.task_id, 1000, abort);
  }
}
