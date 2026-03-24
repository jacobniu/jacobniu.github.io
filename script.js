const LANG_STORAGE_KEY = 'jacob-apps-lang';
const VALID_LANGS = ['zh', 'en'];

/** @type {{ site?: object, apps: object[] } | null} */
let cachedConfig = null;
let currentLang = 'zh';

const UI = {
    zh: {
        langZh: '中文',
        langEn: 'English',
        expandDetails: '展开详情',
        collapseDetails: '收起详情',
        sectionPlatforms: '平台',
        sectionPricing: '定价详情',
        sectionPrivacy: '隐私与权限',
        sectionUpdates: '更新渠道',
        versionHistory: '版本历史',
        download: '下载',
        errorLoad: '加载失败，请先运行',
        errorThenOpen: '再通过',
        errorVisit: '访问页面',
        closeModal: '关闭'
    },
    en: {
        langZh: '中文',
        langEn: 'English',
        expandDetails: 'Show details',
        collapseDetails: 'Hide details',
        sectionPlatforms: 'Platforms',
        sectionPricing: 'Pricing',
        sectionPrivacy: 'Privacy & permissions',
        sectionUpdates: 'Updates',
        versionHistory: 'Version history',
        download: 'Download',
        errorLoad: 'Failed to load. Run',
        errorThenOpen: 'then open',
        errorVisit: 'in your browser.',
        closeModal: 'Close'
    }
};

function pick(value, lang) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && (value.zh != null || value.en != null)) {
        const primary = value[lang];
        if (primary != null && primary !== '') return primary;
        const fallback = lang === 'zh' ? value.en : value.zh;
        return fallback != null ? fallback : '';
    }
    return String(value);
}

function getInitialLang() {
    const params = new URLSearchParams(window.location.search);
    const q = (params.get('lang') || '').toLowerCase();
    if (q === 'zh' || q === 'en') {
        localStorage.setItem(LANG_STORAGE_KEY, q);
        return q;
    }
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === 'zh' || stored === 'en') return stored;
    return 'zh';
}

function setLang(lang) {
    if (!VALID_LANGS.includes(lang)) return;
    currentLang = lang;
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.querySelectorAll('.lang-btn').forEach(btn => {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('lang-btn-active', isActive);
        btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
    if (cachedConfig) {
        applySiteChrome(cachedConfig);
        renderAppCards(cachedConfig);
    }
}

function t(key) {
    const pack = UI[currentLang] || UI.zh;
    return pack[key] != null ? pack[key] : key;
}

function applySiteChrome(config) {
    const site = config.site || {};
    const titleEl = document.getElementById('nav-title');
    const heroEl = document.getElementById('hero-subtitle');
    const kickerEl = document.getElementById('hero-kicker');
    const footerEl = document.getElementById('footer-text');
    if (site.pageTitle) {
        document.title = pick(site.pageTitle, currentLang);
    }
    if (titleEl && site.navTitle) titleEl.textContent = pick(site.navTitle, currentLang);
    if (heroEl && site.heroSubtitle) heroEl.textContent = pick(site.heroSubtitle, currentLang);
    if (kickerEl) {
        const k = site.heroKicker ? pick(site.heroKicker, currentLang) : '';
        kickerEl.textContent = k;
        kickerEl.hidden = !k;
    }
    if (footerEl && site.footer) footerEl.textContent = pick(site.footer, currentLang);
}

function bindLangButtons() {
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const lang = btn.getAttribute('data-lang');
            if (lang) setLang(lang);
        });
    });
}

function createDetailBlock(label, bodyText) {
    const block = document.createElement('div');
    block.className = 'detail-block';
    const h = document.createElement('h4');
    h.className = 'detail-block-title';
    h.textContent = label;
    const p = document.createElement('p');
    p.className = 'detail-block-body';
    p.textContent = bodyText;
    block.appendChild(h);
    block.appendChild(p);
    return block;
}

