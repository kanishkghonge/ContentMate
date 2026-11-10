// ===================================
// DATA MANAGEMENT & STORAGE
// ===================================

class IdeaBank {
    constructor() {
        this.ideas = this.loadIdeas();
        this.settings = this.loadSettings();
        this.sessionSkipped = new Set(); // Ideas skipped in current session
        this.currentIdea = null;
    }

    // Generate unique ID for ideas
    generateId() {
        return 'idea_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // Normalize text for duplicate detection
    normalizeText(text) {
        return text.toLowerCase().trim().replace(/\s+/g, ' ');
    }

    // Check if idea is duplicate
    isDuplicate(title, description) {
        const normalizedTitle = this.normalizeText(title);
        const normalizedDesc = this.normalizeText(description || '');
        
        return this.ideas.some(idea => {
            const existingTitle = this.normalizeText(idea.title);
            const existingDesc = this.normalizeText(idea.description || '');
            return existingTitle === normalizedTitle || 
                   (normalizedDesc && existingDesc === normalizedDesc);
        });
    }

    // Load ideas from localStorage
    loadIdeas() {
        const stored = localStorage.getItem('ideaBank_ideas');
        const ideas = stored ? JSON.parse(stored) : [];
        
        // Migrate existing ideas: mark them as default if they don't have flags yet
        const needsMigration = ideas.some(idea => 
            idea.isDefault === undefined && idea.isUserCreated === undefined
        );
        
        if (needsMigration && typeof DEFAULT_IDEAS !== 'undefined') {
            console.log('Migrating existing ideas to add source flags...');
            ideas.forEach(idea => {
                if (idea.isDefault === undefined && idea.isUserCreated === undefined) {
                    // Check if this looks like a default idea by matching against known titles
                    const isFromDefaultSet = DEFAULT_IDEAS.some(
                        defaultIdea => defaultIdea.title === idea.title
                    );
                    
                    if (isFromDefaultSet) {
                        idea.isDefault = true;
                        idea.isUserCreated = false;
                    } else {
                        // It's a user-created idea
                        idea.isDefault = false;
                        idea.isUserCreated = true;
                    }
                }
            });
            
            // Save the migrated ideas
            localStorage.setItem('ideaBank_ideas', JSON.stringify(ideas));
            console.log(`Migration complete! Processed ${ideas.length} ideas.`);
        } else if (needsMigration) {
            console.log('Migration needed but DEFAULT_IDEAS not loaded yet');
        }
        
        return ideas;
    }

    // Save ideas to localStorage
    saveIdeas() {
        localStorage.setItem('ideaBank_ideas', JSON.stringify(this.ideas));
    }

    // Load settings from localStorage
    loadSettings() {
        const stored = localStorage.getItem('ideaBank_settings');
        return stored ? JSON.parse(stored) : { cooldownDays: 90 };
    }

    // Save settings to localStorage
    saveSettings() {
        localStorage.setItem('ideaBank_settings', JSON.stringify(this.settings));
    }

    // Add new idea
    addIdea(ideaData) {
        const idea = {
            id: this.generateId(),
            title: ideaData.title,
            description: ideaData.description || '',
            category: ideaData.category || 'Uncategorized',
            subcategory: ideaData.subcategory || '',
            evidence: ideaData.evidence || '',
            notes: ideaData.notes || '',
            status: 'fresh', // fresh, used, saved, trashed
            createdAt: new Date().toISOString(),
            usedAt: null,
            trashedAt: null,
            savedAt: null,
            useNote: '',
            useCount: ideaData.useCount || 0,
            isDefault: ideaData.isDefault || false, // Track if it's a default insight
            isUserCreated: ideaData.isUserCreated || false // Track if it's user-created
        };
        this.ideas.push(idea);
        this.saveIdeas();
        return idea;
    }

    // Update idea
    updateIdea(id, updates) {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            Object.assign(idea, updates);
            this.saveIdeas();
        }
        return idea;
    }

