import axios, { AxiosRequestConfig, isAxiosError } from 'axios';
import {
  DocboxFileSearchRequest,
  DocboxFileSearchResponse,
  DocumentBoxScope,
  FileId,
  FileResponse,
  FolderId,
  GeneratedFileType,
  PresignedStatusResponse,
  UpdateFile,
  UploadFileResponse,
  UploadTaskResponse,
} from '../types';
import { DocboxClient } from './client';
import { sleep } from './utils';
import {
  DocFile,
  DocFileEditHistory,
  DocGeneratedFile as GeneratedFile,
  PresignedDownloadResponse,
  PresignedUploadFileRequest,
  PresignedUploadOptions,
  PresignedUploadResponse,
  UploadFileRequest,
} from '../types/file';

import 'formdata-polyfill';
import { FileNotFoundError } from './error';

export class FileService {
  private client: DocboxClient;

  constructor(client: DocboxClient) {
    this.client = client;
  }

  /**
   * Get a URL to a raw version of a file
   *
   * @param scope Scope the file is within
   * @param id ID of the file
   * @returns The file URL
   */
  rawURL(scope: DocumentBoxScope, id: string) {
    return `box/${scope}/file/${id}/raw`;
  }

  /**
   * Get a URL to a raw version of a file with an additional
   * cosmetic name shown in browser viewers
   *
   * @param scope Scope the file is within
   * @param id ID of the file
   * @param name Name to provide the file
   * @returns The file URL
   */
  rawNamedURL(scope: DocumentBoxScope, id: string, name: string) {
    return `box/${scope}/file/${id}/raw/${encodeURIComponent(name)}`;
  }

  /**
   * Get a URL to a generated version of a file
   *
   * @param scope Scope the file is within
   * @param id ID of the main file
   * @param type Type of generated file to get
   * @returns The URL to the generated file
   */
  generatedRawURL(scope: string, id: string, type: string) {
    return `box/${scope}/file/${id}/generated/${type}/raw`;
  }

  /**
   * Get a URL to a generated version of a file with an additional
   * cosmetic name shown in browser viewers
   *
   * @param scope Scope the file is within
   * @param id ID of the main file
   * @param type Type of generated file to get
   * @param name Name to provide the file
   * @returns The URL to the generated file
   */
  generatedRawNamedURL(scope: string, id: string, type: string, name: string) {
    return `box/${scope}/file/${id}/generated/${type}/raw/${encodeURIComponent(name)}`;
  }

  /**
   * Direct upload
   *
   * @deprecated When behind the proxy service this will often encounter timeout issues
   * its recommended you use another upload method
   *
   * Prefer {@link FileService.uploadAsync}
   *
   * @param scope Scope to upload the file into
   * @param name Name of the file
   * @param folder_id Folder to store the file in
   * @param file File to store
   * @returns File upload response
   */
  async upload(
    scope: DocumentBoxScope,
    name: string,
    folder_id: FolderId,
    file: File
  ): Promise<UploadFileResponse> {
    // Create form data
    const data = new FormData();
    data.append('name', name);
    data.append('folder_id', folder_id);
    data.append('file', file);

    return this.client.httpPost(`box/${scope}/file`, data, {
      // Clear default JSON content type (We need the browser to set multipart headers properly)
      headers: { 'Content-Type': undefined },
    });
  }

  /**
   * Asynchronous direct upload
   *
   * (File is uploaded directly but processed asynchronously)
   *
   * If you are handling reasonably sized files prefer {@link FileService.uploadPresigned} to
   * prevent running into browser timeouts as the file is transferred between services
   *
   * @param request Upload request data
   * @returns The uploaded file response
   */
  async uploadAsync(request: UploadFileRequest): Promise<UploadFileResponse> {
    // Create form data
    const data = new FormData();
    data.append('name', request.name);
    data.append('folder_id', request.folder_id);
    data.append('file', request.file);
    data.append('asynchronous', 'true');

    if (request.fixed_id) {
      data.append('fixed_id', request.fixed_id);
    }

    if (request.parent_id) {
      data.append('parent_id', request.parent_id);
    }

    if (request.processing_config) {
      data.append('processing_config', JSON.stringify(request.processing_config));
    }

    const taskResponse: UploadTaskResponse = await this.client.httpPost(
      `box/${request.scope}/file`,
      data,
      {
        // Clear default JSON content type (We need the browser to set multipart headers properly)
        headers: { 'Content-Type': undefined },
      }
    );

    return await this.client.task.finished(
      request.scope,
      taskResponse.task_id,
      1000,
      request.abort
    );
  }

