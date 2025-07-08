"use client";

import React from "react";

export default function SettingsPage() {
  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF UI Text", "SF Pro Text", "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    padding: "40px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#202437",
    margin: "0 0 24px 0",
  };

  const contentStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #EBECF1",
    padding: "40px",
    textAlign: "center",
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <h1 style={titleStyle}>Settings</h1>

        <div style={contentStyle}>
          <p style={{ fontSize: "16px", color: "#797E8B", margin: "0" }}>
            Settings page coming soon...
          </p>
        </div>
      </div>
    </div>
  );
}
