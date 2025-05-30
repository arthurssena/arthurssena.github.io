// Google Analytics Configuration
window.dataLayer = window.dataLayer || [];
function gtag() { dataLayer.push(arguments); }
gtag("js", new Date());
gtag("config", "G-MJR5ZZF472");

// Custom Page Scripts
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Toggle
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuButton && mobileMenu) {
        const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileMenuButton.addEventListener('click', () => {
            const isCurrentlyHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(!isCurrentlyHidden));
            mobileMenu.setAttribute('aria-hidden', String(isCurrentlyHidden));
        });
        if (mobileNavLinks) {
            mobileNavLinks.forEach(link => {
                link.addEventListener('click', () => {
                    mobileMenu.classList.add('hidden');
                    mobileMenuButton.setAttribute('aria-expanded', 'false');
                    mobileMenu.setAttribute('aria-hidden', 'true');
                });
            });
        }
    }

    // Smooth scroll, Current Year, ScrollToTop, Header animation (keep these as they are)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const isFileLink = this.getAttribute('href') !== '#' && !this.getAttribute('href').startsWith('#');
            if (isFileLink) { return; }
            if (this.getAttribute('href').startsWith('#')) { e.preventDefault(); }
            const targetId = this.getAttribute('href');
            if (targetId && targetId.startsWith('#') && targetId.length > 1) {
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerOffset = document.querySelector('header')?.offsetHeight || 80;
                    const elementPosition = targetElement.getBoundingClientRect().top;
                    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                    window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
                }
            }
        });
    });
    const currentYearEl = document.getElementById('currentYear');
    if (currentYearEl) currentYearEl.textContent = new Date().getFullYear();
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    if (scrollToTopBtn) {
        window.addEventListener('scroll', () => {
            if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
                scrollToTopBtn.classList.remove('hidden');
            } else {
                scrollToTopBtn.classList.add('hidden');
            }
        });
        scrollToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
    const header = document.querySelector('header');
    if (header) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 60) {
                header.classList.remove('bg-white/80', 'shadow-lg');
                header.classList.add('bg-white/95', 'backdrop-blur-xl', 'shadow-2xl');
            } else {
                header.classList.remove('bg-white/95', 'backdrop-blur-xl', 'shadow-2xl');
                header.classList.add('bg-white/80', 'shadow-lg');
            }
        });
    }
    const generalFadeInSections = document.querySelectorAll('.fade-in-section:not(#publications)');
    if (generalFadeInSections.length > 0) {
        const genericObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } });
        }, { threshold: 0.1 });
        generalFadeInSections.forEach(section => genericObserver.observe(section));
    }
    const publicationsSection = document.getElementById('publications');
    const publicationsTitleArea = document.getElementById('publications-title-area');
    if (publicationsSection && publicationsTitleArea && publicationsSection.classList.contains('fade-in-section')) {
        const publicationsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => { if (entry.isIntersecting) { publicationsSection.classList.add('is-visible'); observer.unobserve(publicationsTitleArea); } });
        }, { threshold: 0.1 });
        publicationsObserver.observe(publicationsTitleArea);
    }

    // --- Publication Loading and Tabs Logic ---
    const tabButtons = document.querySelectorAll('#publication-tabs .tab-button');
    const publicationCategories = [
        { id: 'journal-papers-content', file: 'journals.html', count: 0, name: 'Journal Papers', h3Element: null, loaded: false, items: [] },
        { id: 'magazine-papers-content', file: 'magazines.html', count: 0, name: 'Magazine Papers', h3Element: null, loaded: false, items: [] },
        { id: 'conference-papers-content', file: 'conferences.html', count: 0, name: 'Conference Papers', h3Element: null, loaded: false, items: [] },
        { id: 'bookchapter-papers-content', file: 'bookchapters.html', count: 0, name: 'Book Chapters', h3Element: null, loaded: false, items: [] }
    ];
    const allPublicationsSortedContainer = document.getElementById('all-publications-sorted-content');
    const allPublicationsSortedOl = allPublicationsSortedContainer?.querySelector('ol.publication-list');
    let allPublicationListItems = []; // To store all <li> elements for sorting
    let allItemsCollectedAndSorted = false;

    async function loadPublicationContent(category) {
        const contentDiv = document.getElementById(category.id);
        if (contentDiv) {
            category.h3Element = contentDiv.querySelector('h3');
            if (!category.loaded) {
                try {
                    const response = await fetch(category.file);
                    if (!response.ok) {
                        console.error(`Failed to load ${category.file}: ${response.statusText}`);
                        if (category.h3Element) {
                           const errorMsgElement = document.createElement('p');
                           errorMsgElement.className = 'text-center text-red-500 py-4';
                           errorMsgElement.textContent = `Error loading ${category.name}. File not found or server error.`;
                           category.h3Element.parentNode.insertBefore(errorMsgElement, category.h3Element.nextSibling);
                        }
                        category.count = 0; category.items = []; category.loaded = true; return;
                    }
                    const html = await response.text();
                    if (category.h3Element) {
                        const tempDiv = document.createElement('div'); tempDiv.innerHTML = html;
                        const olElement = tempDiv.querySelector('ol.publication-list');
                        if (olElement) {
                             category.h3Element.parentNode.insertBefore(olElement, category.h3Element.nextSibling);
                             const listItems = olElement.querySelectorAll('li');
                             category.count = listItems.length;
                             category.items = Array.from(listItems); // Store actual li elements
                        } else {
                            console.warn(`No <ol class="publication-list"> found in ${category.file}`);
                            const infoMsgElement = document.createElement('p');
                            infoMsgElement.className = 'text-center text-slate-500 py-4';
                            infoMsgElement.textContent = `No publications currently listed for ${category.name}.`;
                            category.h3Element.parentNode.insertBefore(infoMsgElement, category.h3Element.nextSibling);
                            category.count = 0; category.items = [];
                        }
                    } else { /* ... error handling for missing H3 ... */ category.count = 0; category.items = [];}
                    category.loaded = true;
                } catch (error) { /* ... error handling ... */ category.count = 0; category.items = []; category.loaded = true; }
            } else { // Already loaded
                const olElement = contentDiv.querySelector('ol.publication-list');
                category.items = olElement ? Array.from(olElement.querySelectorAll('li')) : [];
                category.count = category.items.length;
            }
        } else { /* ... error handling for missing contentDiv ... */ category.count = 0; category.items = []; category.loaded = true; }
    }

    function collectAndSortAllItems() {
        if (allItemsCollectedAndSorted) return;
        allPublicationListItems = [];
        publicationCategories.forEach(category => {
            allPublicationListItems.push(...category.items);
        });

        allPublicationListItems.sort((a, b) => {
            const yearA = parseInt(a.dataset.year, 10) || 0;
            const yearB = parseInt(b.dataset.year, 10) || 0;
            if (yearB !== yearA) {
                return yearB - yearA; // Sort by year descending
            }
            // Optional: Add secondary sort criteria if years are the same
            // For example, by title (if you add data-title to your LIs)
            // const titleA = a.querySelector('h4')?.textContent.toLowerCase() || '';
            // const titleB = b.querySelector('h4')?.textContent.toLowerCase() || '';
            // return titleA.localeCompare(titleB);
            return 0; // Keep original relative order for same year if no secondary sort
        });
        allItemsCollectedAndSorted = true;
    }

    function displayAllSortedPublications() {
        if (!allPublicationsSortedOl) return;
        collectAndSortAllItems(); // Ensure items are collected and sorted

        allPublicationsSortedOl.innerHTML = ''; // Clear previous items
        allPublicationListItems.forEach(item => {
            allPublicationsSortedOl.appendChild(item.cloneNode(true)); // CLONE items
        });
    }

    async function initializePublications() {
        const loadPromises = publicationCategories.map(cat => loadPublicationContent(cat));
        await Promise.all(loadPromises);

        // Counts for chart are now derived from category.count after loading
        const journalCount = publicationCategories.find(c => c.id === 'journal-papers-content')?.count || 0;
        const magazineCount = publicationCategories.find(c => c.id === 'magazine-papers-content')?.count || 0;
        const conferenceCount = publicationCategories.find(c => c.id === 'conference-papers-content')?.count || 0;
        const bookchapterCount = publicationCategories.find(c => c.id === 'bookchapter-papers-content')?.count || 0;
        const totalPublications = journalCount + magazineCount + conferenceCount + bookchapterCount;

        const totalPublicationsTextElement = document.getElementById('total-publications-text');
        if (totalPublicationsTextElement) {
            totalPublicationsTextElement.textContent = `Number of works: ${totalPublications}`;
        }

        const ctx = document.getElementById('publicationChart')?.getContext('2d');
        if (ctx) {
            // ... (Chart.js initialization logic - should be the same as before, using these counts)
            const allCounts = [journalCount, conferenceCount, magazineCount, bookchapterCount];
            const maxCount = Math.max(...allCounts, 1);
            let yAxisMax = maxCount + 2; // Default to max + 2 for y-axis
            if (maxCount > 0 && maxCount <= 5) { yAxisMax = maxCount +1; if (maxCount === 1) yAxisMax = 2; }
            else if (maxCount === 0) { yAxisMax = 5; }

            new Chart(ctx, { /* ... chart config ... */
                type: 'bar',
                data: {
                    labels: ['Journal Papers', 'Conference Papers', 'Magazine Papers', 'Book Chapters'],
                    datasets: [{
                        label: 'Total', data: allCounts,
                        backgroundColor: ['rgba(59, 130, 246, 0.7)','rgba(99, 102, 241, 0.7)','rgba(14, 165, 233, 0.7)','rgba(156, 163, 175, 0.7)'],
                        borderColor: ['rgba(59, 130, 246, 1)','rgba(99, 102, 241, 1)','rgba(14, 165, 233, 1)','rgba(156, 163, 175, 1)'],
                        borderWidth: 1, borderRadius: 6,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: { beginAtZero: true, max: yAxisMax, ticks: { stepSize: (maxCount < 10 && maxCount > 0 && yAxisMax <= maxCount +1 && yAxisMax > 1) ? 1 : Math.max(1, Math.ceil(yAxisMax / 5)), color: '#4b5563' }, grid: { color: '#e5e7eb' } },
                        x: { ticks: { color: '#4b5563' }, grid: { display: false } }
                    },
                    plugins: { legend: { display: false }, title: { display: false } }
                }
            });
        }
        setupTabs();
    }

    function filterPublications(filter) {
        // Deactivate all individual category titles and hide all content sections
        publicationCategories.forEach(category => {
            if (category.h3Element) {
                category.h3Element.classList.remove('active-category-title');
            }
            const contentDiv = document.getElementById(category.id);
            if (contentDiv) contentDiv.classList.add('hidden');
        });
        if (allPublicationsSortedContainer) allPublicationsSortedContainer.classList.add('hidden');

        // Activate the correct tab button
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });

        if (filter === 'all') {
            if (allPublicationsSortedContainer) {
                displayAllSortedPublications(); // Populate and sort
                allPublicationsSortedContainer.classList.remove('hidden');
                // Ensure the "All Publications (Sorted by Year)" h3 does not get active styling meant for individual cats
                const allPubsH3 = allPublicationsSortedContainer.querySelector('h3');
                if (allPubsH3) allPubsH3.classList.remove('active-category-title');
            }
        } else {
            const activeCategory = publicationCategories.find(cat => cat.id.startsWith(filter));
            if (activeCategory) {
                const contentDiv = document.getElementById(activeCategory.id);
                if (contentDiv) contentDiv.classList.remove('hidden');
                if (activeCategory.h3Element) {
                    activeCategory.h3Element.classList.add('active-category-title');
                }
            }
        }
    }

    function setupTabs() {
        if (tabButtons.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterPublications(button.dataset.filter);
                });
            });
            const defaultFilterValue = 'all';
            filterPublications(defaultFilterValue); // Apply initial filter
        }
    }

    initializePublications();
}); // End DOMContentLoaded