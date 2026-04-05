// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  return JSON.parse(localStorage.getItem(key));
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

export function getCartItems(key = "so-cart") {
  const cartItems = getLocalStorage(key);

  if (Array.isArray(cartItems)) {
    return cartItems;
  }

  return cartItems ? [cartItems] : [];
}

export function formatCurrency(value) {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function removeAlerts() {
  document.querySelectorAll(".alert").forEach((alert) => alert.remove());
}

export function alertMessage(message, scroll = true) {
  removeAlerts();

  const alert = document.createElement("div");
  alert.className = "alert";
  const messageText = document.createElement("span");
  messageText.textContent = message;

  const closeButton = document.createElement("button");
  closeButton.className = "alert__close";
  closeButton.type = "button";
  closeButton.setAttribute("aria-label", "Dismiss message");
  closeButton.textContent = "X";

  alert.append(messageText, closeButton);

  alert.addEventListener("click", function handleAlertClick(event) {
    if (event.target.closest(".alert__close")) {
      this.remove();
    }
  });

  const main = qs("main");

  if (main) {
    main.prepend(alert);
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener("touchend", (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener("click", callback);
}
