import { api } from './api.js';
import { cartManager } from './cart.js';
import { wishlistManager } from './wishlist.js';

// Configuration
const PRODUCTS_PER_PAGE = 12;
let currentPage = 1;
let allProducts = [];
let filteredProducts = [];

// Éléments DOM
const productsContainer = document.getElementById('products-grid');
const searchInput = document.querySelector('.search input');
const sortSelect = document.querySelector('.sort select');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageInfo = document.getElementById('page-info');

// Charger les produits depuis l'API
async function loadProducts() {
    try {
        console.log("Chargement des produits...");
        const products = await api.getProducts();
        console.log("Produits reçus:", products);
        
        allProducts = products;
        filteredProducts = [...allProducts];
        renderProducts();
        updatePagination();
        
        // Initialiser les filtres après chargement
        initializeFilters();
    } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        if (productsContainer) {
            productsContainer.innerHTML = '<div class="error">Erreur lors du chargement des produits</div>';
        }
    }
}

// Rendre les produits
function renderProducts() {
    if (!productsContainer) return;
    
    productsContainer.innerHTML = '';
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    const endIndex = startIndex + PRODUCTS_PER_PAGE;
    const productsToShow = filteredProducts.slice(startIndex, endIndex);
    
    console.log(`Affichage de ${productsToShow.length} produits`);

    if (productsToShow.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">Aucun produit trouvé</div>';
        return;
    }

    productsToShow.forEach(product => {
        const productCard = createProductCard(product);
        productsContainer.appendChild(productCard);
    });
    
    // Initialiser les carrousels d'images
    initializeProductSliders();
    
    // Ajouter les écouteurs d'événements aux boutons
    addProductEventListeners();
}

// Créer une carte de produit
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.dataset.id = product.id;
    
    const discountedPrice = product.reduction ? 
        (product.price * (1 - product.reduction / 100)).toFixed(2) : 
        product.price.toFixed(2);
    
    // Créer un tableau d'images pour le carrousel
    const images = [];
    if (product.img_1) images.push(product.img_1);
    if (product.img_2) images.push(product.img_2);
    if (product.img_3) images.push(product.img_3);
    
    // Si aucune image n'est disponible, utiliser une image par défaut
    if (images.length === 0) {
        images.push('/assets/img/placeholder.jpg');
    }
    
    // Générer le HTML du carrousel
    const sliderHTML = `
        <div class="product-image">
            <img src="${images[0]}" alt="${product.name}" onerror="this.src='/assets/img/placeholder.jpg'">
            ${product.reduction ? `<div class="discount-badge">-${product.reduction}%</div>` : ''}
        </div>
    `;
    
    card.innerHTML = `
        ${sliderHTML}
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <div class="product-price">
                ${product.reduction > 0 ? 
                    `<span class="original-price">${product.price.toFixed(2)}€</span> 
                    <span class="sale-price">${discountedPrice}€</span>` : 
                    `<span>${discountedPrice}€</span>`}
            </div>
            <div class="product-actions">
                <button class="add-to-cart" data-product-id="${product.id}">
                    <i class="fas fa-shopping-cart"></i> Ajouter
                </button>
                <button class="add-to-wishlist ${wishlistManager.isInWishlist(product.id) ? 'in-wishlist' : ''}" data-product-id="${product.id}">
                    <i class="fas fa-heart"></i>
                </button>
                <button class="view-details" data-product-id="${product.id}">Voir détails</button>
            </div>
        </div>
    `;

    return card;
}

