export function getAuthRoutes() {
  return {
    login: "login.html",

    user_exists: "userexistpage.html",
    new_user_auth: "loginauth.html",

    create_account: "createaccount.html",

    verify_signup_email: "emailverify.html",
    verify_signup_phone: "numberverify.html",

    account_success: "accsuccess.html",
    account_verified: "accverified.html",

    add_email: "addemail.html",
    add_phone: "addnumber.html",

    verify_add_email: "emailverify.html",
    verify_add_phone: "numberverify.html",

    otp_login: "otpuserlogin.html",

    authenticated: "amazon.html"
  };
}

const AUTH_STATE_KEY = "authState";

export const AuthState = {

  LOGIN: "login",
  USER_EXISTS: "user_exists",
  NEW_USER_AUTH: "new_user_auth",

  CREATE_ACCOUNT: "create_account",

  VERIFY_SIGNUP_EMAIL: "verify_signup_email",
  VERIFY_SIGNUP_PHONE: "verify_signup_phone",

  ACCOUNT_SUCCESS: "account_success",
  ACCOUNT_VERIFIED: "account_verified",

  ADD_EMAIL: "add_email",
  ADD_PHONE: "add_phone",

  VERIFY_ADD_EMAIL: "verify_add_email",
  VERIFY_ADD_PHONE: "verify_add_phone",

  OTP_LOGIN: "otp_login",

  AUTHENTICATED: "authenticated"
};

const AUTH_SESSION_KEY = "authSession";

export function setAuthState(step, extra = {}) {

  const session = {
    step,
    ...extra
  };

  localStorage.setItem(
    AUTH_SESSION_KEY,
    JSON.stringify(session)
  );
}

export function getAuthState() {
  const raw = localStorage.getItem(AUTH_SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

export function clearAuthState() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

export function goToNextAuthStep() {

  const session = getAuthState();
  if (!session || !session.step) return;

  const routes = getAuthRoutes();
  const target = routes[session.step];

  if (!target) return;

  const current = window.location.pathname.split("/").pop();

  if (current !== target) {
    window.location.replace(target);
  }
}