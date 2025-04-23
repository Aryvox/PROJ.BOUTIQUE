// Configuration
const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];

// Éléments DOM
const productsContainer = document.getElementById('products-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const categoryFilters = document.querySelector('.category-filters');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Charger les produits depuis l'API
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        renderProducts();
        updatePagination();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
    }
}

// Rendre les produits
function renderProducts() {
    productsContainer.innerHTML = '';
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
}

// Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    const discountedPrice = calculateDiscountedPrice(product.price, product.reduction);
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.img_1}" alt="${product.name}" class="main-image">
            <img src="${product.img_2 || product.img_1}" alt="${product.name}" class="hover-image">
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                ${product.reduction > 0 ? 
                    `<span class="original-price">${formatPrice(product.price)}</span>` : 
                    ''}
                <span class="${product.reduction > 0 ? 'sale' : ''}">
                    ${formatPrice(discountedPrice)}
                </span>
            </div>
            <button class="view-details" data-product-id="${product.id}">Voir détails</button>
        </div>
    `;

    // Gestion du survol de l'image
    const mainImage = card.querySelector('.main-image');
    const hoverImage = card.querySelector('.hover-image');
    
    card.addEventListener('mouseenter', () => {
        if (hoverImage.src !== mainImage.src) {
            mainImage.style.opacity = '0';
            hoverImage.style.opacity = '1';
        }
    });
    
    card.addEventListener('mouseleave', () => {
        mainImage.style.opacity = '1';
        hoverImage.style.opacity = '0';
    });

    // Gestion du clic sur le bouton "Voir détails"
    card.querySelector('.view-details').addEventListener('click', () => {
        showProductDetails(product);
    });

    return card;
}

// Afficher les détails d'un produit
function showProductDetails(product) {
    const modalContent = document.querySelector('#product-modal .product-details');
    const discountedPrice = calculateDiscountedPrice(product.price, product.reduction);
    
    modalContent.innerHTML = `
        <div class="product-gallery">
            <img src="${product.img_1}" alt="${product.name}" class="main-image">
            <div class="thumbnail-container">
                <img src="${product.img_1}" alt="Miniature 1" class="thumbnail active">
                ${product.img_2 ? `<img src="${product.img_2}" alt="Miniature 2" class="thumbnail">` : ''}
                ${product.img_3 ? `<img src="${product.img_3}" alt="Miniature 3" class="thumbnail">` : ''}
            </div>
        </div>
        <div class="product-details-info">
            <h2>${product.name}</h2>
            <div class="price">
                ${product.reduction > 0 ? 
                    `<span class="original-price">${formatPrice(product.price)}</span>` : 
                    ''}
                <span class="${product.reduction > 0 ? 'sale' : ''}">
                    ${formatPrice(discountedPrice)}
                </span>
            </div>
            <div class="description">
                <p>${truncateText(product.description, 150)}</p>
                <button class="show-more">Voir plus</button>
            </div>
            <div class="specs">
                <h3>Caractéristiques</h3>
                <ul>
                    ${Object.entries(product.specs).map(([key, value]) => 
                        `<li><strong>${key}:</strong> ${value}</li>`
                    ).join('')}
                </ul>
            </div>
            <div class="actions">
                <button class="add-to-cart" data-product-id="${product.id}">Ajouter au panier</button>
                <button class="add-to-wishlist" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i> Ajouter aux favoris
                </button>
            </div>
        </div>
    `;

    // Gestion du carrousel d'images
    const thumbnails = modalContent.querySelectorAll('.thumbnail');
    const mainImage = modalContent.querySelector('.main-image');
    
    thumbnails.forEach(thumb => {
        thumb.addEventListener('click', () => {
            thumbnails.forEach(t => t.classList.remove('active'));
            thumb.classList.add('active');
            mainImage.src = thumb.src;
        });
    });

    // Gestion du bouton "Voir plus"
    const showMoreBtn = modalContent.querySelector('.show-more');
    const description = modalContent.querySelector('.description p');
    
    showMoreBtn.addEventListener('click', () => {
        description.textContent = product.description;
        showMoreBtn.style.display = 'none';
    });

    // Gestion des boutons d'action
    modalContent.querySelector('.add-to-cart').addEventListener('click', () => {
        addToCart(product);
    });

    modalContent.querySelector('.add-to-wishlist').addEventListener('click', () => {
        addToWishlist(product);
    });

    openModal('product');
}

// Filtrer les produits
function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const sortValue = sortSelect.value;
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    // Trier les produits
    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => b.price - a.price);
    }

    currentPage = 1;
    renderProducts();
    updatePagination();
}

// Mettre à jour la pagination
function updatePagination() {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

// Événements
searchInput.addEventListener('input', filterProducts);
sortSelect.addEventListener('change', filterProducts);

prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        renderProducts();
        updatePagination();
    }
});

nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    if (currentPage < totalPages) {
        currentPage++;
        renderProducts();
        updatePagination();
    }
});

// Charger les produits au chargement de la page
document.addEventListener('DOMContentLoaded', loadProducts); 