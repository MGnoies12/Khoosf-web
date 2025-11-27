document.addEventListener('DOMContentLoaded', () => {
    // تابع برای حذف لودینگ و نمایش سایت
    function removeLoader() {
        const loader = document.querySelector('.loader-wrapper');
        if (loader) {
            loader.style.opacity = '0'; // کم کردن شفافیت
            setTimeout(() => {
                loader.style.display = 'none'; // حذف کامل از صفحه
                
                // فعال کردن انیمیشن‌های AOS بعد از حذف لودر
                if (typeof AOS !== 'undefined') {
                    AOS.init({
                        once: false,
                        offset: 100,
                        easing: 'ease-out-cubic',
                        duration: 1000
                    });
                }
            }, 500);
        }
    }

    // راه حل ۱: وقتی صفحه کامل لود شد باز شود
    window.addEventListener('load', removeLoader);

    // راه حل ۲ (اضطراری): اگر تا ۳ ثانیه لود نشد، به زور باز شود
    setTimeout(removeLoader, 3000);
});

// --- کدهای منوی موبایل ---
const hamburger = document.getElementById('hamburger-btn');
const navLinks = document.getElementById('nav-links');
const links = document.querySelectorAll('.nav-links li'); // انتخاب تمام آیتم‌های لیست

if (hamburger) {
    hamburger.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        hamburger.classList.toggle('toggle');
    });
}

// بستن منو وقتی روی لینک کلیک شد
links.forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
    });
});

// --- کدهای باز شدن کارت‌ها ---
function toggleDetails(card) {
    const allCards = document.querySelectorAll('.item-card');
    allCards.forEach(c => {
        if (c !== card) {
            c.classList.remove('active');
        }
    });
    card.classList.toggle('active');
}