    // Mark idea as used
    useIdea(id, note = '') {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            idea.status = 'used';
            idea.usedAt = new Date().toISOString();
            idea.useNote = note;
            idea.useCount = (idea.useCount || 0) + 1;
            this.saveIdeas();
        }
        return idea;
    }

    // Mark idea as trashed
    trashIdea(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            idea.status = 'trashed';
            idea.trashedAt = new Date().toISOString();
            this.saveIdeas();
        }
        return idea;
    }

    // Mark idea as saved
    saveIdea(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            idea.status = 'saved';
            idea.savedAt = new Date().toISOString();
            this.saveIdeas();
        }
        return idea;
    }

    // Restore idea to fresh status
    restoreIdea(id) {
        const idea = this.ideas.find(i => i.id === id);
        if (idea) {
            idea.status = 'fresh';
            idea.usedAt = null;
            idea.trashedAt = null;
            idea.savedAt = null;
            this.saveIdeas();
        }
        return idea;
    }

    // Delete idea permanently
    deleteIdea(id) {
        const index = this.ideas.findIndex(i => i.id === id);
        if (index !== -1) {
            this.ideas.splice(index, 1);
            this.saveIdeas();
            return true;
        }
        return false;
    }

    // Check if used idea is still in cooldown
    isInCooldown(idea) {
        if (idea.status !== 'used' || !idea.usedAt) return false;
        
        const usedDate = new Date(idea.usedAt);
        const cooldownMs = this.settings.cooldownDays * 24 * 60 * 60 * 1000;
        const now = new Date();
        
        return (now - usedDate) < cooldownMs;
    }

    // Get eligible ideas for discovery (not trashed, not saved, not in cooldown, not skipped this session)
    getEligibleIdeas() {
        return this.ideas.filter(idea => {
            if (idea.status === 'trashed' || idea.status === 'saved') return false;
            if (this.sessionSkipped.has(idea.id)) return false;
            if (idea.status === 'used' && this.isInCooldown(idea)) return false;
            if ((this.settings.excludedCategories || []).includes(idea.category) || (this.settings.excludedSubcategories || []).includes(idea.subcategory)) return false;
            return true;
        });
    }

    // Get random eligible idea
    getRandomIdea() {
        const eligible = this.getEligibleIdeas();
        if (eligible.length === 0) return null;
        
        // Prefer ideas that have never been shown
        const neverUsed = eligible.filter(i => i.status === 'fresh');
        const pool = neverUsed.length > 0 ? neverUsed : eligible;
        
        const randomIndex = Math.floor(Math.random() * pool.length);
        return pool[randomIndex];
    }

    // Skip idea for this session
    skipIdea(id) {
        this.sessionSkipped.add(id);
    }

    // Get ideas by status
    getIdeasByStatus(status) {
        return this.ideas.filter(i => i.status === status);
    }

    // Get all categories
    getCategories() {
        const categories = new Set(this.ideas.map(i => i.category));
        return Array.from(categories).sort();
    }

    getSubcategories(category = '') {
        const items = this.ideas.filter(i => !category || i.category === category);
        return Array.from(new Set(items.map(i => i.subcategory).filter(Boolean))).sort();
    }

    // Search and filter ideas
    searchIdeas(query, category = '', status = null, source = null, subcategory = '') {
        let filtered = this.ideas;
        
        if (status) {
            filtered = filtered.filter(i => i.status === status);
        }
        
        if (category) {
            filtered = filtered.filter(i => i.category === category);
        }
        if (subcategory) filtered = filtered.filter(i => i.subcategory === subcategory);
        
        // Filter by source: 'default', 'user', or null (all)
        if (source === 'default') {
            filtered = filtered.filter(i => i.isDefault === true);
        } else if (source === 'user') {
            filtered = filtered.filter(i => i.isUserCreated === true);
        }
        
        if (query) {
            const q = query.toLowerCase();
            filtered = filtered.filter(i => 
                i.title.toLowerCase().includes(q) ||
                i.description.toLowerCase().includes(q) ||
                i.evidence.toLowerCase().includes(q) ||
                i.category.toLowerCase().includes(q)
            );
        }
        
        return filtered;
    }

    // Import ideas (handles deduplication and preserves existing data)
    importIdeas(newIdeas) {
        const imported = [];
        const duplicates = [];
        
        newIdeas.forEach(newIdea => {
            // Check if this is a re-import with existing ID
            const existingById = this.ideas.find(i => i.id === newIdea.id);
            if (existingById) {
                // Update existing idea but preserve status
                Object.assign(existingById, newIdea);
                imported.push(existingById);
                return;
            }
            
            // Check for duplicate by content
            if (this.isDuplicate(newIdea.title, newIdea.description)) {
                duplicates.push(newIdea);
                return;
            }
            
            // Add new idea
            const idea = {
                id: newIdea.id || this.generateId(),
                title: newIdea.title,
                description: newIdea.description || '',
                category: newIdea.category || 'Uncategorized',
                subcategory: newIdea.subcategory || '',
                evidence: newIdea.evidence || '',
                notes: newIdea.notes || '',
                status: newIdea.status || 'fresh',
                createdAt: newIdea.createdAt || new Date().toISOString(),
                usedAt: newIdea.usedAt || null,
                trashedAt: newIdea.trashedAt || null,
                savedAt: newIdea.savedAt || null,
                useNote: newIdea.useNote || ''
                ,useCount: newIdea.useCount || 0,
                isDefault: newIdea.isDefault === true,
                isUserCreated: newIdea.isUserCreated === true
            };
            
            this.ideas.push(idea);
            imported.push(idea);
        });
        
        this.saveIdeas();
        return { imported, duplicates };
    }

    // Get stats
    getStats() {
        const fresh = this.ideas.filter(i => 
            i.status === 'fresh' || 
            (i.status === 'used' && !this.isInCooldown(i))
        ).length;
        
        const defaultIdeas = this.ideas.filter(i => i.isDefault === true).length;
        const userCreatedIdeas = this.ideas.filter(i => i.isUserCreated === true).length;
        
        return {
            fresh,
            saved: this.ideas.filter(i => i.status === 'saved').length,
            used: this.ideas.filter(i => i.status === 'used').length,
            trashed: this.ideas.filter(i => i.status === 'trashed').length,
            total: this.ideas.length,
            defaultIdeas,
            userCreatedIdeas
        };
    }
}

