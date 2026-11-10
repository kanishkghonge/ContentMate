// ===================================
// IMPORT & EXPORT FUNCTIONALITY
// ===================================

class ImportExportManager {
    constructor(ideaBank, uiManager) {
        this.ideaBank = ideaBank;
        this.uiManager = uiManager;
        this.init();
    }

    init() {
        // Import button
        document.getElementById('import-btn').addEventListener('click', () => {
            this.handleImport();
        });

        // Export buttons
        document.getElementById('export-all-btn').addEventListener('click', () => {
            this.exportToExcel('all', 'all-ideas.xlsx');
        });

        document.getElementById('export-fresh-btn').addEventListener('click', () => {
            this.exportToExcel('fresh', 'fresh-ideas.xlsx');
        });

        document.getElementById('export-used-btn').addEventListener('click', () => {
            this.exportToExcel('used', 'used-ideas.xlsx');
        });

        document.getElementById('export-trash-btn').addEventListener('click', () => {
            this.exportToExcel('trash', 'trash-ideas.xlsx');
        });

        document.getElementById('export-backup-btn').addEventListener('click', () => {
            this.exportFullBackup();
        });

        // File input change preview
        document.getElementById('import-file').addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.previewImport(e.target.files[0]);
            }
        });
    }

    // ===================================
    // IMPORT FUNCTIONALITY
    // ===================================

    async handleImport() {
        const fileInput = document.getElementById('import-file');
        const file = fileInput.files[0];

        if (!file) {
            alert('Please select a file to import.');
            return;
        }

        try {
            let ideas = [];
            const extension = file.name.split('.').pop().toLowerCase();

            if (extension === 'xlsx') {
                ideas = await this.parseExcel(file);
            } else if (extension === 'csv') {
                ideas = await this.parseCSV(file);
            } else if (extension === 'json') {
                ideas = await this.parseJSON(file);
            } else {
                alert('Unsupported file format. Please use .xlsx, .csv, or .json');
                return;
            }

            if (ideas.length === 0) {
                alert('No ideas found in the file.');
                return;
            }

            // Import ideas
            const result = this.ideaBank.importIdeas(ideas);

            // Show results
            let message = `Import completed!\n\n`;
            message += `✓ Imported: ${result.imported.length} ideas\n`;
            if (result.duplicates.length > 0) {
                message += `⚠ Skipped duplicates: ${result.duplicates.length} ideas\n`;
            }

            alert(message);

            // Clear file input and preview
            fileInput.value = '';
            document.getElementById('import-preview').classList.add('hidden');
            document.getElementById('import-preview').innerHTML = '';

            // Update UI
            this.uiManager.updateStats();

        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing file: ' + error.message);
        }
    }

    async previewImport(file) {
        try {
            let ideas = [];
            const extension = file.name.split('.').pop().toLowerCase();

            if (extension === 'xlsx') {
                ideas = await this.parseExcel(file);
            } else if (extension === 'csv') {
                ideas = await this.parseCSV(file);
            } else if (extension === 'json') {
                ideas = await this.parseJSON(file);
            }

            console.log('Preview found', ideas.length, 'ideas');

            if (ideas.length === 0) {
                const preview = document.getElementById('import-preview');
                preview.classList.remove('hidden');
                preview.innerHTML = '<p style="color: red;">No ideas found in file. Please check the file format.</p>';
                return;
            }

            // Show preview
            const preview = document.getElementById('import-preview');
            preview.classList.remove('hidden');

            let html = `<h4>Preview (${ideas.length} ideas found)</h4>`;
            
            ideas.slice(0, 5).forEach((idea, index) => {
                const isDuplicate = this.ideaBank.isDuplicate(idea.title, idea.description);
                html += `
                    <div class="import-preview-item">
                        <strong>${index + 1}. ${idea.title || '(No title)'}</strong>
                        ${isDuplicate ? '<span class="duplicate-warning"> (Duplicate - will be skipped)</span>' : ''}
                        <br>Category: ${idea.category || 'Uncategorized'}
                        ${idea.description ? '<br><small>' + idea.description.substring(0, 100) + '...</small>' : ''}
                    </div>
                `;
            });

            if (ideas.length > 5) {
                html += `<p style="margin-top: 0.5rem; color: var(--gray-600);">...and ${ideas.length - 5} more</p>`;
            }

            preview.innerHTML = html;

        } catch (error) {
            console.error('Preview error:', error);
            const preview = document.getElementById('import-preview');
            preview.classList.remove('hidden');
            preview.innerHTML = '<p style="color: red;">Error reading file: ' + error.message + '</p>';
        }
    }

    async parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    
                    console.log('Excel workbook loaded:', workbook.SheetNames);
                    
                    // Try each sheet until we find one with data
                    let allIdeas = [];
                    for (const sheetName of workbook.SheetNames) {
                        const worksheet = workbook.Sheets[sheetName];
                        
                        // Convert to JSON
                        const jsonData = XLSX.utils.sheet_to_json(worksheet);
                        
                        console.log(`Sheet "${sheetName}" has ${jsonData.length} rows`);
                        
                        if (jsonData.length > 0) {
                            console.log('First row sample:', jsonData[0]);
                            
                            // Map to our idea format
                            const ideas = jsonData.map(row => this.mapRowToIdea(row)).filter(idea => idea.title);
                            allIdeas = allIdeas.concat(ideas);
                        }
                    }
                    
                    console.log(`Total ideas parsed: ${allIdeas.length}`);
                    resolve(allIdeas);
                } catch (error) {
                    console.error('Excel parse error:', error);
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }

    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    
                    // Use SheetJS to parse CSV
                    const workbook = XLSX.read(text, { type: 'string' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    
                    const ideas = jsonData.map(row => this.mapRowToIdea(row));
                    
                    resolve(ideas);
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    async parseJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    
                    // Check if it's a full backup format
                    if (json.version && json.ideas) {
                        resolve(json.ideas);
                    } else if (Array.isArray(json)) {
                        // Array of ideas
                        resolve(json);
                    } else {
                        reject(new Error('Invalid JSON format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };

            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsText(file);
        });
    }

    mapRowToIdea(row) {
        console.log('Mapping row:', row);
        
        // Handle different column name variations
        const title = row['Title'] || row['title'] || 
                     row['Insight'] || row['insight'] || 
                     row['Insight '] || // Handle trailing space
                     '';
        
        const description = row['Description'] || row['description'] || 
                          row['Insight description'] || row['Insight Description'] ||
                          row['insight description'] || row['Insight description '] ||
                          '';
        
        const category = row['Category'] || row['category'] || 
                        row['Category '] || // Handle trailing space
                        'Uncategorized';
        
        const evidence = row['Evidence'] || row['evidence'] || 
                        row['Evidence / execution note'] || 
                        row['Evidence / Execution Note'] ||
                        row['evidence / execution note'] ||
                        row['Evidence / execution note '] || // Handle trailing space
                        '';
        
        // If it has an ID, it might be a re-import
        const id = row['ID'] || row['id'] || null;
        const status = row['Status'] || row['status'] || null;
        const usedAt = row['Used At'] || row['usedAt'] || null;
        const trashedAt = row['Trashed At'] || row['trashedAt'] || null;
        const savedAt = row['Saved At'] || row['savedAt'] || null;
        const useNote = row['Use Note'] || row['useNote'] || '';
        const notes = row['Notes'] || row['notes'] || '';
        const createdAt = row['Created At'] || row['createdAt'] || null;

        const idea = {
            id,
            title,
            description,
            category,
            evidence,
            notes,
            status,
            usedAt,
            trashedAt,
            savedAt,
            useNote,
            createdAt
        };
        
        console.log('Mapped to idea:', idea);
        return idea;
    }

    // ===================================
    // EXPORT FUNCTIONALITY
    // ===================================

    exportToExcel(type, filename) {
        let ideas = [];
        let sheetName = 'Ideas';

        switch(type) {
            case 'all':
                ideas = this.ideaBank.ideas;
                sheetName = 'All Ideas';
                break;
            case 'fresh':
                ideas = this.ideaBank.ideas.filter(i => 
                    i.status === 'fresh' || 
                    (i.status === 'used' && !this.ideaBank.isInCooldown(i))
                );
                sheetName = 'Fresh Ideas';
                break;
            case 'used':
                ideas = this.ideaBank.getIdeasByStatus('used');
                sheetName = 'Used Ideas';
                break;
            case 'trash':
                ideas = this.ideaBank.getIdeasByStatus('trashed');
                sheetName = 'Trash';
                break;
        }

        if (ideas.length === 0) {
            alert('No ideas to export.');
            return;
        }

        // Prepare data for Excel
        const excelData = ideas.map(idea => ({
            'ID': idea.id,
            'Category': idea.category,
            'Title': idea.title,
            'Description': idea.description,
            'Evidence / Execution Note': idea.evidence,
            'Notes': idea.notes,
            'Status': idea.status,
            'Created At': idea.createdAt ? new Date(idea.createdAt).toLocaleString() : '',
            'Used At': idea.usedAt ? new Date(idea.usedAt).toLocaleString() : '',
            'Use Note': idea.useNote || '',
            'Saved At': idea.savedAt ? new Date(idea.savedAt).toLocaleString() : '',
            'Trashed At': idea.trashedAt ? new Date(idea.trashedAt).toLocaleString() : ''
        }));

        // Create workbook
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(excelData);

        // Set column widths
        ws['!cols'] = [
            { wch: 25 }, // ID
            { wch: 15 }, // Category
            { wch: 30 }, // Title
            { wch: 40 }, // Description
            { wch: 40 }, // Evidence
            { wch: 30 }, // Notes
            { wch: 10 }, // Status
            { wch: 18 }, // Created At
            { wch: 18 }, // Used At
            { wch: 30 }, // Use Note
            { wch: 18 }, // Saved At
            { wch: 18 }  // Trashed At
        ];

        XLSX.utils.book_append_sheet(wb, ws, sheetName);
        
        // Download file
        XLSX.writeFile(wb, filename);
    }

    exportFullBackup() {
        const backup = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            settings: this.ideaBank.settings,
            ideas: this.ideaBank.ideas,
            stats: this.ideaBank.getStats()
        };

        const json = JSON.stringify(backup, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `idea-bank-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for ideaBank and ui to be initialized
    const checkInit = setInterval(() => {
        if (typeof ideaBank !== 'undefined' && typeof ui !== 'undefined') {
            clearInterval(checkInit);
            new ImportExportManager(ideaBank, ui);
        }
    }, 100);
});
