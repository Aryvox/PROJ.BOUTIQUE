// Configuration de l'API Mapbox
const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoidGFsaGFraMdqYTA2IiwiYSI6ImNsdTd60HptdTBhczgybGxsbWdmcjN6ZWwiQ.RBnwQKZHLwgUhnIh0LeP_g'; // À remplacer par votre token
const MAPBOX_API_URL = 'https://api.mapbox.com/geocoding/v5/mapbox.places/';

export const addressManager = {
    // Initialiser l'autocomplétion d'adresse
    initAddressAutocomplete(inputElement, resultsContainer) {
        let timeout;
        
        inputElement.addEventListener('input', (e) => {
            clearTimeout(timeout);
            const query = e.target.value.trim();
            
            if (query.length < 3) {
                resultsContainer.innerHTML = '';
                return;
            }
            
            timeout = setTimeout(() => {
                this.searchAddress(query, resultsContainer);
            }, 300);
        });
        
        // Fermer les résultats quand on clique en dehors
        document.addEventListener('click', (e) => {
            if (!inputElement.contains(e.target) && !resultsContainer.contains(e.target)) {
                resultsContainer.innerHTML = '';
            }
        });
    },
    
    // Rechercher une adresse
    async searchAddress(query, resultsContainer) {
        try {
            const response = await fetch(
                `${MAPBOX_API_URL}${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=fr&types=address`
            );
            
            const data = await response.json();
            
            if (data.features && data.features.length > 0) {
                this.displayResults(data.features, resultsContainer);
            } else {
                resultsContainer.innerHTML = '<div class="no-results">Aucune adresse trouvée</div>';
            }
        } catch (error) {
            console.error('Erreur lors de la recherche d\'adresse:', error);
            resultsContainer.innerHTML = '<div class="error">Erreur lors de la recherche</div>';
        }
    },
    
    // Afficher les résultats
    displayResults(results, container) {
        container.innerHTML = results.map(result => `
            <div class="address-result" data-address='${JSON.stringify(result)}'>
                ${result.place_name}
            </div>
        `).join('');
        
        // Ajouter les événements de clic
        container.querySelectorAll('.address-result').forEach(result => {
            result.addEventListener('click', (e) => {
                const addressData = JSON.parse(e.currentTarget.dataset.address);
                this.selectAddress(addressData);
                container.innerHTML = '';
            });
        });
    },
    
    // Sélectionner une adresse
    selectAddress(addressData) {
        // Remplir les champs du formulaire avec les données de l'adresse
        const addressInput = document.querySelector('#address');
        const cityInput = document.querySelector('#city');
        const postalCodeInput = document.querySelector('#postal-code');
        
        // Extraire les composants de l'adresse
        const context = addressData.context || [];
        const city = context.find(c => c.id.startsWith('place'));
        const postalCode = context.find(c => c.id.startsWith('postcode'));
        
        if (addressInput) addressInput.value = addressData.text;
        if (cityInput && city) cityInput.value = city.text;
        if (postalCodeInput && postalCode) postalCodeInput.value = postalCode.text;
        
        // Sauvegarder l'adresse complète dans le localStorage
        const address = {
            street: addressData.text,
            city: city ? city.text : '',
            postalCode: postalCode ? postalCode.text : '',
            fullAddress: addressData.place_name,
            coordinates: addressData.center
        };
        
        localStorage.setItem('last_address', JSON.stringify(address));
    }
}; 