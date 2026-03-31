import { setLocalStorage } from "./utils.mjs";
import ProductData from "./ProductData.mjs";

const dataSource = new ProductData("tents");

function addProductToCart(product) {
  setLocalStorage("so-cart", product);
}
// add to cart button event handler
async function addToCartHandler(e) {
  const product = await dataSource.findProductById(e.target.dataset.id);
  addProductToCart(product);
}

function formatCurrency(value) {
  return `$${value.toFixed(2)}`;
}

function renderDiscountFlag(product) {
  if (!product || product.FinalPrice >= product.SuggestedRetailPrice) {
    return;
  }

  const priceElement = document.querySelector(".product-card__price");

  if (!priceElement) {
    return;
  }

  const discountAmount = product.SuggestedRetailPrice - product.FinalPrice;
  const discountElement = document.createElement("p");
  discountElement.className = "product__discount";
  discountElement.textContent = `Save ${formatCurrency(discountAmount)}`;
  priceElement.insertAdjacentElement("afterend", discountElement);
}

async function initDiscountFlag() {
  const addToCartButton = document.getElementById("addToCart");

  if (!addToCartButton) {
    return;
  }

  const product = await dataSource.findProductById(addToCartButton.dataset.id);
  renderDiscountFlag(product);
}

// add listener to Add to Cart button
document
  .getElementById("addToCart")
  .addEventListener("click", addToCartHandler);

initDiscountFlag();
