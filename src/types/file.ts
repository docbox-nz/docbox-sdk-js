import {
  DocumentBoxScope,
  EditHistoryMetadataMoveToFolder,
  EditHistoryMetadataRename,
  EditHistoryType,
  FileId,
  FolderId,
  GeneratedFileId,
  ISODate,
} from './shared';
import { User } from './user';

/**
 * Request to create a new presigned file upload
 */
export interface PresignedUploadFileRequest {
  /**
   * Name of the file that will be uploaded
   */
  name: string;
  /**
   * ID of the folder to store the uploaded
   * file within
   */
  folder_id: FolderId;
  /**
   * Size of the file that will be uploaded
   *
   * This must match the size of the file you
   * upload otherwise your request will fail
   */
  size: number;
  /**
   * Mime type of the file that will be uploaded
   */
  mime: string;
  /**
   * Optional: ID of the parent file to use for the
   * file after its been uploaded
   */
  parent_id?: FileId | null;
  /**
   * Additional configuration specifying how the file should
   * be processed
   */
  processing_config?: ProcessingConfig | null;
}

/**
 * Response for a presigned upload request
 */
export interface PresignedUploadResponse {
  /**
   * ID of the presigned upload task
   */
  task_id: string;
  /**
   * HTTP request method to send the upload as
   */
  method: string;
  /**
   * URL to send the file upload to
   */
  uri: string;
  /**
   * Headers to attach to the presigned upload
   */
  headers: Record<string, string>;
}

/**
 * Additional options that can be specified on a presigned file upload
 * request for things like aborting or progress
 */
export type PresignedUploadOptions = {
  /**
   * Abort controller to abort an upload in progress
   */
  abort?: AbortController;

  /**
   * Optional: ID of the parent file to use for the
   * file after its been uploaded
   */
  parent_id?: FileId | null;

  /**
   * Additional configuration specifying how the file should
   * be processed
   */
  processing_config?: ProcessingConfig | null;

  /**
   * Callback to update the current progress
   *
   * @param name The name of the current progress state
   * @param progress Percent complete if the progress is not indeterminate
   */
  onProgress?: (name: string, progress?: number) => void;
};

/**
 * Types of generated files
 */
export enum GeneratedFileType {
  PDF = 'Pdf',
  COVER_PAGE = 'CoverPage',
  SMALL_THUMBNAIL = 'SmallThumbnail',
  LARGE_THUMBNAIL = 'LargeThumbnail',
  TEXT_CONTENT = 'TextContent',
  HTML_CONTENT = 'HtmlContent',
  METADATA = 'Metadata',
}

export interface DocGeneratedFile {
  /**
   * Unique ID of the generated file
   */
  id: GeneratedFileId;
  /**
   * ID of the file this generated file
   * belongs to
   */
  file_id: FileId;
  /**
   * Mime/Content-Type of the generated file
   */
  mime: string;
  /**
   * Type of the generated file
   */
  type: GeneratedFileType;
  /**
   * SHA256 hash of the generated file contents
   */
  hash: string;
  /**
   * Timestamp the generated file was created at
   */
  created_at: ISODate;
}

export interface FileResponse {
  /**
   * The file itself
   */
  file: DocFile;
  /**
   * Files generated from processing the file
   */
  generated: DocGeneratedFile[];
}

export type UploadFileResponse = {
  /**
   * The file itself
   */
  file: DocFile;

  /**
   * Files generated from processing the file
   */
  generated: DocGeneratedFile[];

  /**
   * Additional files that were created from processing the
   * uploaded file
   *
   * When email attachment processing is enabled this will
   * contain the responses for the extracted attachments
   */
  additional_files: UploadFileResponse[];
};

/**
 * Statuses that a presigned upload task can have
 */
export enum PresignedUploadStatus {
  Pending = 'Pending',
  Complete = 'Complete',
  Failed = 'Failed',
}

export type PresignedStatusResponse =
  | { status: PresignedUploadStatus.Pending }
  | ({ status: PresignedUploadStatus.Complete } & FileResponse)
  | { status: PresignedUploadStatus.Failed; error: string };

