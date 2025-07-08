"use client";

import React, { useState } from "react";

interface ReportCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  iconBg: string;
  buttonText: string;
  buttonVariant: "primary" | "secondary";
}

const reportCards: ReportCard[] = [
  {
    id: "bacs",
    title: "BACS Report",
    description:
      "Create BACS report to upload bank. Supported banks: NatWest, Metro, Barclays",
    icon: "bacs",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Generate Report",
    buttonVariant: "secondary",
  },
  {
    id: "cash-balance",
    title: "Cash Balance Report",
    description:
      "For client accounting, generate a cash balance and allocation report",
    icon: "chart",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "client-balances",
    title: "Client Balances Report",
    description:
      "Access full log of the summary of client balances by property",
    icon: "users",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "documents",
    title: "Documents Report",
    description:
      "Provides comprehensive list of all documents linked to your properties along with their expiration dates...",
    icon: "document",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Generate Report",
    buttonVariant: "secondary",
  },
  {
    id: "lead-management",
    title: "Lead Management",
    description: "Description field here",
    icon: "users-group",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Generate Report",
    buttonVariant: "secondary",
  },
  {
    id: "portfolio-data",
    title: "Portfolio Data Report XLS",
    description: "Description field here",
    icon: "chart-bar",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "property-balances",
    title: "Property Balances Report",
    description:
      "Access full log of the summary of property balances by property",
    icon: "building",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "rent-payment",
    title: "Rent Payment Report",
    description: "Description field here",
    icon: "credit-card",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Generate Report",
    buttonVariant: "secondary",
  },
  {
    id: "tasks",
    title: "Tasks Report",
    description: "A compilation of all active tasks within the workspace",
    icon: "check-circle",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Generate Report",
    buttonVariant: "secondary",
  },
  {
    id: "tenancy",
    title: "Tenancy Report",
    description: "Detailed list of all active tenancy contracts by property",
    icon: "home",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "nrl-summary",
    title: "NRL Summary Report",
    description: "Description field here",
    icon: "bacs",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Send Report By Email",
    buttonVariant: "primary",
  },
  {
    id: "workspace-journal",
    title: "Workspace Journal",
    description:
      "Access full log of the changes made across your whole workspace, performed by all your colleagues and contacts ...",
    icon: "journal",
    iconColor: "#5D51E2",
    iconBg: "rgba(93, 81, 226, 0.1)",
    buttonText: "Download CSV File",
    buttonVariant: "secondary",
  },
];

