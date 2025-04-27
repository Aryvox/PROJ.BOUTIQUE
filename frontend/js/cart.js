import { api } from './api.js';

// Éléments DOM
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Gestion du panier
const CART_KEY = 'boutique_cart';
const WISHLIST_KEY = 'boutique_wishlist';

// Fonctions pour le panier
export const cartManager = {
    items: [],

    init() {
        this.loadCart();
        this.setupEventListeners();
        this.updateCartUI();
    },

    loadCart() {
        const savedCart = localStorage.getItem(CART_KEY);
        if (savedCart) {
            this.items = JSON.parse(savedCart);
        }
    },

    saveCart() {
        localStorage.setItem(CART_KEY, JSON.stringify(this.items));
        this.updateCartUI();
    },

    addItem(product, quantity = 1) {
        const existingItem = this.items.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                reduction: product.reduction,
                img: product.img_1,
                quantity: quantity
            });
        }
        
        this.saveCart();
        this.showNotification('Produit ajouté au panier');
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.showNotification('Produit retiré du panier');
    },

    updateQuantity(productId, quantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            item.quantity = quantity;
            this.saveCart();
        }
    },

    clearCart() {
        this.items = [];
        this.saveCart();
        this.showNotification('Panier vidé');
    },

    getTotal() {
        return this.items.reduce((total, item) => {
            const price = item.reduction ? 
                item.price * (1 - item.reduction / 100) : 
                item.price;
            return total + (price * item.quantity);
        }, 0);
    },

    getItemCount() {
        return this.items.reduce((total, item) => total + item.quantity, 0);
    },

    setupEventListeners() {
        const cartModal = document.getElementById('cart-modal');
        const cartBtn = document.getElementById('cart-btn');
        const closeBtn = cartModal?.querySelector('.close');
        
        // Boutons du panier
        if (cartBtn) cartBtn.addEventListener('click', () => this.toggleCart());
        if (closeBtn) closeBtn.addEventListener('click', () => this.toggleCart());
        
        // Fermer le modal en cliquant à l'extérieur
        window.addEventListener('click', (e) => {
            if (e.target === cartModal) {
                this.toggleCart();
            }
        });
        
        // Ajouter les événements pour les boutons de quantité et suppression
        document.addEventListener('click', (e) => {
            // Supprimer un produit
            if (e.target.closest('.remove-item')) {
                const productId = parseInt(e.target.closest('.remove-item').dataset.id);
                this.removeItem(productId);
            }
            
            // Diminuer la quantité
            if (e.target.closest('.quantity-btn.decrease')) {
                const productId = parseInt(e.target.closest('.quantity-btn.decrease').dataset.id);
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            }
            
            // Augmenter la quantité
            if (e.target.closest('.quantity-btn.increase')) {
                const productId = parseInt(e.target.closest('.quantity-btn.increase').dataset.id);
                const item = this.items.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            }
        });

        const clearCartBtn = document.getElementById('clear-cart');
        if (clearCartBtn) {
            clearCartBtn.addEventListener('click', () => {
                if (confirm('Voulez-vous vraiment vider votre panier ?')) {
                    this.clearCart();
                }
            });
        }
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (this.items.length === 0) {
                    this.showNotification('Votre panier est vide', 'error');
                    return;
                }
                // Rediriger vers la page de paiement
                window.location.href = 'checkout.html';
            });
        }
    },

    toggleCart() {
        const cartModal = document.getElementById('cart-modal');
        if (cartModal) {
            cartModal.style.display = cartModal.style.display === 'block' ? 'none' : 'block';
            this.updateCartUI();
        }
    },

    updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartCount = document.querySelector('.cart-count');
        const totalPrice = document.querySelector('.total-price');
        
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }
        
        if (totalPrice) {
            totalPrice.textContent = `${this.getTotal().toFixed(2)}€`;
        }
        
        if (!cartItemsContainer) return;
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Votre panier est vide</p>
                    <a href="products.html" class="btn primary">Continuer vos achats</a>
                </div>
            `;
            return;
        }
        
        cartItemsContainer.innerHTML = this.items.map(item => {
            const discountedPrice = item.reduction ? 
                (item.price * (1 - item.reduction / 100)).toFixed(2) : 
                item.price.toFixed(2);
                
            return `
                <div class="cart-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.name}" class="cart-item-image">
                    <div class="cart-item-info">
                        <h3 class="cart-item-name">${item.name}</h3>
                        <div class="cart-item-price">
                            ${item.reduction ? 
                                `<span class="original-price">${item.price.toFixed(2)}€</span> 
                                <span class="sale-price">${discountedPrice}€</span>` : 
                                `<span>${discountedPrice}€</span>`}
                        </div>
                        <div class="cart-item-quantity">
                            <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                            <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                            <button class="quantity-btn increase" data-id="${item.id}">+</button>
                        </div>
                    </div>
                    <div class="cart-item-actions">
                        <button class="remove-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Ajouter les événements pour les boutons de quantité
        document.querySelectorAll('.quantity-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const productId = parseInt(btn.dataset.id);
                const input = document.querySelector(`.quantity-input[data-id="${productId}"]`);
                let quantity = parseInt(input.value);
                
                if (btn.classList.contains('decrease')) {
                    quantity = Math.max(1, quantity - 1);
                } else {
                    quantity += 1;
                }
                
                input.value = quantity;
                this.updateQuantity(productId, quantity);
            });
        });
    },

    checkout() {
        this.showNotification('Paiement en cours...', 'info');
        setTimeout(() => {
            this.items = [];
            this.saveCart();
            this.toggleCart();
            this.showNotification('Paiement réussi !', 'success');
        }, 2000);
    },

    showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('show');
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, 2700);
        }, 100);
    }
};

