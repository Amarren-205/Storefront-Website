const products = [
  {
    id: "book1",
    name: "Harry Potter",
    description: "A fantasy adventure about wizards and magic.",
    price: 25.0,
    image: "Pictures/harry-potter.png",
    category: "Books"
  },
  {
    id: "book2",
    name: "One Piece",
    description: "A manga adventure about pirates searching for treasure.",
    price: 7.0,
    image: "Pictures/one-piece.png",
    category: "Books"
  },
  {
    id: "book3",
    name: "Student Success Guide",
    description: "Strategies for studying, planning, and succeeding in school.",
    price: 14.99,
    image: "Pictures/student-success.png",
    category: "Books"
  },
  {
    id: "book4",
    name: "Vagabond",
    description: "A historical fiction shonen manga about Miyamoto Musashi.",
    price: 12.99,
    image: "Pictures/vagabond.png",
    category: "Books"
  },
  {
    id: "book5",
    name: "The Monkey's Paw",
    description: "A story about a wish granting talisman that has unforeseen consequences.",
    price: 18.99,
    image: "Pictures/monkeys-paw.png",
    category: "Books"
  },
  {
    id: "supply1",
    name: "Notebook",
    description: "Durable notebook for class notes and assignments.",
    price: 4.99,
    image: "Pictures/notebook.png",
    category: "School Supplies"
  },
  {
    id: "supply2",
    name: "Binder",
    description: "Organization binder for coursework and handouts.",
    price: 8.99,
    image: "Pictures/binder.png",
    category: "School Supplies"
  },
  {
    id: "supply3",
    name: "Pens & Pencils",
    description: "Essential writing supplies for everyday schoolwork.",
    price: 6.49,
    image: "Pictures/pens.png",
    category: "School Supplies"
  },
  {
    id: "supply4",
    name: "Folders",
    description: "Keep papers and projects sorted by class.",
    price: 3.99,
    image: "Pictures/folders.png",
    category: "School Supplies"
  },
  {
    id: "supply5",
    name: "Academic Planner",
    description: "Plan assignments, exams, and study time.",
    price: 9.99,
    image: "Pictures/planner.png",
    category: "School Supplies"
  }
];

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

const books = products.filter(
  product => product.category === "Books"
);

const supplies = products.filter(
  product => product.category === "School Supplies"
);


/* =========================================================
   PRODUCT DISPLAY
   ========================================================= */

function renderProducts(containerId, productList = products) {
  const container = document.getElementById(containerId);

  if (!container) return;

  container.innerHTML = "";

  productList.forEach(product => {

    const card = document.createElement("article");

    card.className = "product";

    card.innerHTML = `
      <img
        src="${product.image}"
        alt="${product.name}"
        onerror="this.style.display='none'"
      >

      <div class="product-info">

        <span class="category">
          ${product.category}
        </span>

        <h3>${product.name}</h3>

        <p>${product.description}</p>

        <strong>
          ${formatCurrency(product.price)}
        </strong>

        <p class="stock-count"></p>

        <button
          type="button"
          class="add-cart"
          data-id="${product.id}"
        >
          Add to Cart
        </button>

      </div>
    `;

    container.appendChild(card);
  });

  container
    .querySelectorAll(".add-cart")
    .forEach(button => {

      button.addEventListener("click", () => {
        addToCart(button.dataset.id);
      });

    });

  refreshProductStockDisplay();
}


/* =========================================================
   INVENTORY SYSTEM
   ========================================================= */

const INVENTORY_KEY = "amarrensInventory";
const CART_KEY = "amarrensCart";


function initializeInventory() {

  let inventory;

  try {
    inventory = JSON.parse(
      localStorage.getItem(INVENTORY_KEY)
    );
  } catch {
    inventory = null;
  }

  /*
    If inventory has never been created before,
    give every product 10 units.
  */

  if (!inventory || typeof inventory !== "object") {

    inventory = Object.fromEntries(
      products.map(product => [product.id, 10])
    );

    /*
      If the customer already has items in the cart
      when this new inventory system is installed,
      subtract those items from the initial stock.
    */

    getCart().forEach(item => {

      if (inventory[item.id] !== undefined) {

        inventory[item.id] = Math.max(
          0,
          inventory[item.id] - item.quantity
        );

      }

    });

  }

  /*
    If new products are added later,
    automatically give them the default stock.
  */

  products.forEach(product => {

    if (!Number.isFinite(inventory[product.id])) {
      inventory[product.id] = 10;
    }

  });

  saveInventory(inventory);
}


