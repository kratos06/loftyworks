"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "../../hooks/useSupabase";
import { supabase } from "../../lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const { user, signIn, signUp, resetPassword, loading } = useSupabase();

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle magic link authentication
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // The supabase client should automatically handle the auth callback
        // due to detectSessionInUrl: true in the config
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Auth callback error:", error);
          setError("Authentication failed. Please try again.");
        } else if (data.session) {
          setMessage("Successfully signed in! Redirecting...");
          setTimeout(() => {
            router.push("/properties");
          }, 1000);
        }
      } catch (err) {
        console.error("Magic link processing error:", err);
        setError("Failed to process magic link. Please try again.");
      }
    };

    // Check if this is an auth callback URL
    const urlParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.slice(1));

    if (urlParams.get("token") && urlParams.get("type") === "magiclink") {
      handleAuthCallback();
    } else if (
      hashParams.get("access_token") ||
      hashParams.get("refresh_token")
    ) {
      // Handle hash-based auth responses
      handleAuthCallback();
    }
  }, [router]);

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push("/properties");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsSubmitting(true);

    if (isLogin) {
      // Login
      const { error } = await signIn(email, password);
      if (error) {
        setError(error);
      } else {
        router.push("/properties");
      }
    } else {
      // Sign up
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsSubmitting(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setIsSubmitting(false);
        return;
      }

      const { error } = await signUp(email, password, { name });
      if (error) {
        setError(error);
      } else {
        setMessage("Check your email for the confirmation link!");
      }
    }

    setIsSubmitting(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    const { error } = await resetPassword(email);
    if (error) {
      setError(error);
    } else {
      setMessage("Check your email for the password reset link!");
    }
  };

  const handleMagicLinkSignIn = async () => {
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
        },
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Check your email for the magic link to sign in!");
      }
    } catch (err) {
      setError("Failed to send magic link. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const createTestUser = async () => {
    setIsSubmitting(true);
    setError("");
    setMessage("");

    try {
      const { data, error } = await supabase.auth.signUp({
        email: "jason@lofty.com",
        password: "123456",
        options: {
          data: {
            name: "Jason Test",
          },
          emailRedirectTo: undefined, // Skip email confirmation for development
        },
      });

      if (error) {
        if (
          error.message.includes("already registered") ||
          error.message.includes("User already registered")
        ) {
          setMessage(
            "Test user already exists. You can sign in with jason@lofty.com / 123456",
          );
        } else {
          setError(error.message);
        }
      } else {
        if (data.user && !data.session) {
          setMessage(
            "Test user created! Check email for confirmation, or sign in directly if email confirmation is disabled.",
          );
        } else {
          setMessage(
            "Test user created and signed in! Email: jason@lofty.com, Password: 123456",
          );
          if (data.session) {
            router.push("/properties");
          }
        }
      }
    } catch (err) {
      setError("Failed to create test user.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily:
      'SF Pro Text, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    maxWidth: "400px",
    padding: "20px",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "40px",
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    border: "1px solid #EBECF1",
  };

  const logoStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "32px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "28px",
    fontWeight: "700",
    color: "#202437",
    margin: "0 0 8px 0",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#797E8B",
    margin: "0 0 32px 0",
  };

  const formStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  };

  const inputGroupStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: "500",
    color: "#202437",
  };

  const inputStyle: React.CSSProperties = {
    padding: "12px 16px",
    border: "1px solid #C6C8D1",
    borderRadius: "8px",
    fontSize: "16px",
    outline: "none",
    transition: "border-color 0.2s ease",
  };

  const buttonStyle: React.CSSProperties = {
    padding: "12px 24px",
    backgroundColor: "#5D51E2",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "16px",
    fontWeight: "500",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    opacity: isSubmitting ? 0.7 : 1,
  };

  const linkButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#5D51E2",
    cursor: "pointer",
    fontSize: "14px",
    textDecoration: "underline",
    padding: "0",
  };

  const errorStyle: React.CSSProperties = {
    color: "#F0454C",
    fontSize: "14px",
    textAlign: "center",
    padding: "8px 12px",
    backgroundColor: "#FEF2F2",
    border: "1px solid #FECACA",
    borderRadius: "6px",
  };

  const messageStyle: React.CSSProperties = {
    color: "#047857",
    fontSize: "14px",
    textAlign: "center",
    padding: "8px 12px",
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "6px",
  };

  const switchModeStyle: React.CSSProperties = {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#797E8B",
  };

  if (loading) {
    return (
      <div style={pageStyle}>
        <div style={containerStyle}>
          <div style={cardStyle}>
            <div style={{ textAlign: "center", padding: "40px" }}>
              <p>Loading...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          {/* Logo and Title */}
          <div style={logoStyle}>
            <h1 style={titleStyle}>LoftyWorks</h1>
            <p style={subtitleStyle}>
              {isLogin ? "Welcome back" : "Create your account"}
            </p>
          </div>

          {/* Error/Success Messages */}
          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={messageStyle}>{message}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} style={formStyle}>
            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={inputStyle}
                placeholder="Enter your email"
                required
              />
            </div>

            <div style={inputGroupStyle}>
              <label style={labelStyle}>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={inputStyle}
                placeholder="Enter your password"
                required
                minLength={6}
              />
            </div>

            {!isLogin && (
              <div style={inputGroupStyle}>
                <label style={labelStyle}>Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Confirm your password"
                  required={!isLogin}
                  minLength={6}
                />
              </div>
            )}

            <button type="submit" style={buttonStyle} disabled={isSubmitting}>
              {isSubmitting
                ? isLogin
                  ? "Signing in..."
                  : "Creating account..."
                : isLogin
                  ? "Sign In"
                  : "Create Account"}
            </button>

            {isLogin && (
              <div
                style={{
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
              >
                <button
                  type="button"
                  onClick={handleMagicLinkSignIn}
                  style={{
                    ...buttonStyle,
                    backgroundColor: "#20C472",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Sign in with Magic Link"}
                </button>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  style={linkButtonStyle}
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </form>

          {/* Switch between login/signup */}
          <div style={switchModeStyle}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
                setMessage("");
                setEmail("");
                setPassword("");
                setConfirmPassword("");
                setName("");
              }}
              style={linkButtonStyle}
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </div>

          {/* Development test user creation */}
          <div
            style={{
              ...switchModeStyle,
              marginTop: "16px",
              padding: "16px",
              backgroundColor: "#FFF2D9",
              borderRadius: "8px",
              border: "1px solid #FFA600",
            }}
          >
            <p
              style={{
                margin: "0 0 8px 0",
                fontSize: "12px",
                color: "#B45309",
              }}
            >
              Development Mode
            </p>
            <button
              onClick={createTestUser}
              style={{
                ...linkButtonStyle,
                backgroundColor: "#FFA600",
                color: "white",
                padding: "6px 12px",
                borderRadius: "4px",
                fontSize: "12px",
                textDecoration: "none",
              }}
              disabled={isSubmitting}
            >
              Create Test User (jason@lofty.com)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
