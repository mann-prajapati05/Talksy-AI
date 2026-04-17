import axios from "axios";

const AUTH_TOKEN_KEY = "talksy_session_token";

export const getSessionToken = () => {
  try {
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || "";
  } catch (error) {
    return "";
  }
};

export const setSessionToken = (token) => {
  try {
    if (!token) {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      return;
    }

    sessionStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    // Ignore storage issues and continue with cookie-based auth only.
  }
};

export const clearSessionToken = () => {
  try {
    sessionStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    // Ignore storage clear errors.
  }
};

export const applySessionAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return;
  }

  delete axios.defaults.headers.common.Authorization;
};

export const bootstrapSessionAuth = () => {
  axios.defaults.withCredentials = true;
  applySessionAuthHeader(getSessionToken());
};
