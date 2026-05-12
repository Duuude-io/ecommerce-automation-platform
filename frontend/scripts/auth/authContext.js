const IDENTIFIER_KEY = "identifier";
const TYPE_KEY = "authType";

export const authContext = {

  setIdentifier(value) {
    if (!value) return;

    const normalized = value.trim().toLowerCase();

    localStorage.setItem(IDENTIFIER_KEY, normalized);

    const type = normalized.includes("@")
      ? "email"
      : "phone";

    localStorage.setItem(TYPE_KEY, type);
  },

  getIdentifier() {
    return localStorage.getItem(IDENTIFIER_KEY);
  },

  getAuthType() {
    return localStorage.getItem(TYPE_KEY);
  },

  clear() {
    localStorage.removeItem(IDENTIFIER_KEY);
    localStorage.removeItem(TYPE_KEY);
  }
};
