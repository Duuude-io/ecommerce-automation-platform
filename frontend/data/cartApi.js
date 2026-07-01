import { API_BASE_URL } from "../scripts/config.js";
import { auth } from "../scripts/auth/authStore.js";

export async function addCartItem(productId, quantity) {
  const res = await fetch(`${API_BASE_URL}/cart/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${auth.getToken()}`
    },
    body: JSON.stringify({
      productId,
      quantity,
      deliveryOptionId: "1"
    })
  });

  if (!res.ok) {
    throw new Error("Failed to add cart item");
  }

  return await res.json();
}

export async function deleteCartItem(productId) {
  const res = await fetch(
    `${API_BASE_URL}/cart/items/${productId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${auth.getToken()}`
      }
    }
  );

  return await res.json();
}