// ===================================
// UI MANAGEMENT
// ===================================

class UIManager {
    constructor(ideaBank) {
        this.ideaBank = ideaBank;
        this.currentPage = 'discover';
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupDiscoverPage();
        this.setupAllIdeasPage();
        this.setupDefaultIdeasPage(); // New page for default insights
        this.setupUserIdeasPage(); // New page for user-created ideas
        this.setupSavedPage();
        this.setupUsedPage();
        this.setupTrashPage();
        this.setupSettingsPage();
        this.setupModals();
        this.updateStats();
        this.showPage('discover');
    }

    // Navigation
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const page = link.dataset.page;
                this.showPage(page);
                
                // Update active state
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            });
        });
    }

    showPage(pageName) {
        this.currentPage = pageName;
        
        // Hide all pages
        document.querySelectorAll('.page').forEach(page => {
            page.classList.remove('active');
        });
        
        // Show selected page
        const page = document.getElementById(`${pageName}-page`);
        if (page) {
            page.classList.add('active');
            
            // Refresh page content
            switch(pageName) {
                case 'discover':
                    this.updateStats();
                    break;
                case 'all':
                    this.renderAllIdeas();
                    break;
                case 'default-insights':
                    this.renderDefaultIdeas();
                    break;
                case 'user-ideas':
                    this.renderUserIdeas();
                    break;
                case 'saved':
                    this.renderSavedIdeas();
                    break;
                case 'used':
                    this.renderUsedIdeas();
                    break;
                case 'trash':
                    this.renderTrashIdeas();
                    break;
            }
        }
    }

    // Update stats display
    updateStats() {
        const stats = this.ideaBank.getStats();
        document.getElementById('fresh-count').textContent = stats.fresh;
        document.getElementById('saved-count').textContent = stats.saved;
        document.getElementById('used-count').textContent = stats.used;
        document.getElementById('trash-count').textContent = stats.trashed;
    }

    // Discover Page
    setupDiscoverPage() {
        const giveIdeaBtn = document.getElementById('give-idea-btn');
        const ideaCard = document.getElementById('idea-card');
        const noIdeasMsg = document.getElementById('no-ideas-message');
        
        giveIdeaBtn.addEventListener('click', () => {
            this.showRandomIdea();
        });
        
        // Action buttons
        document.getElementById('use-btn').addEventListener('click', () => this.handleUseIdea());
        document.getElementById('trash-btn').addEventListener('click', () => this.handleTrashIdea());
        document.getElementById('save-btn').addEventListener('click', () => this.handleSaveIdea());
        document.getElementById('skip-btn').addEventListener('click', () => this.handleSkipIdea());
        document.getElementById('edit-btn').addEventListener('click', () => this.handleEditIdea());
        document.getElementById('save-idea-notes-btn').addEventListener('click', () => {
            if (this.ideaBank.currentIdea) {
                const description = document.getElementById('idea-notes').value;
                this.ideaBank.updateIdea(this.ideaBank.currentIdea.id, { description, notes: description });
                document.getElementById('idea-description').textContent = description || 'No description provided.';
            }
        });
        document.getElementById('exclude-category-toggle').addEventListener('change', () => this.renderDiscoveryExclusions());
        this.renderDiscoveryExclusions();
    }

    renderDiscoveryExclusions() {
        const box = document.getElementById('discover-exclusion-list');
        if (!document.getElementById('exclude-category-toggle').checked) { box.classList.add('hidden'); return; }
        box.classList.remove('hidden');
        const cats = this.ideaBank.getCategories(), subs = this.ideaBank.getSubcategories();
        box.innerHTML = cats.map(v => `<label><input type="checkbox" data-exclude-category="${v}" ${(this.ideaBank.settings.excludedCategories || []).includes(v) ? 'checked' : ''}> ${v}</label>`).join('') + subs.map(v => `<label><input type="checkbox" data-exclude-subcategory="${v}" ${(this.ideaBank.settings.excludedSubcategories || []).includes(v) ? 'checked' : ''}> ${v}</label>`).join('');
        box.querySelectorAll('input').forEach(input => input.addEventListener('change', e => {
            const key = e.target.dataset.excludeCategory ? 'excludedCategories' : 'excludedSubcategories';
            const value = e.target.dataset.excludeCategory || e.target.dataset.excludeSubcategory;
            const list = this.ideaBank.settings[key] || [];
            this.ideaBank.settings[key] = e.target.checked ? [...new Set([...list, value])] : list.filter(x => x !== value);
            this.ideaBank.saveSettings();
        }));
    }

    showRandomIdea() {
        const idea = this.ideaBank.getRandomIdea();
        const ideaCard = document.getElementById('idea-card');
        const noIdeasMsg = document.getElementById('no-ideas-message');
        
        if (!idea) {
            ideaCard.classList.add('hidden');
            noIdeasMsg.classList.remove('hidden');
            return;
        }
        
        this.ideaBank.currentIdea = idea;
        
        document.getElementById('idea-category').textContent = idea.category;
        document.getElementById('idea-subcategory').textContent = idea.subcategory || '';
        document.getElementById('idea-title').textContent = idea.title;
        document.getElementById('idea-description').textContent = idea.description || 'No description provided.';
        document.getElementById('idea-evidence').textContent = idea.evidence || 'No evidence or execution notes provided.';
        document.getElementById('idea-notes').value = idea.notes || '';
        
        ideaCard.classList.remove('hidden');
        noIdeasMsg.classList.add('hidden');
    }

    handleUseIdea() {
        if (!this.ideaBank.currentIdea) return;
        
        // Show modal for optional note
        const modal = document.getElementById('use-modal');
        modal.classList.add('active');
        document.getElementById('use-note').value = '';
        document.getElementById('use-note').focus();
    }

    handleTrashIdea() {
        if (!this.ideaBank.currentIdea) return;
        
        if (confirm('Are you sure you want to trash this idea? It will be excluded from recommendations.')) {
            this.ideaBank.trashIdea(this.ideaBank.currentIdea.id);
            this.updateStats();
            this.showRandomIdea();
        }
    }

    handleSaveIdea() {
        if (!this.ideaBank.currentIdea) return;
        
        this.ideaBank.saveIdea(this.ideaBank.currentIdea.id);
        this.updateStats();
        this.showRandomIdea();
    }

    handleSkipIdea() {
        if (!this.ideaBank.currentIdea) return;
        
        this.ideaBank.skipIdea(this.ideaBank.currentIdea.id);
        this.showRandomIdea();
    }

    handleEditIdea() {
        if (!this.ideaBank.currentIdea) return;
        
        const idea = this.ideaBank.currentIdea;
        document.getElementById('edit-modal-title').textContent = 'Edit Idea';
        document.getElementById('edit-title').value = idea.title;
        document.getElementById('edit-description').value = idea.description;
        document.getElementById('edit-category').value = idea.category;
        document.getElementById('edit-subcategory').value = idea.subcategory || '';
        document.getElementById('edit-evidence').value = idea.evidence;
        document.getElementById('edit-notes').value = idea.notes;
        
        // Populate category dropdown
        this.populateCategoryDatalist('edit-category-list');
        // Populate subcategory based on current category
        this.updateSubcategoryDatalist('edit-subcategory-list', idea.category);
        
        // Set up dynamic subcategory update
        const categoryInput = document.getElementById('edit-category');
        categoryInput.addEventListener('input', () => {
            this.updateSubcategoryDatalist('edit-subcategory-list', categoryInput.value);
        });
        
        const modal = document.getElementById('edit-modal');
        modal.classList.add('active');
        modal.dataset.ideaId = idea.id;
    }

    // All Ideas Page
    setupAllIdeasPage() {
        document.getElementById('add-idea-btn').addEventListener('click', () => {
            this.showAddModal();
        });
        
        // Search and filter
        document.getElementById('search-all').addEventListener('input', () => this.renderAllIdeas());
        document.getElementById('filter-category-all').addEventListener('change', () => this.renderAllIdeas());
        document.getElementById('toggle-table-btn').addEventListener('click', () => { this.tableView = !this.tableView; this.renderAllIdeas(); });
    }

    renderAllIdeas() {
        const query = document.getElementById('search-all').value;
        const category = document.getElementById('filter-category-all').value;
        const ideas = this.ideaBank.searchIdeas(query, category);
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'all-ideas-list', {
            showEdit: true,
            showRestore: false,
            showDelete: true, table: this.tableView
        });
    }

    // Default Insights Page
    setupDefaultIdeasPage() {
        document.getElementById('search-default').addEventListener('input', () => this.renderDefaultIdeas());
        document.getElementById('filter-category-default').addEventListener('change', () => this.renderDefaultIdeas());
    }

    renderDefaultIdeas() {
        const query = document.getElementById('search-default').value;
        const category = document.getElementById('filter-category-default').value;
        const ideas = this.ideaBank.searchIdeas(query, category, null, 'default');
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'default-ideas-list', {
            showEdit: true,
            showRestore: false,
            showDelete: false,
            showSource: true
        });
    }

    // User-Created Ideas Page
    setupUserIdeasPage() {
        document.getElementById('add-user-idea-btn').addEventListener('click', () => {
            this.showAddModal(true); // Pass true to indicate user-created
        });
        
        document.getElementById('search-user').addEventListener('input', () => this.renderUserIdeas());
        document.getElementById('filter-category-user').addEventListener('change', () => this.renderUserIdeas());
    }

    renderUserIdeas() {
        const query = document.getElementById('search-user').value;
        const category = document.getElementById('filter-category-user').value;
        const ideas = this.ideaBank.searchIdeas(query, category, null, 'user');
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'user-ideas-list', {
            showEdit: true,
            showRestore: false,
            showDelete: true,
            showSource: true
        });
    }

    // Saved Ideas Page
    setupSavedPage() {
        document.getElementById('search-saved').addEventListener('input', () => this.renderSavedIdeas());
        document.getElementById('filter-category-saved').addEventListener('change', () => this.renderSavedIdeas());
    }

    renderSavedIdeas() {
        const query = document.getElementById('search-saved').value;
        const category = document.getElementById('filter-category-saved').value;
        const ideas = this.ideaBank.searchIdeas(query, category, 'saved');
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'saved-ideas-list', {
            showEdit: true,
            showRestore: true,
            showDelete: false
        });
    }

    // Used Ideas Page
    setupUsedPage() {
        document.getElementById('search-used').addEventListener('input', () => this.renderUsedIdeas());
        document.getElementById('filter-category-used').addEventListener('change', () => this.renderUsedIdeas());
    }

    renderUsedIdeas() {
        const query = document.getElementById('search-used').value;
        const category = document.getElementById('filter-category-used').value;
        const ideas = this.ideaBank.searchIdeas(query, category, 'used');
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'used-ideas-list', {
            showEdit: true,
            showRestore: true,
            showDelete: false,
            showUsedInfo: true
        });
    }

    // Trash Page
    setupTrashPage() {
        document.getElementById('search-trash').addEventListener('input', () => this.renderTrashIdeas());
        document.getElementById('filter-category-trash').addEventListener('change', () => this.renderTrashIdeas());
    }

    renderTrashIdeas() {
        const query = document.getElementById('search-trash').value;
        const category = document.getElementById('filter-category-trash').value;
        const ideas = this.ideaBank.searchIdeas(query, category, 'trashed');
        
        this.updateCategoryFilters();
        this.renderIdeasList(ideas, 'trash-ideas-list', {
            showEdit: false,
            showRestore: true,
            showDelete: true
        });
    }

    // Generic ideas list renderer
    renderIdeasList(ideas, containerId, options = {}) {
        const container = document.getElementById(containerId);
        
        if (ideas.length === 0) {
            container.innerHTML = '<div class="message"><p>No ideas found.</p></div>';
            return;
        }
        if (options.table) {
            container.innerHTML = `<div class="table-wrap"><table><thead><tr><th>Question / Insight</th><th>Category</th><th>Subcategory</th><th>Used</th><th>Notes</th><th></th></tr></thead><tbody>${ideas.map(i => `<tr><td>${i.title}</td><td>${i.category}</td><td>${i.subcategory || ''}</td><td>${i.useCount || 0}</td><td>${i.notes || ''}</td><td><button class="btn btn-edit" onclick="ui.editIdeaFromList('${i.id}')">Edit</button></td></tr>`).join('')}</tbody></table></div>`;
            return;
        }
        
        container.innerHTML = ideas.map(idea => {
            const usedInfo = options.showUsedInfo && idea.usedAt ? 
                `<div class="idea-item-meta">
                    Used on: ${new Date(idea.usedAt).toLocaleDateString()}
                    ${idea.useNote ? `<br>Note: ${idea.useNote}` : ''}
                    ${this.ideaBank.isInCooldown(idea) ? 
                        `<br><strong>In cooldown for ${this.getRemainingCooldownDays(idea)} more days</strong>` : 
                        '<br><em>Available for discovery again</em>'}
                </div>` : '';
            
            const trashedInfo = idea.trashedAt ? 
                `<div class="idea-item-meta">Trashed on: ${new Date(idea.trashedAt).toLocaleDateString()}</div>` : '';
            
            const savedInfo = idea.savedAt ? 
                `<div class="idea-item-meta">Saved on: ${new Date(idea.savedAt).toLocaleDateString()}</div>` : '';
            
            const sourceInfo = options.showSource ? 
                `<span class="idea-source-badge ${idea.isDefault ? 'badge-default' : 'badge-user'}">
                    ${idea.isDefault ? '📚 Default Insight' : '✍️ User Created'}
                </span>` : '';
            
            return `
                <div class="idea-item">
                    <div class="idea-item-header">
                        <div class="idea-item-title">
                            <h3>${idea.title}</h3>
                            <span class="idea-item-category">${idea.category}${idea.subcategory ? ' · ' + idea.subcategory : ''}</span>
                            <span class="idea-item-category">Used ${idea.useCount || 0}×</span>
                            ${sourceInfo}
                        </div>
                    </div>
                    <p class="idea-item-description">${idea.description || 'No description'}</p>
                    ${usedInfo}${trashedInfo}${savedInfo}
                    <div class="idea-item-actions">
                        ${options.showEdit ? `<button class="btn btn-edit" onclick="ui.editIdeaFromList('${idea.id}')">Edit</button>` : ''}
                        ${options.showRestore ? `<button class="btn btn-save" onclick="ui.restoreIdea('${idea.id}')">Restore</button>` : ''}
                        ${options.showDelete && idea.isUserCreated ? `<button class="btn btn-trash" onclick="ui.deleteIdea('${idea.id}')">Delete</button>` : ''}
                    </div>
                </div>
            `;
        }).join('');
    }

    getRemainingCooldownDays(idea) {
        const usedDate = new Date(idea.usedAt);
        const cooldownMs = this.ideaBank.settings.cooldownDays * 24 * 60 * 60 * 1000;
        const endDate = new Date(usedDate.getTime() + cooldownMs);
        const remaining = Math.ceil((endDate - new Date()) / (24 * 60 * 60 * 1000));
        return remaining;
    }

    updateCategoryFilters() {
        const categories = this.ideaBank.getCategories();
        const filterSelects = [
            'filter-category-all',
            'filter-category-default',
            'filter-category-user',
            'filter-category-saved',
            'filter-category-used',
            'filter-category-trash'
        ];
        
        filterSelects.forEach(id => {
            const select = document.getElementById(id);
            if (select) {
                const currentValue = select.value;
                select.innerHTML = '<option value="">All Categories</option>' + 
                    categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
                select.value = currentValue;
            }
        });
    }

    editIdeaFromList(id) {
        const idea = this.ideaBank.ideas.find(i => i.id === id);
        if (!idea) return;
        
        document.getElementById('edit-modal-title').textContent = 'Edit Idea';
        document.getElementById('edit-title').value = idea.title;
        document.getElementById('edit-description').value = idea.description;
        document.getElementById('edit-category').value = idea.category;
        document.getElementById('edit-subcategory').value = idea.subcategory || '';
        document.getElementById('edit-evidence').value = idea.evidence;
        document.getElementById('edit-notes').value = idea.notes;
        
        // Populate category dropdown
        this.populateCategoryDatalist('edit-category-list');
        // Populate subcategory based on current category
        this.updateSubcategoryDatalist('edit-subcategory-list', idea.category);
        
        // Set up dynamic subcategory update
        const categoryInput = document.getElementById('edit-category');
        categoryInput.addEventListener('input', () => {
            this.updateSubcategoryDatalist('edit-subcategory-list', categoryInput.value);
        });
        
        const modal = document.getElementById('edit-modal');
        modal.classList.add('active');
        modal.dataset.ideaId = id;
    }

    // Populate category datalist with all existing categories
    populateCategoryDatalist(datalistId) {
        const datalist = document.getElementById(datalistId);
        const categories = this.ideaBank.getCategories();
        datalist.innerHTML = categories.map(cat => `<option value="${cat}">`).join('');
    }

    // Update subcategory datalist based on selected category
    updateSubcategoryDatalist(datalistId, category) {
        const datalist = document.getElementById(datalistId);
        const subcategories = this.ideaBank.getSubcategories(category);
        datalist.innerHTML = subcategories.map(sub => `<option value="${sub}">`).join('');
    }

    restoreIdea(id) {
        this.ideaBank.restoreIdea(id);
        this.updateStats();
        this.showPage(this.currentPage);
    }

    deleteIdea(id) {
        if (confirm('Are you sure you want to permanently delete this idea?')) {
            this.ideaBank.deleteIdea(id);
            this.updateStats();
            this.showPage(this.currentPage);
        }
    }

    // Settings Page
    setupSettingsPage() {
        const cooldownInput = document.getElementById('cooldown-days');
        cooldownInput.value = this.ideaBank.settings.cooldownDays;
        
        cooldownInput.addEventListener('change', () => {
            this.ideaBank.settings.cooldownDays = parseInt(cooldownInput.value);
            this.ideaBank.saveSettings();
        });

        // Migration button
        document.getElementById('migrate-ideas-btn').addEventListener('click', () => {
            this.migrateExistingIdeas();
        });
    }

    // Manual migration function
    migrateExistingIdeas() {
        const statusEl = document.getElementById('migration-status');
        statusEl.textContent = 'Migrating...';
        statusEl.style.color = 'var(--warning-color)';

        try {
            let migrated = 0;
            let alreadyMigrated = 0;

            this.ideaBank.ideas.forEach(idea => {
                if (idea.isDefault === undefined && idea.isUserCreated === undefined) {
                    // Check if this looks like a default idea by matching against known titles
                    const isFromDefaultSet = typeof DEFAULT_IDEAS !== 'undefined' && 
                        DEFAULT_IDEAS.some(defaultIdea => defaultIdea.title === idea.title);
                    
                    if (isFromDefaultSet) {
                        idea.isDefault = true;
                        idea.isUserCreated = false;
                    } else {
                        // It's a user-created idea
                        idea.isDefault = false;
                        idea.isUserCreated = true;
                    }
                    migrated++;
                } else {
                    alreadyMigrated++;
                }
            });

            // Save the changes
            this.ideaBank.saveIdeas();
            
            // Update stats and refresh current page
            this.updateStats();
            this.showPage(this.currentPage);

            // Show success message
            statusEl.style.color = 'var(--success-color)';
            statusEl.textContent = `✅ Migration complete! ${migrated} ideas migrated, ${alreadyMigrated} already had flags.`;
            
            console.log('Migration stats:', { migrated, alreadyMigrated, total: this.ideaBank.ideas.length });

        } catch (error) {
            console.error('Migration error:', error);
            statusEl.style.color = 'var(--danger-color)';
            statusEl.textContent = '❌ Migration failed. Check console for details.';
        }
    }

    // Modals
    setupModals() {
        // Use modal
        document.getElementById('use-confirm-btn').addEventListener('click', () => {
            const note = document.getElementById('use-note').value;
            this.ideaBank.useIdea(this.ideaBank.currentIdea.id, note);
            this.closeModal('use-modal');
            this.updateStats();
            this.showRandomIdea();
        });
        
        document.getElementById('use-cancel-btn').addEventListener('click', () => {
            this.closeModal('use-modal');
        });
        
        // Edit modal
        document.getElementById('edit-save-btn').addEventListener('click', () => {
            this.saveEditedIdea();
        });
        
        document.getElementById('edit-cancel-btn').addEventListener('click', () => {
            this.closeModal('edit-modal');
        });
        
        // Add modal
        document.getElementById('add-save-btn').addEventListener('click', () => {
            this.saveNewIdea();
        });
        
        document.getElementById('add-cancel-btn').addEventListener('click', () => {
            this.closeModal('add-modal');
        });
        
        // Close modals on outside click
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.classList.remove('active');
                }
            });
        });
    }

    showAddModal(isUserCreated = true) {
        document.getElementById('add-title').value = '';
        document.getElementById('add-description').value = '';
        document.getElementById('add-category').value = '';
        document.getElementById('add-subcategory').value = '';
        document.getElementById('add-evidence').value = '';
        document.getElementById('add-notes').value = '';
        
        // Populate category dropdown
        this.populateCategoryDatalist('category-list');
        
        // Set up dynamic subcategory update
        const categoryInput = document.getElementById('add-category');
        categoryInput.addEventListener('input', () => {
            this.updateSubcategoryDatalist('subcategory-list', categoryInput.value);
        });
        
        const modal = document.getElementById('add-modal');
        modal.classList.add('active');
        modal.dataset.isUserCreated = isUserCreated;
        document.getElementById('add-title').focus();
    }

    saveNewIdea() {
        const title = document.getElementById('add-title').value.trim();
        
        if (!title) {
            alert('Please enter a title for the idea.');
            return;
        }
        
        const modal = document.getElementById('add-modal');
        const isUserCreated = modal.dataset.isUserCreated === 'true';
        
        this.ideaBank.addIdea({
            title,
            description: document.getElementById('add-description').value.trim(),
            category: document.getElementById('add-category').value.trim() || 'Uncategorized',
            subcategory: document.getElementById('add-subcategory').value.trim(),
            evidence: document.getElementById('add-evidence').value.trim(),
            notes: document.getElementById('add-notes').value.trim(),
            isUserCreated: isUserCreated
        });
        
        this.closeModal('add-modal');
        this.updateStats();
        alert('Idea added successfully!');
    }

    saveEditedIdea() {
        const modal = document.getElementById('edit-modal');
        const ideaId = modal.dataset.ideaId;
        const title = document.getElementById('edit-title').value.trim();
        
        if (!title) {
            alert('Please enter a title for the idea.');
            return;
        }
        
        this.ideaBank.updateIdea(ideaId, {
            title,
            description: document.getElementById('edit-description').value.trim(),
            category: document.getElementById('edit-category').value.trim() || 'Uncategorized',
            subcategory: document.getElementById('edit-subcategory').value.trim(),
            evidence: document.getElementById('edit-evidence').value.trim(),
            notes: document.getElementById('edit-notes').value.trim()
        });
        
        this.closeModal('edit-modal');
        
        // Refresh current view
        if (this.ideaBank.currentIdea && this.ideaBank.currentIdea.id === ideaId) {
            this.showRandomIdea();
        }
        this.showPage(this.currentPage);
    }

    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
}