  /**
   * Performs a pre-signed file upload
   *
   * @param scope Scope to upload the file into
   * @param folderId ID of the folder to store the file within
   * @param file File to upload
   * @param options Request options
   * @returns File upload response
   */
  async uploadPresigned(
    scope: DocumentBoxScope,
    folderId: FolderId,
    file: File,
    options?: PresignedUploadOptions
  ): Promise<FileResponse> {
    if (options && options.onProgress) {
      options.onProgress('Preparing');
    }

    const presigned = await this.createPresignedUpload(scope, {
      name: file.name,
      folder_id: folderId,
      size: file.size,
      mime: file.type,
      parent_id: options?.parent_id,
      processing_config: options?.processing_config,
    });

    await this.performPresignedUpload(file, presigned, options);

    if (options && options.onProgress) {
      options.onProgress('Processing');
    }

    const taskId = presigned.task_id;
    const response = await this.presignedFinished(scope, taskId, 1000, options?.abort);

    if (options && options.onProgress) {
      options.onProgress('Complete', 1);
    }

    return response;
  }

  async performPresignedUpload(
    file: File,
    presigned: PresignedUploadResponse,
    options?: PresignedUploadOptions
  ): Promise<void> {
    if (options && options.onProgress) {
      options.onProgress('Starting');
    }

    // Browser is not allowed to set this header
    delete presigned.headers['content-length'];

    const config: AxiosRequestConfig = {
      method: presigned.method,
      url: presigned.uri,
      headers: {
        'Content-Type': file.type,
        ...presigned.headers,
      },
      data: file,
    };

    if (options) {
      if (options.onProgress) {
        const onProgress = options.onProgress;

        config.onUploadProgress = (event) => {
          if (!event.progress) {
            onProgress('Uploading');
            return;
          }

          if (event.progress === 1) {
            onProgress('Uploaded', 1);
          } else {
            onProgress('Uploading', event.progress);
          }
        };
      }

      // Apply abort signal
      if (options.abort) {
        config.signal = options.abort.signal;
      }
    }

    // Upload the file to the presigned target
    await axios.request(config);
  }

  /**
   * Creates a new presigned upload
   *
   * @param scope Scope to upload the file within
   * @param request The presigned upload request
   * @returns The presigned upload details
   */
  createPresignedUpload(
    scope: DocumentBoxScope,
    request: PresignedUploadFileRequest
  ): Promise<PresignedUploadResponse> {
    return this.client.httpPost(`box/${scope}/file/presigned`, request);
  }

  /**
   * Request the status of a presigned upload task
   *
   * @param scope Scope the upload file task is within
   * @param taskId ID of the uploading task
   * @param abort Abort handle to abort the request
   * @returns The task status
   */
  presignedStatus(
    scope: DocumentBoxScope,
    taskId: string,
    abort?: AbortController
  ): Promise<PresignedStatusResponse> {
    return this.client.httpGet(`box/${scope}/file/presigned/${taskId}`, { signal: abort?.signal });
  }

  /**
   * Polls for the completion of a presigned upload task
   *
   * @param scope Scope the upload file task is within
   * @param task_id ID of the uploading task
   * @param interval Rate at which to poll for completion
   * @param abort Abort handle that can abort the polling
   * @returns The uploaded file response
   */
  async presignedFinished(
    scope: DocumentBoxScope,
    task_id: string,
    interval: number = 1000,
    abort?: AbortController
  ): Promise<FileResponse> {
    while (abort === undefined ? true : !abort.signal.aborted) {
      const task = await this.presignedStatus(scope, task_id, abort);

      if (task.status === 'Complete') {
        return { file: task.file, generated: task.generated };
      }

      if (task.status === 'Failed') {
        const error: string = task.error ?? 'Unknown error';
        throw new Error(error);
      }

      await sleep(interval);
    }

    throw new Error('upload tracking aborted');
  }

  /**
   * Request the details of a file using its ID and scope
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file
   * @returns The full file details
   */
  async get(scope: DocumentBoxScope, file_id: FileId): Promise<FileResponse> {
    try {
      return await this.client.httpGet(`box/${scope}/file/${file_id}`);
    } catch (err) {
      // Handle a document box not being created yet
      if (isAxiosError(err) && err.response?.status === 404) {
        throw new FileNotFoundError();
      }

      throw err;
    }
  }

