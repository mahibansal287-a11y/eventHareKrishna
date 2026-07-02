// data.js - Data access layer and default seeding

const DEFAULT_CATEGORIES = [
    "Royal Weddings",
    "Elegant Receptions",
    "Sangeet & Mehendi",
    "Floral Installations",
    "Intimate Gatherings"
];

const DEFAULT_EVENTS = [
    {
        id: "evt-1",
        title: "The Regal Lake Palace Affair",
        category: "Royal Weddings",
        description: "A breathtaking celebration styled with royal Rajasthani grandeur. The design featured 10,000 fresh white roses, gold-gilded arches, custom-woven ivory silk drapes, and hundreds of brass oil lamps reflecting off the lake at twilight. The centerpiece was a floating mandap adorned with cascading orchids.",
        date: "2025-11-12",
        location: "Taj Lake Palace, Udaipur",
        images: [
            "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1519225495810-7512c696505a?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-2",
        title: "Crystal & Emerald Reception",
        category: "Elegant Receptions",
        description: "A glamorous evening under a canopy of thousands of crystal shards, accented by lush emerald velvet details and gold chrome finishes. Tables featured bespoke tall candelabras, custom calligraphed menus on handmade paper, and soft green atmospheric uplighting that transformed the ballroom into an enchanted forest.",
        date: "2025-12-05",
        location: "The Leela Palace, New Delhi",
        images: [
            "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1543807535-eceef0bc6599?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-3",
        title: "Luminous Indigo Sangeet",
        category: "Sangeet & Mehendi",
        description: "A high-octane celebration of music and color, featuring a futuristic pixel-mapped lighting grid blended with classic Moroccan lanterns. Hanging brass floral screens, customized low-seating lounges in sapphire blue and rich mustard, and a state-of-the-art interactive dance floor.",
        date: "2025-10-22",
        location: "Umaid Bhawan Palace, Jodhpur",
        images: [
            "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-4",
        title: "Ethereal Glasshouse Florals",
        category: "Floral Installations",
        description: "An indoor garden installation designed to look like an overgrown, luxurious English greenhouse. Custom iron pergolas loaded with climbing jasmine, white wisteria, and pale pink hydrangeas, creating a romantic scent and a magical, fairytale aesthetic.",
        date: "2026-02-18",
        location: "The Oberoi Udaivilas, Udaipur",
        images: [
            "https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&q=80&w=1200",
            "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&q=80&w=1200"
        ]
    },
    {
        id: "evt-5",
        title: "Golden Hour Tuscan Lunch",
        category: "Intimate Gatherings",
        description: "An intimate anniversary lunch setup for 30 distinguished guests. Long wooden rustic tables paired with cross-back chairs, soft linen runners, clusters of fresh citrus, olive branches, and trailing eucalyptus, bathed in the natural golden light of a late winter afternoon.",
        date: "2026-01-10",
        location: "Private Estate, Alibaug",
        images: [
            "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&q=80&w=1200"
        ]
    }
];

// Initialize Storage
function initDatabase() {
    if (!localStorage.getItem("eternal_events")) {
        localStorage.setItem("eternal_events", JSON.stringify(DEFAULT_EVENTS));
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
    }
};

// Export to window object for frontend modules
window.EventDB = EventDB;
window.initDatabase = initDatabase;