// ===================================
// INITIALIZATION
// ===================================

let ideaBank;
let ui;

class WebDAVManager {
    constructor(ideaBank, ui) { this.ideaBank = ideaBank; this.ui = ui; this.loadFields(); this.bindEvents(); }
    config() { return { url: document.getElementById('webdav-url').value.trim(), username: document.getElementById('webdav-username').value, password: document.getElementById('webdav-password').value }; }
    loadFields() { try { const c = JSON.parse(localStorage.getItem('ideaBank_webdav') || '{}'); ['url', 'username', 'password'].forEach(k => { const el = document.getElementById(`webdav-${k}`); if (el) el.value = c[k] || ''; }); } catch (_) {} }
    saveFields(c) { localStorage.setItem('ideaBank_webdav', JSON.stringify(c)); }
    status(text, error = false) { const el = document.getElementById('webdav-status'); el.textContent = text; el.style.color = error ? '#b91c1c' : 'var(--gray-600)'; }
    async request(method, body) { const c = this.config(); if (!c.url) throw new Error('Enter a WebDAV file URL first.'); this.saveFields(c); const headers = {}; if (c.username || c.password) headers.Authorization = `Basic ${btoa(`${c.username}:${c.password}`)}`; if (body !== undefined) { headers['Content-Type'] = 'application/json'; } const r = await fetch(c.url, { method, headers, body }); if (!r.ok) throw new Error(`${r.status} ${r.statusText}`); return r; }
    backup() { return JSON.stringify({ version: '1.0', exportedAt: new Date().toISOString(), settings: this.ideaBank.settings, ideas: this.ideaBank.ideas }, null, 2); }
    bindEvents() {
        document.getElementById('webdav-test-btn').onclick = async () => { try { await this.request('GET'); this.status('Connection successful.'); } catch (e) { this.status(`Connection failed: ${e.message}`, true); } };
        document.getElementById('webdav-upload-btn').onclick = async () => { try { await this.request('PUT', this.backup()); this.status('Backup uploaded successfully.'); } catch (e) { this.status(`Upload failed: ${e.message}`, true); } };
        document.getElementById('webdav-download-btn').onclick = async () => { try { const backup = await (await this.request('GET')).json(); if (!Array.isArray(backup.ideas)) throw new Error('The file is not a valid Idea Bank backup.'); if (!confirm(`Replace local data with ${backup.ideas.length} ideas from WebDAV?`)) return; this.ideaBank.ideas = backup.ideas; if (backup.settings) this.ideaBank.settings = backup.settings; this.ideaBank.saveIdeas(); this.ideaBank.saveSettings(); this.ui.updateStats(); this.ui.showPage(this.ui.currentPage); this.status('Backup downloaded successfully.'); } catch (e) { this.status(`Download failed: ${e.message}`, true); } };
    }
}