function getInventory() {

  try {

    return JSON.parse(
      localStorage.getItem(INVENTORY_KEY)
    ) || {};

  } catch {

    return {};

  }

}


function saveInventory(inventory) {

  localStorage.setItem(
    INVENTORY_KEY,
    JSON.stringify(inventory)
  );

}


/*
  Updates the stock text and Add to Cart buttons
  on every product.
*/

function refreshProductStockDisplay() {

  const inventory = getInventory();

  document
    .querySelectorAll(".product")
    .forEach(card => {

      const button =
        card.querySelector(".add-cart");

      if (!button) return;

      const id = button.dataset.id;

      const stock =
        inventory[id] ?? 0;

      const stockLabel =
        card.querySelector(".stock-count");

      if (stockLabel) {

        stockLabel.textContent =
          stock > 0
            ? `In stock: ${stock}`
            : "Out of Stock";

      }

      /*
        Disable the button when no inventory remains.
      */

      button.disabled = stock <= 0;

      /*
        This provides the requested
        "Out of Stock" cursor tooltip.
      */

      button.title =
        stock <= 0
          ? "Out of Stock"
          : "Add to Cart";

      button.setAttribute(
        "aria-label",
        stock <= 0
          ? "Out of Stock"
          : "Add to Cart"
      );

      button.textContent =
        stock <= 0
          ? "Out of Stock"
          : "Add to Cart";

    });

}


/* =========================================================
   SHOPPING CART
   ========================================================= */

function getCart() {

  try {

    const cart =
      JSON.parse(
        localStorage.getItem(CART_KEY)
      ) || [];

    return Array.isArray(cart)
      ? cart
      : [];

  } catch {

    return [];

  }

}


function saveCart(cart) {

  localStorage.setItem(
    CART_KEY,
    JSON.stringify(cart)
  );

}


/*
  Adds one product to the cart.
*/

function addToCart(id) {

  const product =
    products.find(item => item.id === id);

  if (!product) return;

  const inventory =
    getInventory();

  const available =
    inventory[id] ?? 0;

  /*
    Prevent adding products when
    inventory reaches zero.
  */

  if (available <= 0) {

    refreshProductStockDisplay();

    showCartMessage(
      `${product.name} is currently out of stock.`
    );

    return;
  }

  const cart =
    getCart();

  const existing =
    cart.find(item => item.id === id);

  if (existing) {

    existing.quantity += 1;

  } else {

    cart.push({
      ...product,
      quantity: 1
    });

  }

  /*
    Reduce available inventory.
  */

  inventory[id] =
    available - 1;

  saveInventory(inventory);
  saveCart(cart);

  /*
    Immediate visual feedback.
  */

  const button =
    document.querySelector(
      `.add-cart[data-id="${id}"]`
    );

  if (button) {

    button.textContent = "Added!";

    button.classList.add(
      "just-added"
    );

    setTimeout(() => {

      button.classList.remove(
        "just-added"
      );

      refreshProductStockDisplay();

    }, 900);

  }

  renderCart();
  refreshProductStockDisplay();

}


/*
  Removes an entire product from the cart.
*/

function removeFromCart(id) {

  const cart =
    getCart();

  const item =
    cart.find(product => product.id === id);

  if (!item) return;

  const inventory =
    getInventory();

  /*
    Return the item's quantity
    back to inventory.
  */

  inventory[id] =
    (inventory[id] ?? 0) +
    item.quantity;

  saveInventory(inventory);

  saveCart(
    cart.filter(
      product => product.id !== id
    )
  );

  renderCart();
  refreshProductStockDisplay();

}


/*
  Changes the quantity of an item already
  inside the cart.
*/

