/**
 * Tag service - Auto-generate colors and manage tag registry
 * Uses Supabase for persistence
 */

import type { Tag } from '../../../contracts/types.js';
import { supabase } from '../lib/supabase.js';
import { nanoid } from 'nanoid';

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
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const normalizedName = name.trim().toLowerCase();

  // Try to get existing tag
  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .eq('name', normalizedName)
    .single();

  if (existing) {
    return { name: existing.name, color: existing.color };
  }

  // Create new tag with auto-generated color
  const newTag = {
    id: nanoid(),
    name: normalizedName,
    color: generateTagColor(normalizedName),
  };

  const { data, error } = await supabase
    .from('tags')
    .insert(newTag)
    .select()
    .single();

  if (error) {
    // Handle race condition - tag might have been created by another request
    if (error.code === '23505') { // unique violation
      const { data: existing } = await supabase
        .from('tags')
        .select('*')
        .eq('name', normalizedName)
        .single();
      
      if (existing) {
        return { name: existing.name, color: existing.color };
      }
    }
    console.error('Supabase tag insert error:', error);
    throw new Error(`Failed to create tag: ${error.message}`);
  }

  return { name: data.name, color: data.color };
}

/**
 * Get all tags
 */
export async function getAllTags(): Promise<Tag[]> {
  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  const { data, error } = await supabase
    .from('tags')
    .select('name, color')
    .order('name');

  if (error) {
    console.error('Supabase tags read error:', error);
    throw new Error(`Failed to get tags: ${error.message}`);
  }

  return data || [];
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
