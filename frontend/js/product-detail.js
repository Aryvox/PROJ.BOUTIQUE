import { api } from './api.js';
import { cartManager } from './cart.js';
import { wishlistManager } from './wishlist.js';

document.addEventListener('DOMContentLoaded', async () => {
    const productDetail = new ProductDetail();
    await productDetail.init();
});

class ProductDetail {
    constructor() {
        // Récupérer l'ID du produit depuis l'URL
        this.productId = new URLSearchParams(window.location.search).get('id');
        
        // Éléments DOM
        this.container = document.querySelector('.product-detail-container');
        this.mainImage = document.getElementById('main-image');
        this.thumbnailContainer = document.getElementById('thumbnail-container');
        this.productName = document.getElementById('product-name');
        this.originalPrice = document.getElementById('original-price');
        this.currentPrice = document.getElementById('product-price');
        this.discountBadge = document.getElementById('product-discount');
        this.stockInfo = document.getElementById('product-stock');
        this.deliveryTime = document.getElementById('delivery-time');
        this.deliveryPrice = document.getElementById('delivery-price');
        this.description = document.getElementById('product-description');
        this.specsList = document.getElementById('product-specs');
        this.quantityInput = document.getElementById('quantity');
        this.addToCartBtn = document.getElementById('add-to-cart');
        this.addToWishlistBtn = document.getElementById('add-to-wishlist');
        this.similarProductsContainer = document.getElementById('similar-products');
        
        // Données du produit
        this.product = null;
        this.currentImageIndex = 0;
        this.images = [];
    }

    async init() {
        if (!this.productId) {
            window.location.href = 'products.html';
            return;
        }

        try {
            // Récupérer les données du produit
            this.product = await api.getProductById(parseInt(this.productId));
            console.log('Produit chargé:', this.product);
            
            if (!this.product) {
                this.showError('Produit non trouvé');
                return;
            }
            
            // Récupérer les images du produit
            this.images = await api.getProductImages(parseInt(this.productId));
            
            // Récupérer les produits similaires
            const similarProducts = await api.getSimilarProducts(parseInt(this.productId));
            
            // Afficher les données du produit
            this.displayProduct();
            this.displaySimilarProducts(similarProducts);
            
            // Configurer les événements
            this.setupEventListeners();
            
        } catch (error) {
            console.error('Erreur lors du chargement du produit:', error);
            this.showError('Erreur lors du chargement du produit');
        }
    }

    displayProduct() {
        // Titre de la page
        document.title = `${this.product.name} - Boutique PC`;
        
        // Nom du produit
        this.productName.textContent = this.product.name;
        
        // Images
        this.displayImages();
        
        // Prix et réduction
        this.displayPricing();
        
        // Disponibilité
        this.displayAvailability();
        
        // Informations de livraison
        this.displayDeliveryInfo();
        
        // Spécifications
        this.displaySpecifications();
        
        // Vérifier si le produit est dans les favoris
        this.updateWishlistButton();
    }
    
    displayImages() {
        // Récupérer toutes les images disponibles
        const images = [];
        if (this.product.img_1) images.push(this.product.img_1);
        if (this.product.img_2) images.push(this.product.img_2);
        if (this.product.img_3) images.push(this.product.img_3);

        // Si aucune image n'est disponible, utiliser une image par défaut
        if (images.length === 0) {
            images.push('/assets/img/placeholder.jpg');
        }

        // Sauvegarder les images pour la navigation
        this.images = images;

        // Afficher l'image principale
        if (this.mainImage) {
            this.mainImage.src = images[0];
            this.mainImage.alt = this.product.name;
            this.mainImage.onerror = () => {
                this.mainImage.src = '/assets/img/placeholder.jpg';
            };
        }

        // Générer les miniatures si plusieurs images
        if (this.thumbnailContainer && images.length > 1) {
            this.thumbnailContainer.innerHTML = images.map((img, index) => `
                <div class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
                    <img src="${img}" alt="${this.product.name}" onerror="this.src='/assets/img/placeholder.jpg'">
                </div>
            `).join('');

            // Ajouter les événements sur les miniatures
            this.thumbnailContainer.querySelectorAll('.thumbnail').forEach(thumb => {
                thumb.addEventListener('click', () => {
                    const index = parseInt(thumb.dataset.index);
                    this.currentImageIndex = index;
                    this.updateMainImage();
                });
            });
        } else if (this.thumbnailContainer) {
            // Si une seule image, cacher le conteneur des miniatures
            this.thumbnailContainer.style.display = 'none';
        }
    }
    
    displayPricing() {
        if (this.product.reduction && this.product.reduction > 0) {
            const discountedPrice = (this.product.price * (1 - this.product.reduction / 100)).toFixed(2);
            this.originalPrice.textContent = `${this.product.price.toFixed(2)}€`;
            this.currentPrice.textContent = `${discountedPrice}€`;
            this.discountBadge.textContent = `-${this.product.reduction}%`;
            this.discountBadge.style.display = 'block';
        } else {
            this.originalPrice.style.display = 'none';
            this.currentPrice.textContent = `${this.product.price.toFixed(2)}€`;
            this.discountBadge.style.display = 'none';
        }
    }
    