function updateCartQuantity(
  id,
  requestedQuantity
) {

  const cart =
    getCart();

  const item =
    cart.find(product => product.id === id);

  if (!item) return;

  const newQuantity =
    Math.floor(
      Number(requestedQuantity)
    );

  /*
    Quantity cannot be zero or negative.
  */

  if (
    !Number.isFinite(newQuantity) ||
    newQuantity < 1
  ) {

    renderCart();
    return;

  }

  const inventory =
    getInventory();

  const oldQuantity =
    item.quantity;

  const difference =
    newQuantity - oldQuantity;

  const available =
    inventory[id] ?? 0;

  /*
    Increasing quantity requires
    enough available inventory.
  */

  if (
    difference > 0 &&
    difference > available
  ) {

    showCartMessage(
      `Only ${available} additional unit(s) of ${item.name} are available.`
    );

    renderCart();

    return;
  }

  /*
    If quantity goes up, stock decreases.

    If quantity goes down, stock increases.
  */

  inventory[id] =
    available - difference;

  item.quantity =
    newQuantity;

  saveInventory(inventory);
  saveCart(cart);

  renderCart();
  refreshProductStockDisplay();

}


/*
  Clears the entire cart.

  restoreStock = true:
    Used when the customer manually clears the cart.
    Items return to inventory.

  restoreStock = false:
    Used after checkout.
    Purchased items remain deducted from inventory.
*/

function clearCart(
  restoreStock = true
) {

  const cart =
    getCart();

  if (restoreStock) {

    const inventory =
      getInventory();

    cart.forEach(item => {

      inventory[item.id] =
        (inventory[item.id] ?? 0) +
        item.quantity;

    });

    saveInventory(inventory);

  }

  saveCart([]);

  renderCart();
  refreshProductStockDisplay();

}


/*
  Displays cart-related messages.
*/

function showCartMessage(message) {

  const box =
    document.getElementById(
      "cart-message"
    );

  if (box) {

    box.textContent =
      message;

  }

}


/*
  Calculates the total before discounts.
*/

function calculateSubtotal() {

  return getCart().reduce(
    (sum, item) =>
      sum +
      item.price *
      item.quantity,
    0
  );

}


/*
  Displays the cart itself.
*/

function renderCart() {

  const box =
    document.getElementById(
      "cart-items"
    );

  if (!box) return;

  const cart =
    getCart();

  box.innerHTML = "";

  /*
    Empty cart message.
  */

  if (cart.length === 0) {

    box.innerHTML =
      "<p>Your cart is currently empty. Add products from the catalog.</p>";

    updateCartTotals();

    return;

  }

  /*
    Create a row for every product
    currently in the cart.
  */

  cart.forEach(item => {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "cart-row";


    /*
      Product information.
    */

    const details =
      document.createElement(
        "div"
      );

    details.className =
      "cart-item-details";


    const name =
      document.createElement(
        "strong"
      );

    name.textContent =
      item.name;


    const price =
      document.createElement(
        "p"
      );

    price.textContent =
      `${formatCurrency(item.price)} each`;


    /*
      Quantity controls.
    */

    const quantityLabel =
      document.createElement(
        "label"
      );

    quantityLabel.textContent =
      "Quantity: ";


    const quantity =
      document.createElement(
        "input"
      );

    quantity.type =
      "number";

    quantity.min =
      "1";

    quantity.max =
      String(
        item.quantity +
        (getInventory()[item.id] ?? 0)
      );

    quantity.value =
      item.quantity;

    quantity.className =
      "cart-quantity";

    quantity.setAttribute(
      "aria-label",
      `Quantity of ${item.name}`
    );


    quantity.addEventListener(
      "change",
      () => {

        updateCartQuantity(
          item.id,
          quantity.value
        );

      }
    );


    quantityLabel.appendChild(
      quantity
    );

    details.append(
      name,
      price,
      quantityLabel
    );


    /*
      Price and remove button.
    */

    const actions =
      document.createElement(
        "div"
      );

    actions.className =
      "cart-item-actions";


    const lineTotal =
      document.createElement(
        "strong"
      );

    lineTotal.textContent =
      formatCurrency(
        item.price *
        item.quantity
      );


    const removeButton =
      document.createElement(
        "button"
      );

    removeButton.type =
      "button";

    removeButton.className =
      "remove-cart";

    removeButton.textContent =
      "Remove";


    removeButton.addEventListener(
      "click",
      () => {

        removeFromCart(
          item.id
        );

      }
    );


    actions.append(
      lineTotal,
      removeButton
    );


    row.append(
      details,
      actions
    );

    box.appendChild(
      row
    );

  });

  updateCartTotals();

}


