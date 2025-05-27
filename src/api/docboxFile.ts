import { DocFile } from '../types/file';

let FileGlobal = File;

// Node targets don't have this available, just mock it.
// this type should not be used in a node env
if (FileGlobal === undefined) {
  class MockFile {
    constructor(
      public name: string,
      public fileParts: any[],
      public options?: any
    ) {}
  }

  FileGlobal = MockFile as any;
}

/**
 * Wrapper around the browser File type to allow using a docbox file
 * in place when handling already uploaded files in a form
 */
export class DocboxFile extends FileGlobal {
  file: DocFile;

  get size(): number {
    return this.file.size;
  }

  constructor(file: DocFile) {
    super([], file.name, { type: file.mime });
    this.file = file;
  }
}