  /**
   * Request the details of a file using its ID and scope
   * returns null if the file is not found
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file
   * @returns The full file details
   */
  async getOrNull(scope: DocumentBoxScope, file_id: FileId): Promise<FileResponse | null> {
    try {
      return await this.get(scope, file_id);
    } catch (err) {
      if (err instanceof FileNotFoundError) {
        return null;
      }

      throw err;
    }
  }

  /**
   * Search within the contents of a file
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file
   * @param request The search request
   * @returns The full file details
   */
  search(
    scope: DocumentBoxScope,
    file_id: FileId,
    request: DocboxFileSearchRequest
  ): Promise<DocboxFileSearchResponse> {
    return this.client.httpPost(`box/${scope}/file/${file_id}/search`, request);
  }

  /**
   * Request children of the file, in the case of .eml email files this
   * would provide a list of files for the attachments associated with
   * the email
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to find the children of
   * @returns The files that are children
   */
  children(scope: DocumentBoxScope, file_id: FileId): Promise<DocFile[]> {
    return this.client.httpGet(`box/${scope}/file/${file_id}/children`);
  }

  /**
   * Request the history of edits to the file
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to get the history for
   * @returns The edit history
   */
  editHistory(scope: DocumentBoxScope, file_id: FileId): Promise<DocFileEditHistory[]> {
    return this.client.httpGet(`box/${scope}/file/${file_id}/edit-history`);
  }

  /**
   * Update the details about the file
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to update
   * @param data The updates to perform
   */
  update(scope: DocumentBoxScope, file_id: FileId, data: UpdateFile): Promise<void> {
    return this.client.httpPut(`box/${scope}/file/${file_id}`, data);
  }

