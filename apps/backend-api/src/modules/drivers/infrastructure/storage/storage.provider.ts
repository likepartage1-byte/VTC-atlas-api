export interface StorageProvider {
  uploadFile(file: Express.Multer.File, path: string): Promise<{ storageKey: string; url: string }>;
  deleteFile(storageKey: string): Promise<void>;
  getSignedUrl?(storageKey: string): Promise<string>;
}

import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class LocalStorageProvider implements StorageProvider {
  private readonly logger = new Logger(LocalStorageProvider.name);
  private readonly uploadRoot = process.env.UPLOAD_DIR || '/root/atlas-uploads';

  constructor() {
    if (!fs.existsSync(this.uploadRoot)) {
      fs.mkdirSync(this.uploadRoot, { recursive: true });
    }
  }

  async uploadFile(file: Express.Multer.File, subPath: string): Promise<{ storageKey: string; url: string }> {
    const fullPath = path.join(this.uploadRoot, subPath);
    const dir = path.dirname(fullPath);
    
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    fs.writeFileSync(fullPath, file.buffer);
    
    this.logger.log(`File uploaded to local storage: ${fullPath}`);
    
    // In production with a web server, this would be a serveable URL.
    // For now, we return the internal path or a local API URL.
    return {
      storageKey: subPath,
      url: `/api/v1/files/${subPath}` 
    };
  }

  async deleteFile(storageKey: string): Promise<void> {
    const fullPath = path.join(this.uploadRoot, storageKey);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }
  }
}
