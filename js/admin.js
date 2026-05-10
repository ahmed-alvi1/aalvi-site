/* =========================================================
   admin.js — Admin panel logic for content management
   ========================================================= */

(function () {
  'use strict';

  let contentData = null;
  const TABS = ['profile', 'projects', 'courses', 'course-projects', 'research', 'coding', 'experience', 'blog', 'tools'];
  let activeTab = 'profile';

  /* ---------- Auth ---------- */
  function checkAuth() {
    const gate = document.getElementById('auth-gate');
    const panel = document.getElementById('admin-panel');
    const stored = sessionStorage.getItem('admin_auth');
    if (stored === 'true') {
      gate.style.display = 'none';
      panel.style.display = 'block';
      return true;
    }
    gate.style.display = 'flex';
    panel.style.display = 'none';
    return false;
  }

  function login() {
    const pw = document.getElementById('admin-password').value;
    if (pw === 'aalvi2025') {
      sessionStorage.setItem('admin_auth', 'true');
      checkAuth();
      loadData();
    } else {
      document.getElementById('auth-error').textContent = 'Incorrect password';
    }
  }

  /* ---------- Data ---------- */
  async function loadData() {
    try {
      const resp = await fetch('data/content.json');
      contentData = await resp.json();
    } catch {
      contentData = getDefaultData();
    }
    renderCurrentTab();
  }

  function getDefaultData() {
    return {
      profile: { name: '', tagline: '', bio: '', email: '', socialLinks: { github: '', linkedin: '', email: '' } },
      projects: [], courses: { semesters: [] }, courseProjects: [], research: [],
      coding: { languages: [], websites: [] }, experience: [], blog: [], tools: []
    };
  }

  /* ---------- Tab Navigation ---------- */
  function switchTab(tab) {
    activeTab = tab;
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
    renderCurrentTab();
  }

  function renderCurrentTab() {
    const container = document.getElementById('tab-content');
    const r = tabRenderers[activeTab];
    container.innerHTML = r ? r() : '<p>Unknown tab</p>';
    attachTabListeners();
  }

  /* ---------- Tab Renderers ---------- */
  const tabRenderers = {
    profile() {
      const p = contentData.profile;
      return `
        <h3>Profile</h3>
        <div class="field"><label>Name</label><input id="f-name" value="${esc(p.name)}"></div>
        <div class="field"><label>Tagline</label><input id="f-tagline" value="${esc(p.tagline)}"></div>
        <div class="field"><label>Bio</label><textarea id="f-bio" rows="3">${esc(p.bio)}</textarea></div>
        <div class="field"><label>Email</label><input id="f-email" value="${esc(p.email || '')}"></div>
        <div class="field"><label>GitHub URL</label><input id="f-github" value="${esc(p.socialLinks?.github || '')}"></div>
        <div class="field"><label>LinkedIn URL</label><input id="f-linkedin" value="${esc(p.socialLinks?.linkedin || '')}"></div>
        <button class="admin-btn" onclick="saveProfile()">Save Profile</button>
      `;
    },
    projects() {
      const list = contentData.projects.map((p, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(p.title)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('projects',${i})">Remove</button>
          </div>
          <p class="admin-card-sub">${esc(p.description)}</p>
          ${p.link ? `<small>Link: ${esc(p.link)}</small>` : '<small>No link yet</small>'}
        </div>
      `).join('');
      return `
        <h3>Projects</h3>${list}
        <div class="add-form">
          <h4>Add Project</h4>
          <div class="field"><label>Title</label><input id="f-proj-title"></div>
          <div class="field"><label>Description</label><textarea id="f-proj-desc" rows="2"></textarea></div>
          <div class="field"><label>Tech Stack (comma-separated)</label><input id="f-proj-tech"></div>
          <div class="field"><label>Link</label><input id="f-proj-link" placeholder="https://..."></div>
          <button class="admin-btn" onclick="addProject()">Add Project</button>
        </div>
      `;
    },
    courses() {
      const sems = contentData.courses.semesters.map((s, si) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(s.name)} — ${esc(s.period)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('semesters',${si})">Remove Semester</button>
          </div>
          <ul class="admin-list">${s.courses.map((c, ci) => `
            <li>${esc(c.code)} — ${esc(c.name)} <button class="admin-btn-xs" onclick="removeCourse(${si},${ci})">×</button></li>
          `).join('')}</ul>
          <div class="inline-add">
            <input placeholder="Code" id="f-course-code-${si}" style="width:80px">
            <input placeholder="Course Name" id="f-course-name-${si}">
            <button class="admin-btn-sm" onclick="addCourse(${si})">+ Add</button>
          </div>
        </div>
      `).join('');
      return `
        <h3>Courses</h3>${sems}
        <div class="add-form">
          <h4>Add Semester</h4>
          <div class="field"><label>Name (e.g. Sophomore Fall)</label><input id="f-sem-name"></div>
          <div class="field"><label>Period (e.g. Fall 2026)</label><input id="f-sem-period"></div>
          <button class="admin-btn" onclick="addSemester()">Add Semester</button>
        </div>
      `;
    },
    'course-projects'() {
      const list = contentData.courseProjects.map((p, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(p.title)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('courseProjects',${i})">Remove</button>
          </div>
          <p class="admin-card-sub">${esc(p.description)}</p>
        </div>
      `).join('');
      return `
        <h3>Course Projects</h3>${list}
        <div class="add-form">
          <h4>Add Course Project</h4>
          <div class="field"><label>Title</label><input id="f-cp-title"></div>
          <div class="field"><label>Description</label><textarea id="f-cp-desc" rows="2"></textarea></div>
          <div class="field"><label>Tech Used (comma-separated)</label><input id="f-cp-tech"></div>
          <div class="field"><label>Features (comma-separated)</label><input id="f-cp-features"></div>
          <div class="field"><label>Link</label><input id="f-cp-link"></div>
          <div class="field"><label>Semester</label><input id="f-cp-sem"></div>
          <button class="admin-btn" onclick="addCourseProject()">Add</button>
        </div>
      `;
    },
    research() {
      const list = contentData.research.map((r, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(r.title)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('research',${i})">Remove</button>
          </div>
          <p class="admin-card-sub">${esc(r.abstract)}</p>
          ${r.link ? `<small>Link: ${esc(r.link)}</small>` : '<small>No link — add via edit</small>'}
          <div class="inline-add" style="margin-top:8px">
            <input placeholder="Paper URL" id="f-rlink-${i}" value="${esc(r.link || '')}">
            <button class="admin-btn-sm" onclick="updateResearchLink(${i})">Update Link</button>
          </div>
        </div>
      `).join('');
      return `
        <h3>Research</h3>${list}
        <div class="add-form">
          <h4>Add Research Paper</h4>
          <div class="field"><label>Title</label><input id="f-res-title"></div>
          <div class="field"><label>Abstract</label><textarea id="f-res-abstract" rows="3"></textarea></div>
          <div class="field"><label>Link (optional)</label><input id="f-res-link"></div>
          <div class="field"><label>Date</label><input id="f-res-date" placeholder="2025"></div>
          <button class="admin-btn" onclick="addResearch()">Add</button>
        </div>
      `;
    },
    coding() {
      const langs = contentData.coding.languages.map((l, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(l.name)} — ${esc(l.level)} (${l.percentage}%)</strong>
            <button class="admin-btn-sm danger" onclick="removeLang(${i})">Remove</button>
          </div>
        </div>
      `).join('');
      const sites = contentData.coding.websites.map((w, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(w.name)}</strong>
            <button class="admin-btn-sm danger" onclick="removeWebsite(${i})">Remove</button>
          </div>
          <small>${esc(w.url || 'No URL')}</small>
        </div>
      `).join('');
      return `
        <h3>Languages</h3>${langs}
        <div class="add-form">
          <h4>Add Language</h4>
          <div class="field"><label>Name</label><input id="f-lang-name"></div>
          <div class="field"><label>Level</label><select id="f-lang-level"><option>Basic</option><option>Intermediate</option><option>Advanced</option></select></div>
          <div class="field"><label>Proficiency %</label><input id="f-lang-pct" type="number" min="0" max="100" value="50"></div>
          <button class="admin-btn" onclick="addLang()">Add Language</button>
        </div>
        <hr style="border-color:#1e1e1e;margin:24px 0">
        <h3>Websites</h3>${sites}
        <div class="add-form">
          <h4>Add Website</h4>
          <div class="field"><label>Name</label><input id="f-web-name"></div>
          <div class="field"><label>URL</label><input id="f-web-url"></div>
          <div class="field"><label>Description</label><input id="f-web-desc"></div>
          <button class="admin-btn" onclick="addWebsite()">Add Website</button>
        </div>
      `;
    },
    experience() {
      const list = contentData.experience.map((e, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(e.title)} at ${esc(e.company || '')}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('experience',${i})">Remove</button>
          </div>
          <small>${esc(e.period || '')}</small>
        </div>
      `).join('');
      return `
        <h3>Experience</h3>${list || '<p style="color:#555">No entries yet</p>'}
        <div class="add-form">
          <h4>Add Experience</h4>
          <div class="field"><label>Title</label><input id="f-exp-title"></div>
          <div class="field"><label>Company</label><input id="f-exp-company"></div>
          <div class="field"><label>Period</label><input id="f-exp-period" placeholder="Jun 2025 — Present"></div>
          <div class="field"><label>Description</label><textarea id="f-exp-desc" rows="3"></textarea></div>
          <button class="admin-btn" onclick="addExperience()">Add</button>
        </div>
      `;
    },
    blog() {
      const list = contentData.blog.map((b, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${esc(b.title)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('blog',${i})">Remove</button>
          </div>
          <small>${esc(b.date || '')}</small>
        </div>
      `).join('');
      return `
        <h3>Blog Posts</h3>${list || '<p style="color:#555">No posts yet</p>'}
        <div class="add-form">
          <h4>Add Blog Post</h4>
          <div class="field"><label>Title</label><input id="f-blog-title"></div>
          <div class="field"><label>Date</label><input id="f-blog-date" placeholder="2025-05-10"></div>
          <div class="field"><label>Excerpt</label><textarea id="f-blog-excerpt" rows="2"></textarea></div>
          <div class="field"><label>Full Content</label><textarea id="f-blog-content" rows="6"></textarea></div>
          <button class="admin-btn" onclick="addBlogPost()">Add Post</button>
        </div>
      `;
    },
    tools() {
      const list = contentData.tools.map((t, i) => `
        <div class="admin-card">
          <div class="admin-card-header">
            <strong>${t.icon || ''} ${esc(t.name)}</strong>
            <button class="admin-btn-sm danger" onclick="removeItem('tools',${i})">Remove</button>
          </div>
          <small>${esc(t.url)}</small>
        </div>
      `).join('');
      return `
        <h3>Tools</h3>${list}
        <div class="add-form">
          <h4>Add Tool</h4>
          <div class="field"><label>Name</label><input id="f-tool-name"></div>
          <div class="field"><label>Description</label><textarea id="f-tool-desc" rows="2"></textarea></div>
          <div class="field"><label>URL</label><input id="f-tool-url"></div>
          <div class="field"><label>Icon (emoji)</label><input id="f-tool-icon" placeholder="🔧"></div>
          <div class="field"><label>Category</label><input id="f-tool-cat"></div>
          <button class="admin-btn" onclick="addTool()">Add Tool</button>
        </div>
      `;
    }
  };

  function attachTabListeners() { /* listeners are inline onclick */ }

  /* ---------- CRUD Actions (exposed globally) ---------- */

  window.saveProfile = function () {
    contentData.profile.name = val('f-name');
    contentData.profile.tagline = val('f-tagline');
    contentData.profile.bio = val('f-bio');
    contentData.profile.email = val('f-email');
    contentData.profile.socialLinks = {
      github: val('f-github'), linkedin: val('f-linkedin'), email: val('f-email')
    };
    toast('Profile saved');
    renderCurrentTab();
  };

  window.addProject = function () {
    contentData.projects.push({
      id: slug(val('f-proj-title')), title: val('f-proj-title'), description: val('f-proj-desc'),
      techStack: csv(val('f-proj-tech')), link: val('f-proj-link'), image: '', featured: false
    });
    toast('Project added'); renderCurrentTab();
  };

  window.addSemester = function () {
    contentData.courses.semesters.push({ name: val('f-sem-name'), period: val('f-sem-period'), courses: [] });
    toast('Semester added'); renderCurrentTab();
  };

  window.addCourse = function (si) {
    const code = val(`f-course-code-${si}`);
    const name = val(`f-course-name-${si}`);
    if (code && name) { contentData.courses.semesters[si].courses.push({ code, name }); toast('Course added'); renderCurrentTab(); }
  };

  window.removeCourse = function (si, ci) {
    contentData.courses.semesters[si].courses.splice(ci, 1); renderCurrentTab();
  };

  window.addCourseProject = function () {
    contentData.courseProjects.push({
      id: slug(val('f-cp-title')), title: val('f-cp-title'), description: val('f-cp-desc'),
      techUsed: csv(val('f-cp-tech')), features: csv(val('f-cp-features')),
      link: val('f-cp-link'), semester: val('f-cp-sem')
    });
    toast('Course project added'); renderCurrentTab();
  };

  window.addResearch = function () {
    contentData.research.push({
      id: slug(val('f-res-title')), title: val('f-res-title'), abstract: val('f-res-abstract'),
      link: val('f-res-link'), date: val('f-res-date'), status: 'Completed'
    });
    toast('Research added'); renderCurrentTab();
  };

  window.updateResearchLink = function (i) {
    contentData.research[i].link = val(`f-rlink-${i}`);
    toast('Link updated'); renderCurrentTab();
  };

  window.addLang = function () {
    contentData.coding.languages.push({
      name: val('f-lang-name'), level: val('f-lang-level'),
      percentage: parseInt(val('f-lang-pct')) || 50, icon: ''
    });
    toast('Language added'); renderCurrentTab();
  };

  window.removeLang = function (i) { contentData.coding.languages.splice(i, 1); renderCurrentTab(); };

  window.addWebsite = function () {
    contentData.coding.websites.push({ name: val('f-web-name'), url: val('f-web-url'), description: val('f-web-desc') });
    toast('Website added'); renderCurrentTab();
  };

  window.removeWebsite = function (i) { contentData.coding.websites.splice(i, 1); renderCurrentTab(); };

  window.addExperience = function () {
    contentData.experience.push({
      title: val('f-exp-title'), company: val('f-exp-company'),
      period: val('f-exp-period'), description: val('f-exp-desc')
    });
    toast('Experience added'); renderCurrentTab();
  };

  window.addBlogPost = function () {
    contentData.blog.push({
      id: slug(val('f-blog-title')), title: val('f-blog-title'), date: val('f-blog-date'),
      excerpt: val('f-blog-excerpt'), content: val('f-blog-content')
    });
    toast('Blog post added'); renderCurrentTab();
  };

  window.addTool = function () {
    contentData.tools.push({
      id: slug(val('f-tool-name')), name: val('f-tool-name'), description: val('f-tool-desc'),
      url: val('f-tool-url'), icon: val('f-tool-icon'), category: val('f-tool-cat')
    });
    toast('Tool added'); renderCurrentTab();
  };

  window.removeItem = function (key, i) {
    if (key === 'semesters') { contentData.courses.semesters.splice(i, 1); }
    else { contentData[key].splice(i, 1); }
    renderCurrentTab();
  };

  /* ---------- Import / Export ---------- */
  window.exportData = function () {
    const blob = new Blob([JSON.stringify(contentData, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'content.json';
    a.click();
    URL.revokeObjectURL(a.href);
    toast('content.json downloaded');
  };

  window.importData = function () {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      try {
        contentData = JSON.parse(text);
        toast('Data imported successfully');
        renderCurrentTab();
      } catch { toast('Invalid JSON file'); }
    };
    input.click();
  };

  /* ---------- Helpers ---------- */
  function val(id) { const el = document.getElementById(id); return el ? el.value.trim() : ''; }
  function esc(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function slug(s) { return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function csv(s) { return s ? s.split(',').map(x => x.trim()).filter(Boolean) : []; }

  function toast(msg) {
    const el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 2500);
  }

  /* ---------- Init ---------- */
  window.adminLogin = login;

  document.addEventListener('DOMContentLoaded', () => {
    if (checkAuth()) loadData();

    document.querySelectorAll('.admin-tab').forEach(tab => {
      tab.addEventListener('click', () => switchTab(tab.dataset.tab));
    });
  });
})();