export type UploadOptions = {
  /**
   * Used for legacy API compatibility, specify a fixed file ID
   */
  fixed_id?: FileId;

  /**
   * Abort controller to abort an upload in progress
   */
  abort?: AbortController;

  /**
   * Callback to update the current progress
   *
   * @param name The name of the current progress state
   * @param progress Percent complete if the progress is not indeterminate
   */
  onProgress?: (name: string, progress?: number) => void;
};

/**
 * File within docbox
 */
export interface DocFile {
  /**
   * Unique ID of the file
   */
  id: FileId;
  /**
   * Name of the file
   */
  name: string;
  /**
   * Mime/Content-Type of the file i.e application/json
   */
  mime: string;
  /**
   * ID of the folder this file is stored within.
   */
  folder_id: FolderId;
  /**
   * SHA256 hash of the file contents
   */
  hash: string;
  /**
   * Size of the file contents in bytes
   */
  size: number;
  /**
   * Whether the file has been detected as encrypted when it
   * was processed
   */
  encrypted: boolean;
  /**
   * Timestamp of when the file was created
   */
  created_at: ISODate;
  /**
   * User who created the file if the user was known
   * at the point of creation
   */
  created_by: User | null;
  /**
   * Timestamp of when the file was last modified
   */
  last_modified_at: ISODate | null;
  /**
   * User who last modified the file if the user was
   * known at the point of modification
   *
   * NOTE: This is the user for the most recent modification, not the
   * most recent modification with a user
   */
  last_modified_by: User | null;
  /**
   * ID of the parent file, if the file belongs to some other file
   * (i.e attachment for an email file)
   */
  parent_id: FileId | null;
}

/**
 * Entry within an edit history for a file
 */
export interface DocFileEditHistoryBase {
  /**
   * ID of the specific entry
   */
  id: string;
  /**
   * ID of the file the edit history belongs to
   */
  file_id: FileId;
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

export type DocFileEditHistoryData =
  | { type: EditHistoryType.MoveToFolder; metadata: EditHistoryMetadataMoveToFolder }
  | { type: EditHistoryType.Rename; metadata: EditHistoryMetadataRename };

export type DocFileEditHistory = DocFileEditHistoryBase & DocFileEditHistoryData;

/**
 * Request to upload a new file
 */
export interface UploadFileRequest {
  /**
   * Scope to upload the file into
   */
  scope: DocumentBoxScope;
  /**
   * Name of the file to upload
   */
  name: string;
  /**
   * ID of the folder to store the file within
   */
  folder_id: FolderId;
  /**
   * The file itself
   */
  file: File;
  /**
   * Optional: Fixed ID to set for the file, this should be used
   * if you require the file to have some fixed ID when
   * its created
   */
  fixed_id?: FileId | null;
  /**
   * Optional: ID of the parent file to associate this file to
   */
  parent_id?: FileId | null;
  /**
   * Additional configuration specifying how the file should
   * be processed
   */
  processing_config?: ProcessingConfig | null;
  /**
   * Abort controller to cancel the file upload
   */
  abort?: AbortController;
}

/**
 * Configuration specifying how the file should
 * be processed
 */
export interface ProcessingConfig {
  /**
   * Email specific processing configuration
   */
  email?: EmailProcessingConfig | null;
  // Forward compatibility with any future fields
  [key: string]: unknown | null;
}

/**
 * Email specific processing configuration
 */
export interface EmailProcessingConfig {
  /**
   * Skip extracting attachments from emails
   */
  skip_attachments?: boolean | null;
  // Forward compatibility with any future fields
  [key: string]: unknown | null;
}

/**
 * Perform partial updates on a specific file, such
 * as changing the file name or moving it to another folder
 */
export interface UpdateFile {
  /**
   * Optional new name of the file.
   *
   * leave undefined or specify null to not update this field
   */
  name?: string | null;
  /**
   * Optional new folder to move the file to.
   *
   * leave undefined or specify null to not update this field
   */
  folder_id?: FolderId | null;
}

export interface DocboxTask {
  id: string;
  document_box: DocumentBoxScope;
  status: DocboxTaskStatus;
  output_data: any | null;
  created_at: string;
  completed_at: string | null;
}

export enum DocboxTaskStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Failed = 'Failed',
}

export interface UploadTaskResponse {
  task_id: string;
  created_at: string;
}
