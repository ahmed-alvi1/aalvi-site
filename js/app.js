/* =========================================================
   app.js — Main SPA logic, router, section renderers
   ========================================================= */

(function () {
  'use strict';

  /* ---------- Router ---------- */
  const SECTIONS = ['home', 'projects', 'courses', 'course-projects', 'research', 'coding', 'experience', 'blog', 'tools'];
  let currentSection = 'home';

  function getHash() {
    const hash = window.location.hash.slice(1) || 'home';
    return SECTIONS.includes(hash) ? hash : 'home';
  }

  function navigate(section) {
    window.location.hash = section;
  }

  function onHashChange() {
    const section = getHash();
    if (section === currentSection && document.querySelector('.section.active')) return;
    currentSection = section;
    showSection(section);
    updateNavActive(section);
  }

  function showSection(id) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    const el = document.getElementById('section-' + id);
    if (el) {
      el.classList.add('active');
      // Re-trigger animations
      el.querySelectorAll('.animate-in').forEach(a => {
        a.classList.remove('visible');
        void a.offsetWidth; // reflow
        a.classList.add('visible');
      });
      // Animate skill bars if coding section
      if (id === 'coding') animateSkillBars();
    }
  }

  function updateNavActive(section) {
    document.querySelectorAll('.nav-links a').forEach(a => {
      a.classList.toggle('active', a.getAttribute('data-section') === section);
    });
  }

  /* ---------- Renderers ---------- */

  function renderHome(data) {
    const profile = data.profile;
    const projectCount = data.projects.length;
    const langCount = data.coding.languages.length;
    const researchCount = data.research.length;

    return `
      <div class="hero">
        <div class="hero-orb"></div>
        <div class="hero-greeting animate-in">// welcome</div>
        <h1 class="hero-name animate-in">${escHtml(profile.name)}<span>.</span></h1>
        <p class="hero-tagline animate-in">${escHtml(profile.tagline)}</p>
        <p class="hero-bio animate-in">${escHtml(profile.bio)}</p>
        <div class="hero-stats animate-in">
          <div class="hero-stat">
            <div class="hero-stat-number">${projectCount}</div>
            <div class="hero-stat-label">Projects</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${langCount}</div>
            <div class="hero-stat-label">Languages</div>
          </div>
          <div class="hero-stat">
            <div class="hero-stat-number">${researchCount}</div>
            <div class="hero-stat-label">Research Papers</div>
          </div>
        </div>
        <div class="hero-cta animate-in">
          <a href="#projects" class="btn-primary" data-section="projects">View Projects →</a>
          <a href="#research" class="btn-outline" data-section="research">Research</a>
        </div>
      </div>
    `;
  }

  function renderProjects(data) {
    const cards = data.projects.map(p => `
      <div class="card animate-in">
        <div class="card-title">${escHtml(p.title)}</div>
        <div class="card-description">${escHtml(p.description)}</div>
        ${p.techStack.length ? `<div class="card-meta">${p.techStack.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
        ${p.link ? `<a href="${escHtml(p.link)}" target="_blank" rel="noopener" class="card-link">Visit</a>` : '<span class="card-link" style="color:var(--text-muted)">Link coming soon</span>'}
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Projects</h2>
        <p class="section-subtitle">Things I've built and am working on</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  function renderCourses(data) {
    const semesters = data.courses.semesters.map(sem => `
      <div class="semester-block animate-in">
        <div class="semester-title">
          ${escHtml(sem.name)}
          <span class="semester-period">${escHtml(sem.period)}</span>
        </div>
        <div class="course-list">
          ${sem.courses.map(c => `
            <div class="course-item">
              <span class="course-code">${escHtml(c.code)}</span>
              <span class="course-name">${escHtml(c.name)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Courses</h2>
        <p class="section-subtitle">Academic coursework by semester</p>
      </div>
      ${semesters}
    `;
  }

  function renderCourseProjects(data) {
    if (!data.courseProjects.length) {
      return emptyState('📂', 'No course projects yet', 'Add your first course project via the admin panel');
    }

    const cards = data.courseProjects.map(p => `
      <div class="card animate-in">
        <div class="card-title">${escHtml(p.title)}</div>
        <div class="card-description">${escHtml(p.description)}</div>
        ${p.techUsed.length ? `<div class="card-meta">${p.techUsed.map(t => `<span class="tag">${escHtml(t)}</span>`).join('')}</div>` : ''}
        ${p.features.length ? `<ul class="feature-list">${p.features.map(f => `<li>${escHtml(f)}</li>`).join('')}</ul>` : ''}
        ${p.link ? `<a href="${escHtml(p.link)}" target="_blank" rel="noopener" class="card-link">View Project</a>` : ''}
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Course Projects</h2>
        <p class="section-subtitle">Projects built as part of coursework</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  function renderResearch(data) {
    if (!data.research.length) {
      return emptyState('🔬', 'No research papers yet', 'Add papers via the admin panel');
    }

    const cards = data.research.map(r => `
      <div class="card research-card animate-in">
        <div class="card-status">${escHtml(r.status)}</div>
        <div class="card-title">${escHtml(r.title)}</div>
        <div class="card-description">${escHtml(r.abstract)}</div>
        <div class="card-date">${escHtml(r.date)}</div>
        ${r.link ? `<a href="${escHtml(r.link)}" target="_blank" rel="noopener" class="card-link">Read Paper</a>` : '<span class="card-link" style="color:var(--text-muted)">PDF link coming soon</span>'}
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Research</h2>
        <p class="section-subtitle">Papers and academic work</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  function renderCoding(data) {
    const skills = data.coding.languages.map(l => `
      <div class="skill-item animate-in">
        <div class="skill-header">
          <span class="skill-name">${l.icon ? l.icon + ' ' : ''}${escHtml(l.name)}</span>
          <span class="skill-level">${escHtml(l.level)}</span>
        </div>
        <div class="skill-bar">
          <div class="skill-bar-fill" data-width="${l.percentage}"></div>
        </div>
      </div>
    `).join('');

    const websites = data.coding.websites.map(w => `
      <div class="card animate-in">
        <div class="card-title">${escHtml(w.name)}</div>
        <div class="card-description">${escHtml(w.description)}</div>
        ${w.url ? `<a href="${escHtml(w.url)}" target="_blank" rel="noopener" class="card-link">Visit</a>` : ''}
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Coding</h2>
        <p class="section-subtitle">Languages and technologies I work with</p>
      </div>
      <div class="skill-list">${skills}</div>
      ${data.coding.websites.length ? `
        <div class="websites-section-title animate-in">Websites</div>
        <div class="card-grid">${websites}</div>
      ` : ''}
    `;
  }

  function renderExperience(data) {
    if (!data.experience.length) {
      return `
        <div class="section-header animate-in">
          <h2 class="section-title">Experience</h2>
          <p class="section-subtitle">Professional journey</p>
        </div>
        ${emptyState('💼', 'Experience entries coming soon', 'Add experience via the admin panel')}
      `;
    }

    const items = data.experience.map(e => `
      <div class="timeline-item animate-in">
        <div class="timeline-date">${escHtml(e.period || '')}</div>
        <div class="timeline-title">${escHtml(e.title)}</div>
        <div class="timeline-company">${escHtml(e.company || '')}</div>
        <div class="timeline-description">${escHtml(e.description || '')}</div>
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Experience</h2>
        <p class="section-subtitle">Professional journey</p>
      </div>
      <div class="timeline">${items}</div>
    `;
  }

  function renderBlog(data) {
    if (!data.blog.length) {
      return `
        <div class="section-header animate-in">
          <h2 class="section-title">Blog</h2>
          <p class="section-subtitle">Summaries of research papers I've read</p>
        </div>
        ${emptyState('✍️', 'No blog posts yet', 'Write your first research paper summary via the admin panel')}
      `;
    }

    const cards = data.blog.map(b => `
      <div class="card blog-card animate-in">
        <div class="card-date">${escHtml(b.date || '')}</div>
        <div class="card-title">${escHtml(b.title)}</div>
        <div class="card-excerpt">${escHtml(b.excerpt || b.content?.substring(0, 200) || '')}</div>
        ${b.link ? `<a href="${escHtml(b.link)}" target="_blank" rel="noopener" class="card-link">Read More</a>` : ''}
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Blog</h2>
        <p class="section-subtitle">Summaries of research papers I've read</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  function renderTools(data) {
    const cards = data.tools.map(t => `
      <div class="card animate-in">
        <span class="card-icon">${t.icon || '🔧'}</span>
        <div class="card-title">${escHtml(t.name)}</div>
        <div class="card-description">${escHtml(t.description)}</div>
        ${t.category ? `<div class="card-meta"><span class="tag">${escHtml(t.category)}</span></div>` : ''}
        <a href="${escHtml(t.url)}" class="card-link">Launch Tool</a>
      </div>
    `).join('');

    return `
      <div class="section-header animate-in">
        <h2 class="section-title">Tools</h2>
        <p class="section-subtitle">Interactive tools I've built — minimal UI, math-forward</p>
      </div>
      <div class="card-grid">${cards}</div>
    `;
  }

  /* ---------- Helpers ---------- */

  function escHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function emptyState(icon, text, sub) {
    return `
      <div class="empty-state">
        <div class="empty-state-icon">${icon}</div>
        <div class="empty-state-text">${escHtml(text)}</div>
        <div class="empty-state-sub">${escHtml(sub)}</div>
      </div>
    `;
  }

  function animateSkillBars() {
    setTimeout(() => {
      document.querySelectorAll('.skill-bar-fill').forEach(bar => {
        const width = bar.getAttribute('data-width');
        bar.style.width = width + '%';
      });
    }, 200);
  }

  /* ---------- Render Map ---------- */

  const renderers = {
    'home': renderHome,
    'projects': renderProjects,
    'courses': renderCourses,
    'course-projects': renderCourseProjects,
    'research': renderResearch,
    'coding': renderCoding,
    'experience': renderExperience,
    'blog': renderBlog,
    'tools': renderTools,
  };

  /* ---------- Init ---------- */

  async function init() {
    const data = await DataLoader.load();
    if (!data) {
      document.getElementById('app').innerHTML = '<div class="empty-state"><div class="empty-state-text">Failed to load content data.</div></div>';
      return;
    }

    // Render all sections into DOM
    const app = document.getElementById('app');
    let html = '';
    for (const section of SECTIONS) {
      const renderer = renderers[section];
      if (renderer) {
        html += `<div id="section-${section}" class="section">${renderer(data)}</div>`;
      }
    }
    app.innerHTML = html;

    // Set up navigation
    document.querySelectorAll('[data-section]').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.getAttribute('data-section');
        navigate(section);
        // Close mobile menu
        document.querySelector('.nav-links')?.classList.remove('open');
      });
    });

    // Mobile menu toggle
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
      });
    }

    // Intersection observer for animate-in elements
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.animate-in').forEach(el => observer.observe(el));

    // Route
    window.addEventListener('hashchange', onHashChange);
    onHashChange();
  }

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
