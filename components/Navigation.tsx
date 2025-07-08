"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";

export default function Navigation() {
  const router = useRouter();
  const pathname = usePathname();

  const navigationStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "white",
    borderBottom: "1px solid #EBECF1",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    position: "relative",
  };

  const logoStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#5D51E2",
    fontSize: "16px",
    fontWeight: "600",
    textDecoration: "none",
  };

  const menuStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "30px",
    height: "100%",
  };

  const menuItemStyle: React.CSSProperties = {
    padding: "18px 0",
    fontSize: "15px",
    fontWeight: "500",
    color: "#515666",
    textDecoration: "none",
    cursor: "pointer",
    transition: "all 0.2s ease",
    border: "none",
    backgroundColor: "transparent",
    position: "relative",
    height: "100%",
    display: "flex",
    alignItems: "center",
  };

  const activeMenuItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    color: "#202437",
    fontWeight: "500",
  };

  const rightSectionStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  };

  const isActive = (path: string) => pathname === path;

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <nav style={navigationStyle}>
      {/* Design Element & Logo */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Fd20c56b7c0014cd3b37677828d373a63?format=webp&width=800"
          alt="Design Element"
          style={{ width: "20px", height: "20px", opacity: 0.7 }}
        />
        <div style={logoStyle}>
          <img
            src="https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F61c74aca3c2848c4a986d65f7bc5716b?format=webp&width=800"
            alt="LoftyWorks Logo"
            style={{ height: "32px", width: "auto" }}
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <div style={menuStyle}>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/contacts") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/contacts")}
          >
            Contacts
          </button>
          {isActive("/contacts") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={
              isActive("/properties") ? activeMenuItemStyle : menuItemStyle
            }
            onClick={() => handleNavigation("/properties")}
          >
            Properties
          </button>
          {isActive("/properties") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/tenancies") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/tenancies")}
          >
            Tenancies
          </button>
          {isActive("/tenancies") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={
              isActive("/accounting") ? activeMenuItemStyle : menuItemStyle
            }
            onClick={() => handleNavigation("/accounting")}
          >
            Accounting
          </button>
          {isActive("/accounting") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/tasks") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/tasks")}
          >
            Tasks
          </button>
          {isActive("/tasks") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/calendar") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/calendar")}
          >
            Calendar
          </button>
          {isActive("/calendar") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/reports") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/reports")}
          >
            Reports
          </button>
          {isActive("/reports") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/documents") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/documents")}
          >
            Documents
          </button>
          {isActive("/documents") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
        <div style={{ position: "relative", height: "100%" }}>
          <button
            style={isActive("/settings") ? activeMenuItemStyle : menuItemStyle}
            onClick={() => handleNavigation("/settings")}
          >
            Settings
          </button>
          {isActive("/settings") && (
            <div
              style={{
                position: "absolute",
                bottom: "0",
                left: "0",
                right: "0",
                height: "4px",
                backgroundColor: "#5D51E2",
              }}
            />
          )}
        </div>
      </div>

      {/* Right Section */}
      <div style={rightSectionStyle}>
        {/* Search Icon */}
        <button
          style={{
            padding: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M17.3355 18.8928L12.8611 14.4184C14.2232 12.8379 14.9072 10.7789 14.7427 8.6825C14.5782 6.58612 13.5774 4.64404 11.9578 3.26667C10.3382 1.88929 8.2411 1.19185 6.14464 1.32952C4.04818 1.46719 3.04296 2.42396 2.18359 3.2833C1.32422 4.14264 0.367453 5.14786 0.229784 7.24432C0.0921145 9.34078 0.789559 11.4379 2.16693 13.0575C3.5443 14.6771 5.48638 15.6779 7.58276 15.8424C9.67914 16.0069 11.7381 15.3229 13.3186 13.9608L17.793 18.4352C17.8387 18.4814 17.8937 18.5184 17.9546 18.5441C18.0155 18.5698 18.0811 18.5837 18.1474 18.5851C18.2137 18.5865 18.2798 18.5754 18.3417 18.5525C18.4036 18.5296 18.4601 18.4953 18.5077 18.4517C18.5554 18.408 18.5933 18.3559 18.6194 18.2977C18.6455 18.2395 18.659 18.1766 18.659 18.1131C18.659 18.0496 18.6455 17.9867 18.6194 17.9285C18.5933 17.8703 18.5554 17.8182 18.5077 17.7745L17.3355 18.8928ZM7.46651 14.9963C6.24394 14.9963 5.04884 14.6373 4.02407 13.9616C2.9993 13.2859 2.18942 12.3235 1.69748 11.1952C1.20555 10.0669 1.05073 8.81906 1.25269 7.61066C1.45465 6.40226 2.00354 5.28442 2.83213 4.40199C3.66072 3.51957 4.73186 2.91036 5.91649 2.64775C7.10113 2.38513 8.34398 2.47997 9.48458 2.91985C10.6252 3.35973 11.6212 4.1243 12.3454 5.11635C13.0696 6.1084 13.4943 7.28632 13.5743 8.50758C13.6544 9.72884 13.3861 10.9475 12.8011 12.0266C12.2161 13.1057 11.3402 14.002 10.2743 14.6131C9.20845 15.2242 7.99316 15.524 6.77596 15.4793C5.55876 15.4346 4.37329 15.0473 3.35447 14.3593L7.46651 14.9963Z"
              fill="#797E8B"
            />
          </svg>
        </button>

        {/* Notifications */}
        <button
          style={{
            padding: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 6.5C15 5.17392 14.4732 3.90215 13.5355 2.96447C12.5979 2.02678 11.3261 1.5 10 1.5C8.67392 1.5 7.40215 2.02678 6.46447 2.96447C5.52678 3.90215 5 5.17392 5 6.5C5 12.5 2.5 14 2.5 14H17.5C17.5 14 15 12.5 15 6.5Z"
              stroke="#797E8B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M11.73 17.5C11.5542 17.8031 11.3018 18.0547 10.9982 18.2295C10.6946 18.4044 10.3504 18.4965 10 18.4965C9.64964 18.4965 9.30541 18.4044 9.00179 18.2295C8.69818 18.0547 8.44583 17.8031 8.27 17.5"
              stroke="#797E8B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          {/* Notification dot */}
          <div
            style={{
              position: "absolute",
              top: "6px",
              right: "6px",
              width: "8px",
              height: "8px",
              backgroundColor: "#F0454C",
              borderRadius: "50%",
              border: "2px solid white",
            }}
          />
        </button>

        {/* Help */}
        <button
          style={{
            padding: "8px",
            border: "none",
            backgroundColor: "transparent",
            cursor: "pointer",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle
              cx="10"
              cy="10"
              r="8.5"
              stroke="#797E8B"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M7.5 7.5C7.5 6.11929 8.61929 5 10 5C11.3807 5 12.5 6.11929 12.5 7.5C12.5 8.88071 11.3807 10 10 10V12.5"
              stroke="#797E8B"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <circle cx="10" cy="15" r="0.5" fill="#797E8B" />
          </svg>
        </button>

        {/* User Avatar */}
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            backgroundColor: "#5D51E2",
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          U
        </div>
      </div>
    </nav>
  );
}
