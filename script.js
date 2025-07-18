// 全局变量
let currentZoom = 1;
let modalImage = null;
let touchZoomInfo = null;
let currentRotation = 0;

// 触摸缩放相关变量
let initialDistance = 0;
let initialScale = 1;
let isZooming = false;
let lastTouchTime = 0;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeModal();
    createTouchZoomInfo();
    addMobileOptimizations();
});

// 初始化标签页功能
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // 移除所有活动状态
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 添加当前活动状态
            this.classList.add('active');
            document.getElementById(targetTab).classList.add('active');
        });
    });
}

// 初始化模态框
function initializeModal() {
    modalImage = document.getElementById('modalImage');
    
    // 点击模态框背景关闭
    document.getElementById('imageModal').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
    
    // ESC键关闭模态框
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
    
    // 添加滚轮缩放功能
    document.getElementById('imageModal').addEventListener('wheel', function(e) {
        if (e.target === modalImage) {
            e.preventDefault();
            
            if (e.deltaY < 0) {
                zoomIn();
            } else {
                zoomOut();
            }
        }
    });
    
    // 添加双击缩放功能
    modalImage.addEventListener('dblclick', function() {
        if (currentZoom === 1) {
            currentZoom = 2;
        } else {
            currentZoom = 1;
        }
        
        this.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom > 1) {
            this.style.cursor = 'grab';
            enableImageDrag();
        } else {
            this.style.cursor = 'default';
            this.style.left = '0';
            this.style.top = '0';
            disableImageDrag();
        }
    });
    
    // 添加触摸事件监听
    addTouchZoomListeners();
}

// 显示户型图
function showFloorPlan(imageSrc, buildingName) {
    const modal = document.getElementById('imageModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = imageSrc;
    modalTitle.textContent = buildingName + ' 户型图';
    modal.style.display = 'block';
    
    // 重置缩放和位置
    resetImageState();
    
    // 确保图片居中显示
    centerImage();
    
    // 添加淡入动画
    setTimeout(() => {
        modal.style.opacity = '1';
        showTouchZoomInfo();
    }, 10);
}

// 打开图片模态框（用于平面图）
function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = img.src;
    modalTitle.textContent = '徐桥二期小区平面图';
    modal.style.display = 'block';
    
    // 重置缩放和位置
    resetImageState();
    
    // 确保图片居中显示
    centerImage();
    
    // 添加淡入动画
    setTimeout(() => {
        modal.style.opacity = '1';
        showTouchZoomInfo();
    }, 10);
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.opacity = '0';
    
    hideTouchZoomInfo();
    
    setTimeout(() => {
        modal.style.display = 'none';
        resetImageState();
    }, 300);
}

// 放大图片
function zoomIn() {
    if (currentZoom < 3) {
        currentZoom += 0.2;
        modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom > 1) {
            modalImage.style.cursor = 'grab';
            enableImageDrag();
        }
    }
}

// 缩小图片
function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.2;
        modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom <= 1) {
            modalImage.style.cursor = 'default';
            disableImageDrag();
            centerImage();
        }
    }
}

// 重置缩放
function resetZoom() {
    currentZoom = 1;
    currentRotation = 0;
    modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
    modalImage.style.cursor = 'default';
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    disableImageDrag();
    centerImage();
}

// 拖拽相关变量和函数
let isDragging = false;
let startX, startY, initialX = 0, initialY = 0;

function dragStart(e) {
    isDragging = true;
    modalImage.style.cursor = 'grabbing';
    
    if (e.type === 'mousedown') {
        startX = e.clientX - initialX;
        startY = e.clientY - initialY;
    } else {
        startX = e.touches[0].clientX - initialX;
        startY = e.touches[0].clientY - initialY;
    }
}

