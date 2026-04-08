import {
  alertMessage,
  getCartItems,
  removeAlerts,
  setLocalStorage,
} from './utils.mjs';

export function animateCartIcon() {
  const cart = document.querySelector('.cart');

  if (!cart) {
    return;
  }

  cart.classList.remove('cart--updated');

  // Force a reflow so repeated additions restart the animation.
  void cart.offsetWidth;

  cart.classList.add('cart--updated');

  window.setTimeout(() => {
    cart.classList.remove('cart--updated');
  }, 700);
}

export function addProductToCart(product, options = {}) {
  const {
    storageKey = 'so-cart',
    notify = true,
    message = `${product.Name} was added to your cart.`,
  } = options;

  const cartItems = getCartItems(storageKey);
  cartItems.push(product);
  setLocalStorage(storageKey, cartItems);
  animateCartIcon();

  if (notify) {
    removeAlerts();
    alertMessage(message, false);
  }

  return cartItems;
}
