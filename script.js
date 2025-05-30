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
    if (mobileMenuButton && mobileMenu) { // Ensure elements exist
        const mobileNavLinks = mobileMenu.querySelectorAll('.mobile-nav-link');
        mobileMenuButton.addEventListener('click', () => {
            const isCurrentlyHidden = mobileMenu.classList.contains('hidden');
            mobileMenu.classList.toggle('hidden');
            mobileMenuButton.setAttribute('aria-expanded', String(!isCurrentlyHidden));
            mobileMenu.setAttribute('aria-hidden', String(isCurrentlyHidden));
        });

        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
                mobileMenuButton.setAttribute('aria-expanded', 'false');
                mobileMenu.setAttribute('aria-hidden', 'true');
            });
        });
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

    // --- Enhanced Fade-In Logic ---
    const generalFadeInSections = document.querySelectorAll('.fade-in-section:not(#publications)');
    if (generalFadeInSections.length > 0) {
        const genericObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });
        generalFadeInSections.forEach(section => genericObserver.observe(section));
    }

    const publicationsSection = document.getElementById('publications');
    const publicationsTitleArea = document.getElementById('publications-title-area');
    if (publicationsSection && publicationsTitleArea && publicationsSection.classList.contains('fade-in-section')) {
        const publicationsObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    publicationsSection.classList.add('is-visible');
                    observer.unobserve(publicationsTitleArea);
                }
            });
        }, { threshold: 0.1 });
        publicationsObserver.observe(publicationsTitleArea);
    }

    // --- Publication Loading and Tabs Logic ---
    const tabButtons = document.querySelectorAll('#publication-tabs .tab-button');
    const publicationCategories = [
        { id: 'journal-papers-content', file: 'journals.html', count: 0, name: 'Journal Papers' },
        { id: 'magazine-papers-content', file: 'magazines.html', count: 0, name: 'Magazine Papers' },
        { id: 'conference-papers-content', file: 'conferences.html', count: 0, name: 'Conference Papers' },
        { id: 'bookchapter-papers-content', file: 'bookchapters.html', count: 0, name: 'Book Chapters' }
    ];

    async function loadPublicationContent(category) {
        const contentDiv = document.getElementById(category.id);
        if (contentDiv && !category.loaded) { // Check if already loaded
            try {
                const response = await fetch(category.file);
                if (!response.ok) {
                    console.error(`Failed to load ${category.file}: ${response.statusText}`);
                    contentDiv.innerHTML = `<p class="text-center text-red-500">Error loading ${category.name}.</p>`;
                    category.count = 0; // Set count to 0 on error
                    category.loaded = true; // Mark as "loaded" to prevent retries
                    return;
                }
                const html = await response.text();
                // Find the h3 and append the fetched OL after it, or just set innerHTML if h3 is static
                const h3 = contentDiv.querySelector('h3');
                if (h3) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = html; // This should be the <ol>...</ol>
                    const olElement = tempDiv.querySelector('ol.publication-list');
                    if (olElement) {
                         h3.parentNode.insertBefore(olElement, h3.nextSibling);
                         category.count = olElement.querySelectorAll('li').length;
                    } else {
                        console.warn(`No <ol class="publication-list"> found in ${category.file}`);
                        category.count = 0;
                    }
                } else { // Fallback if h3 isn't there, just inject
                    contentDiv.innerHTML += html;
                    const olElement = contentDiv.querySelector('ol.publication-list');
                    category.count = olElement ? olElement.querySelectorAll('li').length : 0;
                }
                category.loaded = true;
            } catch (error) {
                console.error(`Error fetching ${category.file}:`, error);
                contentDiv.innerHTML = `<p class="text-center text-red-500">Error loading ${category.name}.</p>`;
                category.count = 0;
                category.loaded = true;
            }
        } else if (contentDiv && category.loaded) {
            // Content already loaded, ensure count is correct if it was somehow missed.
            // This might be redundant if initial load is robust.
            const olElement = contentDiv.querySelector('ol.publication-list');
            category.count = olElement ? olElement.querySelectorAll('li').length : 0;
        }
    }

    async function initializePublications() {
        const loadPromises = publicationCategories.map(cat => loadPublicationContent(cat));
        await Promise.all(loadPromises);

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
            const maxCount = Math.max(journalCount, conferenceCount, magazineCount, bookchapterCount, 1);
            let yAxisMax = Math.ceil((maxCount + (maxCount > 10 ? 5 : 2)) / (maxCount > 10 ? 5 : 1)) * (maxCount > 10 ? 5 : 1);
            if (maxCount <= 5 && maxCount > 0) yAxisMax = maxCount + (maxCount < 5 ? 1 : 0) ; if (maxCount ===1) yAxisMax = 2;
            if (maxCount === 0) yAxisMax = 5;

            new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: ['Journal Papers', 'Conference Papers', 'Magazine Papers', 'Book Chapters'],
                    datasets: [{
                        label: 'Number of Publications',
                        data: [journalCount, conferenceCount, magazineCount, bookchapterCount],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.7)', 'rgba(99, 102, 241, 0.7)',
                            'rgba(14, 165, 233, 0.7)', 'rgba(156, 163, 175, 0.7)'
                        ],
                        borderColor: [
                            'rgba(59, 130, 246, 1)', 'rgba(99, 102, 241, 1)',
                            'rgba(14, 165, 233, 1)', 'rgba(156, 163, 175, 1)'
                        ],
                        borderWidth: 1, borderRadius: 6,
                    }]
                },
                options: {
                    responsive: true, maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true, max: yAxisMax,
                            ticks: { stepSize: (maxCount < 10 && maxCount > 0 && yAxisMax <= maxCount +1) ? 1 : Math.ceil(yAxisMax / 5), color: '#4b5563' },
                            grid: { color: '#e5e7eb' }
                        },
                        x: { ticks: { color: '#4b5563' }, grid: { display: false } }
                    },
                    plugins: {
                        legend: { display: false },
                        title: {
                            display: true, text: 'Publications Overview', padding: { top: 10, bottom: 20 },
                            font: { size: 16, weight: '600', family: 'Inter, sans-serif' }, color: '#1f2937'
                        }
                    }
                }
            });
        }
        setupTabs();
    }

    function filterPublications(filter) {
        tabButtons.forEach(button => {
            button.classList.toggle('active', button.dataset.filter === filter);
        });

        publicationCategories.forEach(category => {
            const contentDiv = document.getElementById(category.id);
            if (contentDiv) {
                if (filter === 'all' || category.id.startsWith(filter)) {
                    contentDiv.classList.remove('hidden');
                } else {
                    contentDiv.classList.add('hidden');
                }
            }
        });
    }

    function setupTabs() {
        if (tabButtons.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    filterPublications(button.dataset.filter);
                });
            });

            const defaultFilterValue = 'all';
            const defaultActiveTab = document.querySelector(`#publication-tabs .tab-button[data-filter="${defaultFilterValue}"]`);
            
            if (defaultActiveTab) {
                filterPublications(defaultFilterValue); // Apply filter first
                defaultActiveTab.classList.add('active'); // Then set active class
            } else if (tabButtons.length > 0) {
                tabButtons[0].classList.add('active');
                filterPublications(tabButtons[0].dataset.filter);
            }
        }
    }

    initializePublications();

}); // End DOMContentLoaded