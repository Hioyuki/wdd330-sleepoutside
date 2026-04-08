const baseURL =
  import.meta.env.VITE_SERVER_URL || "https://wdd330-backend.onrender.com/";

async function convertToJson(res) {
  const jsonResponse = await res.json().catch(() => ({
    message: "Unable to read the server response.",
  }));

  if (res.ok) {
    return jsonResponse;
  }

  throw { name: "servicesError", message: jsonResponse };
}

export default class ExternalServices {
  constructor(endpoint = baseURL) {
    this.endpoint = endpoint.endsWith("/") ? endpoint : `${endpoint}/`;
  }

  async login(credentials) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    };

    const response = await fetch(`${this.endpoint}login/`, options);
    return convertToJson(response);
  }

  async registerUser(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(`${this.endpoint}users/`, options);
    return convertToJson(response);
  }

  async checkout(payload) {
    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch(`${this.endpoint}checkout/`, options);
    return convertToJson(response);
  }

  async getOrders(token) {
    const options = {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    const response = await fetch(`${this.endpoint}orders/`, options);
    return convertToJson(response);
  }
}