/* =========================================================
   CART TOTALS AND COUPONS
   ========================================================= */

const coupons = {
  STUDY10: 0.10,
  BOOKS15: 0.15
};


function updateCartTotals() {

  const subtotal =
    calculateSubtotal();

  const couponInput =
    document.getElementById(
      "coupon-code"
    );

  const code =
    couponInput
      ? couponInput.value
          .trim()
          .toUpperCase()
      : "";

  const rate =
    coupons[code] || 0;

  const discount =
    subtotal * rate;

  const subtotalElement =
    document.getElementById(
      "checkout-subtotal"
    );

  const discountElement =
    document.getElementById(
      "discount-amount"
    );

  const totalElement =
    document.getElementById(
      "checkout-total"
    );


  if (subtotalElement) {

    subtotalElement.textContent =
      formatCurrency(
        subtotal
      );

  }


  if (discountElement) {

    discountElement.textContent =
      discount > 0
        ? `-${formatCurrency(discount)}`
        : "$0.00";

  }


  if (totalElement) {

    totalElement.textContent =
      formatCurrency(
        subtotal - discount
      );

  }

}


function applyCouponCode() {

  const input =
    document.getElementById(
      "coupon-code"
    );

  const message =
    document.getElementById(
      "coupon-message"
    );

  if (!input || !message) return;

  const code =
    input.value
      .trim()
      .toUpperCase();

  const rate =
    coupons[code];

  const subtotal =
    calculateSubtotal();


  /*
    No coupon entered.
  */

  if (!code) {

    message.textContent =
      "Enter a coupon code.";

    message.className =
      "form-message error-message";

    updateCartTotals();

    return;

  }


  /*
    Invalid coupon.
  */

  if (rate === undefined) {

    message.textContent =
      "Coupon code not found.";

    message.className =
      "form-message error-message";

    updateCartTotals();

    return;

  }


  /*
    Valid coupon.
  */

  const discount =
    subtotal * rate;


  document.getElementById(
    "checkout-subtotal"
  ).textContent =
    formatCurrency(
      subtotal
    );


  document.getElementById(
    "discount-amount"
  ).textContent =
    `-${formatCurrency(discount)}`;


  document.getElementById(
    "checkout-total"
  ).textContent =
    formatCurrency(
      subtotal - discount
    );


  message.textContent =
    `${code} applied: ${Math.round(rate * 100)}% off.`;

  message.className =
    "form-message success-message";

}


/* =========================================================
   FORM VALIDATION
   ========================================================= */

function validateRequiredFields(form) {

  let valid = true;

  form
    .querySelectorAll("[required]")
    .forEach(field => {

      const error =
        field.parentElement.querySelector(
          ".field-error"
        );

      field.classList.remove(
        "invalid"
      );


      if (!field.value.trim()) {

        valid = false;

        field.classList.add(
          "invalid"
        );

        if (error) {

          error.textContent =
            "This field is required.";

        }

      } else {

        if (error) {

          error.textContent =
            "";

        }

      }

    });

  return valid;

}


function validateEmail(field) {

  if (!field.value.trim()) {
    return true;
  }

  const valid =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      .test(
        field.value.trim()
      );

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Enter a valid email address.";

  }

  return valid;

}


function validateCardNumber(field) {

  if (!field.value.trim()) {
    return true;
  }

  const digits =
    field.value.replace(
      /\D/g,
      ""
    );

  const valid =
    digits.length >= 13 &&
    digits.length <= 19;

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Card number must contain 13–19 digits.";

  }

  return valid;

}


function validateExpiration(field) {

  if (!field.value) {
    return true;
  }

  const [year, month] =
    field.value
      .split("-")
      .map(Number);

  const chosen =
    new Date(
      year,
      month - 1,
      1
    );

  const now =
    new Date();

  const current =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    );

  const valid =
    chosen >= current;

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Expiration date must be in the future.";

  }

  return valid;

}


