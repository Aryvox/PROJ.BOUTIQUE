import { cartManager } from './cart.js';

export const paymentManager = {
    // Initialiser le formulaire de paiement
    initPaymentForm() {
        const paymentForm = document.querySelector('#payment-form');
        if (!paymentForm) return;

        paymentForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.processPayment();
        });

        // Validation en temps réel des champs de carte
        const cardNumber = document.querySelector('#card-number');
        const cardExpiry = document.querySelector('#card-expiry');
        const cardCvc = document.querySelector('#card-cvc');

        if (cardNumber) {
            cardNumber.addEventListener('input', this.formatCardNumber);
        }
        if (cardExpiry) {
            cardExpiry.addEventListener('input', this.formatCardExpiry);
        }
        if (cardCvc) {
            cardCvc.addEventListener('input', this.formatCardCvc);
        }
    },

    // Formater le numéro de carte
    formatCardNumber(e) {
        let value = e.target.value.replace(/\D/g, '');
        value = value.replace(/(\d{4})/g, '$1 ').trim();
        e.target.value = value;
    },

    // Formater la date d'expiration
    formatCardExpiry(e) {
        let value = e.target.value.replace(/\D/g, '');
        if (value.length >= 2) {
            value = value.slice(0, 2) + '/' + value.slice(2);
        }
        e.target.value = value;
    },

    // Formater le CVC
    formatCardCvc(e) {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3);
    },

    // Valider les informations de carte
    validateCard(cardNumber, expiry, cvc) {
        // Validation simple pour la démo
        const cardNumberValid = /^\d{4}\s\d{4}\s\d{4}\s\d{4}$/.test(cardNumber);
        const expiryValid = /^\d{2}\/\d{2}$/.test(expiry);
        const cvcValid = /^\d{3}$/.test(cvc);

        return cardNumberValid && expiryValid && cvcValid;
    },

    // Traiter le paiement
    async processPayment() {
        const cardNumber = document.querySelector('#card-number').value;
        const cardExpiry = document.querySelector('#card-expiry').value;
        const cardCvc = document.querySelector('#card-cvc').value;
        const total = cartManager.getTotal();

        // Valider les informations de carte
        if (!this.validateCard(cardNumber, cardExpiry, cardCvc)) {
            this.showError('Veuillez vérifier les informations de votre carte');
            return;
        }

        // Simulation de traitement de paiement
        try {
            // Afficher le loader
            this.showLoading();

            // Simuler un délai de traitement
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Simuler une réponse de paiement réussie
            const success = Math.random() > 0.1; // 90% de chance de succès

            if (success) {
                this.handleSuccessfulPayment(total);
            } else {
                this.showError('Le paiement a échoué. Veuillez réessayer.');
            }
        } catch (error) {
            this.showError('Une erreur est survenue lors du traitement du paiement');
        } finally {
            this.hideLoading();
        }
    },

    // Gérer un paiement réussi
    handleSuccessfulPayment(total) {
        // Vider le panier
        cartManager.clearCart();

        // Afficher le message de succès
        this.showSuccess(`
            Paiement réussi !<br>
            Montant: ${total.toFixed(2)}€<br>
            Un email de confirmation vous a été envoyé.
        `);

        // Rediriger vers la page d'accueil après 3 secondes
        setTimeout(() => {
            window.location.href = '/';
        }, 3000);
    },

    // Afficher le loader
    showLoading() {
        const loader = document.createElement('div');
        loader.className = 'payment-loader';
        loader.innerHTML = '<div class="spinner"></div>';
        document.body.appendChild(loader);
    },

    // Cacher le loader
    hideLoading() {
        const loader = document.querySelector('.payment-loader');
        if (loader) {
            loader.remove();
        }
    },

    // Afficher une erreur
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'payment-error';
        errorDiv.textContent = message;
        document.querySelector('#payment-form').appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    },

    // Afficher un message de succès
    showSuccess(message) {
        const successDiv = document.createElement('div');
        successDiv.className = 'payment-success';
        successDiv.innerHTML = message;
        document.body.appendChild(successDiv);
    }
};

// Initialiser le formulaire de paiement au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    paymentManager.initPaymentForm();
}); 