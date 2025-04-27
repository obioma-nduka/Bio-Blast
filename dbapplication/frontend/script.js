// Function to display error messages
function showError(message) {
    const errorDiv = document.getElementById("error-message");
    const successDiv = document.getElementById("success-message");
    errorDiv.textContent = message;
    errorDiv.style.display = "block";
    successDiv.style.display = "none";
    setTimeout(() => {
        errorDiv.style.display = "none";
    }, 5000);
}

// Function to display success messages
function showSuccess(message) {
    const errorDiv = document.getElementById("error-message");
    const successDiv = document.getElementById("success-message");
    successDiv.textContent = message;
    successDiv.style.display = "block";
    errorDiv.style.display = "none";
    setTimeout(() => {
        successDiv.style.display = "none";
    }, 5000);
}

// Function to load users from the server
async function loadUsers() {
    const response = await fetch("http://localhost:3002/api/users");
    const users = await response.json();
    const usersList = document.getElementById("users-list");
    usersList.innerHTML = "";

    for (const user of users) {
        const userCard = document.createElement("div");
        userCard.classList.add("user-card");
        userCard.innerHTML = `
            <h2>${user.name}</h2>
            <p><strong>Bio:</strong> ${user.bio || "Not specified"}</p>
            <p><strong>Quote:</strong> ${user.quote || "Not specified"}</p>
            <div class="section">
                <h3>Study Groups</h3>
                <ul id="study-groups-${user.id}"></ul>
                <div class="form-group">
                    <input type="text" id="study-group-input-${user.id}" placeholder="Add study group">
                    <button class="add" onclick="addStudyGroup(${user.id})"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
            <div class="section">
                <h3>Hobbies</h3>
                <ul id="hobbies-${user.id}"></ul>
                <div class="form-group">
                    <input type="text" id="hobby-input-${user.id}" placeholder="Add hobby">
                    <button class="add" onclick="addHobby(${user.id})"><i class="fas fa-plus"></i> Add</button>
                </div>
            </div>
            <div class="button-group">
                <button class="edit" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit User</button>
                <button class="delete" onclick="deleteUser(${user.id})"><i class="fas fa-trash-alt"></i> Delete User</button>
            </div>
        `;
        usersList.appendChild(userCard);

        // Load study groups
        const studyGroupsResponse = await fetch(`http://localhost:3002/api/study-groups/${user.id}`);
        const studyGroups = await studyGroupsResponse.json();
        const studyGroupsList = document.getElementById(`study-groups-${user.id}`);
        studyGroups.forEach(group => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${group.name}
                <button class="delete" onclick="deleteStudyGroup(${group.id})"><i class="fas fa-trash-alt"></i> Delete</button>
            `;
            studyGroupsList.appendChild(li);
        });

        // Load hobbies
        const hobbiesResponse = await fetch(`http://localhost:3002/api/hobbies/${user.id}`);
        const hobbies = await hobbiesResponse.json();
        const hobbiesList = document.getElementById(`hobbies-${user.id}`);
        hobbies.forEach(hobby => {
            const li = document.createElement("li");
            li.innerHTML = `
                ${hobby.name}
                <div>
                    <button class="edit" onclick="editHobby(${hobby.id}, ${user.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete" onclick="deleteHobby(${hobby.id})"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            hobbiesList.appendChild(li);
        });
    }
}

// Function to add a new user
async function addUser() {
    const nameInput = document.getElementById("name-input");
    const bioInput = document.getElementById("bio-input");
    const quoteInput = document.getElementById("quote-input");
    const name = nameInput.value.trim();
    const bio = bioInput.value.trim();
    const quote = quoteInput.value.trim();

    if (!name) {
        showError("Name is required!");
        return;
    }

    const response = await fetch("http://localhost:3002/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, quote }),
    });

    if (response.ok) {
        showSuccess("User added successfully!");
        nameInput.value = "";
        bioInput.value = "";
        quoteInput.value = "";
        loadUsers();
    } else {
        showError("Failed to add user");
    }
}

// Function to edit a user
async function editUser(id) {
    const name = prompt("Enter new name:");
    const bio = prompt("Enter new bio:");
    const quote = prompt("Enter new quote:");
    if (!name) {
        showError("Name is required!");
        return;
    }

    const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, bio, quote }),
    });

    if (response.ok) {
        showSuccess("User updated successfully!");
        loadUsers();
    } else {
        showError("Failed to update user");
    }
}

// Function to delete a user
async function deleteUser(id) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    const response = await fetch(`http://localhost:3002/api/users/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        showSuccess("User deleted successfully!");
        loadUsers();
    } else {
        showError("Failed to delete user");
    }
}

// Function to add a study group
async function addStudyGroup(userId) {
    const input = document.getElementById(`study-group-input-${userId}`);
    const name = input.value.trim();
    if (!name) {
        showError("Study group name is required!");
        return;
    }

    const response = await fetch("http://localhost:3002/api/study-groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name }),
    });

    if (response.ok) {
        showSuccess("Study group added successfully!");
        input.value = "";
        loadUsers();
    } else {
        showError("Failed to add study group");
    }
}

// Function to delete a study group
async function deleteStudyGroup(id) {
    if (!confirm("Are you sure you want to delete this study group?")) return;

    const response = await fetch(`http://localhost:3002/api/study-groups/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        showSuccess("Study group deleted successfully!");
        loadUsers();
    } else {
        showError("Failed to delete study group");
    }
}

// Function to add a hobby
async function addHobby(userId) {
    const input = document.getElementById(`hobby-input-${userId}`);
    const name = input.value.trim();
    if (!name) {
        showError("Hobby name is required!");
        return;
    }

    const response = await fetch("http://localhost:3002/api/hobbies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, name }),
    });

    if (response.ok) {
        showSuccess("Hobby added successfully!");
        input.value = "";
        loadUsers();
    } else {
        showError("Failed to add hobby");
    }
}

// Function to edit a hobby
async function editHobby(id, userId) {
    const name = prompt("Enter new hobby name:");
    if (!name) {
        showError("Hobby name is required!");
        return;
    }

    const response = await fetch(`http://localhost:3002/api/hobbies/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
    });

    if (response.ok) {
        showSuccess("Hobby updated successfully!");
        loadUsers();
    } else {
        showError("Failed to update hobby");
    }
}

// Function to delete a hobby
async function deleteHobby(id) {
    if (!confirm("Are you sure you want to delete this hobby?")) return;

    const response = await fetch(`http://localhost:3002/api/hobbies/${id}`, {
        method: "DELETE",
    });

    if (response.ok) {
        showSuccess("Hobby deleted successfully!");
        loadUsers();
    } else {
        showError("Failed to delete hobby");
    }
}