import { DocFile } from './file';
import { DocFolder } from './folder';
import { DocLink } from './link';

export * from './box';
export * from './file';
export * from './folder';
export * from './link';
export * from './search';
export * from './shared';
export * from './user';

export enum DocboxItemType {
  File = 'File',
  Folder = 'Folder',
  Link = 'Link',
}

export type DocboxItem =
  | ({ type: DocboxItemType.File } & DocFile)
  | ({ type: DocboxItemType.Folder } & DocFolder)
  | ({ type: DocboxItemType.Link } & DocLink);
