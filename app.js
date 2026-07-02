// app.js - Public website interaction and dynamic loading

document.addEventListener("DOMContentLoaded", () => {
    // 1. Mobile Menu Toggle
    const menuToggle = document.querySelector(".menu-toggle");
    const navLinks = document.querySelector(".nav-links");
    if (menuToggle && navLinks) {
        menuToggle.addEventListener("click", () => {
            const isActive = menuToggle.classList.toggle("active");
            navLinks.classList.toggle("active");
            menuToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
        });
        
        // Close menu when a link is clicked
        const links = navLinks.querySelectorAll("a");
        links.forEach(link => {
            link.addEventListener("click", () => {
                menuToggle.classList.remove("active");
                navLinks.classList.remove("active");
                menuToggle.setAttribute("aria-expanded", "false");
            });
        });
    }

    // 2. Preloader Fadeout
    const preloader = document.getElementById("preloader");
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add("fade-out");
        }, 1000);
    }

    // Dynamic Hero Slides and About Images Loading
    const heroSlider = document.querySelector(".hero-slider");
    if (heroSlider && window.EventDB) {
        const slidesList = window.EventDB.getHeroSlides();
        heroSlider.innerHTML = "";
        slidesList.forEach((slideUrl, i) => {
            const slide = document.createElement("div");
            slide.className = `hero-slide ${i === 0 ? 'active' : ''}`;
            slide.style.backgroundImage = `linear-gradient(to bottom, rgba(0, 0, 0, 0.55), rgba(0, 0, 0, 0.8)), url('${slideUrl}')`;
            heroSlider.appendChild(slide);
        });
    }

    const aboutLeftImg = document.querySelector(".story-img-left");
    const aboutMainImg = document.querySelector(".story-img-main");
    const aboutRightImg = document.querySelector(".story-img-right");
    if (window.EventDB) {
        const aboutImages = window.EventDB.getAboutImages();
        if (aboutImages && aboutImages.length >= 3) {
            if (aboutLeftImg) aboutLeftImg.src = aboutImages[0];
            if (aboutMainImg) aboutMainImg.src = aboutImages[1];
            if (aboutRightImg) aboutRightImg.src = aboutImages[2];
        }
    }

    // Hero Slideshow Controller
    const slides = document.querySelectorAll(".hero-slide");
    let currentSlideIndex = 0;
    if (slides.length > 0) {
        setInterval(() => {
            slides[currentSlideIndex].classList.remove("active");
            currentSlideIndex = (currentSlideIndex + 1) % slides.length;
            slides[currentSlideIndex].classList.add("active");
        }, 5000);
    }

    // Milestones Count-Up Animation
    const milestonesSection = document.getElementById("milestones");
    const milestoneNumbers = document.querySelectorAll("#milestones span[style*='font-size: 3.5rem']");
    let milestonesAnimated = false;

    function animateCountUp(el, targetValue) {
        let start = 0;
        const duration = 1500; // ms
        const stepTime = Math.abs(Math.floor(duration / targetValue));
        const originalSymbol = el.innerText.includes("+") ? "+" : el.innerText.includes("%") ? "%" : "";
        
        const timer = setInterval(() => {
            start += Math.ceil(targetValue / 50); // count up in steps
            if (start >= targetValue) {
                start = targetValue;
                clearInterval(timer);
            }
            el.innerText = start + originalSymbol;
        }, 30);
    }

    const milestonesObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !milestonesAnimated) {
                milestonesAnimated = true;
                milestoneNumbers.forEach(numSpan => {
                    const cleanText = numSpan.innerText.replace("+", "").replace("%", "");
                    const val = parseInt(cleanText);
                    if (!isNaN(val)) {
                        animateCountUp(numSpan, val);
                    }
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.25 });

    if (milestonesSection) {
        milestonesObserver.observe(milestonesSection);
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

            const imagesList = evt.images && evt.images.length > 0 
                ? evt.images 
                : ["https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200"];

            item.innerHTML = `
                <div class="portfolio-slides-wrapper" style="position: absolute; top: 0; left: 0; width: 100%; height: calc(100% - 65px); overflow: hidden; border-radius: 2px 2px 0 0;">
                    ${imagesList.map((imgUrl, i) => `
                        <img src="${imgUrl}" alt="${evt.title}" class="portfolio-img ${i === 0 ? 'active' : ''}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; opacity: ${i === 0 ? 1 : 0}; transition: opacity 0.8s ease-in-out;" loading="lazy">
                    `).join('')}
                    
                    <!-- Manual Slide Dots -->
                    ${imagesList.length > 1 ? `
                    <div class="card-slide-dots" style="position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 6px; z-index: 10; background: rgba(0, 0, 0, 0.4); padding: 4px 8px; border-radius: 10px;">
                        ${imagesList.map((_, i) => `
                            <span class="card-dot ${i === 0 ? 'active' : ''}" data-index="${i}" style="width: 6px; height: 6px; border-radius: 50%; background: ${i === 0 ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'}; cursor: pointer; transition: background 0.3s ease;"></span>
                        `).join('')}
                    </div>
                    ` : ''}
                </div>
                <div class="portfolio-overlay">
                    <span class="portfolio-cat">${evt.category}</span>
                    <h3 class="portfolio-title">${evt.title}</h3>
                    <span class="portfolio-loc">${evt.location || 'Bespoke Location'}</span>
                </div>
            `;

            // Click listener for details modal
            item.addEventListener("click", () => openLightbox(evt.id));

            // Attach click listeners to manual slide dots
            if (imagesList.length > 1) {
                const dots = item.querySelectorAll(".card-dot");
                dots.forEach(dot => {
                    dot.addEventListener("click", (e) => {
                        e.stopPropagation(); // Prevent opening lightbox
                        const targetIdx = parseInt(dot.getAttribute("data-index"));
                        const slides = item.querySelectorAll(".portfolio-img");
                        
                        slides.forEach((slide, sIdx) => {
                            if (sIdx === targetIdx) {
                                slide.classList.add("active");
                                slide.style.opacity = 1;
                            } else {
                                slide.classList.remove("active");
                                slide.style.opacity = 0;
                            }
                        });
                        
                        dots.forEach((d, dIdx) => {
                            if (dIdx === targetIdx) {
                                d.classList.add("active");
                                d.style.background = "#FFFFFF";
                            } else {
                                d.classList.remove("active");
                                d.style.background = "rgba(255, 255, 255, 0.5)";
                            }
                        });
                    });
                });
            }

            portfolioGrid.appendChild(item);

            // Re-observe newly created elements for reveal animation
            setTimeout(() => {
                revealObserver.observe(item);
            }, 50);
        });

        // Start automatic card slideshow cycling
        if (filteredEvents.length > 0) {
            clearInterval(window.cardSlideshowInterval);
            window.cardSlideshowInterval = setInterval(() => {
                const items = document.querySelectorAll(".portfolio-item");
                items.forEach(item => {
                    const slides = item.querySelectorAll(".portfolio-img");
                    if (slides.length <= 1) return;
                    
                    let activeIndex = -1;
                    slides.forEach((slide, idx) => {
                        if (slide.classList.contains("active")) {
                            activeIndex = idx;
                        }
                    });
                    
                    if (activeIndex !== -1) {
                        slides[activeIndex].classList.remove("active");
                        slides[activeIndex].style.opacity = 0;
                        
                        const nextIndex = (activeIndex + 1) % slides.length;
                        slides[nextIndex].classList.add("active");
                        slides[nextIndex].style.opacity = 1;
                        
                        // Sync dots
                        const dots = item.querySelectorAll(".card-dot");
                        dots.forEach((d, dIdx) => {
                            if (dIdx === nextIndex) {
                                d.classList.add("active");
                                d.style.background = "#FFFFFF";
                            } else {
                                d.classList.remove("active");
                                d.style.background = "rgba(255, 255, 255, 0.5)";
                            }
                        });
                    }
                });
            }, 3500);
        }

        // Start horizontal auto scroll for the portfolio grid
        if (filteredEvents.length > 3) {
            clearInterval(window.portfolioAutoScrollInterval);
            window.portfolioAutoScrollInterval = setInterval(() => {
                const maxScrollLeft = portfolioGrid.scrollWidth - portfolioGrid.clientWidth;
                if (portfolioGrid.scrollLeft >= maxScrollLeft - 10) {
                    // Loop back to start smoothly
                    portfolioGrid.scrollTo({ left: 0, behavior: 'smooth' });
                } else {
                    // Scroll by one card width (card width + gap)
                    const firstCard = portfolioGrid.querySelector(".portfolio-item");
                    if (firstCard) {
                        const cardWidth = firstCard.offsetWidth + 30; // Card width + 30px gap
                        portfolioGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
                    }
                }
            }, 4500); // Auto-scroll every 4.5 seconds

            // Pause auto-scroll when user hovers or interacts with the grid
            const pauseAutoScroll = () => clearInterval(window.portfolioAutoScrollInterval);
            const resumeAutoScroll = () => {
                clearInterval(window.portfolioAutoScrollInterval);
                window.portfolioAutoScrollInterval = setInterval(() => {
                    const maxScrollLeft = portfolioGrid.scrollWidth - portfolioGrid.clientWidth;
                    if (portfolioGrid.scrollLeft >= maxScrollLeft - 10) {
                        portfolioGrid.scrollTo({ left: 0, behavior: 'smooth' });
                    } else {
                        const firstCard = portfolioGrid.querySelector(".portfolio-item");
                        if (firstCard) {
                            const cardWidth = firstCard.offsetWidth + 30;
                            portfolioGrid.scrollBy({ left: cardWidth, behavior: 'smooth' });
                        }
                    }
                }, 4500);
            };

            portfolioGrid.addEventListener("mouseenter", pauseAutoScroll);
            portfolioGrid.addEventListener("mouseleave", resumeAutoScroll);
            portfolioGrid.addEventListener("touchstart", pauseAutoScroll, { passive: true });
            portfolioGrid.addEventListener("touchend", resumeAutoScroll, { passive: true });
        }
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
        const thumbsStrip = lightbox.querySelector("#lightbox-thumbs-strip");

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

        // Render Thumbnails
        if (thumbsStrip) {
            thumbsStrip.innerHTML = "";
            if (lightboxImagesList.length > 0) {
                lightboxImagesList.forEach((imgUrl, i) => {
                    const thumb = document.createElement("img");
                    thumb.src = imgUrl;
                    thumb.className = `lightbox-thumb-item ${i === 0 ? 'active' : ''}`;
                    thumb.alt = "Thumbnail";
                    thumb.addEventListener("click", () => showImage(i));
                    thumbsStrip.appendChild(thumb);
                });
            }
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
        const thumbs = document.querySelectorAll(".lightbox-thumb-item");
        if (images.length === 0) return;
        
        images.forEach(img => img.classList.remove("active"));
        thumbs.forEach(t => t.classList.remove("active"));
        
        // Handle wrapping indexes
        if (index >= images.length) currentImgIndex = 0;
        else if (index < 0) currentImgIndex = images.length - 1;
        else currentImgIndex = index;

        images[currentImgIndex].classList.add("active");
        if (thumbs[currentImgIndex]) {
            thumbs[currentImgIndex].classList.add("active");
            thumbs[currentImgIndex].scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        }
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
