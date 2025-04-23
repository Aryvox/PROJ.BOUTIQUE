// Éléments DOM
const wishlistItemsContainer = document.getElementById('wishlist-items');

// Fonction pour ajouter un produit à la liste de souhaits
function addToWishlist(product) {
    const wishlist = storage.get('wishlist') || [];
    
    // Vérifier si le produit est déjà dans la liste
    if (wishlist.some(item => item.id === product.id)) {
        showNotification('Ce produit est déjà dans votre liste de souhaits');
        return;
    }
    
    wishlist.push({
        id: product.id,
        name: product.name,
        price: product.price,
        reduction: product.reduction,
        img_1: product.img_1
    });
    
    storage.set('wishlist', wishlist);
    updateWishlistDisplay();
    showNotification('Produit ajouté à la liste de souhaits');
}

// Fonction pour supprimer un produit de la liste de souhaits
function removeFromWishlist(productId) {
    const wishlist = storage.get('wishlist') || [];
    const newWishlist = wishlist.filter(item => item.id !== productId);
    storage.set('wishlist', newWishlist);
    updateWishlistDisplay();
    showNotification('Produit retiré de la liste de souhaits');
}

// Fonction pour mettre à jour l'affichage de la liste de souhaits
function updateWishlistDisplay() {
    const wishlist = storage.get('wishlist') || [];
    wishlistItemsContainer.innerHTML = '';
    
    if (wishlist.length === 0) {
        wishlistItemsContainer.innerHTML = '<p>Votre liste de souhaits est vide</p>';
        return;
    }
    
    wishlist.forEach(item => {
        const discountedPrice = calculateDiscountedPrice(item.price, item.reduction);
        
        const wishlistItem = document.createElement('div');
        wishlistItem.className = 'wishlist-item';
        wishlistItem.innerHTML = `
            <div class="wishlist-item-info">
                <img src="${item.img_1}" alt="${item.name}" class="wishlist-item-image">
                <div>
                    <h3>${item.name}</h3>
                    <div class="price">
                        ${item.reduction > 0 ? 
                            `<span class="original-price">${formatPrice(item.price)}</span>` : 
                            ''}
                        <span class="${item.reduction > 0 ? 'sale' : ''}">
                            ${formatPrice(discountedPrice)}
                        </span>
                    </div>
                </div>
            </div>
            <div class="wishlist-item-actions">
                <button class="add-to-cart" data-product-id="${item.id}">
                    <i class="fas fa-shopping-cart"></i> Ajouter au panier
                </button>
                <button class="remove-from-wishlist" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        wishlistItemsContainer.appendChild(wishlistItem);
    });
    
    // Ajouter les événements aux boutons
    addWishlistItemEventListeners();
}

// Fonction pour ajouter les événements aux éléments de la liste de souhaits
function addWishlistItemEventListeners() {
    // Ajouter au panier
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const wishlist = storage.get('wishlist');
            const product = wishlist.find(item => item.id === productId);
            if (product) {
                addToCart(product);
            }
        });
    });
    
    // Supprimer de la liste de souhaits
    document.querySelectorAll('.remove-from-wishlist').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            removeFromWishlist(productId);
        });
    });
}

// Mettre à jour l'affichage de la liste de souhaits au chargement de la page
document.addEventListener('DOMContentLoaded', updateWishlistDisplay); 