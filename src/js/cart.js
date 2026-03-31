import { getLocalStorage, setLocalStorage } from "./utils.mjs";

function getCartItems() {
  const cartItems = getLocalStorage("so-cart");

  if (Array.isArray(cartItems)) {
    return cartItems;
  }

  return cartItems ? [cartItems] : [];
}

function renderCartContents() {
  const cartItems = getCartItems();

  if (!cartItems.length) {
    document.querySelector(".product-list").innerHTML =
      "<li class='cart-empty'>Your cart is empty.</li>";
    return;
  }

  const htmlItems = cartItems.map((item, index) =>
    cartItemTemplate(item, index),
  );
  document.querySelector(".product-list").innerHTML = htmlItems.join("");
  attachRemoveEvents();
}

function cartItemTemplate(item, index) {
  const newItem = `<li class="cart-card divider">
  <button class="cart-card__remove" type="button" data-index="${index}" aria-label="Remove ${item.Name} from cart">X</button>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${item.Colors[0].ColorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;

  return newItem;
}

function removeCartItem(index) {
  const cartItems = getCartItems();
  cartItems.splice(index, 1);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function attachRemoveEvents() {
  document.querySelectorAll(".cart-card__remove").forEach((button) => {
    button.addEventListener("click", (event) => {
      removeCartItem(Number(event.currentTarget.dataset.index));
    });
  });
}

renderCartContents();
