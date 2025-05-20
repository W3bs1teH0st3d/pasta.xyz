document.addEventListener('DOMContentLoaded', () => {
    const buyButtons = document.querySelectorAll('.shop-button');
    const modal = document.querySelector('#purchaseModal');
    const closeModal = document.querySelector('.modal-close');
    const funpayButton = document.querySelector('.modal-fupay');
    const continueButton = document.querySelector('.modal-continue');
    const modalProductName = document.querySelector('#modalProductName');
    const modalProductPrice = document.querySelector('#modalProductPrice');
    let currentFunpayUrl = '';

    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const name = button.getAttribute('data-name');
            const price = button.getAttribute('data-price');
            currentFunpayUrl = button.getAttribute('data-funpaylink');
            modalProductName.textContent = name;
            modalProductPrice.innerHTML = `${price} ₽`;
            funpayButton.setAttribute('href', currentFunpayUrl);
            modal.style.display = 'block';
        });
    });

    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Disable the promo code button (optional, can be re-enabled if needed)
    document.querySelector('.promo-code-button').disabled = true;
});