import { jwtDecode } from "jwt-decode";

/**
 * Interval callback: if JWT is expired, clear storage and hard-navigate to `/` (SPA root).
 */
export const expireJwtLocalStorage = () => {
  const jwt = localStorage.getItem("jwt");
  if (!jwt) return;

  let decoded;
  try {
    decoded = jwtDecode(jwt);
  } catch {
    return;
  }

  const exp = decoded.exp;
  if (exp == null) return;

  const currentTime = Math.floor(Date.now() / 1000);
  if (exp < currentTime) {
    localStorage.clear();
    window.location.href = "/";
  }
};
