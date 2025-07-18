// 全局变量
let currentZoom = 1;
let currentRotation = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;
let isModalOpen = false;

// 触摸相关变量
let touchStartDistance = 0;
let touchStartZoom = 1;
let touchStartX = 0;
let touchStartY = 0;
let touchStartTranslateX = 0;
let touchStartTranslateY = 0;
let lastTouchTime = 0;
let touchCount = 0;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initMobileMenu();
    initModal();
    initTouchEvents();
    // 移动端优化
    addMobileTouchFeedback();
    if (isMobileDevice()) {
        showTouchHint();
        // 禁用移动端的双击缩放
        document.addEventListener('touchstart', function(e) {
            if (e.touches.length > 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, { passive: false });
    }
});

// 导航初始化
function initNavigation() {
    // PC端侧边栏导航
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, navItems);
        });
    });
    
    // 移动端导航
    const mobileNavItems = document.querySelectorAll('.mobile-nav-item');
    mobileNavItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchTab(tabId, mobileNavItems);
            closeMobileMenu();
        });
    });
}

// 移动端菜单初始化
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const mobileNav = document.getElementById('mobileNav');
    
    if (menuToggle && mobileNav) {
        menuToggle.addEventListener('click', function() {
            mobileNav.classList.toggle('active');
        });
        
        // 点击外部关闭菜单
        document.addEventListener('click', function(e) {
            if (!menuToggle.contains(e.target) && !mobileNav.contains(e.target)) {
                mobileNav.classList.remove('active');
            }
        });
    }
}

// 关闭移动端菜单
function closeMobileMenu() {
    const mobileNav = document.getElementById('mobileNav');
    if (mobileNav) {
        mobileNav.classList.remove('active');
    }
}

// 切换标签页
function switchTab(tabId, navItems) {
    // 隐藏所有内容区域
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 显示目标内容区域
    const targetSection = document.getElementById(tabId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // 更新导航状态
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // 找到对应的导航项并激活
    navItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        }
    });
    
    // 同步PC端和移动端导航状态
    const allNavItems = document.querySelectorAll('.nav-item, .mobile-nav-item');
    allNavItems.forEach(item => {
        if (item.getAttribute('data-tab') === tabId) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// 模态框初始化
function initModal() {
    const modal = document.getElementById('imageModal');
    const modalBackdrop = document.querySelector('.modal-backdrop');
    
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isModalOpen) {
            closeModal();
        }
    });
}

// 打开模态框
function openModal(imgElement) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modal && modalImage && modalTitle) {
        modalImage.src = imgElement.src;
        modalImage.alt = imgElement.alt;
        modalTitle.textContent = imgElement.alt || '图片查看';
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        isModalOpen = true;
        
        // 重置图片状态
        resetImageState();
        
        // 添加触摸事件
        addTouchZoomListeners();
        
        // 显示触摸提示
        if (isMobileDevice()) {
            showTouchHint();
        }
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('imageModal');
    if (modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
        isModalOpen = false;
        
        // 恢复背景滚动
        document.body.style.overflow = '';
        
        // 隐藏触摸提示
        hideTouchHint();
    }
}

// 显示楼栋户型图
function showFloorPlan(imageSrc, title) {
    const modal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    
    if (modal && modalImage && modalTitle) {
        modalImage.src = imageSrc;
        modalImage.alt = title;
        modalTitle.textContent = title;
        
        modal.classList.add('active');
        modal.style.display = 'flex';
        isModalOpen = true;
        
        // 重置图片状态
        resetImageState();
        
        // 添加触摸事件
        addTouchZoomListeners();
        
        // 显示触摸提示
        if (isMobileDevice()) {
            showTouchHint();
        }
        
        // 防止背景滚动
        document.body.style.overflow = 'hidden';
    }
}

// 放大图片
function zoomIn() {
    currentZoom = Math.min(currentZoom * 1.2, 5);
    updateImageTransform();
}

// 缩小图片
function zoomOut() {
    currentZoom = Math.max(currentZoom / 1.2, 0.5);
    updateImageTransform();
}

