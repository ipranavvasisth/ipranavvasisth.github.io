#!/usr/bin/env node

/* ═══════════════════════════════════════════════════════
   build-posts.js — Blog post manifest generator

   Usage:  node build-posts.js

   Scans posts/*.md for YAML frontmatter and generates
   posts/posts.json automatically. No dependencies needed.

   Expected frontmatter format:
   ---
   title: My Post Title
   date: 2026-06-20
   excerpt: A short summary of the post.
   tags: [Python, Aerospace]
   readTime: 3 min read
   ---
   ═══════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const POSTS_DIR = path.join(__dirname, 'posts');
const OUTPUT_FILE = path.join(POSTS_DIR, 'posts.json');

/**
 * Minimal YAML frontmatter parser (no dependencies).
 * Handles: strings, arrays (flow style [a, b, c]), dates.
 */
function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const meta = {};

  for (const line of yaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    let value = trimmed.slice(colonIdx + 1).trim();

    // Parse flow-style arrays: [tag1, tag2, tag3]
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim().replace(/^["']|["']$/g, ''));
    }
    // Strip surrounding quotes
    else if ((value.startsWith('"') && value.endsWith('"')) ||
             (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    meta[key] = value;
  }

  return meta;
}

// ── Main ──────────────────────────────────────────────

const mdFiles = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith('.md'));

const posts = [];

for (const file of mdFiles) {
  const filePath = path.join(POSTS_DIR, file);
  const content = fs.readFileSync(filePath, 'utf-8');
  const meta = parseFrontmatter(content);

  if (!meta) {
    console.warn(`⚠  Skipping ${file} — no frontmatter found`);
    continue;
  }

  if (!meta.title || !meta.date) {
    console.warn(`⚠  Skipping ${file} — missing required fields (title, date)`);
    continue;
  }

  const slug = file
    .replace(/\.md$/, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')  // strip non-alphanumeric (except spaces/hyphens)
    .trim()
    .replace(/\s+/g, '-')          // spaces → hyphens
    .replace(/-+/g, '-');           // collapse multiple hyphens

  posts.push({
    slug,
    title: meta.title,
    date: meta.date,
    excerpt: meta.excerpt || '',
    tags: Array.isArray(meta.tags) ? meta.tags : [],
    readTime: meta.readTime || '',
    file: `posts/${file}`
  });
}

// Sort by date, newest first
posts.sort((a, b) => new Date(b.date) - new Date(a.date));

const output = JSON.stringify({ posts }, null, 2) + '\n';
fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

console.log(`✓  Generated posts.json with ${posts.length} post(s)`);
posts.forEach(p => console.log(`   • ${p.date}  ${p.title}`));
