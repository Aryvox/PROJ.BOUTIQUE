import { api } from './api.js';
import { cartManager } from './cart.js';

// Gestion de la liste de souhaits
const WISHLIST_KEY = 'boutique_wishlist';

// Fonction pour le gestionnaire de wishlist
export const wishlistManager = {
    items: [],
    
    init() {
        this.loadWishlist();
        this.setupEventListeners();
        this.updateWishlistUI();
        this.updateWishlistButtons();
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
        this.updateWishlistButtons();
    },

    async addItem(product) {
        try {
            const productId = product.id;
            
            // Vérifier si le produit est déjà dans les favoris
            if (this.isInWishlist(productId)) {
                this.removeItem(productId);
                return;
            }
            
            // Ajouter le produit aux favoris
            this.items.push({
                id: productId,
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

    isInWishlist(productId) {
        return this.items.some(item => item.id === productId);
    },

    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveWishlist();
        this.showNotification('Produit retiré des favoris');
    },
    
    updateWishlistButtons() {
        // Mettre à jour l'apparence des boutons de favoris sur toutes les pages
        document.querySelectorAll('.add-to-wishlist, .add-to-wishlist-btn').forEach(btn => {
            const productId = parseInt(btn.dataset.productId);
            if (this.isInWishlist(productId)) {
                btn.classList.add('in-wishlist');
            } else {
                btn.classList.remove('in-wishlist');
            }
        });

        // Mettre à jour le compteur de favoris
        const wishlistCount = document.querySelector('.wishlist-count');
        if (wishlistCount) {
            wishlistCount.textContent = this.items.length;
        }
    },
    
    setupEventListeners() {
        const wishlistModal = document.getElementById('wishlist-modal');
        const wishlistBtn = document.getElementById('wishlist-btn');
        const closeBtn = wishlistModal?.querySelector('.wishlist-modal-close');
        
        if (wishlistBtn) {
            wishlistBtn.addEventListener('click', () => {
                if (wishlistModal) {
                    wishlistModal.style.display = 'block';
                    this.updateWishlistUI();
                }
            });
        }

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                if (wishlistModal) {
                    wishlistModal.style.display = 'none';
                }
            });
        }
        
        if (wishlistModal) {
            window.addEventListener('click', (e) => {
                if (e.target === wishlistModal) {
                    wishlistModal.style.display = 'none';
                }
            });
        }
        
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
            this.showNotification('Produit ajouté au panier');
        } catch (error) {
            console.error('Erreur lors de l\'ajout au panier depuis les favoris:', error);
            this.showNotification('Erreur lors de l\'ajout au panier', 'error');
        }
    },
    
    updateWishlistUI() {
        const wishlistItemsContainer = document.getElementById('wishlist-items');
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

// Initialiser la wishlist au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    wishlistManager.init();
}); 