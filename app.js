// app.js - Public website interaction and dynamic loading

document.addEventListener("DOMContentLoaded", () => {
    // 1. Preloader Fadeout
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("fade-out");
        }, 1000);
    }

    // 2. Navbar Scroll Effect
    const navbar = document.querySelector(".navbar");
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // 3. Scroll Reveal Animations
    const revealElements = document.querySelectorAll(".reveal");
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add("active");
                observer.unobserve(entry.target); // Animates once
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px"
    });

    revealElements.forEach(el => revealObserver.observe(el));

    // 4. Dynamic Portfolio Load and Filtering
    const portfolioGrid = document.querySelector(".portfolio-grid");
    const filterBar = document.querySelector(".filter-bar");
    let activeCategory = "All";
    let allEvents = [];

    // Initialize/Fetch Categories & Events from LocalDB
    function loadPortfolio() {
        if (!window.EventDB) return;
        
        allEvents = window.EventDB.getEvents();
        const categories = window.EventDB.getCategories();

        // Render Category Filter Buttons
        if (filterBar) {
            filterBar.innerHTML = `<button class="filter-btn active" data-category="All">All Works</button>`;
            categories.forEach(cat => {
                filterBar.innerHTML += `<button class="filter-btn" data-category="${cat}">${cat}</button>`;
            });

            // Re-attach listeners to filter buttons
            const filterBtns = document.querySelectorAll(".filter-btn");
            filterBtns.forEach(btn => {
                btn.addEventListener("click", (e) => {
                    filterBtns.forEach(b => b.classList.remove("active"));
                    e.target.classList.add("active");
                    activeCategory = e.target.getAttribute("data-category");
                    renderGrid();
                });
            });
        }
        
        renderGrid();
    }

    // Render Events in the Masonry Grid
    function renderGrid() {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = "";

        const filteredEvents = activeCategory === "All" 
            ? allEvents 
            : allEvents.filter(e => e.category === activeCategory);

        if (filteredEvents.length === 0) {
            portfolioGrid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; padding: 60px; font-family: var(--font-serif); font-size: 1.5rem; color: var(--text-secondary);">No events found in this category.</div>`;
            return;
        }

        filteredEvents.forEach((evt, idx) => {
            const item = document.createElement("div");
            item.className = "portfolio-item reveal";
            item.setAttribute("data-id", evt.id);
            
            // Assign some index-based variations for staggered reveal
            item.style.transitionDelay = `${(idx % 3) * 0.15}s`;

            const primaryImg = evt.images && evt.images.length > 0 
                ? evt.images[0] 
                : "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200";

            item.innerHTML = `
                <img src="${primaryImg}" alt="${evt.title}" class="portfolio-img" loading="lazy">
                <div class="portfolio-overlay">
                    <span class="portfolio-cat">${evt.category}</span>
                    <h3 class="portfolio-title">${evt.title}</h3>
                    <span class="portfolio-loc">${evt.location || 'Bespoke Location'}</span>
                </div>
            `;

            // Click listener for details modal
            item.addEventListener("click", () => openLightbox(evt.id));

            portfolioGrid.appendChild(item);

            // Re-observe newly created elements for reveal animation
            setTimeout(() => {
                revealObserver.observe(item);
            }, 50);
        });
    }

    // 5. Lightbox Modal Functionality
    const lightbox = document.getElementById("lightbox");
    const lightboxContent = document.querySelector(".lightbox-content");
    const closeBtn = document.querySelector(".lightbox-close");
    let currentImgIndex = 0;
    let lightboxImagesList = [];

    function openLightbox(eventId) {
        const evt = allEvents.find(e => e.id === eventId);
        if (!evt || !lightbox) return;

        currentImgIndex = 0;
        lightboxImagesList = evt.images || [];

        // Elements within Lightbox
        const imageContainer = lightbox.querySelector(".lightbox-images");
        const detailsContainer = lightbox.querySelector(".lightbox-details");

        // Render Images
        imageContainer.innerHTML = "";
        if (lightboxImagesList.length > 0) {
            lightboxImagesList.forEach((imgUrl, i) => {
                const img = document.createElement("img");
                img.src = imgUrl;
                img.className = `lightbox-img-item ${i === 0 ? 'active' : ''}`;
                img.alt = `${evt.title} showcase ${i + 1}`;
                imageContainer.appendChild(img);
            });
        } else {
            imageContainer.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-light);font-style:italic;">No images available</div>`;
        }

        // Setup Arrow controls if more than 1 image
        const arrowControls = lightbox.querySelector(".lightbox-arrows");
        if (lightboxImagesList.length > 1) {
            arrowControls.style.display = "flex";
        } else {
            arrowControls.style.display = "none";
        }

        // Format Date
        let formattedDate = "";
        if (evt.date) {
            const dateObj = new Date(evt.date);
            formattedDate = dateObj.toLocaleDateString("en-US", { year: 'numeric', month: 'long', day: 'numeric' });
        }

        // Render Details
        detailsContainer.innerHTML = `
            <div class="lightbox-meta">
                <span>Category: <strong>${evt.category}</strong></span>
                ${formattedDate ? `<span>•</span> <span>${formattedDate}</span>` : ''}
            </div>
            <h2 class="lightbox-title">${evt.title}</h2>
            <p class="lightbox-desc">${evt.description}</p>
            <div class="lightbox-loc-tag">
                📍 Location: ${evt.location || "Bespoke Venue"}
            </div>
            <a href="#contact" class="btn-luxury" style="text-align:center; color: var(--text-primary); border-color: var(--text-primary);" onclick="closeLightboxModal()">Inquire About This Theme</a>
        `;

        lightbox.classList.add("active");
        document.body.style.overflow = "hidden"; // Disable page scroll
    }

    window.closeLightboxModal = function() {
        if (!lightbox) return;
        lightbox.classList.remove("active");
        document.body.style.overflow = ""; // Re-enable page scroll
    };

    if (closeBtn) {
        closeBtn.addEventListener("click", closeLightboxModal);
    }

    // Close lightbox on clicking outside content
    if (lightbox) {
        lightbox.addEventListener("click", (e) => {
            if (e.target === lightbox) {
                closeLightboxModal();
            }
        });
    }

    // Image Slider Navigation Controls
    const prevBtn = document.getElementById("prev-img");
    const nextBtn = document.getElementById("next-img");

    function showImage(index) {
        const images = document.querySelectorAll(".lightbox-img-item");
        if (images.length === 0) return;
        
        images.forEach(img => img.classList.remove("active"));
        
        // Handle wrapping indexes
        if (index >= images.length) currentImgIndex = 0;
        else if (index < 0) currentImgIndex = images.length - 1;
        else currentImgIndex = index;

        images[currentImgIndex].classList.add("active");
    }

    if (prevBtn) {
        prevBtn.addEventListener("click", () => showImage(currentImgIndex - 1));
    }
    if (nextBtn) {
        nextBtn.addEventListener("click", () => showImage(currentImgIndex + 1));
    }

    // Contact Form Animated Feedback
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const submitBtn = contactForm.querySelector("button[type='submit']");
            const originalText = submitBtn.innerText;
            submitBtn.innerText = "Sending Inquiry...";
            submitBtn.disabled = true;

            setTimeout(() => {
                alert("Thank you for reaching out. A representative from Hare Krishna Creations will contact you shortly.");
                contactForm.reset();
                submitBtn.innerText = originalText;
                submitBtn.disabled = false;
            }, 1200);
        });
    }

    // 6. Floating Design/Theme Switcher Logic
    const themeBtns = document.querySelectorAll(".theme-btn");
    
    function applyTheme(themeName) {
        document.body.setAttribute("data-theme", themeName);
        localStorage.setItem("hk_theme", themeName);
        
        // Update active class on buttons
        themeBtns.forEach(btn => {
            if (btn.getAttribute("data-theme") === themeName) {
                btn.classList.add("active");
            } else {
                btn.classList.remove("active");
            }
        });
    }

    if (themeBtns.length > 0) {
        // Load initial theme
        const savedTheme = localStorage.getItem("hk_theme") || "d1";
        applyTheme(savedTheme);

        // Click listeners
        themeBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTheme = btn.getAttribute("data-theme");
                applyTheme(targetTheme);
            });
        });
    }

    // Initialize Website
    loadPortfolio();

    // Export refresh interface (so admin script can trigger reload if testing locally)
    window.refreshPortfolio = loadPortfolio;
});
