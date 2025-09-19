export class DocumentBoxNotFoundError extends Error {
  constructor() {
    super('document box not found');
  }
}

export class LinkNotFoundError extends Error {
  constructor() {
    super('link not found');
  }
}

export class FolderNotFoundError extends Error {
  constructor() {
    super('folder not found');
  }
}

export class FileNotFoundError extends Error {
  constructor() {
    super('file not found');
  }
}
