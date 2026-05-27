console.log("Checkout Session Active")

export const checkoutSession = {

  get() {
    return JSON.parse(
      localStorage.getItem('checkoutSession')
    ) || {};
  },

  save(data) {

    const current = this.get();

    const updated = {
      ...current,
      ...data
    };

    localStorage.setItem(
      'checkoutSession',
      JSON.stringify(updated)
    );
  },

  clear() {
    localStorage.removeItem('checkoutSession');
  }
};