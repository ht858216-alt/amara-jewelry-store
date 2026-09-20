/* ============================================
   ECLIPSE JEWELRY - Login Logic
   ============================================ */

document.getElementById("login-form").addEventListener("submit", function (e) {
  e.preventDefault();
  const errorMsg = document.getElementById("error-msg");

  try {
    const email = document.getElementById("email").value.trim().toLowerCase();
    const password = document.getElementById("password").value;

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      errorMsg.textContent = "Invalid email or password.";
      errorMsg.classList.add("show");
      return;
    }

    setCurrentUser({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    });
    window.location.href = "index.html";
  } catch (err) {
    console.error("Login failed:", err);
    errorMsg.textContent = "Something went wrong: " + err.message;
    errorMsg.classList.add("show");
  }
});
