import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";

import { getDatabase, ref, set, get } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();

// UI Elements
var formLogin = document.getElementById("formLogin");
var formSignup = document.getElementById("formSignup");
var tabLogin = document.getElementById("tabLogin");
var tabSignup = document.getElementById("tabSignup");
var goToSignup = document.getElementById("goToSignup");
var goToLogin = document.getElementById("goToLogin");
var loginError = document.getElementById("loginError");
var signupError = document.getElementById("signupError");
var signupSuccess = document.getElementById("signupSuccess");

var toggleLoginPw = document.getElementById("toggleLoginPw");
var toggleSuPw = document.getElementById("toggleSuPw");
var loginPassword = document.getElementById("loginPassword");
var suPassword = document.getElementById("suPassword");
var loginEmail = document.getElementById("loginEmail");
var suEmail = document.getElementById("suEmail");
var suUsername = document.getElementById("suUsername");

// Show Login Form
function showLogin() {
    formLogin.classList.remove("hidden");
    formSignup.classList.add("hidden");

    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
}

// Show Signup Form
function showSignup() {
    formSignup.classList.remove("hidden");
    formLogin.classList.add("hidden");

    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
}

tabLogin.addEventListener("click", showLogin);
goToLogin.addEventListener("click", showLogin);

tabSignup.addEventListener("click", showSignup);
goToSignup.addEventListener("click", showSignup);

toggleLoginPw.addEventListener("change", function() {
    if (toggleLoginPw.checked) {
        loginPassword.type = "text";
    } else {
        loginPassword.type = "password";
    }
});

toggleSuPw.addEventListener("change", function() {
    if (toggleSuPw.checked) {
        suPassword.type = "text";
    } else {
        suPassword.type = "password";
    }
});

// Sign Up Logic
formSignup.addEventListener("submit", (e) => {
    e.preventDefault();

    signupError.classList.add("hidden");
    signupSuccess.classList.add("hidden");

    var username = suUsername.value.trim().toLowerCase();

    get(ref(db, "usernames/" + username))
        .then((data) => {
            if (data.exists()) {
                signupError.classList.remove("hidden");
                signupError.textContent = "Username already taken";
                return;
            }

            createUserWithEmailAndPassword(auth, suEmail.value, suPassword.value)
                .then((userCredential) => {
                    var user = userCredential.user;

                    set(ref(db, "usernames/" + username), user.uid);

                    return set(ref(db, "users/" + user.uid), {
                        username: username,
                        email: suEmail.value
                    });
                })

                .then(() => {
                    signupSuccess.classList.remove("hidden");
                    signupSuccess.textContent = "Registration Successful. Please login now.";
                    formSignup.reset();
                })

                .catch((error) => {
                    signupError.classList.remove("hidden");
                    signupError.textContent = error.message;
                });
        })
        
        .catch((error) => {
            signupError.classList.remove("hidden");
            signupError.textContent = error.message;
        });
});

// Login Logic
formLogin.addEventListener("submit", (e) => {
    e.preventDefault();

    loginError.classList.add("hidden");

    signInWithEmailAndPassword(auth, loginEmail.value, loginPassword.value)
        .then((userCredential) => {
            window.location.href = `dashboard.html`;
        })

        .catch((error) => {
            loginError.classList.remove("hidden");
            loginError.textContent = error.message;
        });
});