// API base URL
const API_BASE = 'http://localhost:4000';

// Check user authentication on page load
document.addEventListener('DOMContentLoaded', function() {
    checkUserAuth();
});

// Check if user is logged in
function checkUserAuth() {
    const userData = localStorage.getItem('userData');
    
    if (userData) {
        const user = JSON.parse(userData);
        
        // If user is admin, redirect to admin panel
        if (user.type === 'admin') {
            window.location.href = '/admin/';
            return;
        }
        
        showUserInterface(user);
    } else {
        showGuestInterface();
    }
}

// Show interface for logged in users
function showUserInterface(user) {
    // Hide guest elements
    document.getElementById('guestNav').classList.add('hidden');
    document.getElementById('guestHero').classList.add('hidden');
    
    // Show user elements
    document.getElementById('userNav').classList.remove('hidden');
    document.getElementById('userHero').classList.remove('hidden');
    
    // Update user info
    document.getElementById('userName').textContent = user.name;
    document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
    
    // Setup support form
    setupSupportForm(user);
    
    // Load user problems
    loadUserProblems(user);
}

// Show interface for guests
function showGuestInterface() {
    // Show guest elements
    document.getElementById('guestNav').classList.remove('hidden');
    document.getElementById('guestHero').classList.remove('hidden');
    
    // Hide user elements
    document.getElementById('userNav').classList.add('hidden');
    document.getElementById('userHero').classList.add('hidden');
}

// Setup support form submission
function setupSupportForm(user) {
    const form = document.getElementById('supportForm');
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(form);
        const requestData = {
            title: formData.get('title'),
            description: formData.get('description'),
            category: formData.get('category'),
            userId: user.id
        };

        try {
            const response = await fetch(`${API_BASE}/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestData)
            });

            const result = await response.json();

            if (response.ok) {
                showAlert('success', result.message);
                form.reset();
                // Reload problems to show the new request
                setTimeout(() => {
                    loadUserProblems(user);
                }, 1000);
            } else {
                showAlert('error', result.message);
            }
        } catch (error) {
            showAlert('error', 'Xatolik yuz berdi. Iltimos qaytadan urinib ko\'ring.');
            console.error('Error:', error);
        }
    });
}

// Load user problems
async function loadUserProblems(user) {
    try {
        const response = await fetch(`${API_BASE}/problems`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId: user.id })
        });

        const result = await response.json();

        if (response.ok && result.problems.length > 0) {
            displayUserProblems(result.problems);
        } else {
            // Remove existing problems section if no problems
            const existingSection = document.querySelector('.user-problems');
            if (existingSection) {
                existingSection.remove();
            }
        }
    } catch (error) {
        console.error('So\'rovlarni yuklashda xatolik:', error);
    }
}

// Display user problems
function displayUserProblems(problems) {
    // Remove existing problems section
    const existingSection = document.querySelector('.user-problems');
    if (existingSection) {
        existingSection.remove();
    }

    const knowledgeBase = document.querySelector('.knowledge-base');
    
    // Create problems section
    const problemsSection = document.createElement('section');
    problemsSection.className = 'user-problems';
    
    problemsSection.innerHTML = `
        <div class="container">
            <h2 class="section-title">Mening so'rovlarim</h2>
            <p class="section-subtitle">Yuborgan so'rovlaringiz va ularning holati</p>
            <div class="problems-grid">
                ${problems.map(problem => `
                    <div class="problem-card">
                        <div class="problem-header">
                            <h3>${problem.title}</h3>
                            <span class="status-badge ${problem.status === 'open' ? 'status-open' : 'status-closed'}">
                                ${problem.status === 'open' ? 'Ochiq' : 'Yopiq'}
                            </span>
                        </div>
                        
                        <div class="problem-category">
                            ${getCategoryName(problem.category)}
                        </div>
                        
                        <p class="problem-description">${problem.description}</p>
                        
                        ${problem.reply ? `
                            <div class="problem-reply">
                                <h4>Admin javobi:</h4>
                                <p>${problem.reply}</p>
                            </div>
                        ` : ''}
                        
                        <div class="problem-date">
                            Yuborilgan: ${formatDate(problem.createdAt)}
                            ${problem.replyCreatedAt ? `<br>Javob berilgan: ${formatDate(problem.replyCreatedAt)}` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Insert before knowledge base
    knowledgeBase.parentNode.insertBefore(problemsSection, knowledgeBase);
}

// Helper function to get category name
function getCategoryName(category) {
    switch(category) {
        case 'texnik': return 'Texnik';
        case 'hisob': return 'Hisob';
        case 'boshqa': return 'Boshqa';
        default: return category;
    }
}

// Helper function to format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Show alert messages
function showAlert(type, message) {
    const alertElement = document.getElementById(type === 'success' ? 'successAlert' : 'errorAlert');
    alertElement.textContent = message;
    alertElement.style.display = 'block';
    
    // Hide alert after 5 seconds
    setTimeout(() => {
        alertElement.style.display = 'none';
    }, 5000);
}

// Logout function
function logout() {
    localStorage.removeItem('userData');
    location.reload();
}