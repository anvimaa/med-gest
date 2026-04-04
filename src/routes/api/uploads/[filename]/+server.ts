import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import * as fs from 'node:fs';
import * as path from 'node:path';
import 'dotenv/config';

export const GET: RequestHandler = async ({ params }) => {
  const { filename } = params;

  // Protect against directory traversal attacks
  if (!filename || filename.includes('..') || filename.includes('/')) {
    throw error(400, 'Invalid filename');
  }

  const uploadDir = process.env.UPLOAD_DIR || '../medgest-uploads';
  // Resolve absolute path from project root
  const absoluteUploadDir = path.resolve(process.cwd(), uploadDir);
  const filePath = path.join(absoluteUploadDir, filename);

  if (!fs.existsSync(filePath)) {
    throw error(404, 'File not found');
  }

  try {
    const fileBuffer = fs.readFileSync(filePath);
    
    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    let contentType = 'application/octet-stream';
    if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
    else if (ext === '.png') contentType = 'image/png';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    return new Response(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable'
      }
    });
  } catch (err) {
    console.error('Error reading file:', err);
    throw error(500, 'Internal server error');
  }
};
