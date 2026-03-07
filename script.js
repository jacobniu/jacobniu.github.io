// 加载配置并渲染应用（从 config.json 读取，需通过 server.py 启动服务器访问）
async function loadApps() {
    try {
        const response = await fetch('config.json');
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const config = await response.json();

        const appsContainer = document.getElementById('apps-container');
        appsContainer.innerHTML = '';

        config.apps.forEach(app => {
            const appCard = createAppCard(app);
            appsContainer.appendChild(appCard);
        });
    } catch (error) {
        console.error('加载配置失败:', error);
        document.getElementById('apps-container').innerHTML =
            '<div class="error-tip">⚠️ 加载失败，请先运行 <code>python3 server.py</code>，再通过 <a href="http://localhost:8080">http://localhost:8080</a> 访问页面</div>';
    }
}

// 创建应用卡片
function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';

    // 应用头部
    const header = document.createElement('div');
    header.className = 'app-header';
    header.innerHTML = `<h2>${app.name}</h2>`;
    card.appendChild(header);

    // 应用描述
    const description = document.createElement('div');
    description.className = 'app-description';
    description.textContent = app.description;
    card.appendChild(description);

    // 媒体容器
    if (app.media && app.media.length > 0) {
        const mediaContainer = document.createElement('div');
        mediaContainer.className = 'media-container';

        app.media.forEach(mediaItem => {
            const mediaElement = createMediaElement(mediaItem);
            mediaContainer.appendChild(mediaElement);
        });

        // 绑定鼠标拖拽横向滚动
        bindDragScroll(mediaContainer);
        card.appendChild(mediaContainer);
    }

    // 版本列表
    if (app.versions && app.versions.length > 0) {
        const versionsSection = document.createElement('div');
        versionsSection.className = 'versions-section';

        const versionsTitle = document.createElement('h3');
        versionsTitle.textContent = '版本历史';
        versionsSection.appendChild(versionsTitle);

        const versionList = document.createElement('ul');
        versionList.className = 'version-list';

        app.versions.forEach(version => {
            const versionItem = createVersionItem(version);
            versionList.appendChild(versionItem);
        });

        versionsSection.appendChild(versionList);
        card.appendChild(versionsSection);
    }

    return card;
}

// 创建媒体元素（图片或视频），图片懒加载，视频延迟加载
function createMediaElement(mediaItem) {
    const mediaDiv = document.createElement('div');
    mediaDiv.className = 'media-item';

    if (mediaItem.type === 'image') {
        const img = document.createElement('img');
        img.alt = mediaItem.alt || '应用截图';
        // 懒加载：先用 data-src，进入视口后再赋给 src
        img.dataset.src = mediaItem.url;
        img.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 160"%3E%3Crect width="260" height="160" fill="%23f0f2f7"/%3E%3C/svg%3E';
        img.decoding = 'async';
        img.onclick = () => {
            if (!img.dataset.dragging) openImageModal(mediaItem.url);
        };
        observeLazyImage(img);
        mediaDiv.appendChild(img);
    } else if (mediaItem.type === 'video') {
        const video = document.createElement('video');
        // preload=none 延迟加载视频数据
        video.preload = 'none';
        video.controls = true;
        video.src = mediaItem.url;
        if (mediaItem.poster) {
            video.poster = mediaItem.poster;
        }
        mediaDiv.appendChild(video);
    }

    return mediaDiv;
}

// ===== 图片懒加载（IntersectionObserver）=====
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
    if (lazyObserver) {
        lazyObserver.observe(img);
    } else {
        // 降级：直接赋值
        img.src = img.dataset.src;
    }
}

// ===== 鼠标拖拽横向滚动 =====
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
        // 如果发生了拖拽，标记防止触发图片点击
        if (hasDragged) {
            const img = e.target.closest('img');
            if (img) img.dataset.dragging = '1';
            setTimeout(() => {
                if (img) delete img.dataset.dragging;
            }, 100);
        }
    });

    el.addEventListener('mousemove', e => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - el.offsetLeft;
        const walk = (x - startX) * 1.2;
        if (Math.abs(walk) > 3) hasDragged = true;
        el.scrollLeft = scrollLeft - walk;
    });

    // 触摸设备原生支持，无需额外处理
}

// 创建版本项
function createVersionItem(version) {
    const item = document.createElement('li');
    item.className = 'version-item';

    item.onclick = () => {
        if (version.downloadUrl) {
            window.open(version.downloadUrl, '_blank');
        }
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
    versionDesc.textContent = version.description || '';

    left.appendChild(versionNumber);
    left.appendChild(versionDesc);

    const right = document.createElement('div');
    right.className = 'version-right';

    const versionDate = document.createElement('span');
    versionDate.className = 'version-date';
    versionDate.textContent = version.releaseDate || '';

    const downloadBtn = document.createElement('span');
    downloadBtn.className = 'download-btn';
    downloadBtn.textContent = '下载';

    right.appendChild(versionDate);
    right.appendChild(downloadBtn);

    header.appendChild(left);
    header.appendChild(right);
    item.appendChild(header);

    return item;
}

// 打开图片全屏查看
function openImageModal(imageUrl) {
    let modal = document.getElementById('imageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'imageModal';
        modal.className = 'modal';

        const closeBtn = document.createElement('span');
        closeBtn.className = 'close';
        closeBtn.innerHTML = '&times;';
        closeBtn.onclick = closeImageModal;

        const img = document.createElement('img');
        img.className = 'modal-content';
        img.id = 'modalImage';

        modal.appendChild(closeBtn);
        modal.appendChild(img);
        document.body.appendChild(modal);
    }

    document.getElementById('modalImage').src = imageUrl;
    modal.style.display = 'flex';

    modal.onclick = function(e) {
        if (e.target === modal) closeImageModal();
    };
}

// 关闭图片全屏查看
function closeImageModal() {
    const modal = document.getElementById('imageModal');
    if (modal) modal.style.display = 'none';
}

// ESC键关闭模态框
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeImageModal();
});

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', loadApps);
