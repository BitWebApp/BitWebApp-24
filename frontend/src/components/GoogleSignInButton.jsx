import React, { useEffect, useRef, useState } from "react";

const GIS_SRC = "https://accounts.google.com/gsi/client";

/**
 * Renders Google's official "Sign in with Google" button.
 *
 * Calls onCredential(idToken) once the user picks an account. The token is
 * verified server side by POST /api/v1/users/google-login - nothing here is
 * trusted on its own.
 *
 * Renders nothing when VITE_GOOGLE_CLIENT_ID is unset, so the login page keeps
 * working normally on deployments where Google sign-in isn't configured yet.
 */
export default function GoogleSignInButton({ onCredential, disabled = false }) {
  const holder = useRef(null);
  const callbackRef = useRef(onCredential);
  const [loadError, setLoadError] = useState("");
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Keep the newest callback without re-initialising Google's script.
  useEffect(() => {
    callbackRef.current = onCredential;
  }, [onCredential]);

  useEffect(() => {
    if (!clientId) return undefined;
    let cancelled = false;

    const renderButton = () => {
      if (cancelled || !window.google?.accounts?.id || !holder.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response) => callbackRef.current?.(response.credential),
        cancel_on_tap_outside: true,
      });
      holder.current.innerHTML = "";
      window.google.accounts.id.renderButton(holder.current, {
        theme: "outline",
        size: "large",
        text: "signin_with",
        shape: "rectangular",
        logo_alignment: "center",
        width: 360,
      });
    };

    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) {
      if (window.google?.accounts?.id) renderButton();
      else existing.addEventListener("load", renderButton);
      return () => {
        cancelled = true;
        existing.removeEventListener("load", renderButton);
      };
    }

    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = renderButton;
    script.onerror = () =>
      setLoadError("Could not load Google sign-in. Check your connection.");
    document.body.appendChild(script);

    return () => {
      cancelled = true;
    };
  }, [clientId]);

  if (!clientId) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full flex items-center gap-3 my-4">
        <span className="h-px flex-1 bg-gray-300" />
        <span className="text-xs uppercase tracking-wide text-gray-500">or</span>
        <span className="h-px flex-1 bg-gray-300" />
      </div>
      <div
        ref={holder}
        className={
          disabled ? "opacity-50 pointer-events-none" : undefined
        }
      />
      {loadError && (
        <p className="mt-2 text-xs text-red-600">{loadError}</p>
      )}
      <p className="mt-2 text-xs text-gray-500 text-center">
        Use your @bitmesra.ac.in account - no password or OTP needed.
      </p>
    </div>
  );
}
