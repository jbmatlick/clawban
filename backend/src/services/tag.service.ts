/**
 * Tag service - Auto-generate colors and manage tag registry
 */

import type { Tag } from '../../../contracts/types.js';
import { readData, writeData, withLock } from './storage.service.js';

interface AppData {
  tasks: any[];
  tags: Record<string, Tag>; // tag name -> Tag
}

/**
 * Generate a consistent color for a tag name
 * Uses hash of name to pick from a predefined palette
 */
function generateTagColor(name: string): string {
  const palette = [
    '#3b82f6', // blue
    '#8b5cf6', // purple
    '#ec4899', // pink
    '#f59e0b', // amber
    '#10b981', // green
    '#06b6d4', // cyan
    '#6366f1', // indigo
    '#f97316', // orange
    '#ef4444', // red
    '#14b8a6', // teal
    '#a855f7', // violet
    '#84cc16', // lime
  ];

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = ((hash << 5) - hash) + name.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  const index = Math.abs(hash) % palette.length;
  return palette[index];
}

/**
 * Get or create a tag
 * If tag exists, return existing one
 * If tag doesn't exist, create with auto-generated color
 */
export async function getOrCreateTag(name: string): Promise<Tag> {
  return withLock(async () => {
    const data = await readData<AppData>();

    if (!data.tags) {
      data.tags = {};
    }

    const normalizedName = name.trim().toLowerCase();

    if (data.tags[normalizedName]) {
      return data.tags[normalizedName];
    }

    // Create new tag with auto-generated color
    const newTag: Tag = {
      name: normalizedName,
      color: generateTagColor(normalizedName),
    };

    data.tags[normalizedName] = newTag;
    await writeData(data);

    return newTag;
  });
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<Tag[]> {
  const data = await readData<AppData>();
  
  if (!data.tags) {
    return [];
  }

  return Object.values(data.tags);
}

/**
 * Ensure tags exist for a list of tag names
 * Returns the normalized tag names
 */
export async function ensureTagsExist(tagNames: string[]): Promise<string[]> {
  const normalized: string[] = [];

  for (const name of tagNames) {
    const tag = await getOrCreateTag(name);
    normalized.push(tag.name);
  }

  return normalized;
}
