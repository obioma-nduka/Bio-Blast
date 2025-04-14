// User CRUD
async function fetchUsers() {
    const response = await fetch("/api/users");
    const data = await response.json();
    return data;
}

async function fetchStudyGroups(userId) {
    const response = await fetch(`/api/study-groups/${userId}`);
    const data = await response.json();
    return data;
}

async function fetchHobbies(userId) {
    const response = await fetch(`/api/hobbies/${userId}`);
    const data = await response.json();
    return data;
}

async function displayUsers() {
    const userContainer = document.getElementById("user-container");
    userContainer.innerHTML = "";
    const users = await fetchUsers();
    for (const user of users) {
        const studyGroups = await fetchStudyGroups(user.id);
        const hobbies = await fetchHobbies(user.id);

        const card = document.createElement("div");
        card.className = "user-card";
        card.innerHTML = `
            <h2>${user.name}</h2>
            <p><strong>Bio:</strong> ${user.bio}</p>
            <p><strong>Quote:</strong> ${user.quote}</p>
            <div class="section study-groups">
                <h3>Study Groups</h3>
                <ul>
                    ${studyGroups.map(group => `
                        <li>
                            ${group.name}
                            <button class="delete" onclick="deleteStudyGroup(${group.id}, ${user.id})"><i class="fas fa-trash"></i> Delete</button>
                        </li>
                    `).join("")}
                </ul>
                <input type="text" id="study-input-${user.id}" placeholder="Add Study Group">
                <button class="add" onclick="addStudyGroup(${user.id})"><i class="fas fa-plus"></i> Add</button>
            </div>
            <div class="section hobbies">
                <h3>Hobbies</h3>
                <ul>
                    ${hobbies.map(hobby => `
                        <li>
                            ${hobby.name}
                            <button class="edit" onclick="editHobby(${hobby.id}, ${user.id})"><i class="fas fa-edit"></i> Edit</button>
                            <button class="delete" onclick="deleteHobby(${hobby.id}, ${user.id})"><i class="fas fa-trash"></i> Delete</button>
                        </li>
                    `).join("")}
                </ul>
                <input type="text" id="hobby-input-${user.id}" placeholder="Add Hobby">
                <button class="add" onclick="addHobby(${user.id})"><i class="fas fa-plus"></i> Add</button>
            </div>
            <div class="button-group">
                <button class="edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit User</button>
                <button class="delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Delete User</button>
            </div>
        `;
        userContainer.appendChild(card);
    }
}

async function addUser() {
    const nameInput = document.getElementById("user-name-input");
    const bioInput = document.getElementById("user-bio-input");
    const quoteInput = document.getElementById("user-quote-input");
    const name = nameInput.value.trim();
    const bio = bioInput.value.trim();
    const quote = quoteInput.value.trim();
    if (!name) {
        alert("Please enter a name!");
        return;
    }
    const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, quote }),
    });
    if (response.ok) {
        nameInput.value = "";
        bioInput.value = "";
        quoteInput.value = "";
        displayUsers();
    } else {
        alert("Failed to add user");
    }
}

async function editUser(id) {
    const users = await fetchUsers();
    const user = users.find(u => u.id === id);
    const newName = prompt("Edit name:", user.name);
    const newBio = prompt("Edit bio:", user.bio);
    const newQuote = prompt("Edit quote:", user.quote);
    if (newName && newName.trim()) {
        const response = await fetch(`/api/users/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newName.trim(), bio: newBio || "", quote: newQuote || "" }),
        });
        if (response.ok) {
            displayUsers();
        } else {
            alert("Failed to update user");
        }
    }
}

async function deleteUser(id) {
    if (confirm("Delete this user?")) {
        const response = await fetch(`/api/users/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            displayUsers();
        } else {
            alert("Failed to delete user");
        }
    }
}

async function addStudyGroup(userId) {
    const input = document.getElementById(`study-input-${userId}`);
    const newGroup = input.value.trim();
    if (!newGroup) {
        alert("Please enter a study group!");
        return;
    }
    const response = await fetch("/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name: newGroup }),
    });
    if (response.ok) {
        input.value = "";
        displayUsers();
    } else {
        alert("Failed to add study group");
    }
}

async function deleteStudyGroup(id, userId) {
    if (confirm("Delete this study group?")) {
        const response = await fetch(`/api/study-groups/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            displayUsers();
        } else {
            alert("Failed to delete study group");
        }
    }
}

async function addHobby(userId) {
    const input = document.getElementById(`hobby-input-${userId}`);
    const newHobby = input.value.trim();
    if (!newHobby) {
        alert("Please enter a hobby!");
        return;
    }
    const response = await fetch("/api/hobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name: newHobby }),
    });
    if (response.ok) {
        input.value = "";
        displayUsers();
    } else {
        alert("Failed to add hobby");
    }
}

async function editHobby(id, userId) {
    const newHobby = prompt("Edit hobby:");
    if (newHobby && newHobby.trim()) {
        const response = await fetch(`/api/hobbies/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newHobby.trim() }),
        });
        if (response.ok) {
            displayUsers();
        } else {
            alert("Failed to edit hobby");
        }
    }
}

async function deleteHobby(id, userId) {
    if (confirm("Delete this hobby?")) {
        const response = await fetch(`/api/hobbies/${id}`, {
            method: "DELETE",
        });
        if (response.ok) {
            displayUsers();
        } else {
            alert("Failed to delete hobby");
        }
    }
}

// Initialize
displayUsers();