function validateSecurityCode(field) {

  if (!field.value) {
    return true;
  }

  const valid =
    /^\d{3,4}$/.test(
      field.value
    );

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Security code must be 3–4 digits.";

  }

  return valid;

}


function validateZip(field) {

  if (!field.value.trim()) {
    return true;
  }

  const valid =
    /^\d{5}(-\d{4})?$/.test(
      field.value.trim()
    );

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Enter a valid 5-digit ZIP code (or ZIP+4).";

  }

  return valid;

}


function validatePhone(field) {

  if (!field.value) {
    return true;
  }

  const valid =
    field.value.replace(
      /\D/g,
      ""
    ).length >= 10;

  const error =
    field.parentElement.querySelector(
      ".field-error"
    );

  field.classList.toggle(
    "invalid",
    !valid
  );

  if (error) {

    error.textContent =
      valid
        ? ""
        : "Enter a valid phone number.";

  }

  return valid;

}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    /*
      Initialize inventory before displaying products.
    */

    initializeInventory();


    /*
      Display products.
    */

    renderProducts(
      "book-products",
      books
    );

    renderProducts(
      "supply-products",
      supplies
    );

    renderProducts(
      "all-products",
      products
    );

    renderProducts(
      "featured-products",
      products.slice(0, 3)
    );


    /*
      Display the existing cart.
      This is what allows the cart to survive
      a browser refresh.
    */

    renderCart();

    refreshProductStockDisplay();


    /* =====================================================
       CLEAR CART BUTTON
       ===================================================== */

    const clearCartButton =
      document.getElementById(
        "clear-cart"
      );

    if (clearCartButton) {

      clearCartButton.addEventListener(
        "click",
        () => {

          if (getCart().length === 0) {

            showCartMessage(
              "Your cart is already empty."
            );

            return;

          }

          clearCart();

          showCartMessage(
            "Cart cleared. All reserved stock has been returned."
          );

        }
      );

    }


    /* =====================================================
       COUPON BUTTON
       ===================================================== */

    const couponButton =
      document.getElementById(
        "apply-coupon"
      );

    if (couponButton) {

      couponButton.addEventListener(
        "click",
        applyCouponCode
      );

    }


    /* =====================================================
       CONTACT FORM
       ===================================================== */

    const contact =
      document.getElementById(
        "contact-form"
      );

    if (contact) {

      contact.addEventListener(
        "submit",
        event => {

          event.preventDefault();

          const email =
            document.getElementById(
              "email"
            );

          const valid =
            validateRequiredFields(
              contact
            ) &&
            validateEmail(email);

          const message =
            document.getElementById(
              "contact-message"
            );


          if (valid) {

            message.textContent =
              "Thanks! Your message is ready to be sent.";

            message.className =
              "form-message success-message";

            contact.reset();

          } else {

            message.textContent =
              "Please correct the highlighted fields.";

            message.className =
              "form-message error-message";

          }

        }
      );

    }


    /* =====================================================
       CHECKOUT FORM
       ===================================================== */

    const checkout =
      document.getElementById(
        "checkout-form"
      );

    if (checkout) {

      const card =
        document.getElementById(
          "card-number"
        );

      const expiration =
        document.getElementById(
          "expiration"
        );

      const securityCode =
        document.getElementById(
          "security-code"
        );

      const phone =
        document.getElementById(
          "phone"
        );

      const zip =
        document.getElementById(
          "zip-code"
        );


      /*
        Live validation while the customer types.
      */

      card.addEventListener(
        "input",
        () => validateCardNumber(card)
      );

      expiration.addEventListener(
        "change",
        () => validateExpiration(expiration)
      );

      securityCode.addEventListener(
        "input",
        () => validateSecurityCode(securityCode)
      );

      phone.addEventListener(
        "input",
        () => validatePhone(phone)
      );

      zip.addEventListener(
        "input",
        () => validateZip(zip)
      );


      /*
        Checkout / order confirmation.
      */

      checkout.addEventListener(
        "submit",
        event => {

          event.preventDefault();

          const message =
            document.getElementById(
              "checkout-message"
            );

          const cart =
            getCart();


          /*
            Don't allow an empty order.
          */

          if (cart.length === 0) {

            message.textContent =
              "Your cart is empty. Add products before placing an order.";

            message.className =
              "form-message error-message";

            return;

          }


          /*
            Validate all required fields.
          */

          const valid =
            validateRequiredFields(
              checkout
            ) &&
            validateCardNumber(card) &&
            validateExpiration(expiration) &&
            validateSecurityCode(securityCode) &&
            validatePhone(phone) &&
            validateZip(zip);


          if (!valid) {

            message.textContent =
              "Please correct the highlighted fields before submitting.";

            message.className =
              "form-message error-message";

            return;

          }


          /*
            Create a simple demonstration
            order number.
          */

          const orderNumber =
            "AM-" +
            Date.now()
              .toString()
              .slice(-8);


          const orderTotal =
            document.getElementById(
              "checkout-total"
            ).textContent;


          /*
            The inventory was already reduced
            when the customer added the items.

            false means DON'T restore inventory.
          */

          clearCart(false);


          /*
            Show confirmation.
          */

          message.textContent =
            `Order confirmed! Reference: ${orderNumber}. ` +
            `Order total: ${orderTotal}. ` +
            "This is a demonstration order; no payment was processed.";

          message.className =
            "form-message success-message";


          /*
            Reset the checkout form.
          */

          checkout.reset();


          const couponMessage =
            document.getElementById(
              "coupon-message"
            );

          if (couponMessage) {

            couponMessage.textContent =
              "";

          }


          updateCartTotals();

        }
      );

    }

  }
);
/* =========================================================
   NETWORK CONNECTION TEST
   ========================================================= */

