import { productsManager } from './products.js';
import { cartManager } from './cart.js';
import { wishlistManager } from './wishlist.js';

// Configuration de l'API
const API_URL = 'http://localhost:3000/api';

const url = 'http://localhost:3000';
const btn = document.querySelector('.btn');
const modalBtn = document.querySelector('.modal-btn');
const modal = document.querySelector('.modal');
const closeBtn = document.querySelector('.close-btn');
const backdrop = document.querySelector('.backdrop');

// Gestion des modales
const modals = {
    product: document.getElementById('product-modal'),
    cart: document.getElementById('cart-modal'),
    wishlist: document.getElementById('wishlist-modal')
};

// Fonction pour ouvrir une modale
function openModal(modalId) {
    const modal = modals[modalId];
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Fonction pour fermer une modale
function closeModal(modalId) {
    const modal = modals[modalId];
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Fermer les modales en cliquant sur le bouton de fermeture
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', () => {
        const modal = closeBtn.closest('.modal');
        const modalId = Object.keys(modals).find(key => modals[key] === modal);
        closeModal(modalId);
    });
});

// Fermer les modales en cliquant en dehors
window.addEventListener('click', (event) => {
    Object.keys(modals).forEach(modalId => {
        if (event.target === modals[modalId]) {
            closeModal(modalId);
        }
    });
});

// Gestion de la navigation
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelectorAll('.nav-links a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
    });
});

// Gestion des boutons du panier et de la liste de souhaits
document.getElementById('cart-btn').addEventListener('click', () => openModal('cart'));
document.getElementById('wishlist-btn').addEventListener('click', () => openModal('wishlist'));

// Fonction pour formater les prix
function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(price);
}

// Fonction pour calculer le prix avec réduction
function calculateDiscountedPrice(price, reduction) {
    return price * (1 - reduction / 100);
}

// Fonction pour tronquer le texte
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Fonction pour créer un élément HTML
function createElement(tag, className, content) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (content) element.textContent = content;
    return element;
}

// Fonction pour ajouter des attributs à un élément
function setAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
    });
}

// Gestion du localStorage
const storage = {
    get: (key) => {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : null;
    },
    set: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
    }
};

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si le panier existe dans le localStorage
    if (!storage.get('cart')) {
        storage.set('cart', []);
    }
    
    // Vérifier si la liste de souhaits existe dans le localStorage
    if (!storage.get('wishlist')) {
        storage.set('wishlist', []);
    }
});

modalBtn.addEventListener('click', () => {
    modal.classList.add('open');
    backdrop.classList.add('open');
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('open');
    backdrop.classList.remove('open');
});

btn.addEventListener('click', getSneakers);

function getSneakers() {
    fetch(`${url}/sneakers`)
    .then(res => res.json())
    .then(data => {
        console.log(data);
    })
    .catch(err => console.log(err));
}

// Fonction pour afficher les notifications
function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    // Ajouter la classe show après un court délai pour l'animation
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, duration);
}

// Fonction pour charger les produits depuis le fichier JSON
async function loadProducts() {
    try {
        const response = await fetch('../backend/data.json');
        const data = await response.json();
        return data.components;
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        return [];
    }
}

