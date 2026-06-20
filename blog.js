/* ═══════════════════════════════════════════════════════
   Pranav Vasisth — Blog Scripts
   Post listing, filtering, and individual post loading
   Now supports Markdown (.md) posts with YAML frontmatter
   ═══════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.getAttribute('data-page');

  if (page === 'blog-listing') {
    initBlogListing();
  } else if (page === 'blog-post') {
    initBlogPost();
  }
});

/* ── Blog Listing Page ───────────────────────────────── */
async function initBlogListing() {
  const postsContainer = document.getElementById('blog-posts');
  const filtersContainer = document.getElementById('blog-filters');
  const loadingEl = document.getElementById('blog-loading');

  try {
    const response = await fetch('posts/posts.json');
    if (!response.ok) throw new Error('Failed to load posts');
    const data = await response.json();
    const posts = data.posts;

    // Hide loading
    if (loadingEl) loadingEl.remove();

    if (posts.length === 0) {
      postsContainer.innerHTML = '<p class="blog-empty">No posts yet — check back soon.</p>';
      return;
    }

    // Collect all unique tags
    const allTags = [...new Set(posts.flatMap(p => p.tags))].sort();

    // Render filter bar
    renderFilters(filtersContainer, allTags);

    // Render post cards
    renderPostCards(postsContainer, posts);

    // Re-initialise scroll reveal for dynamically added elements
    initDynamicReveal();

  } catch (err) {
    console.error('Error loading blog posts:', err);
    if (loadingEl) {
      loadingEl.textContent = 'Unable to load posts. Please try again later.';
    }
  }
}

function renderFilters(container, tags) {
  if (!container) return;

  const filterHTML = `
    <div class="filter-tags">
      <span class="filter-label">Filter:</span>
      <button class="filter-tag active" data-tag="all">All</button>
      ${tags.map(tag => `<button class="filter-tag" data-tag="${tag}">${tag}</button>`).join('')}
    </div>
  `;

  container.innerHTML = filterHTML;

  // Attach filter event listeners
  const filterButtons = container.querySelectorAll('.filter-tag');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const selectedTag = btn.getAttribute('data-tag');
      filterPosts(selectedTag);
    });
  });
}

function filterPosts(tag) {
  const cards = document.querySelectorAll('.blog-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const cardTags = JSON.parse(card.getAttribute('data-tags'));

    if (tag === 'all' || cardTags.includes(tag)) {
      card.classList.remove('hidden');
      visibleCount++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Show/hide empty state
  let emptyEl = document.querySelector('.blog-empty');
  if (visibleCount === 0) {
    if (!emptyEl) {
      emptyEl = document.createElement('p');
      emptyEl.className = 'blog-empty';
      emptyEl.textContent = 'No posts match this filter.';
      document.getElementById('blog-posts').appendChild(emptyEl);
    }
    emptyEl.style.display = 'block';
  } else if (emptyEl) {
    emptyEl.style.display = 'none';
  }
}

function renderPostCards(container, posts) {
  if (!container) return;

  const cardsHTML = posts.map((post, index) => {
    const formattedDate = formatDate(post.date);
    const tagsJSON = JSON.stringify(post.tags);
    const tagsHTML = post.tags.map(tag =>
      `<span class="blog-card-tag">${tag}</span>`
    ).join('');

    const delayClass = index > 0 ? ` reveal-delay-${Math.min(index, 4)}` : '';

    return `
      <a href="post.html?slug=${post.slug}" class="blog-card reveal${delayClass}" data-tags='${tagsJSON}'>
        <time class="blog-card-date" datetime="${post.date}">${formattedDate}</time>
        <h2 class="blog-card-title">${post.title}</h2>
        <p class="blog-card-excerpt">${post.excerpt}</p>
        <div class="blog-card-meta">
          <div class="blog-card-tags">${tagsHTML}</div>
          <span class="blog-card-readtime">${post.readTime}</span>
        </div>
      </a>
    `;
  }).join('');

  container.innerHTML = cardsHTML;
}

/* ── Individual Post Page ────────────────────────────── */
async function initBlogPost() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const contentEl = document.getElementById('post-content');
  const headerEl = document.getElementById('post-header-content');
  const loadingEl = document.getElementById('post-loading');

  if (!slug) {
    showPostNotFound(contentEl, loadingEl);
    return;
  }

  try {
    // Fetch the manifest to get metadata
    const manifestRes = await fetch('posts/posts.json');
    if (!manifestRes.ok) throw new Error('Failed to load manifest');
    const manifest = await manifestRes.json();

    const post = manifest.posts.find(p => p.slug === slug);
    if (!post) {
      showPostNotFound(contentEl, loadingEl);
      return;
    }

    // Set page title
    document.title = `${post.title} — Pranav Vasisth`;

    // Update meta description
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute('content', post.excerpt);

    // Render post header metadata
    if (headerEl) {
      const formattedDate = formatDate(post.date);
      const tagsHTML = post.tags.map(tag =>
        `<span class="post-tag">${tag}</span>`
      ).join('');

      headerEl.innerHTML = `
        <div class="post-meta">
          <time class="post-date" datetime="${post.date}">${formattedDate}</time>
          <span class="post-meta-divider"></span>
          <span class="post-readtime">${post.readTime}</span>
          <span class="post-meta-divider"></span>
          <div class="post-tags">${tagsHTML}</div>
        </div>
        <h1 class="post-title">${post.title}</h1>
      `;
    }

    // Fetch the post content (Markdown file)
    const postRes = await fetch(post.file);
    if (!postRes.ok) throw new Error('Failed to load post content');
    const rawContent = await postRes.text();

    // Strip YAML frontmatter and render Markdown
    const markdownBody = stripFrontmatter(rawContent);
    const renderedHTML = marked.parse(markdownBody);

    // Hide loading, inject content
    if (loadingEl) loadingEl.remove();
    if (contentEl) {
      contentEl.innerHTML = renderedHTML;
    }

    // Re-initialise scroll reveal
    initDynamicReveal();

  } catch (err) {
    console.error('Error loading post:', err);
    showPostNotFound(contentEl, loadingEl);
  }
}

function showPostNotFound(contentEl, loadingEl) {
  if (loadingEl) loadingEl.remove();
  if (contentEl) {
    contentEl.innerHTML = `
      <div class="post-not-found">
        <h2>Post Not Found</h2>
        <p>The post you are looking for does not exist or has been moved.</p>
        <a href="blog.html" class="btn btn-secondary">← Back to Blog</a>
      </div>
    `;
  }
}

/* ── Utilities ───────────────────────────────────────── */

/**
 * Strip YAML frontmatter (--- ... ---) from the top of a markdown string.
 * Returns only the body content after the closing ---.
 */
function stripFrontmatter(text) {
  const match = text.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (match) {
    return match[2].trim();
  }
  return text; // No frontmatter found, return as-is
}

function formatDate(dateStr) {
  const date = new Date(dateStr + 'T00:00:00');
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

function initDynamicReveal() {
  const reveals = document.querySelectorAll('.reveal:not(.visible)');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  reveals.forEach(el => observer.observe(el));
}