// 重置缩放
function resetZoom() {
    currentZoom = 1;
    currentRotation = 0;
    translateX = 0;
    translateY = 0;
    updateImageTransform();
}

// 旋转图片
function rotateImage() {
    currentRotation = (currentRotation + 90) % 360;
    updateImageTransform();
}

// 更新图片变换
function updateImageTransform() {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.style.transform = `translate(${translateX}px, ${translateY}px) scale(${currentZoom}) rotate(${currentRotation}deg)`;
    }
}

// 重置图片状态
function resetImageState() {
    currentZoom = 1;
    currentRotation = 0;
    translateX = 0;
    translateY = 0;
    isDragging = false;
    updateImageTransform();
}

// 触摸事件初始化
function initTouchEvents() {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        // 鼠标事件（PC端拖拽）
        modalImage.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        
        // 双击放大
        modalImage.addEventListener('dblclick', function() {
            if (currentZoom === 1) {
                zoomIn();
            } else {
                resetZoom();
            }
        });
    }
}

// 鼠标按下
function handleMouseDown(e) {
    if (!isModalOpen) return;
    
    isDragging = true;
    startX = e.clientX - translateX;
    startY = e.clientY - translateY;
    
    e.preventDefault();
}

// 鼠标移动
function handleMouseMove(e) {
    if (!isDragging || !isModalOpen) return;
    
    translateX = e.clientX - startX;
    translateY = e.clientY - startY;
    
    updateImageTransform();
    e.preventDefault();
}

// 鼠标释放
function handleMouseUp() {
    isDragging = false;
}

// 添加触摸缩放监听器
function addTouchZoomListeners() {
    const modalImage = document.getElementById('modalImage');
    if (modalImage) {
        modalImage.addEventListener('touchstart', handleTouchStart, { passive: false });
        modalImage.addEventListener('touchmove', handleTouchMove, { passive: false });
        modalImage.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
}

// 触摸开始
function handleTouchStart(e) {
    if (!isModalOpen) return;
    
    e.preventDefault();
    
    const touches = e.touches;
    touchCount = touches.length;
    
    if (touches.length === 1) {
        // 单指拖拽
        touchStartX = touches[0].clientX;
        touchStartY = touches[0].clientY;
        touchStartTranslateX = translateX;
        touchStartTranslateY = translateY;
        
        // 双击检测
        const currentTime = new Date().getTime();
        if (currentTime - lastTouchTime < 300) {
            handleDoubleTap();
        }
        lastTouchTime = currentTime;
    } else if (touches.length === 2) {
        // 双指缩放
        touchStartDistance = getDistance(touches[0], touches[1]);
        touchStartZoom = currentZoom;
        
        // 记录双指中心点
        const centerX = (touches[0].clientX + touches[1].clientX) / 2;
        const centerY = (touches[0].clientY + touches[1].clientY) / 2;
        touchStartX = centerX;
        touchStartY = centerY;
        touchStartTranslateX = translateX;
        touchStartTranslateY = translateY;
    }
}

// 触摸移动
function handleTouchMove(e) {
    if (!isModalOpen) return;
    
    e.preventDefault();
    
    const touches = e.touches;
    
    if (touches.length === 1 && touchCount === 1) {
        // 单指拖拽
        const deltaX = touches[0].clientX - touchStartX;
        const deltaY = touches[0].clientY - touchStartY;
        
        translateX = touchStartTranslateX + deltaX;
        translateY = touchStartTranslateY + deltaY;
        
        updateImageTransform();
    } else if (touches.length === 2) {
        // 双指缩放
        const currentDistance = getDistance(touches[0], touches[1]);
        const scale = currentDistance / touchStartDistance;
        
        currentZoom = Math.max(0.5, Math.min(5, touchStartZoom * scale));
        
        updateImageTransform();
    }
}

// 触摸结束
function handleTouchEnd(e) {
    if (!isModalOpen) return;
    
    e.preventDefault();
    
    // 如果所有手指都离开了屏幕，重置触摸计数
    if (e.touches.length === 0) {
        touchCount = 0;
    }
}

// 计算两点间距离
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// 双击处理
function handleDoubleTap() {
    if (currentZoom === 1) {
        currentZoom = 2;
    } else {
        resetZoom();
    }
    updateImageTransform();
}

// 检测移动设备// 移动设备检测
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        ('ontouchstart' in window) ||
        (navigator.maxTouchPoints > 0) ||
        window.innerWidth <= 1024;
}

