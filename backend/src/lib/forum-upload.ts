import { mkdirSync } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import multer from 'multer';

const UPLOAD_DIR = path.join(process.cwd(), 'uploads', 'forum');
mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    cb(null, `${randomUUID()}${ext}`);
  },
});

export const forumImageUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      cb(new Error('Only JPEG, PNG, WebP, and GIF images are allowed'));
      return;
    }
    cb(null, true);
  },
});

export function forumUploadPublicUrl(filename: string): string {
  return `/uploads/forum/${filename}`;
}