  /**
   * Gets the raw file contents of the provided file
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @returns The raw contents of the file
   */
  raw(scope: DocumentBoxScope, file_id: FileId): Promise<Blob> {
    return this.client.httpGet(this.rawURL(scope, file_id), {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Creates a presigned URL for the requested file
   *
   * Requires docbox >=0.2.0
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @param expires_at Time in seconds till the link expires
   * @returns The raw contents of the file
   */
  createRawPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    expires_at: number = 900
  ): Promise<PresignedDownloadResponse> {
    return this.client.httpPost(`box/${scope}/file/${file_id}/raw-presigned`, {
      expires_at,
    });
  }

  /**
   * Gets the raw file contents of the provided file downloading
   * using a presigned URL
   *
   * Requires docbox >=0.2.0
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @param expires_at Time in seconds till the link expires
   * @returns The raw contents of the file
   */
  async rawPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    expires_at: number = 900
  ): Promise<Blob> {
    const { uri } = await this.createRawPresigned(scope, file_id, expires_at);
    return this.client.httpGet(uri, {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Gets the raw file contents of the provided file downloading
   * using a presigned URL
   *
   * Requires docbox >=0.2.0
   *
   * This function is the same as {@link FileService.rawPresigned} just
   * it has the correct return type for Node
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @param expires_at Time in seconds till the link expires
   * @returns The raw contents of the file
   */
  async rawPresignedNode(
    scope: DocumentBoxScope,
    file_id: FileId,
    expires_at: number = 900
  ): Promise<ArrayBuffer> {
    const { uri } = await this.createRawPresigned(scope, file_id, expires_at);
    return this.client.httpGet(uri, {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Gets the raw file contents of the provided file
   *
   * This function is the same as {@link FileService.raw} just
   * it has the correct return type for Node
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @returns The raw contents of the file
   */
  rawNode(scope: DocumentBoxScope, file_id: FileId): Promise<ArrayBuffer> {
    return this.client.httpGet(this.rawURL(scope, file_id), {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Gets the raw file contents of the provided file in
   * JSON format (Will only work if the actual file is JSON)
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @returns The JSON contents of the file
   */
  json(scope: DocumentBoxScope, file_id: FileId): Promise<any> {
    return this.client.httpGet(this.rawURL(scope, file_id), {
      responseType: 'json',
    });
  }

  /**
   * Gets the raw file contents of the provided file as text
   * (Will only work if the actual file is text)
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to retrieve
   * @returns The text contents of the file
   */
  text(scope: DocumentBoxScope, file_id: FileId): Promise<string> {
    return this.client.httpGet(this.rawURL(scope, file_id), {
      responseType: 'text',
    });
  }

  /**
   * Deletes a file
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to delete
   */
  delete(scope: DocumentBoxScope, file_id: FileId): Promise<void> {
    return this.client.httpDelete(`box/${scope}/file/${file_id}`);
  }

  /**
   * Gets a generated file details
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @returns The generated file details
   */
  generated(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType
  ): Promise<GeneratedFile> {
    return this.client.httpGet(`box/${scope}/file/${file_id}/generated/${type}`);
  }

  /**
   * Gets a generated file raw contents
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @returns The Blob/ArrayBuffer content of the file (Blob within a browser, ArrayBuffer on node)
   */
  generatedRaw(scope: DocumentBoxScope, file_id: FileId, type: GeneratedFileType): Promise<Blob> {
    return this.client.httpGet(this.generatedRawURL(scope, file_id, type), {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Create a presigned URL for the requested generated file
   *
   * Requires docbox >=0.2.0
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @param expires_at Time in seconds till the link expires
   * @returns The presigned metadata to perform the presigned download
   */
  createGeneratedRawPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType,
    expires_at: number = 900
  ): Promise<PresignedDownloadResponse> {
    return this.client.httpPost(`box/${scope}/file/${file_id}/generated/${type}/raw-presigned`, {
      expires_at,
    });
  }

  /**
   * Gets a generated file raw contents using a presigned URL
   *
   * Requires docbox >=0.2.0
   *
   * On node this returns an {@link ArrayBuffer} not a blob
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @param expires_at Time in seconds till the link expires
   * @returns The Blob/ArrayBuffer content of the file (Blob within a browser, ArrayBuffer on node)
   */
  async generatedRawPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType,
    expires_at: number = 900
  ): Promise<Blob> {
    const { uri } = await this.createGeneratedRawPresigned(scope, file_id, type, expires_at);
    return this.client.httpGet(uri, {
      responseType: typeof window === 'undefined' ? 'arraybuffer' : 'blob',
    });
  }

  /**
   * Gets a generated file raw contents using a presigned URL
   *
   * Requires docbox >=0.2.0
   *
   * This function is the same as {@link FileService.generatedRawPresigned} just
   * it has the correct return type for Node and will only return an
   * ArrayBuffer
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @param expires_at Time in seconds till the link expires
   * @returns The Blob/ArrayBuffer content of the file (Blob within a browser, ArrayBuffer on node)
   */
  async generatedRawPresignedNode(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType,
    expires_at: number = 900
  ): Promise<ArrayBuffer> {
    const { uri } = await this.createGeneratedRawPresigned(scope, file_id, type, expires_at);
    return this.client.httpGet(uri, {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Gets a generated file raw contents
   *
   * This function is the same as {@link FileService.generatedRaw} just
   * it has the correct return type for Node and will only return an
   * ArrayBuffer
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @returns The ArrayBuffer content of the generated file
   */
  generatedRawNode(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType
  ): Promise<ArrayBuffer> {
    return this.client.httpGet(this.generatedRawURL(scope, file_id, type), {
      responseType: 'arraybuffer',
    });
  }

  /**
   * Gets a generated file raw contents as text
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @returns The text content of the generated file
   */
  generatedText(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType
  ): Promise<string> {
    return this.client.httpGet(this.generatedRawURL(scope, file_id, type), {
      responseType: 'text',
    });
  }

  /**
   * Gets a generated file raw contents as JSON
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @returns The JSON content of the generated file
   */
  generatedJson(scope: DocumentBoxScope, file_id: FileId, type: GeneratedFileType): Promise<any> {
    return this.client.httpGet(this.generatedRawURL(scope, file_id, type), {
      responseType: 'json',
    });
  }

  /**
   * Gets a generated file raw contents as text using a presigned download
   *
   * Requires docbox >=0.2.0
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @param expires_at Time in seconds till the link expires
   * @returns The text content of the generated file
   */
  async generatedTextPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType,
    expires_at: number = 900
  ): Promise<string> {
    const { uri } = await this.createGeneratedRawPresigned(scope, file_id, type, expires_at);
    return this.client.httpGet(uri, {
      responseType: 'text',
    });
  }
  /**
   * Gets a generated file raw contents as JSON using a presigned download
   *
   * Requires docbox >=0.2.0
   *
   * @param scope Scope the file resides within
   * @param file_id ID of the file to query
   * @param type Type of the generated file
   * @param expires_at Time in seconds till the link expires
   * @returns The parsed JSON content of the generated file
   */
  async generatedJsonPresigned(
    scope: DocumentBoxScope,
    file_id: FileId,
    type: GeneratedFileType,
    expires_at: number = 900
  ): Promise<any> {
    const { uri } = await this.createGeneratedRawPresigned(scope, file_id, type, expires_at);
    return this.client.httpGet(uri, {
      responseType: 'json',
    });
  }
}