// 移动端触摸反馈
function addMobileTouchFeedback() {
    if (!isMobileDevice()) return;
    
    // 为所有可点击元素添加触摸反馈
    const clickableElements = document.querySelectorAll('.building-item, .image-card, .mobile-nav-item, .control-btn');
    
    clickableElements.forEach(element => {
        element.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.95)';
            this.style.transition = 'transform 0.1s ease';
        }, { passive: true });
        
        element.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        }, { passive: true });
        
        element.addEventListener('touchcancel', function() {
            this.style.transform = '';
        }, { passive: true });
    });
}

// 显示触摸提示
function showTouchHint() {
    if (!isMobileDevice()) return;
    
    const touchHint = document.getElementById('touchHint');
    if (touchHint) {
        touchHint.classList.add('show');
        
        // 移动端5秒后自动隐藏，给用户更多时间阅读
        setTimeout(() => {
            hideTouchHint();
        }, 5000);
    }
}

// 隐藏触摸提示
function hideTouchHint() {
    const touchHint = document.getElementById('touchHint');
    if (touchHint) {
        touchHint.classList.remove('show');
    }
}

// 窗口大小改变时的处理
window.addEventListener('resize', function() {
    if (isModalOpen) {
        // 重置图片位置，避免超出边界
        const modalImage = document.getElementById('modalImage');
        if (modalImage) {
            const rect = modalImage.getBoundingClientRect();
            const containerRect = modalImage.parentElement.getBoundingClientRect();
            
            // 如果图片超出容器边界，重置位置
            if (rect.left > containerRect.right || rect.right < containerRect.left ||
                rect.top > containerRect.bottom || rect.bottom < containerRect.top) {
                translateX = 0;
                translateY = 0;
                updateImageTransform();
            }
        }
    }
});

// 防止图片拖拽的默认行为
document.addEventListener('dragstart', function(e) {
    if (e.target.tagName === 'IMG') {
        e.preventDefault();
    }
});

// 防止右键菜单（可选）
document.addEventListener('contextmenu', function(e) {
    if (isModalOpen && e.target.id === 'modalImage') {
        e.preventDefault();
    }
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    if (!isModalOpen) return;
    
    switch(e.key) {
        case 'Escape':
            closeModal();
            break;
        case '+':
        case '=':
            e.preventDefault();
            zoomIn();
            break;
        case '-':
            e.preventDefault();
            zoomOut();
            break;
        case '0':
            e.preventDefault();
            resetZoom();
            break;
        case 'r':
        case 'R':
            e.preventDefault();
            rotateImage();
            break;
        case 'ArrowLeft':
            e.preventDefault();
            translateX -= 20;
            updateImageTransform();
            break;
        case 'ArrowRight':
            e.preventDefault();
            translateX += 20;
            updateImageTransform();
            break;
        case 'ArrowUp':
            e.preventDefault();
            translateY -= 20;
            updateImageTransform();
            break;
        case 'ArrowDown':
            e.preventDefault();
            translateY += 20;
            updateImageTransform();
            break;
    }
});

// 滚轮缩放（PC端）
document.addEventListener('wheel', function(e) {
    if (!isModalOpen) return;
    
    const modalImage = document.getElementById('modalImage');
    if (modalImage && e.target === modalImage) {
        e.preventDefault();
        
        if (e.deltaY < 0) {
            zoomIn();
        } else {
            zoomOut();
        }
    }
}, { passive: false });

// 页面加载完成后的初始化
window.addEventListener('load', function() {
    // 预加载图片
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });
    
    // 添加加载动画
    document.body.classList.add('loaded');
});

// 错误处理
window.addEventListener('error', function(e) {
    console.error('页面错误:', e.error);
});

// 图片加载错误处理
document.addEventListener('error', function(e) {
    if (e.target.tagName === 'IMG') {
        console.error('图片加载失败:', e.target.src);
        e.target.style.display = 'none';
    }
}, true);