// Fonctions pour la wishlist
export const wishlistManager = {
    items: [],
    
    init() {
        this.loadWishlist();
        this.setupEventListeners();
        this.updateWishlistUI();
    },
    
    loadWishlist() {
        const savedWishlist = localStorage.getItem(WISHLIST_KEY);
        if (savedWishlist) {
            this.items = JSON.parse(savedWishlist);
        }
    },
    
    saveWishlist() {
        localStorage.setItem(WISHLIST_KEY, JSON.stringify(this.items));
        this.updateWishlistUI();
    },

    async addItem(product) {
        try {
            if (this.items.some(item => item.id === product.id)) {
                this.showNotification('Ce produit est déjà dans vos favoris', 'info');
                return;
            }
            
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                reduction: product.reduction,
                img: product.img_1
            });
            
            this.saveWishlist();
            this.showNotification('Produit ajouté aux favoris');
        } catch (error) {
            console.error('Erreur lors de l\'ajout aux favoris:', error);
            this.showNotification('Erreur lors de l\'ajout aux favoris', 'error');
        }
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveWishlist();
        this.showNotification('Produit retiré des favoris');
    },
    
    setupEventListeners() {
        const wishlistModal = document.getElementById('wishlist-modal');
        const wishlistBtn = document.getElementById('wishlist-btn');
        const closeBtn = wishlistModal?.querySelector('.close');
        
        if (wishlistBtn) wishlistBtn.addEventListener('click', () => this.toggleWishlist());
        if (closeBtn) closeBtn.addEventListener('click', () => this.toggleWishlist());
        
        window.addEventListener('click', (e) => {
            if (e.target === wishlistModal) {
                this.toggleWishlist();
            }
        });
        
        // Ajouter les événements pour les boutons de suppression et d'ajout au panier
        document.addEventListener('click', (e) => {
            // Supprimer un produit des favoris
            if (e.target.closest('.remove-wishlist-item')) {
                const productId = parseInt(e.target.closest('.remove-wishlist-item').dataset.id);
                this.removeItem(productId);
            }
            
            // Ajouter au panier depuis les favoris
            if (e.target.closest('.add-to-cart-from-wishlist')) {
                const productId = parseInt(e.target.closest('.add-to-cart-from-wishlist').dataset.id);
                this.addToCartFromWishlist(productId);
            }
        });
    },
    
    async addToCartFromWishlist(productId) {
        try {
            const product = await api.getProductById(productId);
            cartManager.addItem(product);
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier depuis les favoris:', error);
            this.showNotification('Erreur lors de l\'ajout au panier', 'error');
        }
    },
    
    toggleWishlist() {
        const wishlistModal = document.getElementById('wishlist-modal');
        if (wishlistModal) {
            wishlistModal.style.display = wishlistModal.style.display === 'block' ? 'none' : 'block';
            this.updateWishlistUI();
        }
    },
    
    updateWishlistUI() {
        const wishlistItemsContainer = document.getElementById('wishlist-items');
        const wishlistBtn = document.getElementById('wishlist-btn');
        
        if (wishlistBtn) {
            wishlistBtn.setAttribute('data-count', this.items.length);
        }
        
        if (!wishlistItemsContainer) return;
        
        if (this.items.length === 0) {
            wishlistItemsContainer.innerHTML = '<p class="empty-wishlist">Votre liste de souhaits est vide</p>';
            return;
        }
        
        wishlistItemsContainer.innerHTML = this.items.map(item => {
            const discountedPrice = item.reduction ? 
                (item.price * (1 - item.reduction / 100)).toFixed(2) : 
                item.price.toFixed(2);
                
            return `
                <div class="wishlist-item" data-id="${item.id}">
                    <img src="${item.img}" alt="${item.name}" class="wishlist-item-image">
                    <div class="wishlist-item-info">
                        <h3 class="wishlist-item-name">${item.name}</h3>
                        <div class="wishlist-item-price">
                            ${item.reduction ? 
                                `<span class="original-price">${item.price.toFixed(2)}€</span> 
                                <span class="sale-price">${discountedPrice}€</span>` : 
                                `<span>${discountedPrice}€</span>`}
                        </div>
                    </div>
                    <div class="wishlist-item-actions">
                        <button class="add-to-cart-from-wishlist" data-id="${item.id}">
                            <i class="fas fa-shopping-cart"></i>
                        </button>
                        <button class="remove-wishlist-item" data-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    },
    
    showNotification(message, type = 'success') {
        cartManager.showNotification(message, type);
    }
};

// Initialiser le panier et la wishlist au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    cartManager.init();
    wishlistManager.init();
}); 