import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const db = getDatabase();

var checkForm = document.getElementById("checkForm");
var checkUsername = document.getElementById("checkUsername");

// Check username availability
checkForm.addEventListener("submit", (e) => {
    e.preventDefault();

    var username = checkUsername.value.trim().toLowerCase();

    get(ref(db, "usernames/" + username))
        .then((snapshot) => {
            if (snapshot.exists()) {
                alert("Sorry! @" + username + " is already taken. Try another one.");
            } else {
                alert("Great news! @" + username + " is available! Redirecting to create your page...");
                window.location.href = "login.html";
            }
        })
        .catch((error) => {
            alert("Error checking username: " + error.message);
        });
});