// Fonction pour afficher les produits en réduction
async function displayFeaturedProducts() {
    const products = await loadProducts();
    const featuredProducts = products.filter(product => product.reduction > 0);
    const featuredGrid = document.getElementById('featured-grid');
    
    // Récupérer la wishlist du localStorage
    const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

    if (featuredGrid) {
        featuredGrid.innerHTML = featuredProducts.map(product => {
            const isInWishlist = wishlist.includes(product.id);
            return `
                <div class="product-card">
                    <div class="product-image">
                        <img src="../../${product.img_1}" alt="${product.name}">
                        ${product.reduction ? `<span class="discount-badge">-${product.reduction}%</span>` : ''}
                    </div>
                    <div class="product-info">
                        <h3>${product.name}</h3>
                        <div class="price">
                            ${product.reduction ? `
                                <span class="original-price">${product.price}€</span>
                                <span class="sale">${(product.price * (1 - product.reduction / 100)).toFixed(2)}€</span>
                            ` : `
                                <span>${product.price}€</span>
                            `}
                        </div>
                        <div class="product-actions">
                            <button class="add-to-cart" data-id="${product.id}">
                                <i class="fas fa-shopping-cart"></i> Ajouter au panier
                            </button>
                            <button class="add-to-wishlist ${isInWishlist ? 'in-wishlist' : ''}" data-id="${product.id}">
                                <i class="fas fa-heart"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        // Ajouter les écouteurs d'événements pour les boutons
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-cart').dataset.id);
                const product = products.find(p => p.id === productId);
                if (product) {
                    const cart = JSON.parse(localStorage.getItem('cart')) || [];
                    cart.push(product);
                    localStorage.setItem('cart', JSON.stringify(cart));
                    showNotification('Produit ajouté au panier', 'success');
                }
            });
        });

        document.querySelectorAll('.add-to-wishlist').forEach(button => {
            button.addEventListener('click', (e) => {
                const productId = parseInt(e.target.closest('.add-to-wishlist').dataset.id);
                const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
                const index = wishlist.indexOf(productId);
                
                if (index === -1) {
                    // Ajouter à la wishlist
                    wishlist.push(productId);
                    e.target.closest('.add-to-wishlist').classList.add('in-wishlist');
                    showNotification('Produit ajouté aux favoris', 'success');
                } else {
                    // Retirer de la wishlist
                    wishlist.splice(index, 1);
                    e.target.closest('.add-to-wishlist').classList.remove('in-wishlist');
                    showNotification('Produit retiré des favoris', 'info');
                }
                
                localStorage.setItem('wishlist', JSON.stringify(wishlist));
            });
        });
    }
}

// Charger les produits en vedette au chargement de la page
document.addEventListener('DOMContentLoaded', displayFeaturedProducts);

// Fonction pour charger les produits depuis l'API
async function loadProductsAPI() {
    try {
        const response = await fetch(`${API_URL}/products`);
        const products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        showNotification('Erreur lors du chargement des produits', 5000);
    }
}

// Fonction pour afficher les produits
function displayProducts(products) {
    const container = document.getElementById('products-container');
    container.innerHTML = '';

    products.forEach(product => {
        const discountedPrice = calculateDiscountedPrice(product.price, product.reduction);
        
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <div class="product-image">
                <img src="${product.img_1}" alt="${product.name}">
                ${product.reduction > 0 ? `<span class="discount-badge">-${product.reduction}%</span>` : ''}
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="price">
                    ${product.reduction > 0 ? 
                        `<span class="original-price">${formatPrice(product.price)}</span>` : 
                        ''}
                    <span class="${product.reduction > 0 ? 'sale' : ''}">
                        ${formatPrice(discountedPrice)}
                    </span>
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" data-product-id="${product.id}">
                        <i class="fas fa-shopping-cart"></i> Ajouter au panier
                    </button>
                    <button class="add-to-wishlist" data-product-id="${product.id}">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
            </div>
        `;

        container.appendChild(productCard);
    });

    // Ajouter les événements aux boutons
    addProductEventListeners();
}

// Fonction pour ajouter les événements aux produits
function addProductEventListeners() {
    // Ajouter au panier
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = parseInt(button.dataset.productId);
            try {
                const response = await fetch(`${API_URL}/products/${productId}`);
                const product = await response.json();
                addToCart(product);
            } catch (error) {
                console.error('Erreur lors de l\'ajout au panier:', error);
                showNotification('Erreur lors de l\'ajout au panier', 5000);
            }
        });
    });

    // Ajouter à la liste de souhaits
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', async () => {
            const productId = parseInt(button.dataset.productId);
            try {
                const response = await fetch(`${API_URL}/products/${productId}`);
                const product = await response.json();
                addToWishlist(product);
            } catch (error) {
                console.error('Erreur lors de l\'ajout à la liste de souhaits:', error);
                showNotification('Erreur lors de l\'ajout à la liste de souhaits', 5000);
            }
        });
    });
}

// Charger les produits au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    loadProductsAPI();
    updateCartDisplay();
    updateWishlistDisplay();
});

// Fonction pour initialiser l'application
function initApp() {
    // Initialiser les gestionnaires
    productsManager.init();
    cartManager.init();
    wishlistManager.init();

    // Ajouter les styles pour les badges
    const style = document.createElement('style');
    style.textContent = `
        .nav-icons button {
            position: relative;
        }
        .nav-icons button[data-count]::after {
            content: attr(data-count);
            position: absolute;
            top: -5px;
            right: -5px;
            background: var(--primary-color);
            color: white;
            font-size: 0.8rem;
            padding: 0.2rem 0.5rem;
            border-radius: 50%;
            min-width: 1.2rem;
            text-align: center;
        }
        .notification {
            position: fixed;
            bottom: 2rem;
            right: 2rem;
            background: var(--card-background);
            color: var(--text-color);
            padding: 1rem 2rem;
            border-radius: var(--border-radius);
            box-shadow: var(--box-shadow);
            z-index: 1000;
            animation: slideIn 0.3s ease;
        }
        .notification.success {
            background: #10b981;
            color: white;
        }
        .notification.error {
            background: #ef4444;
            color: white;
        }
        .notification.info {
            background: #3b82f6;
            color: white;
        }
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', initApp);