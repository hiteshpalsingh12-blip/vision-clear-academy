// ADMIN PANEL JavaScript

const API = "https://vision-clear-academy.onrender.com/api";

// Check admin access
const user = JSON.parse(localStorage.getItem("user"));
const token = localStorage.getItem("token");

if (!token || !user || user.role !== "admin") {
  window.location.href = "login.html";
}

// Get auth headers
function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: "Bearer " + token,
  };
}

// ============================================
// SHOW/HIDE SECTIONS
// ============================================
function showSection(name) {
  var sections = ["dashboard", "courses", "addcourse", "users", "addlesson"];
  sections.forEach(function (s) {
    var el = document.getElementById("section-" + s);
    if (el) el.style.display = "none";
  });

  var target = document.getElementById("section-" + name);
  if (target) target.style.display = "block";

  // Update active sidebar link
  document.querySelectorAll(".sidebar-link").forEach(function (link) {
    link.classList.remove("active");
  });
  event.target.classList.add("active");

  // Load data
  if (name === "courses") loadCourses();
  if (name === "users") loadUsers();
  if (name === "addlesson") loadCourseDropdown();
  if (name === "dashboard") loadDashboard();
}

// ============================================
// LOAD DASHBOARD STATS
// ============================================
async function loadDashboard() {
  try {
    var coursesRes = await fetch(API + "/courses/admin/all", {
      headers: getHeaders(),
    });
    var coursesData = await coursesRes.json();

    var usersRes = await fetch(API + "/auth/users", { headers: getHeaders() });
    var usersData = await usersRes.json();

    if (coursesData.success) {
      document.getElementById("totalCourses").textContent = coursesData.count;
      var totalLessons = 0;
      coursesData.data.forEach(function (c) {
        totalLessons += c.lessons ? c.lessons.length : 0;
      });
      document.getElementById("totalLessons").textContent = totalLessons;
    }

    if (usersData.success) {
      document.getElementById("totalUsers").textContent = usersData.count;
    }
  } catch (error) {
    console.error("Dashboard load error:", error);
  }
}

// ============================================
// LOAD COURSES TABLE
// ============================================
async function loadCourses() {
  try {
    var res = await fetch(API + "/courses/admin/all", {
      headers: getHeaders(),
    });
    var data = await res.json();
    var tbody = document.getElementById("coursesTable");

    if (data.success && data.data.length > 0) {
      var html = "";
      data.data.forEach(function (course) {
        html += "<tr>";
        html += "<td><strong>" + course.title + "</strong></td>";
        html += "<td>₹" + course.price + "</td>";
        html += "<td>" + course.category + "</td>";
        html += "<td>" + (course.lessons ? course.lessons.length : 0) + "</td>";
        html +=
          "<td>" + (course.isPublished ? "✅ Published" : "⏳ Draft") + "</td>";
        html +=
          "<td><button onclick=\"deleteCourse('" +
          course._id +
          '\')" class="btn btn-small" style="background:#ff1744; color:#fff;">Delete</button></td>';
        html += "</tr>";
      });
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML =
        '<tr><td colspan="6" style="text-align:center; padding:40px;">No courses yet. Add your first course!</td></tr>';
    }
  } catch (error) {
    console.error("Load courses error:", error);
  }
}

// ============================================
// LOAD USERS TABLE
// ============================================
async function loadUsers() {
  try {
    var res = await fetch(API + "/auth/users", { headers: getHeaders() });
    var data = await res.json();
    var tbody = document.getElementById("usersTable");

    if (data.success && data.data.length > 0) {
      var html = "";
      data.data.forEach(function (u) {
        html += "<tr>";
        html += "<td>" + u.name + "</td>";
        html += "<td>" + u.email + "</td>";
        html += "<td>" + u.role + "</td>";
        html += "<td>" + new Date(u.createdAt).toLocaleDateString() + "</td>";
        html += "</tr>";
      });
      tbody.innerHTML = html;
    } else {
      tbody.innerHTML =
        '<tr><td colspan="4" style="text-align:center; padding:40px;">No users found.</td></tr>';
    }
  } catch (error) {
    console.error("Load users error:", error);
  }
}

