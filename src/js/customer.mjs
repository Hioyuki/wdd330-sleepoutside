const CUSTOMER_KEY = 'so-customer';

export function getCustomer() {
  return JSON.parse(localStorage.getItem(CUSTOMER_KEY));
}

export function saveCustomer(customer) {
  localStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer));
}

export function clearCustomer() {
  localStorage.removeItem(CUSTOMER_KEY);
}

export function getCustomerDisplayName(customer = getCustomer()) {
  if (!customer) {
    return 'Guest Camper';
  }

  return (
    customer.name ||
    [customer.fname, customer.lname].filter(Boolean).join(' ') ||
    customer.email ||
    'Guest Camper'
  );
}

export function getCustomerIdentifier(customer = getCustomer()) {
  return customer?.email || customer?.id || customer?._id || 'guest';
}