export default function ReportsPage() {
  const [searchTerm, setSearchTerm] = useState("");

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

  const headerStyle: React.CSSProperties = {
    marginBottom: "40px",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#202437",
    margin: "0 0 8px 0",
  };

  const subtitleStyle: React.CSSProperties = {
    fontSize: "16px",
    color: "#797E8B",
    margin: "0 0 24px 0",
  };

  const contactInfoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#797E8B",
  };

  const linkStyle: React.CSSProperties = {
    color: "#5D51E2",
    textDecoration: "none",
  };

  const gridStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: "24px",
    width: "100%",
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: "white",
    borderRadius: "12px",
    border: "1px solid #EBECF1",
    padding: "24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    height: "200px",
  };

  const iconContainerStyle: React.CSSProperties = {
    width: "48px",
    height: "48px",
    borderRadius: "8px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };

  const cardTitleStyle: React.CSSProperties = {
    fontSize: "16px",
    fontWeight: "600",
    color: "#202437",
    margin: "0",
  };

  const cardDescriptionStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#797E8B",
    margin: "0",
    lineHeight: "1.4",
    flex: 1,
  };

  const primaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    backgroundColor: "#5D51E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "auto",
  };

  const secondaryButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 16px",
    backgroundColor: "transparent",
    color: "#5D51E2",
    border: "1px solid #5D51E2",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
    marginTop: "auto",
  };

  const renderIcon = (iconType: string, color: string) => {
    const iconProps = {
      width: "24",
      height: "24",
      fill: color,
    };

    switch (iconType) {
      case "bacs":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
          </svg>
        );
      case "chart":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4zm2.5 2.25h-15V5.75H22v13.5z" />
          </svg>
        );
      case "users":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M16 7c0-2.21-1.79-4-4-4S8 4.79 8 7s1.79 4 4 4 4-1.79 4-4zm-4 6c-2.67 0-8 1.34-8 4v3h16v-3c0-2.66-5.33-4-8-4z" />
          </svg>
        );
      case "document":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case "users-group":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M12,5.5A3.5,3.5 0 0,1 15.5,9A3.5,3.5 0 0,1 12,12.5A3.5,3.5 0 0,1 8.5,9A3.5,3.5 0 0,1 12,5.5M5,8C5.56,8 6.08,8.15 6.53,8.42C6.38,9.85 6.8,11.27 7.66,12.38C7.16,13.34 6.16,14 5,14A3,3 0 0,1 2,11A3,3 0 0,1 5,8M19,8A3,3 0 0,1 22,11A3,3 0 0,1 19,14C17.84,14 16.84,13.34 16.34,12.38C17.2,11.27 17.62,9.85 17.47,8.42C17.92,8.15 18.44,8 19,8M5.5,18.25C5.5,16.18 8.41,14.5 12,14.5C15.59,14.5 18.5,16.18 18.5,18.25V20H5.5V18.25M0,20V18.5C0,17.11 1.89,15.94 4.45,15.6C3.86,16.28 3.5,17.22 3.5,18.25V20H0M24,20H20.5V18.25C20.5,17.22 20.14,16.28 19.55,15.6C22.11,15.94 24,17.11 24,18.5V20Z" />
          </svg>
        );
      case "chart-bar":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M22,21H2V3H4V19H6V10H10V19H12V6H16V19H18V14H22V21Z" />
          </svg>
        );
      case "building":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M17,11V3H21V11H19V21H15V11H17M5,11V21H1V11H3V3H7V11H5M11,21H9V3H11V8H13V3H15V21H13V10H11V21Z" />
          </svg>
        );
      case "credit-card":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M20,4H4C2.89,4 2,4.89 2,6V18A2,2 0 0,0 4,20H20A2,2 0 0,0 22,18V6C22,4.89 21.1,4 20,4M20,18H4V12H20V18M20,8H4V6H20V8Z" />
          </svg>
        );
      case "check-circle":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M11,16.5L18,9.5L16.59,8.09L11,13.67L7.91,10.59L6.5,12L11,16.5Z" />
          </svg>
        );
      case "home":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M10,20V14H14V20H19V12H22L12,3L2,12H5V20H10Z" />
          </svg>
        );
      case "journal":
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19,3H14.82C14.4,1.84 13.3,1 12,1C10.7,1 9.6,1.84 9.18,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M12,3A1,1 0 0,1 13,4A1,1 0 0,1 12,5A1,1 0 0,1 11,4A1,1 0 0,1 12,3" />
          </svg>
        );
      default:
        return (
          <svg {...iconProps} viewBox="0 0 24 24">
            <path d="M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z" />
          </svg>
        );
    }
  };

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <div style={headerStyle}>
          <h1 style={titleStyle}>Reports</h1>
          <p style={subtitleStyle}>
            We&apos;re working hard in the background to bring you more reports.
          </p>
          <div style={contactInfoStyle}>
            If you have any suggestions, please let us know by emailing us at{" "}
            <a href="mailto:contact@letancy.com" style={linkStyle}>
              contact@letancy.com
            </a>
          </div>
        </div>

        <div style={gridStyle}>
          {reportCards.map((card) => (
            <div key={card.id} style={cardStyle}>
              <div
                style={{
                  ...iconContainerStyle,
                  backgroundColor: card.iconBg,
                }}
              >
                {renderIcon(card.icon, card.iconColor)}
              </div>

              <div>
                <h3 style={cardTitleStyle}>{card.title}</h3>
                <p style={cardDescriptionStyle}>{card.description}</p>
              </div>

              <button
                style={
                  card.buttonVariant === "primary"
                    ? primaryButtonStyle
                    : secondaryButtonStyle
                }
              >
                {card.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
