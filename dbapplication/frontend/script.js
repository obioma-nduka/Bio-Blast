function updateNavbar(username) {
    const navbarLinks = document.getElementById('navbarLinks');
    if (username) {
        navbarLinks.innerHTML = `
            <a href="index.html">Dashboard</a>
            <a href="#" onclick="logout()">Logout <i class="fas fa-sign-out-alt"></i></a>
        `;
    } else {
        navbarLinks.innerHTML = `
            <a href="register.html">Register</a>
            <a href="login.html">Login</a>
        `;
    }
}

function logout() {
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    showNotification('Logged out successfully', 'success');
    setTimeout(() => {
        window.location.href = 'login.html';
    }, 1000);
}

function showNotification(message, type) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${type}`;
    notification.style.display = 'block';
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

function loadFreelancerDashboard() {
    const username = localStorage.getItem('username');
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <h2>Freelancer Dashboard</h2>
        <p>Welcome, ${username}!</p>
        <h3>Your Profile</h3>
        <form id="profileForm">
            <div class="form-group">
                <label for="name">Name:</label>
                <input type="text" id="name" name="name" required>
            </div>
            <div class="form-group">
                <label for="location">Location:</label>
                <input type="text" id="location" name="location" required>
            </div>
            <div class="form-group">
                <label for="description">Description:</label>
                <textarea id="description" name="description"></textarea>
            </div>
            <div class="form-group">
                <label for="rate">Rate per Hour ($):</label>
                <input type="number" id="rate" name="rate" step="0.01">
            </div>
            <button type="submit" class="btn"><i class="fas fa-save"></i> Save Profile</button>
        </form>
        <h3>Your Services</h3>
        <form id="serviceForm">
            <div class="form-group">
                <label for="serviceName">Service Name:</label>
                <input type="text" id="serviceName" name="serviceName" required>
            </div>
            <div class="form-group">
                <label for="serviceDescription">Description:</label>
                <textarea id="serviceDescription" name="serviceDescription"></textarea>
            </div>
            <button type="submit" class="btn"><i class="fas fa-plus"></i> Add Service</button>
        </form>
        <div id="servicesList"></div>
    `;

    // Fetch user ID and load profile
    fetch(`/api/user/${username}`)
        .then(response => response.json())
        .then(user => {
            const userId = user.id;
            localStorage.setItem('userId', userId);

            // Check if the freelancer has a profile
            fetch('/api/freelancers')
                .then(response => response.json())
                .then(freelancers => {
                    const profile = freelancers.find(f => f.user_id === userId);
                    if (profile) {
                        document.getElementById('name').value = profile.name;
                        document.getElementById('location').value = profile.location;
                        document.getElementById('description').value = profile.description || '';
                        document.getElementById('rate').value = profile.rate_per_hour || '';
                        loadServices(profile.id);
                    }
                })
                .catch(error => {
                    showNotification('Error loading profile', 'error');
                    console.error('Error:', error);
                });

            // Handle profile form submission
            document.getElementById('profileForm').addEventListener('submit', function(e) {
                e.preventDefault();
                const name = document.getElementById('name').value;
                const location = document.getElementById('location').value;
                const description = document.getElementById('description').value;
                const rate = document.getElementById('rate').value;

                fetch('/api/freelancers')
                    .then(response => response.json())
                    .then(freelancers => {
                        const profile = freelancers.find(f => f.user_id === userId);
                        const method = profile ? 'PUT' : 'POST';
                        const url = profile ? `/api/freelancer_profiles/${profile.id}` : '/api/freelancer_profiles';

                        fetch(url, {
                            method: method,
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                user_id: userId,
                                name: name,
                                location: location,
                                description: description || null,
                                rate_per_hour: rate || null
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                showNotification(data.error, 'error');
                            } else {
                                showNotification(profile ? 'Profile updated successfully!' : 'Profile added successfully!', 'success');
                                if (!profile) {
                                    loadServices(data.id);
                                }
                            }
                        })
                        .catch(error => {
                            showNotification('Error saving profile', 'error');
                            console.error('Error:', error);
                        });
                    });
            });

            // Handle service form submission
            document.getElementById('serviceForm').addEventListener('submit', function(e) {
                e.preventDefault();
                fetch('/api/freelancers')
                    .then(response => response.json())
                    .then(freelancers => {
                        const profile = freelancers.find(f => f.user_id === userId);
                        if (!profile) {
                            showNotification('Please create a profile first', 'error');
                            return;
                        }

                        const serviceName = document.getElementById('serviceName').value;
                        const serviceDescription = document.getElementById('serviceDescription').value;

                        fetch('/api/services', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({
                                freelancer_id: profile.id,
                                service_name: serviceName,
                                description: serviceDescription || null
                            })
                        })
                        .then(response => response.json())
                        .then(data => {
                            if (data.error) {
                                showNotification(data.error, 'error');
                            } else {
                                showNotification('Service added successfully!', 'success');
                                document.getElementById('serviceForm').reset();
                                loadServices(profile.id);
                            }
                        })
                        .catch(error => {
                            showNotification('Error adding service', 'error');
                            console.error('Error:', error);
                        });
                    });
            });
        })
        .catch(error => {
            showNotification('Error loading user data', 'error');
            console.error('Error:', error);
        });
}

