// Éléments DOM
const cartItemsContainer = document.getElementById('cart-items');
const cartTotalPrice = document.getElementById('cart-total-price');
const checkoutBtn = document.getElementById('checkout-btn');

// Fonction pour ajouter un produit au panier
function addToCart(product, quantity = 1) {
    const cart = storage.get('cart') || [];
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            reduction: product.reduction,
            img_1: product.img_1,
            quantity: quantity
        });
    }
    
    storage.set('cart', cart);
    updateCartDisplay();
    showNotification('Produit ajouté au panier');
}

// Fonction pour mettre à jour l'affichage du panier
function updateCartDisplay() {
    const cart = storage.get('cart') || [];
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Votre panier est vide</p>';
        cartTotalPrice.textContent = formatPrice(0);
        checkoutBtn.disabled = true;
        return;
    }
    
    let total = 0;
    
    cart.forEach(item => {
        const discountedPrice = calculateDiscountedPrice(item.price, item.reduction);
        const itemTotal = discountedPrice * item.quantity;
        total += itemTotal;
        
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <img src="${item.img_1}" alt="${item.name}" class="cart-item-image">
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
            <div class="quantity-controls">
                <button class="decrease-quantity" data-product-id="${item.id}">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="increase-quantity" data-product-id="${item.id}">+</button>
                <button class="remove-item" data-product-id="${item.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    cartTotalPrice.textContent = formatPrice(total);
    checkoutBtn.disabled = false;
    
    // Ajouter les événements aux boutons
    addCartItemEventListeners();
}

// Fonction pour ajouter les événements aux éléments du panier
function addCartItemEventListeners() {
    // Augmenter la quantité
    document.querySelectorAll('.increase-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const cart = storage.get('cart');
            const item = cart.find(item => item.id === productId);
            if (item) {
                item.quantity++;
                storage.set('cart', cart);
                updateCartDisplay();
            }
        });
    });
    
    // Diminuer la quantité
    document.querySelectorAll('.decrease-quantity').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const cart = storage.get('cart');
            const item = cart.find(item => item.id === productId);
            if (item && item.quantity > 1) {
                item.quantity--;
                storage.set('cart', cart);
                updateCartDisplay();
            }
        });
    });
    
    // Supprimer un article
    document.querySelectorAll('.remove-item').forEach(button => {
        button.addEventListener('click', () => {
            const productId = parseInt(button.dataset.productId);
            const cart = storage.get('cart');
            const newCart = cart.filter(item => item.id !== productId);
            storage.set('cart', newCart);
            updateCartDisplay();
        });
    });
}

// Fonction pour passer la commande
function checkout() {
    const cart = storage.get('cart');
    if (cart.length === 0) return;
    
    // Ici, vous pouvez ajouter la logique pour le processus de paiement
    // Par exemple, rediriger vers une page de paiement ou afficher un formulaire
    
    // Pour l'instant, nous allons simplement vider le panier
    storage.set('cart', []);
    updateCartDisplay();
    showNotification('Commande passée avec succès');
}

// Fonction pour afficher une notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Événements
checkoutBtn.addEventListener('click', checkout);

// Mettre à jour l'affichage du panier au chargement de la page
document.addEventListener('DOMContentLoaded', updateCartDisplay); 