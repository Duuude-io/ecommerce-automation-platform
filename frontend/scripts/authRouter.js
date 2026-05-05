const routes = {
  CREATE_ACCOUNT: "createaccount.html",
  VERIFY_EMAIL: "emailverify.html",
  VERIFY_PHONE: "numberverify.html",
  ADD_EMAIL_OPTIONAL: "addemail.html",
  ADD_PHONE_OPTIONAL: "addnumber.html",
  AUTHENTICATED: "accsuccess.html",
  LOGIN: "login.html",
  VERIFY_LOGIN: "otpuserlogin.html"
};

export async function routeUser() {

  console.log("ROUTER STARTED");

  try {

    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://127.0.0.1:8000/auth/session-status", {
      headers: {
        Authorization: "Bearer " + token
      }
    });

    const data = await res.json();

    const nextPage = routes[data.next_step];

    if (!nextPage) {
      console.error("Unknown auth state:", data.next_step);
      return;
    }

    // prevent redirect loop
    const currentPage =
      window.location.pathname.split("/").pop();

    if (currentPage !== nextPage) {
      console.log("Routing →", nextPage);
      window.location.replace(nextPage);
    }

  } catch (err) {
    console.error("Router error:", err);
  }
}