function runNetworkConnectionTest() {

    const hostName =
        document.getElementById("host-name");

    const communicationPort =
        document.getElementById("communication-port");

    const transmissionProtocol =
        document.getElementById("transmission-protocol");

    const lastLaunched =
        document.getElementById("last-launched");

    const message =
        document.getElementById("network-test-message");


    /*
       This page cannot directly access the computer's
       Windows/local host name from a normal browser.

       Use the current hostname from the page URL instead.
    */

    if (hostName) {

        hostName.textContent =
            window.location.hostname || "localhost";

    }


    /*
       Detect the current communication port.

       If the URL does not explicitly contain a port,
       the browser is using the protocol's default port.
    */

    if (communicationPort) {

        let port =
            window.location.port;

        if (!port) {

            if (window.location.protocol === "https:") {
                port = "443";
            }

            else if (window.location.protocol === "http:") {
                port = "80";
            }

            else {
                port = "Not specified";
            }

        }

        communicationPort.textContent =
            port;

    }


    /*
       Detect the transmission protocol.
    */

    if (transmissionProtocol) {

        let protocol =
            window.location.protocol
                .replace(":", "")
                .toUpperCase();

        transmissionProtocol.textContent =
            protocol;

    }


    /*
       Store the most recent launch time in localStorage.
       This allows the page to remember when it was last opened.
    */

    const currentLaunchTime =
        new Date().toLocaleString();


    const previousLaunchTime =
        localStorage.getItem(
            "networkTestLastLaunch"
        );


    if (lastLaunched) {

        if (previousLaunchTime) {

            lastLaunched.textContent =
                previousLaunchTime;

        }

        else {

            lastLaunched.textContent =
                "First launch";

        }

    }


    /*
       Save the current launch time so it can be
       displayed the next time the page is opened.
    */

    localStorage.setItem(
        "networkTestLastLaunch",
        currentLaunchTime
    );


    /*
       Display a successful test message.
    */

    if (message) {

        message.textContent =
            "Network connection test completed successfully.";

        message.className =
            "form-message success-message";

    }

}


/*
   Run automatically when the Network Test page loads.
*/

document.addEventListener(
    "DOMContentLoaded",
    () => {

        const networkPage =
            document.getElementById("run-network-test");

        if (networkPage) {

            runNetworkConnectionTest();


            networkPage.addEventListener(
                "click",
                runNetworkConnectionTest
            );

        }

    }
);