function drag(e) {
    if (!isDragging) return;
    
    e.preventDefault();
    
    let currentX, currentY;
    if (e.type === 'mousemove') {
        currentX = e.clientX - startX;
        currentY = e.clientY - startY;
    } else {
        currentX = e.touches[0].clientX - startX;
        currentY = e.touches[0].clientY - startY;
    }
    
    initialX = currentX;
    initialY = currentY;
    
    modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg) translate(${currentX}px, ${currentY}px)`;
}

function dragEnd() {
    isDragging = false;
    modalImage.style.cursor = 'grab';
}

// 启用图片拖拽
function enableImageDrag() {
    modalImage.addEventListener('mousedown', dragStart);
    modalImage.addEventListener('mousemove', drag);
    modalImage.addEventListener('mouseup', dragEnd);
    modalImage.addEventListener('mouseleave', dragEnd);
    
    // 触摸事件支持
    modalImage.addEventListener('touchstart', dragStart);
    modalImage.addEventListener('touchmove', drag);
    modalImage.addEventListener('touchend', dragEnd);
}

// 禁用图片拖拽
function disableImageDrag() {
    modalImage.removeEventListener('mousedown', dragStart);
    modalImage.removeEventListener('mousemove', drag);
    modalImage.removeEventListener('mouseup', dragEnd);
    modalImage.removeEventListener('mouseleave', dragEnd);
    modalImage.removeEventListener('touchstart', dragStart);
    modalImage.removeEventListener('touchmove', drag);
    modalImage.removeEventListener('touchend', dragEnd);
}



// 添加页面切换动画
function switchTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    // 移除所有活动状态
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(content => content.classList.remove('active'));
    
    // 添加当前活动状态
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// 添加触摸滑动支持（移动端）
let touchStartX = 0;
let touchEndX = 0;

document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
});

document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = touchStartX - touchEndX;
    
    if (Math.abs(diff) > swipeThreshold) {
        const currentTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
        
        if (diff > 0 && currentTab === 'overview') {
            // 向左滑动，切换到楼栋户型
            switchTab('buildings');
        } else if (diff < 0 && currentTab === 'buildings') {
            // 向右滑动，切换到平面图
            switchTab('overview');
        }
    }
}

// 添加加载动画
window.addEventListener('load', function() {
    document.body.classList.add('loaded');
});

// 图片懒加载优化
function lazyLoadImages() {
    const images = document.querySelectorAll('img');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src || img.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 如果支持 IntersectionObserver，启用懒加载
if ('IntersectionObserver' in window) {
    lazyLoadImages();
}

// 移动端检测
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
           (window.innerWidth <= 768 && 'ontouchstart' in window);
}

// 创建触摸缩放提示
function createTouchZoomInfo() {
    touchZoomInfo = document.createElement('div');
    touchZoomInfo.className = 'touch-zoom-info';
    touchZoomInfo.textContent = '双指缩放 • 双击放大 • 拖拽移动';
    document.body.appendChild(touchZoomInfo);
}

// 显示触摸缩放提示
function showTouchZoomInfo() {
    if (isMobile() && touchZoomInfo) {
        touchZoomInfo.classList.add('show');
        setTimeout(() => {
            hideTouchZoomInfo();
        }, 3000);
    }
}

// 隐藏触摸缩放提示
function hideTouchZoomInfo() {
    if (touchZoomInfo) {
        touchZoomInfo.classList.remove('show');
    }
}



// 重置图片状态
function resetImageState() {
    currentZoom = 1;
    currentRotation = 0;
    isDragging = false;
    initialX = 0;
    initialY = 0;
    modalImage.style.transform = 'scale(1) rotate(0deg)';
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    modalImage.style.cursor = 'default';
    disableImageDrag();
}

// 图片居中显示
function centerImage() {
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
}

// 旋转图片
function rotateImage() {
    currentRotation += 90;
    if (currentRotation >= 360) {
        currentRotation = 0;
    }
    modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
}

// 添加触摸缩放监听器
function addTouchZoomListeners() {
    modalImage.addEventListener('touchstart', handleTouchStart, { passive: false });
    modalImage.addEventListener('touchmove', handleTouchMove, { passive: false });
    modalImage.addEventListener('touchend', handleTouchEnd, { passive: false });
}

// 处理触摸开始
function handleTouchStart(e) {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTouchTime;
    
    if (e.touches.length === 2) {
        // 双指触摸，准备缩放
        isZooming = true;
        initialDistance = getDistance(e.touches[0], e.touches[1]);
        initialScale = currentZoom;
        e.preventDefault();
    } else if (e.touches.length === 1) {
        // 单指触摸，检查双击
        if (tapLength < 500 && tapLength > 0) {
            // 双击事件
            handleDoubleTap(e);
            e.preventDefault();
        }
        lastTouchTime = currentTime;
    }
}

// 处理触摸移动
function handleTouchMove(e) {
    if (e.touches.length === 2 && isZooming) {
        e.preventDefault();
        
        const currentDistance = getDistance(e.touches[0], e.touches[1]);
        const scale = (currentDistance / initialDistance) * initialScale;
        
        // 限制缩放范围
        currentZoom = Math.min(Math.max(scale, 0.5), 5);
        modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom > 1) {
            modalImage.style.cursor = 'grab';
            enableImageDrag();
        } else {
            modalImage.style.cursor = 'default';
            disableImageDrag();
        }
    }
}

// 处理触摸结束
function handleTouchEnd(e) {
    if (isZooming) {
        isZooming = false;
        initialDistance = 0;
        initialScale = 1;
    }
}

// 计算两点间距离
function getDistance(touch1, touch2) {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
}

// 处理双击事件
function handleDoubleTap(e) {
    if (currentZoom === 1) {
        currentZoom = 2.5;
        modalImage.style.cursor = 'grab';
        enableImageDrag();
    } else {
        resetImageState();
    }
    
    modalImage.style.transform = `scale(${currentZoom})`;
}

// 添加移动端优化
function addMobileOptimizations() {
    if (isMobile()) {
        // 防止页面缩放
        document.addEventListener('touchmove', function(e) {
            if (e.scale !== 1) {
                e.preventDefault();
            }
        }, { passive: false });
        
        // 防止双击缩放页面
        let lastTouchEnd = 0;
        document.addEventListener('touchend', function(e) {
            const now = (new Date()).getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);
        
        // 优化滚动性能
        document.body.style.webkitOverflowScrolling = 'touch';
        
        // 添加视口元标签（如果不存在）
        if (!document.querySelector('meta[name="viewport"]')) {
            const viewport = document.createElement('meta');
            viewport.name = 'viewport';
            viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
            document.head.appendChild(viewport);
        }
    }
}

// 优化的缩放函数
function zoomInOptimized() {
    if (currentZoom < 5) {
        currentZoom = Math.min(currentZoom + 0.5, 5);
        modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom > 1) {
            modalImage.style.cursor = 'grab';
            enableImageDrag();
        }
    }
}

function zoomOutOptimized() {
    if (currentZoom > 0.5) {
        currentZoom = Math.max(currentZoom - 0.5, 0.5);
        modalImage.style.transform = `scale(${currentZoom}) rotate(${currentRotation}deg)`;
        
        if (currentZoom <= 1) {
            modalImage.style.cursor = 'default';
            modalImage.style.left = '0';
            modalImage.style.top = '0';
            disableImageDrag();
            centerImage();
        }
    }
}