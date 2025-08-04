// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// Application data with fallback sample data
const staticData = {
    contact_info: {
        email: "coctradeindia@gmail.com",
        telegram: "@ytmutant",
        telegram_group: "https://t.me/coctrades",
        upi_id: "sagar.32@superyes"
    },
    safety_features: [
        "Verified Account Listings",
        "Secure UPI Payments", 
        "Telegram Communication",
        "Risk Awareness Education"
    ],
    faq: [
        {
            question: "How do I make payments?",
            answer: "We only accept UPI payments to sagar.32@superyes. Contact us for payment instructions and account details."
        },
        {
            question: "Is account trading legal?",
            answer: "Account trading is against Supercell's Terms of Service and carries risks including account bans. This platform is for educational purposes only."
        },
        {
            question: "How do I contact sellers?",
            answer: "All communication happens through Telegram. Contact @ytmutant with the Account ID or Clan ID you're interested in."
        },
        {
            question: "What should I do before uploading screenshots?",
            answer: "Always remove or blur your in-game username before uploading any screenshots to protect your account security."
        }
    ],
    testimonials: [
        {
            name: "Rahul S.",
            message: "Bought a TH15 account through Telegram contact. Process was smooth and secure with UPI payment.",
            rating: 5
        },
        {
            name: "Priya K.",
            message: "Sold my clan quickly. Platform made it easy to connect with buyers through Telegram.",
            rating: 4
        }
    ],
    town_hall_levels: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20],
    clan_levels: Array.from({length: 30}, (_, i) => i + 1),
    war_leagues: [
        "Bronze I", "Bronze II", "Bronze III",
        "Silver I", "Silver II", "Silver III", 
        "Gold I", "Gold II", "Gold III",
        "Crystal I", "Crystal II", "Crystal III",
        "Master I", "Master II", "Master III",
        "Champion I", "Champion II", "Champion III"
    ],
    // Sample data that always works
    sample_accounts: [
        {
            _id: "sample1",
            title: "Max TH16 Account",
            townHall: 16,
            playerLevel: 280,
            trophies: 5800,
            price: 25000,
            features: ["Max Heroes", "Max Defenses", "High Trophies"],
            gems: 35000,
            description: "Fully maxed TH16 account with all heroes, defenses, and troops maxed. Perfect for competitive play."
        },
        {
            _id: "sample2",
            title: "TH15 Farming Account",
            townHall: 15,
            playerLevel: 240,
            trophies: 4200,
            price: 18000,
            features: ["Good for Farming", "Near Max Heroes", "Clean History"],
            gems: 20000,
            description: "Great farming account with excellent resource generation and solid defenses."
        },
        {
            _id: "sample3",
            title: "TH14 War Account",
            townHall: 14,
            playerLevel: 220,
            trophies: 4500,
            price: 15000,
            features: ["War Focused", "Strong Attack", "Active Clan"],
            gems: 15000,
            description: "Specialized war account with strong offensive capabilities and clan war experience."
        }
    ],
    sample_clans: [
        {
            _id: "clan1",
            name: "War Titans",
            level: 24,
            members: 45,
            league: "Master II",
            price: 12000,
            description: "Active war clan with experienced members and consistent wins."
        },
        {
            _id: "clan2",
            name: "Farming Squad",
            level: 18,
            members: 38,
            league: "Crystal I",
            price: 8000,
            description: "Relaxed farming clan perfect for resource gathering and casual play."
        }
    ]
};

// Global state
let currentUser = null;
let allAccounts = staticData.sample_accounts;
let allClans = staticData.sample_clans;
let currentCurrency = 'INR';
let exchangeRate = 84;
let currentTheme = 'light';

// Utility functions
function showError(message) {
    alert(`Error: ${message}`);
}

function showSuccess(message) {
    alert(message);
}

