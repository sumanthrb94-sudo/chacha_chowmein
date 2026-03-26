// Scroll animations using IntersectionObserver
document.addEventListener('DOMContentLoaded', () => {
  const animatedElements = document.querySelectorAll('.animate-on-scroll');
  
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  animatedElements.forEach(el => {
    observer.observe(el);
  });
  
  // Navbar bg update on scroll (Optimized)
  const navbar = document.querySelector('.glass-nav');
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        if (window.scrollY > 50) {
          navbar.style.background = 'rgba(5, 5, 5, 0.9)';
          navbar.style.borderBottom = '1px solid rgba(178, 34, 34, 0.3)';
        } else {
          navbar.style.background = 'rgba(20, 20, 20, 0.6)';
          navbar.style.borderBottom = '1px solid rgba(255, 255, 255, 0.08)';
        }
        ticking = false;
      });
      ticking = true;
    }
  }, { passive: true });
});

// Shopping Cart Logic & State
let cart = {}; // Object matching: name -> { price, qty }
let menuDict = {}; // Global dictionary mapping names to prices

const cartBtn = document.getElementById('cart-btn');
const cartModal = document.getElementById('cart-modal');
const closeCartBtn = document.getElementById('close-cart');
const checkoutBtn = document.getElementById('checkout-btn');
const cartItemsContainer = document.getElementById('cart-items');
const cartCountEl = document.getElementById('cart-count');
const totalPriceEl = document.getElementById('total-price');

// Item Detail Overlay Elements
const detailOverlay = document.getElementById('item-detail-overlay');
const detailCloseBtn = document.getElementById('detail-close-btn');
const detailNameEl = document.getElementById('detail-name');
const detailPriceEl = document.getElementById('detail-price');
const detailAddArea = document.getElementById('detail-add-area');
let currentDetailItem = null;

function toggleCart() { cartModal.classList.toggle('active'); }
cartBtn.addEventListener('click', toggleCart);
closeCartBtn.addEventListener('click', toggleCart);
cartModal.addEventListener('click', (e) => { if (e.target === cartModal) toggleCart(); });

detailCloseBtn.addEventListener('click', () => { detailOverlay.classList.remove('active'); });
detailOverlay.addEventListener('click', (e) => { if (e.target === detailOverlay) detailOverlay.classList.remove('active'); });

