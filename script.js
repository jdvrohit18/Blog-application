/* =================================
   BLOGSPACE APPLICATION
================================= */

const STORAGE_KEY = "blogspace_posts_v1";
const USER_KEY = "blogspace_demo_user_v1";

/* =================================
   HELPER FUNCTIONS
================================= */

// Get saved blogs
function getPosts() {
  try {
    const data = JSON.parse(
      localStorage.getItem(STORAGE_KEY) || "[]"
    );

    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// Save blogs
function savePosts(posts) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(posts)
  );
}

// Escape text before inserting into HTML
function escapeText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]));
}

// Format date
function dateLabel(value) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

// Short preview
function shortText(value, max = 190) {
  const s = String(value || "");

  return s.length > max
    ? s.slice(0, max).trim() + "…"
    : s;
}

// Current page
const page = document.body.dataset.page;


/* =================================
   MOBILE NAVBAR
================================= */

const menuToggle = document.getElementById("menu-toggle");

if (menuToggle) {
  menuToggle.addEventListener("click", () => {
    document.getElementById("nav-links")
      ?.classList.toggle("open");
  });
}


/* =================================
   HOME PAGE
================================= */

if (page === "home") {
  const list = document.getElementById("blog-list");

  const posts = getPosts().sort(
    (a, b) => b.createdAt - a.createdAt
  );

  if (posts.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <h3>Your first story starts here.</h3>
        <p>No blog posts yet. Create one to see it appear.</p>
        <a class="btn" href="create-blog.html">
          Create a blog
        </a>
      </div>
    `;
  } else {
    list.innerHTML = posts.map(post => `
      <article class="blog-card">
        <span class="tag">BLOG</span>

        <p class="blog-meta">
          ${dateLabel(post.createdAt)}
        </p>

        <h3>${escapeText(post.title)}</h3>

        <p>
          ${escapeText(
            shortText(post.excerpt || post.content)
          )}
        </p>
      </article>
    `).join("");
  }
}


/* =================================
   REGISTER PAGE
================================= */

const registerForm =
  document.getElementById("register-form");

if (registerForm) {
  registerForm.addEventListener("submit", event => {
    event.preventDefault();

    const name = document.getElementById("reg-name")
      .value.trim();

    const email = document.getElementById("reg-email")
      .value.trim().toLowerCase();

    const password =
      document.getElementById("reg-password").value;

    const confirm =
      document.getElementById("reg-confirm").value;

    const message =
      document.getElementById("register-message");

    if (name.length < 2) {
      message.textContent = "Please enter your name.";
      return;
    }

    if (password.length < 6) {
      message.textContent =
        "Password must have at least 6 characters.";
      return;
    }

    if (password !== confirm) {
      message.textContent = "Passwords do not match.";
      return;
    }

    // Demo profile only.
    // Never store real passwords in localStorage.
    localStorage.setItem(
      USER_KEY,
      JSON.stringify({ name, email })
    );

    message.textContent =
      "Demo profile created! Taking you to Login…";

    setTimeout(() => {
      location.href = "login.html";
    }, 650);
  });
}


/* =================================
   LOGIN PAGE
================================= */

const loginForm =
  document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const email = document.getElementById("login-email")
      .value.trim().toLowerCase();

    const profile = JSON.parse(
      localStorage.getItem(USER_KEY) || "null"
    );

    const message =
      document.getElementById("login-message");

    if (!profile || profile.email !== email) {
      message.textContent =
        "No demo profile found for this email. " +
        "Register first in this browser.";
      return;
    }

    // Demo session only
    sessionStorage.setItem(
      "blogspace_logged_in",
      "yes"
    );

    message.textContent =
      "Demo login successful. Opening dashboard…";

    setTimeout(() => {
      location.href = "dashboard.html";
    }, 500);
  });
}


/* =================================
   DASHBOARD PAGE
================================= */

if (page === "dashboard") {
  const profile = JSON.parse(
    localStorage.getItem(USER_KEY) || "null"
  );

  const welcome =
    document.getElementById("dashboard-welcome");

  if (profile) {
    welcome.textContent =
      `Welcome, ${profile.name}. ` +
      "These demo posts are stored in this browser.";
  }

  const list =
    document.getElementById("dashboard-list");

  // Display posts
  function renderDashboard() {
    const posts = getPosts().sort(
      (a, b) => b.createdAt - a.createdAt
    );

    if (posts.length === 0) {
      list.innerHTML = `
        <div class="empty-state">
          <h3>No posts yet</h3>
          <p>Create your first blog and it will show here.</p>
          <a class="btn" href="create-blog.html">
            Write a blog
          </a>
        </div>
      `;

      return;
    }

    list.innerHTML = posts.map(post => `
      <article class="post-row">

        <div>
          <span class="blog-meta">
            ${dateLabel(post.createdAt)}
          </span>

          <h3>${escapeText(post.title)}</h3>

          <p>
            ${escapeText(shortText(post.content, 240))}
          </p>
        </div>

        <div class="post-actions">
          <button
            class="small-button"
            data-edit="${escapeText(post.id)}">
            Edit
          </button>

          <button
            class="small-button danger"
            data-delete="${escapeText(post.id)}">
            Delete
          </button>
        </div>

      </article>
    `).join("");
  }

  renderDashboard();

  // Edit and delete buttons
  list.addEventListener("click", event => {
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-delete]");

    // Edit
    if (edit) {
      location.href =
        `create-blog.html?id=${
          encodeURIComponent(edit.dataset.edit)
        }`;
    }

    // Delete
    if (del) {
      const id = del.dataset.delete;

      const confirmed = confirm(
        "Delete this blog post? This cannot be undone."
      );

      if (!confirmed) return;

      const updatedPosts = getPosts().filter(
        post => post.id !== id
      );

      savePosts(updatedPosts);
      renderDashboard();
    }
  });

  // Logout
  document.getElementById("logout-btn")
    ?.addEventListener("click", () => {
      sessionStorage.removeItem(
        "blogspace_logged_in"
      );

      location.href = "index.html";
    });
}


/* =================================
   CREATE AND EDIT BLOG PAGE
================================= */

if (page === "create") {
  const form = document.getElementById("blog-form");

  const idToEdit =
    new URLSearchParams(location.search).get("id");

  const existing = idToEdit
    ? getPosts().find(post => post.id === idToEdit)
    : null;

  // Load existing blog for editing
  if (existing) {
    document.getElementById("editor-heading")
      .textContent = "Edit your blog";

    document.getElementById("publish-btn")
      .textContent = "Save changes";

    document.getElementById("blog-title").value =
      existing.title;

    document.getElementById("blog-excerpt").value =
      existing.excerpt || "";

    document.getElementById("blog-content").value =
      existing.content;
  }

  form.addEventListener("submit", event => {
    event.preventDefault();

    const title = document.getElementById("blog-title")
      .value.trim();

    const excerpt = document.getElementById("blog-excerpt")
      .value.trim();

    const content = document.getElementById("blog-content")
      .value.trim();

    const message =
      document.getElementById("blog-message");

    if (!title || !content) {
      message.textContent =
        "Title and content are required.";
      return;
    }

    const posts = getPosts();

    // Update existing post
    if (existing) {
      const index = posts.findIndex(
        post => post.id === existing.id
      );

      if (index < 0) {
        message.textContent =
          "Post not found. Please return to dashboard.";
        return;
      }

      posts[index] = {
        ...posts[index],
        title,
        excerpt,
        content,
        updatedAt: Date.now()
      };

    } else {
      // Create new post
      const newPost = {
        id: crypto.randomUUID(),
        title,
        excerpt,
        content,
        createdAt: Date.now()
      };

      posts.push(newPost);
    }

    // Save
    savePosts(posts);

    message.textContent =
      "Saved! Opening your dashboard…";

    setTimeout(() => {
      location.href = "dashboard.html";
    }, 450);
  });
}