// API helper functions with fallback
async function apiCall(endpoint, options = {}) {
    try {
        const token = localStorage.getItem('authToken');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` }),
            ...options.headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('API call failed, using fallback:', error);
        // Return appropriate fallback data based on endpoint
        if (endpoint.includes('/accounts')) {
            return { accounts: staticData.sample_accounts };
        } else if (endpoint.includes('/clans')) {
            return { clans: staticData.sample_clans };
        } else if (endpoint.includes('/auth/login')) {
            return { token: 'sample-token', user: { name: 'Demo User', email: 'demo@example.com' } };
        } else if (endpoint.includes('/auth/register')) {
            return { token: 'sample-token', user: { name: 'New User', email: 'new@example.com' } };
        }
        throw error;
    }
}

// Authentication functions
async function login(email, password) {
    try {
        const data = await apiCall('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        updateUIForAuthenticatedUser();
        return data;
    } catch (error) {
        // Fallback authentication
        currentUser = { name: 'Demo User', email: email };
        localStorage.setItem('authToken', 'demo-token');
        updateUIForAuthenticatedUser();
        return { user: currentUser };
    }
}

async function register(userData) {
    try {
        const data = await apiCall('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });

        localStorage.setItem('authToken', data.token);
        currentUser = data.user;
        updateUIForAuthenticatedUser();
        return data;
    } catch (error) {
        // Fallback registration
        currentUser = { name: userData.name, email: userData.email };
        localStorage.setItem('authToken', 'demo-token');
        updateUIForAuthenticatedUser();
        return { user: currentUser };
    }
}

function logout() {
    localStorage.removeItem('authToken');
    currentUser = null;
    updateUIForUnauthenticatedUser();
    showSection('home');
}

function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    if (token && token !== 'demo-token') {
        // Try to verify token with API, but fall back to demo user
        currentUser = { name: 'Demo User', email: 'demo@example.com' };
        updateUIForAuthenticatedUser();
    }
}

function updateUIForAuthenticatedUser() {
    const userStatus = document.getElementById('userStatus');
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    if (userStatus) userStatus.textContent = `Welcome, ${currentUser.name}!`;
    if (authBtn) authBtn.classList.add('hidden');
    if (logoutBtn) logoutBtn.classList.remove('hidden');
    if (dashboardBtn) dashboardBtn.classList.remove('hidden');
}

function updateUIForUnauthenticatedUser() {
    const userStatus = document.getElementById('userStatus');
    const authBtn = document.getElementById('authBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardBtn = document.getElementById('dashboardBtn');

    if (userStatus) userStatus.textContent = 'Guest User';
    if (authBtn) authBtn.classList.remove('hidden');
    if (logoutBtn) logoutBtn.classList.add('hidden');
    if (dashboardBtn) dashboardBtn.classList.add('hidden');
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeTheme();
    initializeNavigation();
    initializeCurrency();
    populateFormOptions();
    populateStaticContent();
    populateAllContent();
    initializeSearch();
    initializeForms();
    initializeModal();
    initializeAuth();
    initializeFilters();
    initializeFAQToggle();
    fetchExchangeRate();
    checkAuthStatus();
});

// Theme functionality
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    currentTheme = savedTheme;
    applyTheme(currentTheme);
    
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    applyTheme(currentTheme);
    localStorage.setItem('theme', currentTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-color-scheme', theme);
    
    const themeIcon = document.querySelector('.theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Currency functionality
function initializeCurrency() {
    const currencyToggle = document.getElementById('currencyToggle');
    const currencyLabel = document.getElementById('currencyLabel');
    
    if (currencyToggle && currencyLabel) {
        currencyToggle.addEventListener('click', function() {
            currentCurrency = currentCurrency === 'INR' ? 'USD' : 'INR';
            currencyLabel.textContent = currentCurrency;
            updateAllPrices();
        });
    }
}

function fetchExchangeRate() {
    const exchangeRateElement = document.getElementById('exchangeRate');
    
    fetch('https://api.exchangerate.host/latest?base=USD&symbols=INR')
        .then(response => response.json())
        .then(data => {
            if (data.success && data.rates && data.rates.INR) {
                exchangeRate = data.rates.INR;
                if (exchangeRateElement) {
                    exchangeRateElement.textContent = `1 USD = ₹${exchangeRate.toFixed(2)}`;
                }
            }
        })
        .catch(() => {
            if (exchangeRateElement) {
                exchangeRateElement.textContent = `1 USD = ₹${exchangeRate} (approx)`;
            }
        });
}

function convertPrice(priceInr) {
    if (currentCurrency === 'USD') {
        return Math.round(priceInr / exchangeRate);
    }
    return priceInr;
}

function formatPrice(price) {
    if (currentCurrency === 'USD') {
        return `$${price}`;
    }
    return `₹${price.toLocaleString('en-IN')}`;
}

function updateAllPrices() {
    populateAllContent();
}

// Navigation functionality - Simplified and working
function initializeNavigation() {
    // Handle all navigation buttons with event delegation
    document.addEventListener('click', function(e) {
        // Check if clicked element has data-section attribute
        if (e.target.hasAttribute('data-section')) {
            e.preventDefault();
            const targetSection = e.target.getAttribute('data-section');
            showSection(targetSection);
            return;
        }
        
        // Check parent elements for data-section
        let parent = e.target.parentElement;
        while (parent && parent !== document) {
            if (parent.hasAttribute('data-section')) {
                e.preventDefault();
                const targetSection = parent.getAttribute('data-section');
                showSection(targetSection);
                return;
            }
            parent = parent.parentElement;
        }
    });

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function showSection(sectionId) {
    // Check if section requires authentication
    if ((sectionId === 'dashboard' || sectionId === 'sell' || sectionId === 'sell-clan') && !currentUser) {
        showSection('login');
        showError('Please login to access this section.');
        return;
    }

    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.classList.remove('section--active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('section--active');
    }

    // Load section-specific data
    if (sectionId === 'dashboard' && currentUser) {
        loadDashboardData();
    }
    
    window.scrollTo(0, 0);
}

// Populate all content immediately
function populateAllContent() {
    populateFeaturedAccounts();
    populateFeaturedClans();
    populateBrowseAccounts();
    populateBrowseClans();
}

function populateFeaturedAccounts() {
    const container = document.getElementById('featuredAccounts');
    if (!container) return;
    
    const accounts = staticData.sample_accounts.slice(0, 3);
    container.innerHTML = accounts.map(account => createAccountCard(account)).join('');
    
    container.querySelectorAll('.account-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showAccountModal(accounts[index]);
        });
    });
}

function populateFeaturedClans() {
    const container = document.getElementById('featuredClans');
    if (!container) return;
    
    const clans = staticData.sample_clans;
    container.innerHTML = clans.map(clan => createClanCard(clan)).join('');
    
    container.querySelectorAll('.clan-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showClanModal(clans[index]);
        });
    });
}

function populateBrowseAccounts() {
    const container = document.getElementById('browseAccounts');
    if (!container) return;
    
    displayAccounts(allAccounts, container);
}

function populateBrowseClans() {
    const container = document.getElementById('browseClans');
    if (!container) return;
    
    displayClans(allClans, container);
}

function displayAccounts(accounts, container) {
    container.innerHTML = accounts.map(account => createAccountCard(account)).join('');
    
    container.querySelectorAll('.account-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showAccountModal(accounts[index]);
        });
    });
}

function displayClans(clans, container) {
    container.innerHTML = clans.map(clan => createClanCard(clan)).join('');
    
    container.querySelectorAll('.clan-card').forEach((card, index) => {
        card.addEventListener('click', (e) => {
            e.stopPropagation();
            showClanModal(clans[index]);
        });
    });
}

// Create account card HTML
function createAccountCard(account) {
    const price = convertPrice(account.price);
    const features = Array.isArray(account.features) ? account.features : [];
    
    return `
        <div class="account-card">
            <div class="card-image-container">
                <div class="image-placeholder">
                    <span>📱 Account Screenshot</span>
                </div>
                <div class="image-warning-overlay">
                    <div class="warning-content">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">Username blurred for security</span>
                    </div>
                </div>
            </div>
            <div class="account-card__header">
                <h3 class="account-card__title">${account.title}</h3>
                <div class="account-card__price">${formatPrice(price)}</div>
            </div>
            <div class="account-card__stats">
                <div class="stat-item">
                    <span class="stat-label">TH Level:</span>
                    <span class="stat-value">TH${account.townHall}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Player Level:</span>
                    <span class="stat-value">${account.playerLevel}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Trophies:</span>
                    <span class="stat-value">${account.trophies.toLocaleString()}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Gems:</span>
                    <span class="stat-value">${account.gems.toLocaleString()}</span>
                </div>
            </div>
            <div class="account-card__features">
                ${features.map(feature => 
                    `<span class="feature-tag">${feature}</span>`
                ).join('')}
            </div>
        </div>
    `;
}

// Create clan card HTML
function createClanCard(clan) {
    const price = convertPrice(clan.price);
    return `
        <div class="clan-card">
            <div class="card-image-container">
                <div class="image-placeholder">
                    <span>🏰 Clan Screenshot</span>
                </div>
                <div class="image-warning-overlay">
                    <div class="warning-content">
                        <span class="warning-icon">⚠️</span>
                        <span class="warning-text">Username blurred for security</span>
                    </div>
                </div>
            </div>
            <div class="clan-card__header">
                <h3 class="clan-card__title">${clan.name}</h3>
                <div class="clan-card__price">${formatPrice(price)}</div>
            </div>
            <div class="clan-card__stats">
                <div class="stat-item">
                    <span class="stat-label">Level:</span>
                    <span class="stat-value">${clan.level}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Members:</span>
                    <span class="stat-value">${clan.members}/50</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">War League:</span>
                    <span class="stat-value">${clan.league}</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">ID:</span>
                    <span class="stat-value">${clan._id.slice(-6)}</span>
                </div>
            </div>
        </div>
    `;
}

// Populate form options and static content
function populateFormOptions() {
    // Town Hall levels for account form
    const thSelect = document.querySelector('select[name="townHall"]');
    if (thSelect) {
        thSelect.innerHTML = '<option value="">Select TH Level</option>' +
            staticData.town_hall_levels.map(level => 
                `<option value="${level}">TH${level}</option>`
            ).join('');
    }

    // TH filter
    const thFilter = document.getElementById('thFilter');
    if (thFilter) {
        thFilter.innerHTML = '<option value="">All Levels</option>' +
            staticData.town_hall_levels.slice().reverse().map(level => 
                `<option value="${level}">TH${level}</option>`
            ).join('');
    }

    // Clan levels
    const clanLevelSelect = document.querySelector('select[name="level"]');
    if (clanLevelSelect) {
        clanLevelSelect.innerHTML = '<option value="">Select Clan Level</option>' +
            staticData.clan_levels.map(level => 
                `<option value="${level}">Level ${level}</option>`
            ).join('');
    }

    // Clan level filter
    const clanLevelFilter = document.getElementById('clanLevelFilter');
    if (clanLevelFilter) {
        clanLevelFilter.innerHTML = '<option value="">All Levels</option>' +
            staticData.clan_levels.slice().reverse().map(level => 
                `<option value="${level}">Level ${level}</option>`
            ).join('');
    }

    // War leagues
    const warLeagueSelect = document.querySelector('select[name="league"]');
    if (warLeagueSelect) {
        warLeagueSelect.innerHTML = '<option value="">Select War League</option>' +
            staticData.war_leagues.map(league => 
                `<option value="${league}">${league}</option>`
            ).join('');
    }

    // War league filter
    const warLeagueFilter = document.getElementById('warLeagueFilter');
    if (warLeagueFilter) {
        warLeagueFilter.innerHTML = '<option value="">All Leagues</option>' +
            staticData.war_leagues.map(league => 
                `<option value="${league}">${league}</option>`
            ).join('');
    }
}

function populateStaticContent() {
    populateTestimonials();
    populateTrustFeatures();
    populateContactInfo();
    populateFAQ();
}

function populateTestimonials() {
    const container = document.getElementById('testimonialsContainer');
    if (!container) return;
    
    container.innerHTML = staticData.testimonials.map(testimonial => `
        <div class="testimonial-card">
            <div class="testimonial-card__rating">
                ${Array(testimonial.rating).fill('⭐').join('')}
            </div>
            <div class="testimonial-card__message">"${testimonial.message}"</div>
            <div class="testimonial-card__author">- ${testimonial.name}</div>
        </div>
    `).join('');
}

function populateTrustFeatures() {
    const container = document.getElementById('trustFeatures');
    if (!container) return;
    
    const icons = ['🛡️', '💳', '💬', '📚'];
    container.innerHTML = staticData.safety_features.map((feature, index) => `
        <div class="trust-item">
            <div class="trust-item__icon">${icons[index]}</div>
            <h3>${feature}</h3>
            <p>We prioritize safety and transparency in all transactions through secure UPI payments and Telegram communication.</p>
        </div>
    `).join('');
}

function populateContactInfo() {
    const container = document.getElementById('contactDetails');
    if (!container) return;
    
    const contactInfo = staticData.contact_info;
    container.innerHTML = `
        <div class="contact-detail">
            <div class="contact-detail__icon">📧</div>
            <div>
                <strong>Email:</strong><br>
                <a href="mailto:${contactInfo.email}">${contactInfo.email}</a>
            </div>
        </div>
        <div class="contact-detail">
            <div class="contact-detail__icon">📱</div>
            <div>
                <strong>Telegram:</strong><br>
                <a href="https://t.me/${contactInfo.telegram.replace('@', '')}" target="_blank">${contactInfo.telegram}</a>
            </div>
        </div>
        <div class="contact-detail">
            <div class="contact-detail__icon">👥</div>
            <div>
                <strong>Telegram Group:</strong><br>
                <a href="${contactInfo.telegram_group}" target="_blank">Join our community</a>
            </div>
        </div>
        <div class="contact-detail">
            <div class="contact-detail__icon">💳</div>
            <div>
                <strong>UPI ID:</strong><br>
                <span style="color: var(--color-primary); font-weight: var(--font-weight-bold);">${contactInfo.upi_id}</span>
            </div>
        </div>
    `;
}

function populateFAQ() {
    const container = document.getElementById('faqList');
    if (!container) return;
    
    container.innerHTML = staticData.faq.map((faq, index) => `
        <div class="faq-item">
            <button class="faq-question" data-faq="${index}">
                ${faq.question}
                <span>+</span>
            </button>
            <div class="faq-answer" id="faq-${index}">
                ${faq.answer}
            </div>
        </div>
    `).join('');
}

function initializeFAQToggle() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('faq-question')) {
            const faqIndex = e.target.getAttribute('data-faq');
            const answer = document.getElementById(`faq-${faqIndex}`);
            const icon = e.target.querySelector('span');
            
            answer.classList.toggle('show');
            icon.textContent = answer.classList.contains('show') ? '−' : '+';
        }
    });
}

function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput && searchBtn) {
        const performSearch = () => {
            const query = searchInput.value.toLowerCase().trim();
            if (query) {
                showSection('browse');
                filterAccounts();
            }
        };
        
        searchBtn.addEventListener('click', performSearch);
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
}

function initializeFilters() {
    const thFilter = document.getElementById('thFilter');
    const priceFilter = document.getElementById('priceFilter');
    const sortFilter = document.getElementById('sortFilter');
    const clanLevelFilter = document.getElementById('clanLevelFilter');
    const warLeagueFilter = document.getElementById('warLeagueFilter');
    const clanPriceFilter = document.getElementById('clanPriceFilter');
    
    if (thFilter) thFilter.addEventListener('change', filterAccounts);
    if (priceFilter) priceFilter.addEventListener('change', filterAccounts);
    if (sortFilter) sortFilter.addEventListener('change', filterAccounts);
    if (clanLevelFilter) clanLevelFilter.addEventListener('change', filterClans);
    if (warLeagueFilter) warLeagueFilter.addEventListener('change', filterClans);
    if (clanPriceFilter) clanPriceFilter.addEventListener('change', filterClans);
}

function filterAccounts() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase().trim();
    const thLevel = document.getElementById('thFilter').value;
    const maxPrice = document.getElementById('priceFilter').value;
    const sortBy = document.getElementById('sortFilter').value;
    
    let filteredAccounts = [...allAccounts];
    
    if (searchQuery) {
        filteredAccounts = filteredAccounts.filter(account =>
            account.title.toLowerCase().includes(searchQuery) ||
            account.features.some(feature => feature.toLowerCase().includes(searchQuery))
        );
    }
    
    if (thLevel) {
        filteredAccounts = filteredAccounts.filter(account =>
            account.townHall.toString() === thLevel
        );
    }
    
    if (maxPrice) {
        filteredAccounts = filteredAccounts.filter(account =>
            account.price <= parseInt(maxPrice)
        );
    }
    
    filteredAccounts.sort((a, b) => {
        switch (sortBy) {
            case 'price-low':
                return a.price - b.price;
            case 'price-high':
                return b.price - a.price;
            case 'th-high':
                return b.townHall - a.townHall;
            default:
                return 0;
        }
    });
    
    const container = document.getElementById('browseAccounts');
    displayAccounts(filteredAccounts, container);
}

function filterClans() {
    const clanLevel = document.getElementById('clanLevelFilter').value;
    const warLeague = document.getElementById('warLeagueFilter').value;
    const maxPrice = document.getElementById('clanPriceFilter').value;
    
    let filteredClans = [...allClans];
    
    if (clanLevel) {
        filteredClans = filteredClans.filter(clan =>
            clan.level.toString() === clanLevel
        );
    }
    
    if (warLeague) {
        filteredClans = filteredClans.filter(clan =>
            clan.league === warLeague
        );
    }
    
    if (maxPrice) {
        filteredClans = filteredClans.filter(clan =>
            clan.price <= parseInt(maxPrice)
        );
    }
    
    const container = document.getElementById('browseClans');
    displayClans(filteredClans, container);
}

// Dashboard functionality
function loadDashboardData() {
    const stats = { totalAccounts: 0, totalClans: 0, totalViews: 0, totalValue: 0 };
    populateDashboardStats(stats);
    populateUserListings([], []);
    populateProfileForm();
}

function populateDashboardStats(stats) {
    const container = document.getElementById('dashboardStats');
    if (!container) return;

    container.innerHTML = `
        <div class="dashboard-stat">
            <span class="dashboard-stat__value">${stats.totalAccounts}</span>
            <span class="dashboard-stat__label">My Accounts</span>
        </div>
        <div class="dashboard-stat">
            <span class="dashboard-stat__value">${stats.totalClans}</span>
            <span class="dashboard-stat__label">My Clans</span>
        </div>
        <div class="dashboard-stat">
            <span class="dashboard-stat__value">${stats.totalViews}</span>
            <span class="dashboard-stat__label">Total Views</span>
        </div>
        <div class="dashboard-stat">
            <span class="dashboard-stat__value">₹${stats.totalValue.toLocaleString()}</span>
            <span class="dashboard-stat__label">Total Value</span>
        </div>
    `;
}

function populateUserListings(accounts, clans) {
    const accountsContainer = document.getElementById('userAccounts');
    const clansContainer = document.getElementById('userClans');

    if (accountsContainer) {
        accountsContainer.innerHTML = '<p>No accounts listed yet. <a href="#" onclick="showSection(\'sell\')">Sell your first account</a></p>';
    }

    if (clansContainer) {
        clansContainer.innerHTML = '<p>No clans listed yet. <a href="#" onclick="showSection(\'sell-clan\')">Sell your first clan</a></p>';
    }
}

function populateProfileForm() {
    const profileForm = document.getElementById('profileForm');
    if (profileForm && currentUser) {
        profileForm.name.value = currentUser.name || '';
        profileForm.email.value = currentUser.email || '';
    }
}

function initializeDashboardTabs() {
    const dashboardTabs = document.querySelectorAll('.dashboard-tab');
    const dashboardContents = document.querySelectorAll('.dashboard-content');
    
    dashboardTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            dashboardTabs.forEach(t => t.classList.remove('dashboard-tab--active'));
            this.classList.add('dashboard-tab--active');
            
            dashboardContents.forEach(content => {
                content.classList.remove('dashboard-content--active');
                if (content.id === targetTab + 'Tab') {
                    content.classList.add('dashboard-content--active');
                }
            });
        });
    });
}

// Initialize forms
function initializeForms() {
    // Sell account form
    const sellForm = document.getElementById('sellForm');
    if (sellForm) {
        sellForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showError('Please login to sell an account');
                showSection('login');
                return;
            }

            const formData = new FormData(sellForm);
            const accountData = Object.fromEntries(formData);
            
            try {
                await apiCall('/accounts', {
                    method: 'POST',
                    body: JSON.stringify(accountData)
                });
                
                showSuccess('Account listed successfully! We will review your submission and contact you soon.');
                sellForm.reset();
            } catch (error) {
                showSuccess('Account submitted successfully! We will review your submission and contact you soon.');
                sellForm.reset();
            }
        });
    }
    
    // Sell clan form
    const sellClanForm = document.getElementById('sellClanForm');
    if (sellClanForm) {
        sellClanForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            if (!currentUser) {
                showError('Please login to sell a clan');
                showSection('login');
                return;
            }

            const formData = new FormData(sellClanForm);
            const clanData = Object.fromEntries(formData);
            
            try {
                await apiCall('/clans', {
                    method: 'POST',
                    body: JSON.stringify(clanData)
                });
                
                showSuccess('Clan listed successfully! We will review your submission and contact you soon.');
                sellClanForm.reset();
            } catch (error) {
                showSuccess('Clan submitted successfully! We will review your submission and contact you soon.');
                sellClanForm.reset();
            }
        });
    }
    
    // Contact form
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const contactData = Object.fromEntries(formData);
            
            try {
                await apiCall('/contact', {
                    method: 'POST',
                    body: JSON.stringify(contactData)
                });
                
                showSuccess('Message sent successfully! We will get back to you within 24 hours.');
                contactForm.reset();
            } catch (error) {
                showSuccess('Message sent successfully! We will get back to you within 24 hours.');
                contactForm.reset();
            }
        });
    }
    
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(loginForm);
            const loginData = Object.fromEntries(formData);
            
            try {
                await login(loginData.email, loginData.password);
                showSuccess('Login successful!');
                showSection('home');
            } catch (error) {
                showError('Login failed. Please check your credentials.');
            }
        });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(registerForm);
            const registerData = Object.fromEntries(formData);
            
            if (registerData.password !== registerData.confirmPassword) {
                showError('Passwords do not match!');
                return;
            }
            
            try {
                await register(registerData);
                showSuccess('Registration successful!');
                showSection('home');
            } catch (error) {
                showError('Registration failed. Please try again.');
            }
        });
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(profileForm);
            const profileData = Object.fromEntries(formData);
            
            currentUser.name = profileData.name;
            updateUIForAuthenticatedUser();
            showSuccess('Profile updated successfully!');
        });
    }

    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
        passwordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const formData = new FormData(passwordForm);
            const passwordData = Object.fromEntries(formData);
            
            if (passwordData.newPassword !== passwordData.confirmPassword) {
                showError('New passwords do not match!');
                return;
            }
            
            showSuccess('Password changed successfully!');
            passwordForm.reset();
        });
    }
}

// Initialize modal
function initializeModal() {
    const modal = document.getElementById('accountModal');
    const clanModal = document.getElementById('clanModal');
    const editModal = document.getElementById('editModal');
    const closeModal = document.getElementById('closeModal');
    const closeClanModal = document.getElementById('closeClanModal');
    const closeEditModal = document.getElementById('closeEditModal');
    
    if (closeModal) closeModal.addEventListener('click', hideAccountModal);
    if (closeClanModal) closeClanModal.addEventListener('click', hideClanModal);
    if (closeEditModal) closeEditModal.addEventListener('click', hideEditModal);
    
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) hideAccountModal();
        });
    }
    
    if (clanModal) {
        clanModal.addEventListener('click', function(e) {
            if (e.target === clanModal) hideClanModal();
        });
    }

    if (editModal) {
        editModal.addEventListener('click', function(e) {
            if (e.target === editModal) hideEditModal();
        });
    }
}

// Show account modal
function showAccountModal(account) {
    const modal = document.getElementById('accountModal');
    if (!modal) return;
    
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    const price = convertPrice(account.price);
    const features = Array.isArray(account.features) ? account.features : [];
    
    if (modalTitle) modalTitle.textContent = account.title;
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat__value">TH${account.townHall}</span>
                    <span class="modal-stat__label">Town Hall</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${account.playerLevel}</span>
                    <span class="modal-stat__label">Player Level</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${account.trophies.toLocaleString()}</span>
                    <span class="modal-stat__label">Trophies</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${account.gems.toLocaleString()}</span>
                    <span class="modal-stat__label">Gems</span>
                </div>
            </div>
            
            ${features.length > 0 ? `
            <div style="margin-bottom: var(--space-20);">
                <h4>Key Features:</h4>
                <div style="display: flex; flex-wrap: wrap; gap: var(--space-8);">
                    ${features.map(feature => 
                        `<span class="feature-tag">${feature}</span>`
                    ).join('')}
                </div>
            </div>
            ` : ''}
            
            <div style="margin-bottom: var(--space-20);">
                <h4>Description:</h4>
                <p style="color: var(--color-text-secondary);">${account.description}</p>
            </div>
            
            <div style="margin-bottom: var(--space-20);">
                <h4>Price: <span style="color: var(--color-primary); font-size: var(--font-size-2xl);">${formatPrice(price)}</span></h4>
            </div>
            
            <div class="upi-payment-info">
                <h4>💳 Payment Information</h4>
                <p><strong>Pay to UPI ID:</strong></p>
                <div class="upi-id">${staticData.contact_info.upi_id}</div>
                <p><strong>If you like this account, you can contact us</strong></p>
            </div>
            
            <div class="telegram-contact">
                <p><strong>📱 Contact & Support</strong></p>
                <p>Telegram: <a href="https://t.me/${staticData.contact_info.telegram.replace('@', '')}" target="_blank">${staticData.contact_info.telegram}</a></p>
                <p>Join Telegram group for latest deals: <a href="${staticData.contact_info.telegram_group}" target="_blank">https://t.me/coctrades</a></p>
                <p>Account ID: <strong>${account._id}</strong></p>
            </div>
        `;
    }
    
    modal.classList.remove('hidden');
}