function getCartTotalItems() {
  return Object.values(cart).reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotalPrice() {
  return Object.values(cart).reduce((sum, item) => sum + (item.price * item.qty), 0);
}

window.updateQty = function(name, delta) {
  if (!cart[name]) {
    if (delta > 0) cart[name] = { price: menuDict[name], qty: 0 };
    else return;
  }
  cart[name].qty += delta;
  if (cart[name].qty <= 0) {
    delete cart[name];
  }
  updateAllUIs();
};

window.removeFromCart = function(name) {
  delete cart[name];
  updateAllUIs();
};

function updateAllUIs() {
  const totalItems = getCartTotalItems();
  cartCountEl.textContent = totalItems;
  
  // Render Cart Modal
  if (totalItems === 0) {
    cartItemsContainer.innerHTML = '<p style="text-align:center; color:#888;">Your cart is empty.</p>';
    totalPriceEl.textContent = '₹0';
  } else {
    cartItemsContainer.innerHTML = '';
    Object.entries(cart).forEach(([name, item]) => {
      cartItemsContainer.innerHTML += `
        <div class="cart-item">
          <div class="cart-item-info">
            <h4 style="margin-bottom:0">${name}</h4>
            <div class="cart-qty-controls">
              <button class="cart-qty-btn" onclick="updateQty('${name}', -1)">-</button>
              <span class="cart-qty-num">${item.qty}</span>
              <button class="cart-qty-btn" onclick="updateQty('${name}', 1)">+</button>
            </div>
          </div>
          <div class="cart-item-price" style="text-align:right;">
            <div>₹${item.price * item.qty}</div>
            <button class="remove-btn" onclick="removeFromCart('${name}')" style="margin-top:0.25rem;">Remove</button>
          </div>
        </div>
      `;
    });
    totalPriceEl.textContent = `₹${getCartTotalPrice()}`;
  }

  // Render Menu Item Buttons
  document.querySelectorAll('.menu-item').forEach(el => {
    const name = el.getAttribute('data-name');
    const btnArea = el.querySelector('.item-btn-area');
    if (btnArea && name) {
      if (cart[name]) {
        btnArea.innerHTML = `
          <div class="incrementor" onclick="event.stopPropagation()">
            <button class="inc-btn" onclick="updateQty('${name}', -1)">-</button>
            <span class="inc-qty">${cart[name].qty}</span>
            <button class="inc-btn" onclick="updateQty('${name}', 1)">+</button>
          </div>
        `;
      } else {
        btnArea.innerHTML = `<button class="add-btn" onclick="event.stopPropagation(); updateQty('${name}', 1)">+</button>`;
      }
    }
  });

  // Render Item Detail Overlay Buttons (if open)
  if (currentDetailItem) {
    const qty = cart[currentDetailItem.name] ? cart[currentDetailItem.name].qty : 0;
    if (qty > 0) {
      detailAddArea.innerHTML = `
        <div class="detail-incrementor">
          <button class="detail-inc-btn" onclick="updateQty('${currentDetailItem.name}', -1)">-</button>
          <span class="detail-inc-qty">${qty}</span>
          <button class="detail-inc-btn" onclick="updateQty('${currentDetailItem.name}', 1)">+</button>
        </div>
      `;
    } else {
      detailAddArea.innerHTML = `<button class="btn-primary detail-add-main" onclick="updateQty('${currentDetailItem.name}', 1)">Add to Cart</button>`;
    }
  }
}

checkoutBtn.addEventListener('click', () => {
  if (getCartTotalItems() > 0) {
    let orderText = "Hello! I'd like to place an order from the Cha Cha Chowmein demo:\n\n";
    Object.entries(cart).forEach(([name, item]) => {
      orderText += `* ${item.qty}x ${name} - ₹${item.price * item.qty}\n`;
    });
    orderText += `\n*Total: ₹${getCartTotalPrice()}*`;
    
    // Using user-provided number (Secunderabad/India)
    const phoneNumber = "917799934943";
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderText)}`;
    window.open(waUrl, '_blank');
  } else {
    alert('Your cart is empty!');
  }
});

// Initialize Menu Items
document.querySelectorAll('.menu-item').forEach(itemEl => {
  const nameStr = itemEl.querySelector('span:first-child').textContent.trim();
  const priceStr = itemEl.querySelector('span:nth-child(2)').textContent;
  const match = priceStr.match(/\d+/);
  const parsedPrice = match ? parseInt(match[0], 10) : 0;
  
  // Store globally
  menuDict[nameStr] = parsedPrice;
  itemEl.setAttribute('data-name', nameStr);
  
  // Inject btn area
  const btnArea = document.createElement('div');
  btnArea.className = 'item-btn-area';
  itemEl.appendChild(btnArea);

  // Bind click for launching Detail Overlay
  itemEl.addEventListener('click', (e) => {
    currentDetailItem = { name: nameStr, price: parsedPrice };
    detailNameEl.textContent = nameStr;
    detailPriceEl.textContent = `₹${parsedPrice}`;
    updateAllUIs();
    detailOverlay.classList.add('active');
  });
});

// Initial Render
updateAllUIs();

// Mobile Nav Logic
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const navLinks = document.getElementById('nav-links');

if (mobileMenuBtn && navLinks) {
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenuBtn.classList.toggle('active');
    navLinks.classList.toggle('active');
  });

  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuBtn.classList.remove('active');
      navLinks.classList.remove('active');
    });
  });
}
// Table Reservation Logic
const resForm = document.getElementById('reservation-form');
if (resForm) {
  // Set min date to today
  const dateInput = document.getElementById('res-date');
  const today = new Date().toISOString().split('T')[0];
  dateInput.min = today;

  resForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('res-name').value;
    const guests = document.getElementById('res-guests').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;

    let resText = `Hello Cha Cha Chowmein!\nI would like to request a table reservation.\n\n`;
    resText += `*Name*: ${name}\n`;
    resText += `*Guests*: ${guests}\n`;
    resText += `*Date*: ${date}\n`;
    resText += `*Time*: ${time}\n\n`;
    resText += `Please confirm my booking. Thank you!`;

    const phoneNumber = "917799934943"; // Live WhatsApp number
    const waUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(resText)}`;
    window.open(waUrl, '_blank');
    
    // User feedback
    resForm.reset();
  });
}