// Seed the bundled insights on first run. Runtime Excel loading is intentionally disabled.
function autoLoadExcelFile() {
    console.log('Checking bundled hardcoded insights...');

    try {
        const allIdeas = DEFAULT_IDEAS.filter(seed => !ideaBank.ideas.some(existing =>
            ideaBank.normalizeText(existing.title) === ideaBank.normalizeText(seed.title)
        ));

        /* legacy Excel auto-loader removed */
        if (!allIdeas.length) {
            console.log('All bundled insights are already loaded.');
            return;
        }
        /*
        const arrayBuffer = await response.arrayBuffer();
        const data = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        console.log('Excel workbook loaded:', workbook.SheetNames);

        let allIdeas = [];
        for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet);

            console.log(`Sheet "${sheetName}" has ${jsonData.length} rows`);

            if (jsonData.length > 0) {
                console.log('First row sample:', jsonData[0]);

                // Map to our idea format
                jsonData.forEach(row => {
                    const title = row['Insight'] || row['insight'] || row['Title'] || row['title'] || '';
                    const description = row['Insight description'] || row['Description'] || '';
                    const category = row['Category'] || row['category'] || 'Uncategorized';
                    const evidence = row['Evidence / execution note'] || row['Evidence'] || '';

                    if (title) {
                        allIdeas.push({
                            title,
                            description,
                            category,
                            evidence,
                            notes: ''
                        });
                    }
                });
            }
        }

        if (allIdeas.length > 0) {*/
            console.log(`Auto-loading ${allIdeas.length} ideas...`);
            
            // Import ideas
            const result = ideaBank.importIdeas(allIdeas);
            console.log(`Auto-load complete: ${result.imported.length} ideas imported`);
            
            // Update UI
            ui.updateStats();
            
            // Startup loading is intentionally silent.
        // }

    } catch (error) {
        console.error('Auto-load failed:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    ideaBank = new IdeaBank();
    ui = new UIManager(ideaBank);
    
    // Auto-load data after initialization
    setTimeout(() => {
        // Try to load default ideas first
        const shouldTryExcel = typeof loadDefaultIdeas === 'function' ? loadDefaultIdeas() : true;
        
        // If no default ideas or loading failed, try to fetch Excel file
        if (shouldTryExcel) {
            autoLoadExcelFile();
        }
    }, 500);
    setTimeout(() => new WebDAVManager(ideaBank, ui), 100);
});