// ============================================
// LOAD COURSE DROPDOWN (for Add Lesson)
// ============================================
async function loadCourseDropdown() {
  try {
    var res = await fetch(API + "/courses/admin/all", {
      headers: getHeaders(),
    });
    var data = await res.json();
    var select = document.getElementById("lessonCourseId");

    select.innerHTML = '<option value="">-- Select a course --</option>';
    if (data.success) {
      data.data.forEach(function (course) {
        select.innerHTML +=
          '<option value="' + course._id + '">' + course.title + "</option>";
      });
    }
  } catch (error) {
    console.error("Load dropdown error:", error);
  }
}

// ============================================
// ADD COURSE
// ============================================
var addCourseForm = document.getElementById("addCourseForm");
if (addCourseForm) {
  addCourseForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var msgDiv = document.getElementById("courseMessage");

    var formData = new FormData();
    formData.append("title", document.getElementById("courseTitle").value);
    formData.append("description", document.getElementById("courseDesc").value);
    formData.append("price", document.getElementById("coursePrice").value);
    formData.append(
      "category",
      document.getElementById("courseCategory").value,
    );
    formData.append(
      "isPublished",
      document.getElementById("coursePublished").checked,
    );
    formData.append(
      "isLocked",
      document.getElementById("courseLocked").checked,
    );

    var imageFile = document.getElementById("courseImage").files[0];
    if (imageFile) formData.append("image", imageFile);

    try {
      var res = await fetch(API + "/courses", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      var data = await res.json();

      if (data.success) {
        msgDiv.style.color = "green";
        msgDiv.textContent = "Course created successfully!";
        addCourseForm.reset();
      } else {
        msgDiv.style.color = "red";
        msgDiv.textContent = data.message;
      }
    } catch (error) {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Server error. Try again.";
    }
  });
}

// ============================================
// ADD LESSON
// ============================================
var addLessonForm = document.getElementById("addLessonForm");
if (addLessonForm) {
  addLessonForm.addEventListener("submit", async function (e) {
    e.preventDefault();
    var msgDiv = document.getElementById("lessonMessage");

    var courseId = document.getElementById("lessonCourseId").value;
    if (!courseId) {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Please select a course";
      return;
    }

    var formData = new FormData();
    formData.append("title", document.getElementById("lessonTitle").value);
    formData.append(
      "duration",
      document.getElementById("lessonDuration").value,
    );
    formData.append("order", document.getElementById("lessonOrder").value);
    formData.append("isFree", document.getElementById("lessonFree").checked);

    var videoFile = document.getElementById("lessonVideo").files[0];
    var videoUrl = document.getElementById("lessonVideoUrl").value;

    if (videoFile) {
      formData.append("video", videoFile);
    } else if (videoUrl) {
      formData.append("videoUrl", videoUrl);
    } else {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Please upload a video or provide a URL";
      return;
    }

    try {
      var res = await fetch(API + "/courses/" + courseId + "/lessons", {
        method: "POST",
        headers: { Authorization: "Bearer " + token },
        body: formData,
      });

      var data = await res.json();

      if (data.success) {
        msgDiv.style.color = "green";
        msgDiv.textContent = "Lesson added successfully!";
        addLessonForm.reset();
      } else {
        msgDiv.style.color = "red";
        msgDiv.textContent = data.message;
      }
    } catch (error) {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Error: " + error.message;
      console.error("Full error:", error);
    }
  });
}

// ============================================
// DELETE COURSE
// ============================================
async function deleteCourse(id) {
  if (!confirm("Are you sure you want to delete this course?")) return;

  try {
    var res = await fetch(API + "/courses/" + id, {
      method: "DELETE",
      headers: getHeaders(),
    });
    var data = await res.json();

    if (data.success) {
      loadCourses();
    } else {
      alert(data.message);
    }
  } catch (error) {
    alert("Error deleting course");
  }
}

// Load dashboard on page load
loadDashboard();
