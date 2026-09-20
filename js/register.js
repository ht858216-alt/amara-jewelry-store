/* ============================================
   ECLIPSE JEWELRY - Register Logic
   ============================================ */

document.getElementById("register-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const errorMsg = document.getElementById("error-msg");

  try {
    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    if (!firstName || !lastName || !email || !password) {
      errorMsg.textContent = "Please fill in all fields.";
      errorMsg.classList.add("show");
      return;
    }

    const users = getUsers();

    if (users.some((u) => u.email === email)) {
      errorMsg.textContent = "An account with this email already exists.";
      errorMsg.classList.add("show");
      return;
    }

    users.push({ firstName, lastName, email, password });
    saveUsers(users);

    // Auto-login after registering
    setCurrentUser({ firstName, lastName, email });
    window.location.href = "index.html";
  } catch (err) {
    console.error("Register failed:", err);
    errorMsg.textContent = "Something went wrong: " + err.message;
    errorMsg.classList.add("show");
  }
});
