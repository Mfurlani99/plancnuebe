document.addEventListener('DOMContentLoaded', setupMobileHubs);

function setupMobileHubs() {
    const controls = Array.from(document.querySelectorAll('.form-hub')).map(createHubControl);
    if (!controls.length) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        if (!isMobileHub()) return;

        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY + 4 && currentScrollY > 80) {
            controls.forEach((control) => control.setExpanded(false));
        }

        if (currentScrollY < 20) {
            controls.forEach((control) => control.setExpanded(true));
        }

        lastScrollY = currentScrollY;
    }, { passive: true });

    window.addEventListener('resize', () => {
        controls.forEach((control) => control.syncToViewport());
    });
}

function createHubControl(hub) {
    const summary = hub.firstElementChild;
    const toggle = document.createElement('button');

    toggle.type = 'button';
    toggle.className = 'hub-toggle';
    toggle.setAttribute('aria-label', 'Mostrar u ocultar opciones del hub');

    if (summary) {
        summary.classList.add('hub-summary');
        summary.appendChild(toggle);
    }

    function setExpanded(expanded) {
        const shouldCollapse = isMobileHub() && !expanded;
        hub.classList.toggle('hub-collapsed', shouldCollapse);
        toggle.setAttribute('aria-expanded', String(!shouldCollapse));
        toggle.textContent = shouldCollapse ? 'Opciones' : 'Ocultar';
    }

    function syncToViewport() {
        if (!isMobileHub()) {
            setExpanded(true);
            return;
        }

        setExpanded(!hub.classList.contains('hub-collapsed'));
    }

    toggle.addEventListener('click', (event) => {
        event.stopPropagation();
        setExpanded(hub.classList.contains('hub-collapsed'));
    });

    hub.addEventListener('click', () => {
        if (isMobileHub() && hub.classList.contains('hub-collapsed')) {
            setExpanded(true);
        }
    });

    hub.querySelectorAll('.hub-links a, .hub-actions a, .hub-actions button').forEach((link) => {
        link.addEventListener('click', () => {
            if (isMobileHub()) setExpanded(false);
        });
    });

    setExpanded(!isMobileHub() || window.scrollY < 80);

    return { setExpanded, syncToViewport };
}

function isMobileHub() {
    return window.matchMedia('(max-width: 820px)').matches;
}