    displayAvailability() {
        if (this.product.available) {
            this.stockInfo.innerHTML = '<i class="fas fa-check"></i> En stock';
            this.stockInfo.classList.add('in-stock');
            this.addToCartBtn.disabled = false;
        } else {
            this.stockInfo.innerHTML = '<i class="fas fa-times"></i> Indisponible';
            this.stockInfo.classList.add('out-of-stock');
            this.addToCartBtn.disabled = true;
        }
    }
    
    displayDeliveryInfo() {
        if (this.product.delivery_time) {
            this.deliveryTime.innerHTML = `<i class="fas fa-truck"></i> Livraison en ${this.product.delivery_time} jour(s)`;
        }
        
        if (this.product.delivery_price === 0) {
            this.deliveryPrice.innerHTML = '<i class="fas fa-euro-sign"></i> Livraison gratuite';
            this.deliveryPrice.classList.add('free-delivery');
        } else if (this.product.delivery_price) {
            this.deliveryPrice.innerHTML = `<i class="fas fa-euro-sign"></i> Frais de livraison: ${this.product.delivery_price.toFixed(2)}€`;
        }
    }
    
    displaySpecifications() {
        // Spécifications
        if (this.product.specs) {
            const specs = this.product.specs.split(';');
            this.specsList.innerHTML = specs.map(spec => 
                `<li><i class="fas fa-check-circle"></i> ${spec.trim()}</li>`
            ).join('');
        } else {
            this.specsList.innerHTML = '<li>Aucune spécification disponible</li>';
        }
        
        // Description
        const description = "Ce produit fait partie de notre sélection de composants PC de haute qualité. Idéal pour améliorer les performances de votre ordinateur.";
        this.description.innerHTML = `
            <div class="description-content">
                <p>${description.substring(0, 150)}...</p>
                <button class="show-more-btn">Voir plus</button>
            </div>
            <div class="description-full" style="display: none;">
                <p>${description}</p>
                <button class="show-less-btn">Voir moins</button>
            </div>
        `;
    }
    
    displaySimilarProducts(products) {
        if (products.length === 0) return;
        
        this.similarProductsContainer.innerHTML = `
            <h2>Produits similaires</h2>
            <div class="similar-products-grid">
                ${products.map(product => `
                    <div class="product-card">
                        <img src="${product.img_1}" alt="${product.name}">
                        <h3>${product.name}</h3>
                        <p class="price">${product.price.toFixed(2)}€</p>
                        <a href="product-detail.html?id=${product.id}" class="view-product">Voir le produit</a>
                    </div>
                `).join('')}
            </div>
        `;
    }
    
    updateWishlistButton() {
        if (wishlistManager.isInWishlist(this.product.id)) {
            this.addToWishlistBtn.classList.add('in-wishlist');
        } else {
            this.addToWishlistBtn.classList.remove('in-wishlist');
        }
    }

    setupEventListeners() {
        // Navigation du carrousel
        document.getElementById('prev-image')?.addEventListener('click', () => {
            this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
            this.updateMainImage();
        });
        
        document.getElementById('next-image')?.addEventListener('click', () => {
            this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
            this.updateMainImage();
        });
        
        // Changer l'image principale quand on clique sur une miniature
        this.thumbnailContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('thumbnail')) {
                this.currentImageIndex = parseInt(e.target.dataset.index);
                this.updateMainImage();
            }
        });
        
        // Boutons de quantité
        document.getElementById('decrease-quantity').addEventListener('click', () => {
            if (parseInt(this.quantityInput.value) > 1) {
                this.quantityInput.value = parseInt(this.quantityInput.value) - 1;
            }
        });
        
        document.getElementById('increase-quantity').addEventListener('click', () => {
            this.quantityInput.value = parseInt(this.quantityInput.value) + 1;
        });
        
        // Ajouter au panier
        this.addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(this.quantityInput.value);
            cartManager.addItem(this.product, quantity);
            this.showNotification(`${this.product.name} ajouté au panier`, 'success');
        });
        
        // Ajouter aux favoris
        this.addToWishlistBtn.addEventListener('click', () => {
            wishlistManager.addItem(this.product);
            this.updateWishlistButton();
            this.showNotification(`${this.product.name} ${wishlistManager.isInWishlist(this.product.id) ? 'ajouté aux' : 'retiré des'} favoris`, 'success');
        });
        
        // Description complète
        this.description.addEventListener('click', (e) => {
            if (e.target.classList.contains('show-more-btn')) {
                e.target.parentElement.style.display = 'none';
                e.target.parentElement.nextElementSibling.style.display = 'block';
            } else if (e.target.classList.contains('show-less-btn')) {
                e.target.parentElement.style.display = 'none';
                e.target.parentElement.previousElementSibling.style.display = 'block';
            }
        });
    }
    
    updateMainImage() {
        this.mainImage.src = this.images[this.currentImageIndex];
        document.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.classList.toggle('active', parseInt(thumb.dataset.index) === this.currentImageIndex);
        });
    }

    showNotification(message, type = 'info') {
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
    
    showError(message) {
        const mainContent = document.querySelector('.product-detail-container');
        mainContent.innerHTML = `
            <div class="error-container">
                <div class="error-message">
                    <i class="fas fa-exclamation-circle"></i>
                    <h2>Erreur</h2>
                    <p>${message}</p>
                    <a href="products.html" class="btn">Retour aux produits</a>
                </div>
            </div>
        `;
    }
} 