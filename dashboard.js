import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-auth.js";
import { getDatabase, ref, get, set, update, push, remove } from "https://www.gstatic.com/firebasejs/13.1.0/firebase-database.js";

const auth = getAuth();
const db = getDatabase();

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = "login.html";
        return;
    }

    // Load user profile data
    get(ref(db, "users/" + user.uid))
        .then((snapshot) => {
            if (!snapshot.exists()) return;

            var data = snapshot.val();

            document.getElementById("displayName").value = data.displayName || "";
            document.getElementById("profileBio").value = data.bio || "";
            document.getElementById("photoUrl").value = data.photoUrl || "";

            var profileImg = document.getElementById("profileImg");

            if (data.photoUrl) {
                profileImg.innerHTML = '<img src="' + data.photoUrl + '" alt="avatar">';
            } else if (data.displayName) {
                profileImg.textContent = data.displayName.charAt(0).toUpperCase();
            } else if (data.username) {
                profileImg.textContent = data.username.charAt(0).toUpperCase();
            }

            if (data.username) {
                document.getElementById("profilePageUrl").value = "buraqbio.link/" + data.username;
                document.getElementById("btnViewProfile").href = "p.html?u=" + data.username;
            }
        });

    // Save Profile Changes
    var profileForm = document.getElementById("profileForm");

    profileForm.addEventListener("submit", (e) => {
        e.preventDefault();

        var newDisplayName = document.getElementById("displayName").value;
        var newBio = document.getElementById("profileBio").value;
        var newPhotoUrl = document.getElementById("photoUrl").value;

        update(ref(db, "users/" + user.uid), {
            displayName: newDisplayName,
            bio: newBio,
            photoUrl: newPhotoUrl
        })
            .then(() => {
                alert("Profile saved successfully!");

                var profileImg = document.getElementById("profileImg");
                if (newPhotoUrl) {
                    profileImg.innerHTML = '<img src="' + newPhotoUrl + '" alt="avatar">';
                } else if (newDisplayName) {
                    profileImg.textContent = newDisplayName.charAt(0).toUpperCase();
                }
            })
            .catch((error) => {
                alert("Error saving profile: " + error.message);
            });
    });

    // Load and display links
    var linkList = document.getElementById("linkList");
    var emptyNote = document.getElementById("emptyNote");

    function loadLinks() {
        get(ref(db, "users/" + user.uid + "/links"))
            .then((snapshot) => {
                linkList.innerHTML = "";

                if (!snapshot.exists()) {
                    emptyNote.classList.remove("hidden");
                    return;
                }

                emptyNote.classList.add("hidden");

                snapshot.forEach((child) => {
                    var linkId = child.key;
                    var link = child.val();

                    linkList.innerHTML += `
                        <div class="link-row">
                            <div class="link-main">
                                <b>${link.title}</b>
                                <span>${link.url}</span>
                            </div>
                            <div class="row-actions">
                                <button type="button" class="icon-btn edit-btn" data-id="${linkId}">
                                    <i class="fa-solid fa-pen"></i>
                                </button>
                                <button type="button" class="icon-btn danger delete-btn" data-id="${linkId}">
                                    <i class="fa-solid fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    `;
                });
            });
    }

    loadLinks();

    // Add or Update Link
    var addLinkForm = document.getElementById("addLinkForm");
    var linkTitle = document.getElementById("linkTitle");
    var linkUrl = document.getElementById("linkUrl");
    var editLinkId = document.getElementById("editLinkId");
    var btnAddLink = document.getElementById("btnAddLink");
    var btnCancelEdit = document.getElementById("btnCancelEdit");

    addLinkForm.addEventListener("submit", (e) => {
        e.preventDefault();

        var title = linkTitle.value;
        var url = linkUrl.value;

        if (editLinkId.value) {
            update(ref(db, "users/" + user.uid + "/links/" + editLinkId.value), {
                title: title,
                url: url
            }).then(() => {
                resetLinkForm();
                loadLinks();
            });
        } else {
            push(ref(db, "users/" + user.uid + "/links"), {
                title: title,
                url: url
            }).then(() => {
                resetLinkForm();
                loadLinks();
            });
        }
    });

    // Reset Link Form
    function resetLinkForm() {
        addLinkForm.reset();
        editLinkId.value = "";
        btnAddLink.textContent = "Add Link";
        btnCancelEdit.classList.add("hidden");
    }

    btnCancelEdit.addEventListener("click", resetLinkForm);

    //
    linkList.addEventListener("click", (e) => {
        var deleteBtn = e.target.closest(".delete-btn");
        var editBtn = e.target.closest(".edit-btn");

        if (deleteBtn) {
            var id = deleteBtn.getAttribute("data-id");

            if (confirm("Are you sure you want to delete this link?")) {
                remove(ref(db, "users/" + user.uid + "/links/" + id))
                    .then(() => {
                        loadLinks();
                    });
            }
        }

        if (editBtn) {
            var id = editBtn.getAttribute("data-id");

            get(ref(db, "users/" + user.uid + "/links/" + id))
                .then((snapshot) => {
                    var link = snapshot.val();
                    linkTitle.value = link.title;
                    linkUrl.value = link.url;
                    editLinkId.value = id;

                    btnAddLink.textContent = "Update Link";
                    btnCancelEdit.classList.remove("hidden");
                });
        }
    });

    // Logout
    document.getElementById("btnLogout").addEventListener("click", () => {
        signOut(auth).then(() => {
            alert("Logout Successful!")
            window.location.href = "login.html";
        });
    });
});

