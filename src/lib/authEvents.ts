export const OPEN_AUTH_DIALOG_EVENT = "kolega:open-auth-dialog";
export const AUTH_SESSION_CHANGE_EVENT = "kolega:auth-session-change";

declare global {
  interface WindowEventMap {
    "kolega:open-auth-dialog": Event;
    "kolega:auth-session-change": CustomEvent<string | null>;
  }
}

export function requestAuthDialog() {
  window.dispatchEvent(new Event(OPEN_AUTH_DIALOG_EVENT));
}

export function notifyAuthSessionChange(token: string | null) {
  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CHANGE_EVENT, { detail: token }));
}
