document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const data = Object.fromEntries(formData.entries());
            
            try {
                // Simulation d'envoi de formulaire
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                showNotification('Message envoyé avec succès !', 'success');
                contactForm.reset();
            } catch (error) {
                showNotification('Erreur lors de l\'envoi du message', 'error');
                console.error('Erreur:', error);
            }
        });
    }
});

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.remove();
    }, 3000);
} 