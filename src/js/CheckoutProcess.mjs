import ExternalServices from "./ExternalServices.mjs";
import {
  alertMessage,
  formatCurrency,
  getCartItems,
  qs,
  removeAlerts,
  setLocalStorage,
} from "./utils.mjs";

function formDataToJSON(formElement) {
  const formData = new FormData(formElement);
  const convertedJSON = {};

  formData.forEach((value, key) => {
    convertedJSON[key] = value.trim();
  });

  return convertedJSON;
}

function packageItems(items) {
  return items.map((item) => ({
    id: item.Id,
    name: item.Name,
    price: Number(item.FinalPrice),
    quantity: 1,
  }));
}

function formatServiceError(message) {
  if (!message) {
    return "Something went wrong while placing your order. Please try again.";
  }

  if (typeof message === "string") {
    return message;
  }

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  if (message.message && typeof message.message === "string") {
    return message.message;
  }

  if (message.errors && Array.isArray(message.errors)) {
    return message.errors.join(" ");
  }

  if (message.errors && typeof message.errors === "object") {
    return Object.values(message.errors)
      .flat()
      .join(" ");
  }

  return "Something went wrong while placing your order. Please try again.";
}

function isFutureExpiration(value) {
  const match = value.match(/^(\d{2})\/(\d{2}|\d{4})$/);

  if (!match) {
    return false;
  }

  const month = Number(match[1]);
  const year =
    match[2].length === 2 ? Number(`20${match[2]}`) : Number(match[2]);

  if (month < 1 || month > 12) {
    return false;
  }

  const expirationDate = new Date(year, month, 0, 23, 59, 59, 999);
  return expirationDate > new Date();
}

export default class CheckoutProcess {
  constructor(key, formSelector) {
    this.key = key;
    this.formSelector = formSelector;
    this.form = qs(formSelector);
    this.externalServices = new ExternalServices();
    this.items = [];
    this.subtotal = 0;
    this.tax = 0;
    this.shipping = 0;
    this.orderTotal = 0;
  }

  init() {
    this.items = getCartItems(this.key);
    this.calculateItemSubtotal();
    this.calculateOrderTotal();
    this.addEventListeners();

    if (!this.items.length) {
      this.setSubmitDisabled(true);
      alertMessage(
        "Your cart is empty. Add at least one item before checking out.",
        false,
      );
    }
  }

  addEventListeners() {
    if (!this.form) {
      return;
    }

    this.form.addEventListener("submit", (event) => this.checkout(event));

    const zipInput = this.form.elements.zip;
    if (zipInput) {
      ["input", "blur"].forEach((eventName) => {
        zipInput.addEventListener(eventName, () => this.calculateOrderTotal());
      });
    }

    const expirationInput = this.form.elements.expiration;
    if (expirationInput) {
      expirationInput.addEventListener("input", () => {
        expirationInput.setCustomValidity("");
      });
    }
  }

  calculateItemSubtotal() {
    this.subtotal = this.items.reduce(
      (sum, item) => sum + Number(item.FinalPrice || 0),
      0,
    );
    this.displayOrderTotals();
  }

  calculateOrderTotal() {
    const itemCount = this.items.length;

    this.tax = this.subtotal * 0.06;
    this.shipping = itemCount > 0 ? 10 + (itemCount - 1) * 2 : 0;
    this.orderTotal = this.subtotal + this.tax + this.shipping;
    this.displayOrderTotals();
  }

  displayOrderTotals() {
    const subtotalElement = qs("#itemSubtotal");
    const shippingElement = qs("#shipping");
    const taxElement = qs("#tax");
    const orderTotalElement = qs("#orderTotal");

    if (!subtotalElement) {
      return;
    }

    subtotalElement.textContent = formatCurrency(this.subtotal);
    shippingElement.textContent = formatCurrency(this.shipping);
    taxElement.textContent = formatCurrency(this.tax);
    orderTotalElement.textContent = formatCurrency(this.orderTotal);
  }

  validateForm() {
    const cardNumberField = this.form.elements.cardNumber;
    const securityCodeField = this.form.elements.code;
    const expirationField = this.form.elements.expiration;

    cardNumberField.value = cardNumberField.value.replace(/\D/g, "");
    securityCodeField.value = securityCodeField.value.replace(/\D/g, "");
    expirationField.value = expirationField.value.trim();
    expirationField.setCustomValidity("");

    if (expirationField.value && !isFutureExpiration(expirationField.value)) {
      expirationField.setCustomValidity(
        "Enter a future expiration date using MM/YY.",
      );
    }

    const isValid = this.form.checkValidity();
    this.form.reportValidity();

    return isValid;
  }

  async checkout(event) {
    event.preventDefault();
    removeAlerts();

    if (!this.items.length) {
      alertMessage("Your cart is empty. Please add an item before checkout.");
      return;
    }

    this.calculateOrderTotal();

    if (!this.validateForm()) {
      return;
    }

    const order = formDataToJSON(this.form);
    order.orderDate = new Date().toISOString();
    order.items = packageItems(this.items);
    order.orderTotal = this.orderTotal.toFixed(2);
    order.shipping = this.shipping;
    order.tax = this.tax.toFixed(2);

    this.setSubmitting(true);

    try {
      await this.externalServices.checkout(order);
      setLocalStorage(this.key, []);
      window.location.assign("./success.html");
    } catch (error) {
      alertMessage(formatServiceError(error.message || error));
    } finally {
      this.setSubmitting(false);
    }
  }

  setSubmitDisabled(isDisabled) {
    const submitButton = qs("#checkoutSubmit", this.form);

    if (!submitButton) {
      return;
    }

    submitButton.disabled = isDisabled;
  }

  setSubmitting(isSubmitting) {
    const submitButton = qs("#checkoutSubmit", this.form);

    if (!submitButton) {
      return;
    }

    submitButton.disabled = isSubmitting;
    submitButton.textContent = isSubmitting ? "Submitting..." : "Place Order";
  }
}
