const TOKEN_KEY = "token";
const USER_KEY = "userId";
const USER_DATA_KEY = "userData";

export const auth = {

  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  getUserId() {
    return localStorage.getItem(USER_KEY);
  },

  getUser() {
    const data = localStorage.getItem(USER_DATA_KEY);
    return data ? JSON.parse(data) : null;
  },

  isLoggedIn() {

    const token = this.getToken();
    return !!token && token !== "null";
  },

  login({ token, userId, userData }) {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    }
    if (userId) {
      localStorage.setItem(USER_KEY, userId);
    }
    if (userData) {
      localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
    }
  },

  logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(USER_DATA_KEY);
  }

};