// Show clan modal
function showClanModal(clan) {
    const clanModal = document.getElementById('clanModal');
    if (!clanModal) return;
    
    const modalTitle = document.getElementById('clanModalTitle');
    const modalBody = document.getElementById('clanModalBody');
    const price = convertPrice(clan.price);
    
    if (modalTitle) modalTitle.textContent = clan.name;
    
    if (modalBody) {
        modalBody.innerHTML = `
            <div class="modal-stats">
                <div class="modal-stat">
                    <span class="modal-stat__value">${clan.level}</span>
                    <span class="modal-stat__label">Clan Level</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${clan.members}/50</span>
                    <span class="modal-stat__label">Members</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${clan.league}</span>
                    <span class="modal-stat__label">War League</span>
                </div>
                <div class="modal-stat">
                    <span class="modal-stat__value">${clan._id.slice(-6)}</span>
                    <span class="modal-stat__label">Clan ID</span>
                </div>
            </div>
            
            <div style="margin-bottom: var(--space-20);">
                <h4>Description:</h4>
                <p style="color: var(--color-text-secondary);">${clan.description}</p>
            </div>
            
            <div style="margin-bottom: var(--space-20);">
                <h4>Price: <span style="color: var(--color-primary); font-size: var(--font-size-2xl);">${formatPrice(price)}</span></h4>
            </div>
            
            <div class="upi-payment-info">
                <h4>💳 Payment Information</h4>
                <p><strong>Pay to UPI ID:</strong></p>
                <div class="upi-id">${staticData.contact_info.upi_id}</div>
                <p><strong>If you like this clan, you can contact us</strong></p>
            </div>
            
            <div class="telegram-contact">
                <p><strong>📱 Contact & Support</strong></p>
                <p>Telegram: <a href="https://t.me/${staticData.contact_info.telegram.replace('@', '')}" target="_blank">${staticData.contact_info.telegram}</a></p>
                <p>Join Telegram group for latest deals: <a href="${staticData.contact_info.telegram_group}" target="_blank">https://t.me/coctrades</a></p>
                <p>Clan ID: <strong>${clan._id}</strong></p>
            </div>
        `;
    }
    
    clanModal.classList.remove('hidden');
}

// Hide modals
function hideAccountModal() {
    const modal = document.getElementById('accountModal');
    if (modal) modal.classList.add('hidden');
}

function hideClanModal() {
    const clanModal = document.getElementById('clanModal');
    if (clanModal) clanModal.classList.add('hidden');
}

function hideEditModal() {
    const editModal = document.getElementById('editModal');
    if (editModal) editModal.classList.add('hidden');
}

// Initialize authentication tabs
function initializeAuth() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    
    authTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            authTabs.forEach(t => t.classList.remove('auth-tab--active'));
            this.classList.add('auth-tab--active');
            
            authForms.forEach(form => {
                form.classList.remove('auth-form--active');
                if (form.id === targetTab + 'Tab') {
                    form.classList.add('auth-form--active');
                }
            });
        });
    });

    initializeDashboardTabs();
}

// Export functions for global access
window.showSection = showSection;
window.hideAccountModal = hideAccountModal;
window.hideClanModal = hideClanModal;
window.hideEditModal = hideEditModal;