// Initialiser les carrousels d'images
function initializeProductSliders() {
    // Pour chaque slider
    document.querySelectorAll('.product-image-slider').forEach(slider => {
        const productId = slider.dataset.productId;
        const slides = slider.querySelectorAll('img');
        const slidesCount = slides.length;
        
        if (slidesCount < 2) return; // Ignore si un seul slide
        
        // Index du slide actuel
        let currentSlide = 0;
        
        // Fonction pour montrer un slide spécifique
        function showSlide(index) {
            if (index < 0) index = slidesCount - 1;
            if (index >= slidesCount) index = 0;
            
            currentSlide = index;
            slider.style.transform = `translateX(-${currentSlide * 100}%)`;
            
            // Mettre à jour les dots de navigation
            const dots = document.querySelectorAll(`.slider-nav .dot[data-product-id="${productId}"]`);
            dots.forEach((dot, i) => {
                if (i === currentSlide) {
                    dot.classList.add('active');
                } else {
                    dot.classList.remove('active');
                }
            });
        }
        
        // Navigation par les flèches
        const prevArrow = document.querySelector(`.slider-arrow.prev[data-product-id="${productId}"]`);
        const nextArrow = document.querySelector(`.slider-arrow.next[data-product-id="${productId}"]`);
        
        if (prevArrow) {
            prevArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(currentSlide - 1);
            });
        }
        
        if (nextArrow) {
            nextArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(currentSlide + 1);
            });
        }
        
        // Navigation par les dots
        const dots = document.querySelectorAll(`.slider-nav .dot[data-product-id="${productId}"]`);
        dots.forEach((dot, i) => {
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                showSlide(i);
            });
        });
        
        // Initialiser le premier slide
        showSlide(0);
    });
}

// Ajouter les écouteurs d'événements aux boutons des produits
function addProductEventListeners() {
    // Ajouter au panier
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = parseInt(button.dataset.productId);
            try {
                const product = await api.getProductById(productId);
                cartManager.addItem(product);
            } catch (error) {
                console.error('Erreur lors de l\'ajout au panier:', error);
            }
        });
    });

    // Ajouter aux favoris
    document.querySelectorAll('.add-to-wishlist').forEach(button => {
        button.addEventListener('click', async (e) => {
            e.stopPropagation();
            const productId = parseInt(button.dataset.productId);
            try {
                const product = await api.getProductById(productId);
                wishlistManager.addItem(product);
                
                // Mettre à jour l'apparence du bouton
                if (button.classList.contains('in-wishlist')) {
                    button.classList.remove('in-wishlist');
                } else {
                    button.classList.add('in-wishlist');
                }
            } catch (error) {
                console.error('Erreur lors de l\'ajout aux favoris:', error);
            }
        });
    });
    
    // Voir détails
    document.querySelectorAll('.view-details, .product-image').forEach(element => {
        element.addEventListener('click', (e) => {
            const productCard = e.currentTarget.closest('.product-card');
            if (!productCard) return;
            
            const productId = productCard.dataset.id;
            window.location.href = `product-detail.html?id=${productId}`;
        });
    });
}

// Initialiser les filtres
function initializeFilters() {
    // Recherche
    if (searchInput) {
        searchInput.addEventListener('input', filterProducts);
    }
    
    // Tri
    if (sortSelect) {
        sortSelect.addEventListener('change', filterProducts);
    }
}

// Filtrer les produits
function filterProducts() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';
    const sortValue = sortSelect ? sortSelect.value : '';
    
    filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm);
        return matchesSearch;
    });

    // Trier les produits
    if (sortValue === 'price-asc') {
        filteredProducts.sort((a, b) => {
            const priceA = a.reduction ? a.price * (1 - a.reduction / 100) : a.price;
            const priceB = b.reduction ? b.price * (1 - b.reduction / 100) : b.price;
            return priceA - priceB;
        });
    } else if (sortValue === 'price-desc') {
        filteredProducts.sort((a, b) => {
            const priceA = a.reduction ? a.price * (1 - a.reduction / 100) : a.price;
            const priceB = b.reduction ? b.price * (1 - b.reduction / 100) : b.price;
            return priceB - priceA;
        });
    } else if (sortValue === 'name-asc') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortValue === 'name-desc') {
        filteredProducts.sort((a, b) => b.name.localeCompare(a.name));
    }

    currentPage = 1;
    renderProducts();
    updatePagination();
}

// Mettre à jour la pagination
function updatePagination() {
    if (!prevPageBtn || !nextPageBtn || !pageInfo) return;
    
    const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages;
    
    pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;
}

// Configurer la pagination
function setupPagination() {
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                renderProducts();
                updatePagination();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
            if (currentPage < totalPages) {
                currentPage++;
                renderProducts();
                updatePagination();
            }
        });
    }
}

// Initialiser tout au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    console.log("DOM chargé, initialisation...");
    loadProducts();
    setupPagination();
}); 