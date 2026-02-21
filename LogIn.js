document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("message");

    let users = [
        { username: "admin", password: "1234" },
        { username: "user1", password: "pass1" },
        { username: "john", password: "abcd" }
    ];

    let validUser = users.find(user => 
        user.username === username && user.password === password
    );

    if (username === "" || password === "") {
        message.textContent = "Please fill in all fields";
    }
    else if (validUser) {
        message.style.color = "green";
        message.textContent = "Login successful!";
        window.location.href = "Prototype2.html";
    }
    else {
        message.style.color = "red";
        message.textContent = "Invalid username or password";
    }
});
