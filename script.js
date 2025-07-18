// 全局变量
let currentZoom = 1;
let modalImage = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeModal();
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
}

// 显示户型图
function showFloorPlan(imageSrc, buildingName) {
    const modal = document.getElementById('imageModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = imageSrc;
    modalTitle.textContent = buildingName + ' 户型图';
    modal.style.display = 'block';
    
    // 重置缩放
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    
    // 添加淡入动画
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// 打开图片模态框（用于平面图）
function openModal(img) {
    const modal = document.getElementById('imageModal');
    const modalTitle = document.getElementById('modalTitle');
    
    modalImage.src = img.src;
    modalTitle.textContent = '徐桥二期小区平面图';
    modal.style.display = 'block';
    
    // 重置缩放
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    
    // 添加淡入动画
    setTimeout(() => {
        modal.style.opacity = '1';
    }, 10);
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('imageModal');
    modal.style.opacity = '0';
    
    setTimeout(() => {
        modal.style.display = 'none';
        currentZoom = 1;
        modalImage.style.transform = `scale(${currentZoom})`;
    }, 300);
}

// 放大图片
function zoomIn() {
    if (currentZoom < 3) {
        currentZoom += 0.2;
        modalImage.style.transform = `scale(${currentZoom})`;
        modalImage.style.cursor = 'grab';
        enableImageDrag();
    }
}

// 缩小图片
function zoomOut() {
    if (currentZoom > 0.5) {
        currentZoom -= 0.2;
        modalImage.style.transform = `scale(${currentZoom})`;
        
        if (currentZoom <= 1) {
            modalImage.style.cursor = 'default';
            disableImageDrag();
        }
    }
}

// 重置缩放
function resetZoom() {
    currentZoom = 1;
    modalImage.style.transform = `scale(${currentZoom})`;
    modalImage.style.cursor = 'default';
    modalImage.style.left = '0';
    modalImage.style.top = '0';
    disableImageDrag();
}

// 启用图片拖拽
function enableImageDrag() {
    let isDragging = false;
    let startX, startY, initialX = 0, initialY = 0;
    
    modalImage.addEventListener('mousedown', dragStart);
    modalImage.addEventListener('mousemove', drag);
    modalImage.addEventListener('mouseup', dragEnd);
    modalImage.addEventListener('mouseleave', dragEnd);
    
    // 触摸事件支持
    modalImage.addEventListener('touchstart', dragStart);
    modalImage.addEventListener('touchmove', drag);
    modalImage.addEventListener('touchend', dragEnd);
    
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
        
        modalImage.style.transform = `scale(${currentZoom}) translate(${currentX}px, ${currentY}px)`;
    }
    
    function dragEnd() {
        isDragging = false;
        modalImage.style.cursor = 'grab';
    }
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

// 添加滚动缩放功能
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
    
    this.style.transform = `scale(${currentZoom})`;
    
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