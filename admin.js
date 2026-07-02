// admin.js - Admin dashboard application controller

document.addEventListener("DOMContentLoaded", () => {
    // 1. Passcode Authentication Check
    const authOverlay = document.getElementById("auth-overlay");
    const authForm = document.getElementById("auth-form");
    const passcodeInput = document.getElementById("passcode-input");
    const authError = document.getElementById("auth-error");
    const logoutBtn = document.getElementById("btn-logout");

    function checkAuth() {
        if (sessionStorage.getItem("ee_authenticated") === "true") {
            authOverlay.style.display = "none";
        } else {
            authOverlay.style.display = "flex";
        }
    }

    if (authForm) {
        authForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const val = passcodeInput.value.trim();
            if (val === "krishna123") {
                sessionStorage.setItem("ee_authenticated", "true");
                authError.style.display = "none";
                passcodeInput.value = "";
                
                // Fade out animation
                authOverlay.style.opacity = 0;
                setTimeout(() => {
                    authOverlay.style.display = "none";
                    authOverlay.style.opacity = 1;
                }, 500);

                initializeDashboard();
            } else {
                authError.style.display = "block";
                passcodeInput.value = "";
                passcodeInput.focus();
            }
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            sessionStorage.removeItem("ee_authenticated");
            window.location.reload();
        });
    }

    // Run auth check immediately
    checkAuth();

    // 2. Tab Switcher
    const navItems = document.querySelectorAll(".nav-item");
    const tabPanels = document.querySelectorAll(".tab-panel");
    const tabTitleDisplay = document.getElementById("tab-title-display");
    const tabSubtitleDisplay = document.getElementById("tab-subtitle-display");

    const tabDetails = {
        "tab-overview": { title: "Overview Dashboard", subtitle: "Welcome back, Design Director" },
        "tab-add": { title: "Create Event Project", subtitle: "Publish a new bespoke design to the public showcase" },
        "tab-manage": { title: "Manage Works Catalog", subtitle: "Update details or remove past design projects" },
        "tab-categories": { title: "Event Categories", subtitle: "Configure portfolio filter categories" },
        "tab-global-images": { title: "Edit Theme Images", subtitle: "Manage your background slides and About Us circular photos" }
    };

    window.switchTab = function(tabId) {
        // Remove active class from all nav items and panels
        navItems.forEach(item => item.classList.remove("active"));
        tabPanels.forEach(panel => panel.classList.remove("active"));

        // Add active class to target tab/panel
        const targetPanel = document.getElementById(tabId);
        if (targetPanel) {
            targetPanel.classList.add("active");
        }

        const targetNavItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
        if (targetNavItem) {
            targetNavItem.classList.add("active");
        }

        // Update header details
        if (tabDetails[tabId]) {
            tabTitleDisplay.innerText = tabDetails[tabId].title;
            tabSubtitleDisplay.innerText = tabDetails[tabId].subtitle;
        }

        // Custom actions when switching tab
        if (tabId === "tab-manage") {
            renderManageTable();
        } else if (tabId === "tab-overview") {
            updateStats();
        } else if (tabId === "tab-categories") {
            renderCategoriesTab();
        } else if (tabId === "tab-global-images") {
            renderGlobalImagesTab();
        }
    };

    navItems.forEach(item => {
        item.addEventListener("click", (e) => {
            const tabId = item.getAttribute("data-tab");
            if (tabId) {
                e.preventDefault();
                // If editing, clear form before switching tabs
                if (tabId !== "tab-add" && isEditMode) {
                    cancelEditEvent();
                }
                switchTab(tabId);
            }
        });
    });

    // 3. Image Upload and Management State
    let eventImages = [];
    const imagesPreviewGrid = document.getElementById("images-preview-grid");
    const fileUploadInput = document.getElementById("image-file-upload");
    const urlUploadInput = document.getElementById("image-url-input");
    const btnAddUrlImg = document.getElementById("btn-add-url-img");

    // Handle Local File Uploads
    if (fileUploadInput) {
        fileUploadInput.addEventListener("change", (e) => {
            const files = e.target.files;
            if (!files || files.length === 0) return;

            let loadedCount = 0;
            const targetLoad = files.length;

            for (let i = 0; i < files.length; i++) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const base64Url = event.target.result;
                    eventImages.push(base64Url);
                    loadedCount++;
                    
                    if (loadedCount === targetLoad) {
                        refreshImagesPreview();
                        fileUploadInput.value = ""; // clear file input
                    }
                };
                reader.readAsDataURL(files[i]);
            }
        });
    }

    // Handle External URL Images
    if (btnAddUrlImg) {
        btnAddUrlImg.addEventListener("click", () => {
            const url = urlUploadInput.value.trim();
            if (!url) return;
            
            // Basic URL check
            if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image")) {
                eventImages.push(url);
                urlUploadInput.value = "";
                refreshImagesPreview();
            } else {
                alert("Please enter a valid image URL starting with http:// or https://");
            }
        });
    }

    function refreshImagesPreview() {
        if (!imagesPreviewGrid) return;
        imagesPreviewGrid.innerHTML = "";

        if (eventImages.length === 0) {
            imagesPreviewGrid.innerHTML = `<div class="no-images-text">No images selected yet.</div>`;
            return;
        }

        eventImages.forEach((imgUrl, index) => {
            const thumb = document.createElement("div");
            thumb.className = "preview-thumb";
            thumb.innerHTML = `
                <img src="${imgUrl}" alt="Preview thumbnail">
                <button type="button" class="preview-thumb-delete" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
            `;
            
            thumb.querySelector(".preview-thumb-delete").addEventListener("click", (e) => {
                const idx = parseInt(e.currentTarget.getAttribute("data-index"));
                eventImages.splice(idx, 1);
                refreshImagesPreview();
            });

            imagesPreviewGrid.appendChild(thumb);
        });
    }

    // 4. Form Submit: Add / Edit Event
    const eventForm = document.getElementById("event-form");
    const editIdInput = document.getElementById("event-edit-id");
    const eventTitle = document.getElementById("event-title");
    const eventCategory = document.getElementById("event-category");
    const eventDate = document.getElementById("event-date");
    const eventLocation = document.getElementById("event-location");
    const eventDescription = document.getElementById("event-description");
    
    const formHeading = document.getElementById("form-heading");
    const btnCancelEdit = document.getElementById("btn-cancel-edit");
    let isEditMode = false;

    if (eventForm) {
        eventForm.addEventListener("submit", (e) => {
            e.preventDefault();

            if (eventImages.length === 0) {
                alert("Please add at least one showcase image for this event.");
                return;
            }

            const eventData = {
                title: eventTitle.value.trim(),
                category: eventCategory.value,
                date: eventDate.value,
                location: eventLocation.value.trim(),
                description: eventDescription.value.trim(),
                images: [...eventImages]
            };

            if (isEditMode) {
                eventData.id = editIdInput.value;
                const success = window.EventDB.updateEvent(eventData);
                if (success) {
                    alert("Event project updated successfully.");
                } else {
                    alert("Failed to update event project.");
                }
            } else {
                window.EventDB.addEvent(eventData);
                alert("Event project published successfully.");
            }

            resetEventForm();
            switchTab("tab-overview");
        });
        
        eventForm.addEventListener("reset", () => {
            eventImages = [];
            setTimeout(refreshImagesPreview, 10); // defer to allow form reset to complete
        });
    }

    function resetEventForm() {
        if (eventForm) eventForm.reset();
        eventImages = [];
        refreshImagesPreview();
        cancelEditEvent();
    }

    function cancelEditEvent() {
        isEditMode = false;
        if (editIdInput) editIdInput.value = "";
        if (formHeading) formHeading.innerText = "Create Event Project";
        if (btnCancelEdit) btnCancelEdit.style.display = "none";
        if (eventForm) eventForm.reset();
    }

    if (btnCancelEdit) {
        btnCancelEdit.addEventListener("click", (e) => {
            e.preventDefault();
            resetEventForm();
            switchTab("tab-manage");
        });
    }

    // 5. Manage Catalog Table Rendering
    const manageEventsTbody = document.getElementById("manage-events-tbody");
    const manageSearchInput = document.getElementById("manage-search-input");

    function renderManageTable(filterQuery = "") {
        if (!manageEventsTbody || !window.EventDB) return;
        
        manageEventsTbody.innerHTML = "";
        const events = window.EventDB.getEvents();
        
        const filteredEvents = filterQuery === "" 
            ? events 
            : events.filter(e => 
                e.title.toLowerCase().includes(filterQuery.toLowerCase()) || 
                e.location.toLowerCase().includes(filterQuery.toLowerCase()) ||
                e.category.toLowerCase().includes(filterQuery.toLowerCase())
              );

        if (filteredEvents.length === 0) {
            manageEventsTbody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--text-secondary); font-style: italic; padding: 40px;">No matching event projects found.</td></tr>`;
            return;
        }

        filteredEvents.forEach(evt => {
            const tr = document.createElement("tr");
            
            const thumbUrl = evt.images && evt.images.length > 0 
                ? evt.images[0] 
                : "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";

            tr.innerHTML = `
                <td><img src="${thumbUrl}" class="table-row-img" alt="${evt.title} thumbnail"></td>
                <td style="font-weight: 500;">${evt.title}</td>
                <td><span style="background:#F6F2EC; padding: 4px 8px; border-radius: 2px; font-size: 0.8rem; color: var(--accent-gold); font-weight: 500;">${evt.category}</span></td>
                <td>${evt.location}</td>
                <td>${evt.date || "N/A"}</td>
                <td>
                    <div class="actions-cell">
                        <button class="action-icon-btn edit" data-id="${evt.id}" title="Edit Project"><i class="fa-solid fa-pen-to-square"></i></button>
                        <button class="action-icon-btn delete" data-id="${evt.id}" title="Delete Project"><i class="fa-solid fa-trash-can"></i></button>
                    </div>
                </td>
            `;

            // Attach Action Listeners
            tr.querySelector(".action-icon-btn.edit").addEventListener("click", () => setupEditForm(evt.id));
            tr.querySelector(".action-icon-btn.delete").addEventListener("click", () => deleteEventPrompt(evt.id));

            manageEventsTbody.appendChild(tr);
        });
    }

    if (manageSearchInput) {
        manageSearchInput.addEventListener("input", (e) => {
            renderManageTable(e.target.value.trim());
        });
    }

    function setupEditForm(eventId) {
        if (!window.EventDB) return;
        const events = window.EventDB.getEvents();
        const evt = events.find(e => e.id === eventId);
        if (!evt) return;

        // Switch to Edit Mode
        isEditMode = true;
        editIdInput.value = evt.id;
        eventTitle.value = evt.title;
        eventCategory.value = evt.category;
        eventDate.value = evt.date || "";
        eventLocation.value = evt.location;
        eventDescription.value = evt.description;

        // Clone images list into memory
        eventImages = [...evt.images];
        refreshImagesPreview();

        // Update titles and cancel displays
        formHeading.innerText = "Modify Event: " + evt.title;
        btnCancelEdit.style.display = "inline-block";

        switchTab("tab-add");
    }

    function deleteEventPrompt(eventId) {
        if (confirm("Are you sure you want to permanently delete this event project? This action cannot be undone.")) {
            window.EventDB.deleteEvent(eventId);
            renderManageTable(manageSearchInput ? manageSearchInput.value.trim() : "");
            updateStats();
        }
    }

    // 6. Categories Editor Tab
    const categoriesListUl = document.getElementById("admin-categories-list");
    const categoryAddForm = document.getElementById("category-add-form");
    const newCategoryInput = document.getElementById("new-category-name");

    function renderCategoriesTab() {
        if (!categoriesListUl || !window.EventDB) return;
        categoriesListUl.innerHTML = "";
        
        const categories = window.EventDB.getCategories();
        
        categories.forEach(cat => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span>${cat}</span>
                <button class="btn-text-danger" data-cat="${cat}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            
            li.querySelector("button").addEventListener("click", (e) => {
                const targetCat = e.currentTarget.getAttribute("data-cat");
                deleteCategoryPrompt(targetCat);
            });

            categoriesListUl.appendChild(li);
        });
    }

    if (categoryAddForm) {
        categoryAddForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newCat = newCategoryInput.value.trim();
            if (!newCat) return;

            const categories = window.EventDB.getCategories();
            if (categories.includes(newCat)) {
                alert("This category already exists.");
                return;
            }

            categories.push(newCat);
            window.EventDB.saveCategories(categories);
            
            newCategoryInput.value = "";
            renderCategoriesTab();
            populateCategorySelect(); // update form dropdown
            updateStats();
        });
    }

    function deleteCategoryPrompt(categoryName) {
        const events = window.EventDB.getEvents();
        const linkedEvents = events.filter(e => e.category === categoryName);
        
        if (linkedEvents.length > 0) {
            alert(`Cannot delete category "${categoryName}" because there are ${linkedEvents.length} event projects currently assigned to it. Please reassign or delete these projects first.`);
            return;
        }

        if (confirm(`Are you sure you want to delete the category "${categoryName}"?`)) {
            let categories = window.EventDB.getCategories();
            categories = categories.filter(c => c !== categoryName);
            window.EventDB.saveCategories(categories);
            
            renderCategoriesTab();
            populateCategorySelect();
            updateStats();
        }
    }

    function populateCategorySelect() {
        if (!eventCategory || !window.EventDB) return;
        eventCategory.innerHTML = "";
        const categories = window.EventDB.getCategories();
        
        categories.forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.innerText = cat;
            eventCategory.appendChild(opt);
        });
    }

    // 7. General Stats Updating
    const statTotalEvents = document.getElementById("stat-total-events");
    const statTotalCategories = document.getElementById("stat-total-categories");
    const statTotalImages = document.getElementById("stat-total-images");

    function updateStats() {
        if (!window.EventDB) return;
        const events = window.EventDB.getEvents();
        const categories = window.EventDB.getCategories();

        let imageCount = 0;
        events.forEach(e => {
            if (e.images) imageCount += e.images.length;
        });

        if (statTotalEvents) statTotalEvents.innerText = events.length;
        if (statTotalCategories) statTotalCategories.innerText = categories.length;
        if (statTotalImages) statTotalImages.innerText = imageCount;
    }

    // 8. Database Reset Controls
    const btnResetDb = document.getElementById("btn-reset-db");
    if (btnResetDb) {
        btnResetDb.addEventListener("click", () => {
            if (confirm("WARNING: This will wipe out all changes and restore the catalog to its default luxury demo data. Do you wish to continue?")) {
                window.EventDB.resetToDefault();
                alert("Database re-seeded successfully.");
                initializeDashboard();
                switchTab("tab-overview");
            }
        });
    }

    // ========================================================
    // TAB 5: GLOBAL IMAGES CONTROLLER
    // ========================================================
    const heroSlidesPreview = document.getElementById("hero-slides-preview");
    const heroSlideFileUpload = document.getElementById("hero-slide-file-upload");
    const heroSlideUrlInput = document.getElementById("hero-slide-url-input");
    const btnAddHeroUrl = document.getElementById("btn-add-hero-url");
    const btnSaveAboutImages = document.getElementById("btn-save-about-images");

    function renderGlobalImagesTab() {
        if (!window.EventDB) return;

        // 1. Render Hero Slides list
        const heroSlides = window.EventDB.getHeroSlides();
        renderHeroSlidesList(heroSlides);

        // 2. Render About Images inputs
        const aboutImages = window.EventDB.getAboutImages();
        for (let i = 0; i < 3; i++) {
            const imgEl = document.getElementById(`about-slot-${i}-img`);
            const urlInput = document.getElementById(`about-slot-${i}-url`);
            const fileInput = document.getElementById(`about-slot-${i}-file`);

            if (imgEl) imgEl.src = aboutImages[i] || "";
            if (urlInput) {
                // Only show if it's an external URL (doesn't start with data:image)
                if (aboutImages[i] && !aboutImages[i].startsWith("data:")) {
                    urlInput.value = aboutImages[i];
                } else {
                    urlInput.value = "";
                }
            }
            if (fileInput) fileInput.value = ""; // Clear file selector
        }
    }

    function renderHeroSlidesList(slides) {
        if (!heroSlidesPreview) return;
        heroSlidesPreview.innerHTML = "";

        if (slides.length === 0) {
            heroSlidesPreview.innerHTML = `<div class="no-images-text">No hero slides active. Please add some slides!</div>`;
            return;
        }

        slides.forEach((slideUrl, index) => {
            const thumb = document.createElement("div");
            thumb.className = "preview-thumb";
            thumb.innerHTML = `
                <img src="${slideUrl}" alt="Hero Slide ${index + 1}">
                <button type="button" class="preview-thumb-delete" data-index="${index}"><i class="fa-solid fa-trash-can"></i></button>
            `;
            
            thumb.querySelector(".preview-thumb-delete").addEventListener("click", () => {
                if (confirm("Are you sure you want to remove this hero slide?")) {
                    const activeSlides = window.EventDB.getHeroSlides();
                    activeSlides.splice(index, 1);
                    window.EventDB.saveHeroSlides(activeSlides);
                    renderGlobalImagesTab();
                }
            });
            
            heroSlidesPreview.appendChild(thumb);
        });
    }

    // Handle Hero Slides Local File Upload
    if (heroSlideFileUpload) {
        heroSlideFileUpload.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (event) => {
                const base64Url = event.target.result;
                const activeSlides = window.EventDB.getHeroSlides();
                activeSlides.push(base64Url);
                window.EventDB.saveHeroSlides(activeSlides);
                
                heroSlideFileUpload.value = ""; // clear selector
                renderGlobalImagesTab();
            };
            reader.readAsDataURL(file);
        });
    }

    // Handle Hero Slides URL Paste
    if (btnAddHeroUrl) {
        btnAddHeroUrl.addEventListener("click", () => {
            const url = heroSlideUrlInput.value.trim();
            if (!url) return;

            if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:image")) {
                const activeSlides = window.EventDB.getHeroSlides();
                activeSlides.push(url);
                window.EventDB.saveHeroSlides(activeSlides);
                
                heroSlideUrlInput.value = "";
                renderGlobalImagesTab();
            } else {
                alert("Please enter a valid image URL starting with http:// or https://");
            }
        });
    }

    // Save About Images (symmetrical circles)
    if (btnSaveAboutImages) {
        btnSaveAboutImages.addEventListener("click", async () => {
            btnSaveAboutImages.innerText = "Saving Showcase...";
            btnSaveAboutImages.disabled = true;

            const finalImages = [];
            const currentAboutImages = window.EventDB.getAboutImages();

            for (let i = 0; i < 3; i++) {
                const fileInput = document.getElementById(`about-slot-${i}-file`);
                const urlInput = document.getElementById(`about-slot-${i}-url`);

                // Check file upload first
                if (fileInput && fileInput.files && fileInput.files[0]) {
                    const base64 = await readAsDataURLAsync(fileInput.files[0]);
                    finalImages.push(base64);
                } 
                // Then check URL paste
                else if (urlInput && urlInput.value.trim()) {
                    finalImages.push(urlInput.value.trim());
                } 
                // Fallback to previous image
                else {
                    finalImages.push(currentAboutImages[i] || "");
                }
            }

            window.EventDB.saveAboutImages(finalImages);
            btnSaveAboutImages.innerText = "Save Circular Showcase";
            btnSaveAboutImages.disabled = false;
            
            alert("About Us circular image showcase updated successfully!");
            renderGlobalImagesTab();
        });
    }

    // Utility file reader async promise wrapper
    function readAsDataURLAsync(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // 9. Dashboard Bootstrapping
    function initializeDashboard() {
        if (sessionStorage.getItem("ee_authenticated") === "true") {
            window.initDatabase();
            updateStats();
            populateCategorySelect();
            renderManageTable();
        }
    }

    // Run immediately if already logged in
    initializeDashboard();
});
