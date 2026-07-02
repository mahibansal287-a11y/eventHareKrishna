// data.js - Data access layer and default seeding for Hare Krishna Creations

const DEFAULT_CATEGORIES = [
    "Corporate Events",
    "Weddings & Socials",
    "Branding & LED Signage",
    "Exhibitions & Fabrications"
];

const DEFAULT_EVENTS = [
    {
        id: "evt-1",
        title: "Grand Corporate Tech Summit",
        category: "Corporate Events",
        description: "A high-profile annual corporate summit hosting 1,500+ delegates. The design featured a seamless 60ft LED backdrop, custom stage fabrications, interactive digital registrations, and high-performance sound & lighting systems. The branding elements were aligned perfectly with the corporate identity.",
        date: "2025-11-12",
        location: "Grand Hyatt, Mumbai",
        images: [
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-2",
        title: "The Royal Rajasthani Mandap",
        category: "Weddings & Socials",
        description: "A breathtaking traditional wedding ceremony styled with royal grandeur. The venue was decorated with over 8,000 imported roses and carnations, custom gold-carved pillars, cascading crystal wisterias, and warm brass candle lamps reflecting off water structures at sunset.",
        date: "2025-12-05",
        location: "Taj Palace, New Delhi",
        images: [
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-3",
        title: "Corporate Atelier Glow Signage",
        category: "Branding & LED Signage",
        description: "An end-to-end premium branding installation. Designed and fabricated a series of weather-resistant, dual-sided outdoor LED glow sign boards, custom-printed high-gloss vinyl window branding, and custom-lit acrylic structural signage for corporate offices.",
        date: "2025-10-22",
        location: "DLF CyberCity, Gurugram",
        images: [
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1572021335469-31706a17aaef?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-4",
        title: "National Automotive Trade Pavilion",
        category: "Exhibitions & Fabrications",
        description: "A custom-fabricated, double-decker exhibition stall spanning 150 sq. meters. Designed with interactive screen walls, bespoke meeting pods, clean product display platforms, high-impact backlit vinyl branding, and a dedicated lounge zone.",
        date: "2026-02-18",
        location: "Pragati Maidan, New Delhi",
        images: [
            "https://images.unsplash.com/photo-1565034946487-077786996e27?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-5",
        title: "Luminous Indigo Sangeet",
        category: "Weddings & Socials",
        description: "A grand social sangeet night blending contemporary pixel-mapped light grids with traditional Moroccan screens. Features hanging floral installations, customized blue-gold low-seating lounges, and a state-of-the-art stage setup with intelligent moving lights.",
        date: "2026-01-10",
        location: "Umaid Bhawan, Jodhpur",
        images: [
            "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200"
        ]
    }
];

// Initialize Storage
function initDatabase() {
    // If it's the old eternal_events database or older schema, reset it to load all new images
    if (localStorage.getItem("eternal_events")) {
        const events = JSON.parse(localStorage.getItem("eternal_events"));
        // Reset if we don't have multiple images loaded in corporate events
        if (events.length > 0 && (!events[0].images || events[0].images.length < 3)) {
            localStorage.removeItem("eternal_events");
            localStorage.removeItem("eternal_categories");
        }
    }
    
    if (!localStorage.getItem("eternal_events")) {
        localStorage.setItem("eternal_events", JSON.stringify(DEFAULT_EVENTS));
        localStorage.setItem("hk_creations_db_seeded", "true");
    }
    if (!localStorage.getItem("eternal_categories")) {
        localStorage.setItem("eternal_categories", JSON.stringify(DEFAULT_CATEGORIES));
    }
}

// Data Services
const EventDB = {
    getCategories: function() {
        initDatabase();
        return JSON.parse(localStorage.getItem("eternal_categories"));
    },
    saveCategories: function(categories) {
        localStorage.setItem("eternal_categories", JSON.stringify(categories));
    },
    getEvents: function() {
        initDatabase();
        return JSON.parse(localStorage.getItem("eternal_events"));
    },
    saveEvents: function(events) {
        localStorage.setItem("eternal_events", JSON.stringify(events));
    },
    addEvent: function(event) {
        const events = this.getEvents();
        event.id = "evt-" + Date.now();
        events.push(event);
        this.saveEvents(events);
        return event;
    },
    updateEvent: function(updatedEvent) {
        const events = this.getEvents();
        const index = events.findIndex(e => e.id === updatedEvent.id);
        if (index !== -1) {
            events[index] = updatedEvent;
            this.saveEvents(events);
            return true;
        }
        return false;
    },
    deleteEvent: function(id) {
        let events = this.getEvents();
        events = events.filter(e => e.id !== id);
        this.saveEvents(events);
    },
    resetToDefault: function() {
        localStorage.setItem("eternal_events", JSON.stringify(DEFAULT_EVENTS));
        localStorage.setItem("eternal_categories", JSON.stringify(DEFAULT_CATEGORIES));
        localStorage.setItem("hk_creations_db_seeded", "true");
    }
};

// Export to window object for frontend modules
window.EventDB = EventDB;
window.initDatabase = initDatabase;