function loadServices(freelancerId) {
    fetch(`/api/services/${freelancerId}`)
        .then(response => response.json())
        .then(services => {
            const servicesList = document.getElementById('servicesList');
            if (services.length === 0) {
                servicesList.innerHTML = '<p>No services added yet.</p>';
                return;
            }
            servicesList.innerHTML = '<h4>Services Offered:</h4>';
            const ul = document.createElement('ul');
            services.forEach(service => {
                const li = document.createElement('li');
                li.innerHTML = `
                    ${service.service_name} - ${service.description || 'No description'}
                    <button onclick="deleteService(${service.id}, ${freelancerId})" class="btn btn-danger"><i class="fas fa-trash"></i> Delete</button>
                `;
                ul.appendChild(li);
            });
            servicesList.appendChild(ul);
        })
        .catch(error => {
            showNotification('Error loading services', 'error');
            console.error('Error:', error);
        });
}

function deleteService(serviceId, freelancerId) {
    if (confirm('Are you sure you want to delete this service?')) {
        fetch(`/api/services/${serviceId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showNotification(data.error, 'error');
            } else {
                showNotification('Service deleted successfully!', 'success');
                loadServices(freelancerId);
            }
        })
        .catch(error => {
            showNotification('Error deleting service', 'error');
            console.error('Error:', error);
        });
    }
}

function loadCustomerDashboard() {
    const username = localStorage.getItem('username');
    const dashboard = document.getElementById('dashboard');
    dashboard.innerHTML = `
        <h2>Customer Dashboard</h2>
        <p>Welcome, ${username}!</p>
        <h3>Find Freelancers</h3>
        <div id="freelancersList"></div>
    `;

    fetch('/api/freelancers')
        .then(response => response.json())
        .then(freelancers => {
            const freelancersList = document.getElementById('freelancersList');
            if (freelancers.length === 0) {
                freelancersList.innerHTML = '<p>No freelancers available.</p>';
                return;
            }
            freelancers.forEach(freelancer => {
                const div = document.createElement('div');
                div.className = 'freelancer-card';
                div.innerHTML = `
                    <h4>${freelancer.name} (${freelancer.username})</h4>
                    <p><strong>Location:</strong> ${freelancer.location}</p>
                    <p><strong>Description:</strong> ${freelancer.description || 'No description'}</p>
                    <p><strong>Rate:</strong> $${freelancer.rate_per_hour || 'N/A'} per hour</p>
                    <div id="services-${freelancer.id}"></div>
                    <button onclick="loadFreelancerServices(${freelancer.id}, 'services-${freelancer.id}')" class="btn">View Services</button>
                    <button onclick="contactFreelancer('${freelancer.username}')" class="btn"><i class="fas fa-envelope"></i> Contact</button>
                `;
                freelancersList.appendChild(div);
            });
        })
        .catch(error => {
            showNotification('Error loading freelancers', 'error');
            console.error('Error:', error);
        });
}

function loadFreelancerServices(freelancerId, elementId) {
    fetch(`/api/services/${freelancerId}`)
        .then(response => response.json())
        .then(services => {
            const servicesDiv = document.getElementById(elementId);
            if (services.length === 0) {
                servicesDiv.innerHTML = '<p>No services available.</p>';
                return;
            }
            servicesDiv.innerHTML = '<h5>Services:</h5>';
            const ul = document.createElement('ul');
            services.forEach(service => {
                const li = document.createElement('li');
                li.textContent = `${service.service_name} - ${service.description || 'No description'}`;
                ul.appendChild(li);
            });
            servicesDiv.appendChild(ul);
        })
        .catch(error => {
            showNotification('Error loading services', 'error');
            console.error('Error:', error);
        });
}

function contactFreelancer(username) {
    showNotification(`Contacting ${username}! (This is a placeholder - implement messaging in the future.)`, 'success');
}