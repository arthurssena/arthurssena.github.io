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

    // Smooth scroll for all anchor links
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

    // --- Unified Fade-In Logic ---
    const fadeInElements = document.querySelectorAll('.fade-in-section');
    if (fadeInElements.length > 0) {
        const fadeInObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target); // Unobserve after it's visible
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the element is visible
        });

        fadeInElements.forEach(element => {
            fadeInObserver.observe(element);
        });
    }
    // --- End of Unified Fade-In Logic ---

    // --- Publication Loading and Tabs Logic ---
    const tabButtons = document.querySelectorAll('#publication-tabs .tab-button');
    const publicationCategories = [
        { id: 'journal-papers-content', file: 'journals.html', count: 0, name: 'Journal Papers', h3Element: null, loaded: false, items: [], originalTitle: '' },
        { id: 'magazine-papers-content', file: 'magazines.html', count: 0, name: 'Magazine Papers', h3Element: null, loaded: false, items: [], originalTitle: '' },
        { id: 'conference-papers-content', file: 'conferences.html', count: 0, name: 'Conference Papers', h3Element: null, loaded: false, items: [], originalTitle: '' },
        { id: 'bookchapter-papers-content', file: 'bookchapters.html', count: 0, name: 'Book Chapters', h3Element: null, loaded: false, items: [], originalTitle: '' }
    ];

    const allPublicationsSortedContainer = document.getElementById('all-publications-sorted-content');
    let allPublicationsH3Element = null;
    let allPublicationsOriginalTitle = '';
    const allPublicationsSortedOl = allPublicationsSortedContainer?.querySelector('ol.publication-list');

    let allPublicationListItems = [];
    let allItemsCollectedAndSorted = false;

    async function loadPublicationContent(category) {
        const contentDiv = document.getElementById(category.id);
        if (contentDiv) {
            // category.h3Element is now captured in initializePublications
            if (!category.loaded) {
                try {
                    const response = await fetch(category.file);
                    if (!response.ok) {
                        console.error(`[PubLoad] FAILED to load ${category.file}: ${response.status} ${response.statusText}`);
                        if (category.h3Element) {
                            const errorMsgElement = document.createElement('p');
                            errorMsgElement.className = 'text-center text-red-500 py-4';
                            errorMsgElement.textContent = `Error loading ${category.name}. File not found or server error.`;
                            if (category.h3Element.nextSibling) category.h3Element.parentNode.insertBefore(errorMsgElement, category.h3Element.nextSibling);
                            else category.h3Element.parentNode.appendChild(errorMsgElement);
                        }
                        category.count = 0; category.items = []; category.loaded = true; return;
                    }
                    const html = await response.text();
                    if (category.h3Element) {
                        const tempDiv = document.createElement('div'); tempDiv.innerHTML = html;
                        const olElement = tempDiv.querySelector('ol.publication-list');
                        if (olElement) {
                            if (category.h3Element.nextSibling) category.h3Element.parentNode.insertBefore(olElement, category.h3Element.nextSibling);
                            else category.h3Element.parentNode.appendChild(olElement);
                            const listItems = olElement.querySelectorAll('li');
                            category.count = listItems.length;
                            category.items = Array.from(listItems);
                        } else {
                            const infoMsgElement = document.createElement('p');
                            infoMsgElement.className = 'text-center text-slate-500 py-4';
                            infoMsgElement.textContent = `No publications currently listed for ${category.name}.`;
                            if (category.h3Element.nextSibling) category.h3Element.parentNode.insertBefore(infoMsgElement, category.h3Element.nextSibling);
                            else category.h3Element.parentNode.appendChild(infoMsgElement);
                            category.count = 0; category.items = [];
                        }
                    } else { // Fallback if H3 somehow not found by initializePublications
                        const olContainer = document.createElement('div');
                        olContainer.innerHTML = html;
                        contentDiv.appendChild(olContainer);
                        const listItems = contentDiv.querySelectorAll('ol.publication-list li');
                        category.count = listItems.length;
                        category.items = Array.from(listItems);
                    }
                    category.loaded = true;
                } catch (error) {
                    console.error(`[PubLoad] CATCH ERROR fetching/processing ${category.file}:`, error);
                    if (category.h3Element) {
                        const errorMsgElement = document.createElement('p');
                        errorMsgElement.className = 'text-center text-red-500 py-4';
                        errorMsgElement.textContent = `Error loading ${category.name}. Check console for details.`;
                        if (category.h3Element.nextSibling) category.h3Element.parentNode.insertBefore(errorMsgElement, category.h3Element.nextSibling);
                        else category.h3Element.parentNode.appendChild(errorMsgElement);
                    }
                    category.count = 0; category.items = []; category.loaded = true;
                }
            } else { // Already loaded
                const olElement = contentDiv.querySelector('ol.publication-list');
                category.items = olElement ? Array.from(olElement.querySelectorAll('li')) : [];
                category.count = category.items.length; // Recalculate count just in case
            }
        } else {
            console.warn(`[PubLoad] Content div NOT FOUND for id: ${category.id}`);
            category.count = 0; category.items = []; category.loaded = true;
        }
    }

    function collectAndSortAllItems() {
        if (allItemsCollectedAndSorted && allPublicationListItems.length > 0) return;
        allPublicationListItems = [];
        publicationCategories.forEach(category => {
            if (category.items && category.items.length > 0) {
                allPublicationListItems.push(...category.items);
            }
        });

        allPublicationListItems.sort((a, b) => {
            const yearA = parseInt(a.dataset.year, 10) || 0;
            const yearB = parseInt(b.dataset.year, 10) || 0;
            if (yearB !== yearA) {
                return yearB - yearA;
            }
            return 0;
        });
        allItemsCollectedAndSorted = true;
    }

    function displayAllSortedPublications() {
        if (!allPublicationsSortedOl) {
            console.error('Container for sorted publications OL not found.');
            return;
        }
        collectAndSortAllItems(); // Ensure items are collected and sorted

        allPublicationsSortedOl.innerHTML = ''; // Clear previous items
        allPublicationListItems.forEach(item => {
            if (item && typeof item.cloneNode === 'function') {
                allPublicationsSortedOl.appendChild(item.cloneNode(true));
            }
        });
    }

    function updateCategoryTitlesWithCounts(totalOverallPublications) {
        publicationCategories.forEach(category => {
            if (category.h3Element && category.originalTitle) {
                category.h3Element.textContent = `${category.originalTitle} (${category.count})`;
            }
        });

        if (allPublicationsH3Element && allPublicationsOriginalTitle) {
            allPublicationsH3Element.textContent = `${allPublicationsOriginalTitle} (${totalOverallPublications})`;
        }
    }

    async function initializePublications() {
    // Capture H3 elements and their original titles (this part remains the same)
    publicationCategories.forEach(category => {
        const contentDiv = document.getElementById(category.id);
        if (contentDiv) {
            category.h3Element = contentDiv.querySelector('h3');
            if (category.h3Element) {
                category.originalTitle = category.h3Element.textContent.trim();
            } else {
                console.warn(`H3 element not found for category ${category.name} in div ${category.id}`);
            }
        } else {
            console.warn(`Content div not found for category id: ${category.id} during H3 capture.`);
        }
    });

    if (allPublicationsSortedContainer) {
        allPublicationsH3Element = allPublicationsSortedContainer.querySelector('h3');
        if (allPublicationsH3Element) {
            allPublicationsOriginalTitle = allPublicationsH3Element.textContent.trim();
        } else {
            console.warn("H3 element for 'All Publications (Sorted by Year)' container not found.");
        }
    }

    const loadPromises = publicationCategories.map(cat => loadPublicationContent(cat));
    await Promise.all(loadPromises);

    allItemsCollectedAndSorted = false;
    collectAndSortAllItems();

    const totalPublications = publicationCategories.reduce((sum, cat) => sum + cat.count, 0);

    // Update H3 titles with their respective counts
    updateCategoryTitlesWithCounts(totalPublications);

    // Initialize Chart
    const ctx = document.getElementById('publicationChart')?.getContext('2d');
    if (ctx) {
        const journalCount = publicationCategories.find(c => c.id === 'journal-papers-content')?.count || 0;
        const magazineCount = publicationCategories.find(c => c.id === 'magazine-papers-content')?.count || 0;
        const conferenceCount = publicationCategories.find(c => c.id === 'conference-papers-content')?.count || 0;
        const bookchapterCount = publicationCategories.find(c => c.id === 'bookchapter-papers-content')?.count || 0;
        const allCountsForChart = [journalCount, conferenceCount, magazineCount, bookchapterCount];
        const maxCount = Math.max(...allCountsForChart, 1);
        let yAxisMax = maxCount + 3; // Default to maxCount + 2 for better spacing
        if (maxCount > 0 && maxCount <= 5) { yAxisMax = maxCount + 1; if (maxCount === 1) yAxisMax = 2; }
        else if (maxCount === 0) { yAxisMax = 5; }

        if (typeof ChartDataLabels !== 'undefined') {
            Chart.register(ChartDataLabels);
        }

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Journal Papers', 'Conference Papers', 'Magazine Papers', 'Book Chapters'],
                datasets: [{
                    label: 'Publications', data: allCountsForChart,
                    backgroundColor: ['rgba(59, 130, 246, 0.7)','rgba(99, 102, 241, 0.7)','rgba(14, 165, 233, 0.7)','rgba(156, 163, 175, 0.7)'],
                    borderColor: ['rgba(59, 130, 246, 1)','rgba(99, 102, 241, 1)','rgba(14, 165, 233, 1)','rgba(156, 163, 175, 1)'],
                    borderWidth: 1, borderRadius: 6,
                }]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                scales: { /* ... your existing scales config ... */
                    y: { beginAtZero: true, max: yAxisMax, ticks: { stepSize: (maxCount < 10 && maxCount > 0 && yAxisMax <= maxCount + 1 && yAxisMax > 1) ? 1 : Math.max(1, Math.ceil(yAxisMax / 5)), color: '#4b5563' }, grid: { color: '#e5e7eb' } },
                    x: { ticks: { color: '#4b5563' }, grid: { display: false } }
                },
                plugins: {
                    legend: { display: false },
                    // 2. UPDATE Chart Title Configuration:
                    title: {
                        display: true,
                        text: `Total: ${totalPublications}`, // New title with the total count
                        padding: {
                            top: 0,
                            bottom: 10 // Adjust padding as needed
                        },
                        font: {
                            size: 14, // Example size
                            weight: '380',
                            family: 'Inter, sans-serif' // Match your body font
                        },
                        color: '#1f2937' // Example color (Tailwind slate-800)
                    },
                    datalabels: { // Keep your existing datalabels config
                        display: true, anchor: 'end', align: 'top', offset: 0, color: '#374151',
                        font: { weight: '380', size: 12, family: 'Inter, sans-serif' },
                        formatter: function(value) { return value > 0 ? value : ''; }
                    }
                }
            }
        });
    }
    setupTabs();
}

    function filterPublications(filter) {
        publicationCategories.forEach(category => {
            const contentDiv = document.getElementById(category.id);
            if (contentDiv) contentDiv.classList.add('hidden');
        });
        if (allPublicationsSortedContainer) allPublicationsSortedContainer.classList.add('hidden');

        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });

        if (filter === 'all') {
            if (allPublicationsSortedContainer) {
                if (!allItemsCollectedAndSorted || allPublicationListItems.length === 0) {
                    collectAndSortAllItems(); // Ensure items are collected if somehow missed
                }
                displayAllSortedPublications();
                allPublicationsSortedContainer.classList.remove('hidden');
            }
        } else {
            const activeCategory = publicationCategories.find(cat => cat.id.startsWith(filter));
            if (activeCategory) {
                const contentDiv = document.getElementById(activeCategory.id);
                if (contentDiv) contentDiv.classList.remove('hidden');
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