function createAppCard(app) {
    const lang = currentLang;
    const card = document.createElement('div');
    card.className = 'app-card';

    const header = document.createElement('div');
    header.className = 'app-header';
    const h2 = document.createElement('h2');
    h2.textContent = pick(app.name, lang);
    header.appendChild(h2);
    card.appendChild(header);

    const summary = document.createElement('div');
    summary.className = 'app-summary';
    const line1 = document.createElement('div');
    line1.className = 'summary-line summary-line-primary';
    line1.textContent = pick(app.summaryProblem, lang);
    const line2 = document.createElement('div');
    line2.className = 'summary-line summary-line-secondary';
    line2.textContent = pick(app.summaryPricing, lang);
    summary.appendChild(line1);
    summary.appendChild(line2);
    card.appendChild(summary);

    const details = document.createElement('div');
    details.className = 'app-details';
    details.hidden = true;
    details.setAttribute('aria-hidden', 'true');

    details.appendChild(createDetailBlock(t('sectionPlatforms'), pick(app.platforms, lang)));
    details.appendChild(createDetailBlock(t('sectionPricing'), pick(app.pricingDetail, lang)));
    details.appendChild(createDetailBlock(t('sectionPrivacy'), pick(app.privacy, lang)));
    details.appendChild(createDetailBlock(t('sectionUpdates'), pick(app.updateChannel, lang)));

    const toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'app-details-toggle';
    toggle.setAttribute('aria-expanded', 'false');
    const detailsId = `details-${app.id || 'app'}`;
    details.id = detailsId;
    toggle.setAttribute('aria-controls', detailsId);
    toggle.textContent = t('expandDetails');

    toggle.addEventListener('click', () => {
        const open = details.hidden;
        details.hidden = !open;
        details.setAttribute('aria-hidden', open ? 'false' : 'true');
        toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
        toggle.textContent = open ? t('collapseDetails') : t('expandDetails');
    });

    card.appendChild(toggle);
    card.appendChild(details);

    if (app.media && app.media.length > 0) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';
        app.media.forEach(mediaItem => {
            mediaContainer.appendChild(createMediaElement(mediaItem, lang));
        });
        bindDragScroll(mediaContainer);
        card.appendChild(mediaContainer);
    }

    if (app.versions && app.versions.length > 0) {
        const versionsSection = document.createElement('div');
        versionsSection.className = 'versions-section';
        const versionsTitle = document.createElement('h3');
        versionsTitle.textContent = t('versionHistory');
        versionsSection.appendChild(versionsTitle);
        const versionList = document.createElement('ul');
        versionList.className = 'version-list';
        app.versions.forEach(version => {
            versionList.appendChild(createVersionItem(version, lang));
        });
        versionsSection.appendChild(versionList);
        card.appendChild(versionsSection);
    }

    return card;
}

function createMediaElement(mediaItem, lang) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-item';
    const alt = pick(mediaItem.alt, lang) || (lang === 'zh' ? '应用截图' : 'Screenshot');

    if (mediaItem.type === 'image') {
        const img = document.createElement('img');
        img.alt = alt;
        img.dataset.src = mediaItem.url;
        img.src =
            'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160"%3E%3Crect width="260" height="160" fill="%23f0f2f7"/%3E%3C/svg%3E';
        img.decoding = 'async';
        img.onclick = () => {
            if (!img.dataset.dragging) openImageModal(mediaItem.url);
        };
        observeLazyImage(img);
        mediaDiv.appendChild(img);
    } else if (mediaItem.type === 'video') {
        const video = document.createElement('video');
        video.preload = 'none';
        video.controls = true;
        video.title = alt;
        video.src = mediaItem.url;
        if (mediaItem.poster) video.poster = mediaItem.poster;
        mediaDiv.appendChild(video);
    }

    return mediaDiv;
}

const lazyObserver = window.IntersectionObserver
    ? new IntersectionObserver((entries, obs) => {
          entries.forEach(entry => {
              if (entry.isIntersecting) {
                  const img = entry.target;
                  if (img.dataset.src) {
                      img.src = img.dataset.src;
                      delete img.dataset.src;
                  }
                  obs.unobserve(img);
              }
          });
      }, { rootMargin: '200px' })
    : null;

