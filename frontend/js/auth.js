// AUTH - Login & Signup JavaScript

const API_URL = "https://vision-clear-academy.onrender.com/";

// ============================================
// SIGNUP
// ============================================
const signupForm = document.getElementById("signupForm");
if (signupForm) {
  signupForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value;
    const email = document.getElementById("signupEmail").value;
    const phone = document.getElementById("signupPhone").value;
    const password = document.getElementById("signupPassword").value;
    const msgDiv = document.getElementById("signupMessage");

    try {
      const response = await fetch(API_URL + "/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, phone }),
      });

      const data = await response.json();

      if (data.success) {
        // Token save karo
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        msgDiv.style.color = "green";
        msgDiv.textContent = "Account created! Redirecting...";

        setTimeout(function () {
          if (data.data.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }, 1500);
      } else {
        msgDiv.style.color = "red";
        msgDiv.textContent = data.message;
      }
    } catch (error) {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Server error. Please try again.";
    }
  });
}

// ============================================
// LOGIN
// ============================================
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const msgDiv = document.getElementById("loginMessage");

    try {
      const response = await fetch(API_URL + "/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data));

        msgDiv.style.color = "green";
        msgDiv.textContent = "Login successful! Redirecting...";

        setTimeout(function () {
          if (data.data.role === "admin") {
            window.location.href = "admin.html";
          } else {
            window.location.href = "dashboard.html";
          }
        }, 1500);
      } else {
        msgDiv.style.color = "red";
        msgDiv.textContent = data.message;
      }
    } catch (error) {
      msgDiv.style.color = "red";
      msgDiv.textContent = "Server error. Please try again.";
    }
  });
}

// ============================================
// LOGOUT
// ============================================
function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "../index.html";
}
