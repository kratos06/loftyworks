"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if this is a valid password reset session
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        setError("Invalid or expired reset link. Please request a new one.");
        return;
      }
      
      if (data.session) {
        setIsValidSession(true);
      } else {
        setError("Invalid or expired reset link. Please request a new one.");
      }
    };

    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        setError(error.message);
      } else {
        setMessage("Password updated successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    } catch (err) {
      setError("Failed to update password. Please try again.");
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

  const linkContainerStyle: React.CSSProperties = {
    textAlign: "center",
    marginTop: "24px",
    fontSize: "14px",
    color: "#797E8B",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={logoStyle}>
            <h1 style={titleStyle}>Reset Password</h1>
            <p style={subtitleStyle}>
              Enter your new password below
            </p>
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {message && <div style={messageStyle}>{message}</div>}

          {isValidSession ? (
            <form onSubmit={handleSubmit} style={formStyle}>
              <div style={inputGroupStyle}>
                <label style={labelStyle}>New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
              </div>

              <div style={inputGroupStyle}>
                <label style={labelStyle}>Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  style={inputStyle}
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" style={buttonStyle} disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </button>
            </form>
          ) : (
            <div style={linkContainerStyle}>
              <p>Unable to reset password. The link may have expired.</p>
            </div>
          )}

          <div style={linkContainerStyle}>
            <button
              onClick={() => router.push("/login")}
              style={linkButtonStyle}
            >
              Back to Login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}