import { getDatabase, ref, get } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const db = getDatabase();

var profileContent = document.getElementById("profileContent");
var notFoundCard = document.getElementById("notFoundCard");
var nfUrlText = document.getElementById("nfUrlText");

var pAvatar = document.getElementById("pAvatar");
var pName = document.getElementById("pName");
var pBio = document.getElementById("pBio");
var pLinks = document.getElementById("pLinks");

var params = new URLSearchParams(window.location.search);
var username = params.get("u");

function showNotFound() {
    profileContent.classList.add("hidden");
    notFoundCard.classList.remove("hidden");
    nfUrlText.textContent = "buraqbio.link/" + (username || "...");
}

if (!username) {
    showNotFound();
}

else {
    username = username.toLowerCase().trim();

    // Get user ID from username
    get(ref(db, "usernames/" + username))
        .then((snapshot) => {
            if (!snapshot.exists()) {
                showNotFound();
                return;
            }

            var uid = snapshot.val();

            // Get user data
            get(ref(db, "users/" + uid)).then((userSnapshot) => {
                if (!userSnapshot.exists()) {
                    showNotFound();
                    return;
                }

                var user = userSnapshot.val();

                document.title = (user.displayName || user.username) + " | BuraqBio";
                pName.textContent = user.displayName || user.username;
                pBio.textContent = user.bio || "";

                // Profile image preview
                if (user.photoUrl) {
                    pAvatar.innerHTML = '<img src="' + user.photoUrl + '" alt="avatar">';
                }

                else {
                    pAvatar.textContent = (user.displayName || user.username).charAt(0).toUpperCase();
                }

                // Links
                pLinks.innerHTML = "";

                if (user.links) {
                    for (var id in user.links) {

                        var link = user.links[id];

                        pLinks.innerHTML += `
                        <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="profile-link-btn">
                            <span class="link-txt">${link.title}</span>
                            <span class="chev"><i class="fa-solid fa-arrow-right"></i></span>
                        </a>
                    `;
                    }
                }
            });
        });
}