function observeLazyImage(img) {
    if (lazyObserver) lazyObserver.observe(img);
    else if (img.dataset.src) img.src = img.dataset.src;
}

function bindDragScroll(el) {
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;
    let hasDragged = false;

    el.addEventListener('mousedown', e => {
        isDown = true;
        hasDragged = false;
        startX = e.pageX - el.offsetLeft;
        scrollLeft = el.scrollLeft;
        el.style.cursor = 'grabbing';
    });

    el.addEventListener('mouseleave', () => {
        isDown = false;
        el.style.cursor = 'grab';
    });

    el.addEventListener('mouseup', e => {
        isDown = false;
        el.style.cursor = 'grab';
        if (hasDragged) {
            const img = e.target.closest('img');
            if (img) img.dataset.dragging = '1';
            setTimeout(() => {
                if (img) delete img.dataset.dragging;
            }, 100);
        }
        el.classList.add('drag-end');
        setTimeout(() => el.classList.remove('drag-end'), 50);
    });

    el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.2;
        if (Math.abs(walk) > 3) hasDragged = true;
        el.scrollLeft = scrollLeft - walk;
    });
}

function createVersionItem(version, lang) {
    const item = document.createElement('li');
    item.className = 'version-item';

    item.onclick = () => {
        if (version.downloadUrl) window.open(version.downloadUrl, '_blank');
    };

    const header = document.createElement('div');
    header.className = 'version-header';

    const left = document.createElement('div');
    left.className = 'version-left';

    const versionNumber = document.createElement('span');
    versionNumber.className = 'version-number';
    versionNumber.textContent = `v${version.version}`;

    const versionDesc = document.createElement('span');
    versionDesc.className = 'version-description';
    versionDesc.textContent = pick(version.description, lang);

    left.appendChild(versionNumber);
    left.appendChild(versionDesc);

    const right = document.createElement('div');
    right.className = 'version-right';

    const versionDate = document.createElement('span');
    versionDate.className = 'version-date';
    versionDate.textContent = version.releaseDate || '';

    const downloadBtn = document.createElement('span');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = t('download');

    right.appendChild(versionDate);
    right.appendChild(downloadBtn);

    header.appendChild(left);
    header.appendChild(right);
    item.appendChild(header);

    return item;
}

function renderAppCards(config) {
    const appsContainer = document.getElementById('apps-container');
    appsContainer.innerHTML = '';
    (config.apps || []).forEach(app => {
        appsContainer.appendChild(createAppCard(app));
    });
}

function showLoadError() {
    const u = UI[currentLang] || UI.zh;
    const appsContainer = document.getElementById('apps-container');
    appsContainer.innerHTML = `<div class="error-tip">⚠️ ${u.errorLoad} <code>python3 server.py</code>，${u.errorThenOpen} <a href="http://localhost:8080">http://localhost:8080</a> ${u.errorVisit}</div>`;
}

async function loadApps() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        cachedConfig = await response.json();
        if (!cachedConfig.apps) cachedConfig.apps = [];
        applySiteChrome(cachedConfig);
        renderAppCards(cachedConfig);
    } catch (error) {
        console.error('加载配置失败:', error);
        showLoadError();
    }
}

function openImageModal(imageUrl) {
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.setAttribute('aria-label', t('closeModal'));
        closeBtn.onclick = closeImageModal;

        const img = document.createElement('img');
        img.className = 'modal-content';
        img.id = 'modalImage';
        img.alt = '';

        modal.appendChild(closeBtn);
        modal.appendChild(img);
        document.body.appendChild(modal);

        modal.onclick = function (e) {
            if (e.target === modal) closeImageModal();
        };
    } else {
        modal.querySelector('.close')?.setAttribute('aria-label', t('closeModal'));
    }

    document.getElementById('modalImage').src = imageUrl;
    modal.style.display = 'flex';
}

function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeImageModal();
});

document.addEventListener('DOMContentLoaded', () => {
    currentLang = getInitialLang();
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    bindLangButtons();
    setLang(currentLang);
    loadApps();
});
