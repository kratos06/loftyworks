"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useContacts } from "../../hooks/useSupabase";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: string;
  avatar_url?: string;
  initials?: string;
  company?: string;
  address?: string;
}

export default function ContactsPage() {
  const { contacts, loading, error, fetchContacts, createContact } =
    useContacts();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [showCreateModal, setShowCreateModal] = useState(false);

  const typeOptions = [
    "All",
    "Guarantor",
    "Landlord",
    "New",
    "Supplier",
    "System",
    "Tenant",
    "Permitted Occupier",
    "Other",
  ];

  // 联系人统计数据
  const [contactStats, setContactStats] = useState({
    allContacts: 0,
    guarantor: 0,
    landlord: 0,
    new: 0,
    supplier: 0,
    system: 0,
    tenant: 0,
    permittedOccupier: 0,
    other: 0,
  });

  const getTypeFromTab = useCallback((tab: string) => {
    const typeMap: { [key: string]: string } = {
      guarantor: "Guarantor",
      landlord: "Landlord",
      new: "New",
      supplier: "Supplier",
      system: "System",
      tenant: "Tenant",
      "permitted-occupier": "Permitted Occupier",
      other: "Other",
    };
    return typeMap[tab];
  }, []);

  const loadContacts = useCallback(async () => {
    const filters: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) {
      filters.search = searchTerm;
    }

    // 根据活跃标签过滤类型
    if (activeTab !== "all") {
      filters.type = getTypeFromTab(activeTab);
    } else if (selectedType !== "All") {
      filters.type = selectedType;
    }

    await fetchContacts(filters);
  }, [currentPage, pageSize, searchTerm, selectedType, activeTab, getTypeFromTab, fetchContacts]);

  const calculateStats = useCallback(() => {
    // Calculate stats based on actual contact data
    const guarantorCount = contacts.filter(
      (c) => c.type === "Guarantor",
    ).length;
    const landlordCount = contacts.filter((c) => c.type === "Landlord").length;
    const newCount = contacts.filter((c) => c.type === "New").length;
    const supplierCount = contacts.filter((c) => c.type === "Supplier").length;
    const systemCount = contacts.filter((c) => c.type === "System").length;
    const tenantCount = contacts.filter((c) => c.type === "Tenant").length;
    const permittedOccupierCount = contacts.filter(
      (c) => c.type === "Permitted Occupier",
    ).length;
    const otherCount = contacts.filter((c) => c.type === "Other").length;

    setContactStats({
      allContacts: contacts.length,
      guarantor: guarantorCount,
      landlord: landlordCount,
      new: newCount,
      supplier: supplierCount,
      system: systemCount,
      tenant: tenantCount,
      permittedOccupier: permittedOccupierCount,
      other: otherCount,
    });
  }, [contacts]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  useEffect(() => {
    calculateStats();
  }, [calculateStats]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (typeFilterOpen && !target.closest("[data-type-dropdown]")) {
        setTypeFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeFilterOpen]);

  const getTabCount = (tab: string) => {
    switch (tab) {
      case "all":
        return contactStats.allContacts;
      case "guarantor":
        return contactStats.guarantor;
      case "landlord":
        return contactStats.landlord;
      case "new":
        return contactStats.new;
      case "supplier":
        return contactStats.supplier;
      case "system":
        return contactStats.system;
      case "tenant":
        return contactStats.tenant;
      case "permitted-occupier":
        return contactStats.permittedOccupier;
      case "other":
        return contactStats.other;
      default:
        return 0;
    }
  };

  const handleCreateContact = async (contactData: any) => {
    try {
      await createContact(contactData);
      setShowCreateModal(false);
      await loadContacts();
      await calculateStats();
    } catch (err) {
      console.error("Failed to create contact:", err);
      alert("创建联系人失败，请重试");
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF UI Text", "SF Pro Text", "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const containerStyle: React.CSSProperties = {
    width: "100%",
    padding: "0 20px",
  };

  const topBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px 20px",
    backgroundColor: "white",
    borderBottom: "1px solid #EBECF1",
  };

  const tabsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "5px",
    flex: 1,
  };

  const tabStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "3px",
    padding: "7px 10px",
    borderRadius: "6px",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
  };

  const activeTabStyle: React.CSSProperties = {
    ...tabStyle,
    backgroundColor: "rgba(32, 36, 55, 0.05)",
    color: "#202437",
  };

  const inactiveTabStyle: React.CSSProperties = {
    ...tabStyle,
    color: "#797E8B",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 20px",
    backgroundColor: "#5D51E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    cursor: "pointer",
    minHeight: "36px",
    minWidth: "100px",
  };

  if (loading && contacts.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>加载中...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ color: "red" }}>加载失败: {error}</p>
          <button onClick={loadContacts} style={buttonStyle}>
            重试
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        {/* Top Bar with Tabs */}
        <div style={topBarStyle}>
          <div style={tabsStyle}>
            <button
              style={activeTab === "all" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("all")}
            >
              All Contacts
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("all")}
              </span>
            </button>
            <button
              style={
                activeTab === "guarantor" ? activeTabStyle : inactiveTabStyle
              }
              onClick={() => setActiveTab("guarantor")}
            >
              Guarantor
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("guarantor")}
              </span>
            </button>
            <button
              style={
                activeTab === "landlord" ? activeTabStyle : inactiveTabStyle
              }
              onClick={() => setActiveTab("landlord")}
            >
              Landlord
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("landlord")}
              </span>
            </button>
            <button
              style={activeTab === "new" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("new")}
            >
              New
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("new")}
              </span>
            </button>
            <button
              style={
                activeTab === "supplier" ? activeTabStyle : inactiveTabStyle
              }
              onClick={() => setActiveTab("supplier")}
            >
              Supplier
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("supplier")}
              </span>
            </button>
            <button
              style={activeTab === "system" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("system")}
            >
              System
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("system")}
              </span>
            </button>
            <button
              style={activeTab === "tenant" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("tenant")}
            >
              Tenant
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("tenant")}
              </span>
            </button>
            <button
              style={
                activeTab === "permitted-occupier"
                  ? activeTabStyle
                  : inactiveTabStyle
              }
              onClick={() => setActiveTab("permitted-occupier")}
            >
              Permitted Occupier
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("permitted-occupier")}
              </span>
            </button>
            <button
              style={activeTab === "other" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("other")}
            >
              Other
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {getTabCount("other")}
              </span>
            </button>
          </div>

          <button style={buttonStyle} onClick={() => setShowCreateModal(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                fill="white"
              />
            </svg>
            Add Contact
          </button>
        </div>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px",
            backgroundColor: "white",
            border: "1px solid #EBECF1",
            borderTop: "none",
            borderRadius: "6px 6px 0 0",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "10px",
                  top: "8px",
                  pointerEvents: "none",
                }}
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M13.8685 13.2476L10.0029 9.38194C10.9587 8.26559 11.4451 6.82244 11.3599 5.35527C11.2747 3.8881 10.6246 2.51092 9.54607 1.51267C8.46749 0.514412 7.04422 -0.0273414 5.57485 0.00106307C4.10548 0.0294676 2.70421 0.625823 1.66502 1.66502C0.625823 2.70421 0.0294676 4.10548 0.00106307 5.57485C-0.0273414 7.04422 0.514412 8.46749 1.51267 9.54607C2.51092 10.6246 3.8881 11.2747 5.35527 11.3599C6.82244 11.4451 8.26559 10.9587 9.38194 10.0029L13.2476 13.8685C13.2882 13.9095 13.3366 13.942 13.3899 13.9642C13.4431 13.9864 13.5003 13.9978 13.558 13.9978C13.6157 13.9978 13.6729 13.9864 13.7262 13.9642C13.7795 13.942 13.8278 13.9095 13.8685 13.8685C13.9095 13.8278 13.942 13.7795 13.9642 13.7262C13.9864 13.6729 13.9978 13.6157 13.9978 13.558C13.9978 13.5003 13.9864 13.4431 13.9642 13.3899C13.942 13.3366 13.9095 13.2882 13.8685 13.2476ZM5.68687 10.497C4.73552 10.497 3.80552 10.2149 3.0145 9.68637C2.22348 9.15782 1.60695 8.40658 1.24288 7.52764C0.87881 6.6487 0.783553 5.68154 0.969154 4.74846C1.15475 3.81538 1.61288 2.9583 2.28559 2.28559C2.9583 1.61288 3.81538 1.15475 4.74846 0.969154C5.68154 0.783553 6.6487 0.87881 7.52764 1.24288C8.40658 1.60695 9.15782 2.22348 9.68637 3.0145C10.2149 3.80552 10.497 4.73552 10.497 5.68687C10.497 6.9626 9.99024 8.18608 9.08816 9.08816C8.18608 9.99024 6.9626 10.497 5.68687 10.497Z"
                  fill="#C6C8D1"
                />
              </svg>
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "300px",
                  height: "30px",
                  padding: "0 10px 0 35px",
                  border: "1px solid #C6C8D1",
                  borderRadius: "6px",
                  fontSize: "14px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ position: "relative" }} data-type-dropdown>
              <button
                onClick={() => setTypeFilterOpen(!typeFilterOpen)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 10px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "transparent",
                  cursor: "pointer",
                  fontSize: "14px",
                  color: "#515666",
                }}
              >
                <span>Type:</span>
                <span style={{ fontWeight: "500" }}>{selectedType}</span>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  style={{
                    transform: typeFilterOpen
                      ? "rotate(180deg)"
                      : "rotate(0deg)",
                    transition: "transform 0.2s ease",
                  }}
                >
                  <path
                    d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                    fill="#A0A3AF"
                  />
                </svg>
              </button>

              {typeFilterOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: "0",
                    width: "200px",
                    backgroundColor: "white",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
                    zIndex: 1000,
                    marginTop: "4px",
                    maxHeight: "250px",
                    overflowY: "auto",
                  }}
                >
                  {typeOptions.map((option) => (
                    <div
                      key={option}
                      onClick={() => {
                        setSelectedType(option);
                        setTypeFilterOpen(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 15px",
                        cursor: "pointer",
                        backgroundColor: "white",
                        fontSize: "14px",
                        color: option === selectedType ? "#5D51E2" : "#515666",
                        transition: "background-color 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f8f9fa";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "white";
                      }}
                    >
                      <span>{option}</span>
                      {option === selectedType && (
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                        >
                          <path
                            d="M4.62893 10.3199L0.24797 6.2999C0.175897 6.23884 0.116897 6.16381 0.0745183 6.07933C0.0321393 5.99484 0.00725613 5.90265 0.00136482 5.80829C-0.00452649 5.71393 0.00869571 5.61935 0.0402365 5.53024C0.0717773 5.44112 0.120985 5.35932 0.184902 5.28974C0.248819 5.22016 0.326125 5.16425 0.412172 5.12536C0.498219 5.08646 0.59123 5.0654 0.685613 5.06343C0.779997 5.06146 0.873803 5.07862 0.961394 5.11389C1.04898 5.14916 1.12855 5.2018 1.1953 5.26865L4.56527 8.3624L10.796 1.89365C10.8599 1.82742 10.9362 1.77444 11.0206 1.73774C11.1049 1.70105 11.1957 1.68136 11.2877 1.67979C11.3796 1.67822 11.471 1.69481 11.5566 1.72861C11.6421 1.76241 11.7202 1.81276 11.7864 1.87678C11.8525 1.9408 11.9054 2.01723 11.942 2.10173C11.9787 2.18622 11.9983 2.27711 11.9999 2.36922C12.0015 2.46132 11.9849 2.55283 11.9512 2.63853C11.9174 2.72422 11.8671 2.80242 11.8032 2.86865L4.62893 10.3199Z"
                            fill="#5D51E2"
                          />
                        </svg>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Table */}
        <div
          style={{
            width: "100%",
            backgroundColor: "white",
            border: "1px solid #EBECF1",
            borderTop: "none",
            borderRadius: "0 0 6px 6px",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 280px 280px 240px 160px",
              gap: "40px",
              padding: "12px 20px",
              borderBottom: "1px solid #EBECF1",
              fontSize: "14px",
              fontWeight: "700",
              color: "#202437",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Name
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 0L10 5H0L5 0Z"
                  fill="#E1E2E6"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 16L10 11H0L5 16Z"
                  fill="#E1E2E6"
                />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Email
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 0L10 5H0L5 0Z"
                  fill="#E1E2E6"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 16L10 11H0L5 16Z"
                  fill="#E1E2E6"
                />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Phone
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 0L10 5H0L5 0Z"
                  fill="#E1E2E6"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 16L10 11H0L5 16Z"
                  fill="#E1E2E6"
                />
              </svg>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              Type
              <svg width="10" height="16" viewBox="0 0 10 16" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 0L10 5H0L5 0Z"
                  fill="#E1E2E6"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5 16L10 11H0L5 16Z"
                  fill="#E1E2E6"
                />
              </svg>
            </div>
            <div style={{ textAlign: "center" }}>Action</div>
          </div>

          {/* Table Body */}
          {contacts.map((contact: Contact) => (
            <div
              key={contact.id}
              style={{
                display: "grid",
                gridTemplateColumns: "280px 280px 280px 240px 160px",
                gap: "40px",
                padding: "15px 20px",
                borderBottom: "1px solid #EBECF1",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {contact.avatar_url ? (
                  <img
                    src={contact.avatar_url}
                    alt={contact.name}
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "#8470FD",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: "700",
                    }}
                  >
                    {contact.initials ||
                      contact.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                  </div>
                )}
                <span
                  style={{
                    fontSize: "14px",
                    color: "#515666",
                    fontWeight: "400",
                  }}
                >
                  {contact.name}
                </span>
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#515666",
                  fontWeight: "400",
                }}
              >
                {contact.email}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#515666",
                  fontWeight: "400",
                }}
              >
                {contact.phone}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  color: "#515666",
                  fontWeight: "400",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                {contact.type}
                {contact.type === "New" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                      fill="#A0A3AF"
                    />
                  </svg>
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "10px",
                }}
              >
                <button
                  style={{
                    padding: "5px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.16346 1.00088C3.44832 1.40115 3.76317 1.85645 4.098 2.36179C4.43284 2.86713 4.85763 3.50255 5.26244 4.10796C5.24368 4.20587 5.20636 4.29929 5.15249 4.38314C5.10251 4.48321 5.01256 4.64332 4.89262 4.88348L4.39286 5.80409L4.103 6.34946L4.45283 6.84979C4.74251 7.25408 5.05277 7.64319 5.38238 8.01557C5.7422 8.43085 6.167 8.88115 6.63677 9.35647C7.10654 9.83179 7.57131 10.2671 7.97611 10.6273C8.38092 10.9876 8.77073 11.3128 9.10556 11.5579L9.63531 11.9432L10.2 11.608C10.5549 11.3978 10.8497 11.2277 11.0896 11.1076C11.3295 10.9876 11.4694 10.8925 11.5894 10.8425H11.6193H11.6493C11.6997 10.8129 11.7534 10.7894 11.8092 10.7724C11.8458 10.768 11.8827 10.768 11.9192 10.7724C12.379 11.0526 12.8687 11.3678 13.3835 11.708C13.8982 12.0483 14.458 12.4435 15.0477 12.8588V12.9389C15.0254 13.005 14.9934 13.0674 14.9527 13.124V13.154V13.184C14.9527 13.184 14.9227 13.2341 14.8478 13.3291L14.5579 13.6794C14.4519 13.8156 14.3385 13.9459 14.2181 14.0696C14.0582 14.2297 13.8682 14.4148 13.6334 14.63C13.5068 14.761 13.364 14.8753 13.2086 14.9702L13.1586 15.0002C12.6834 14.965 12.2156 14.8622 11.7693 14.695C11.1598 14.4675 10.574 14.181 10.0201 13.8395C9.31945 13.4051 8.65134 12.9201 8.02109 12.3885C7.30644 11.7981 6.55181 11.1076 5.77718 10.3371C5.00256 9.56661 4.3129 8.8011 3.72818 8.09062C3.20169 7.45729 2.71913 6.78861 2.28389 6.08928C1.93832 5.53801 1.65346 4.95086 1.4343 4.33811C1.22938 3.89492 1.08805 3.42497 1.01451 2.94218C1.02073 2.92453 1.02912 2.90772 1.03949 2.89215C1.14162 2.72689 1.26053 2.57263 1.39432 2.43184C1.59422 2.21169 1.77414 2.02156 1.92906 1.87146C2.04613 1.75462 2.16959 1.64437 2.29888 1.54124L2.65371 1.27606L2.96356 1.05091C2.97685 1.03117 2.99381 1.01419 3.01353 1.00088C3.06322 0.993333 3.11377 0.993333 3.16346 1.00088ZM3.16346 0.000211744C3.02334 -0.000368209 2.88379 0.0181473 2.74866 0.0552485C2.6158 0.0955213 2.49074 0.158122 2.37884 0.240372L2.07399 0.470526L1.70417 0.740707C1.54046 0.870841 1.38365 1.00946 1.2344 1.15598C1.06448 1.32109 0.869576 1.52123 0.659679 1.76139C0.470831 1.95466 0.303283 2.16769 0.159922 2.39681C0.0665097 2.54797 0.011595 2.71978 0 2.89715C0.0311082 3.49523 0.150686 4.08538 0.354827 4.64832C0.597758 5.3272 0.912741 5.97802 1.29437 6.58962C1.75151 7.33526 2.26087 8.04752 2.81863 8.72104C3.42333 9.46654 4.12799 10.222 4.9326 11.0476C5.7372 11.8731 6.50683 12.5486 7.24647 13.159C7.91592 13.7224 8.62582 14.2358 9.37043 14.695C9.98001 15.0699 10.6244 15.3849 11.2945 15.6357C11.8562 15.8496 12.4483 15.9729 13.0486 16.0009H13.0786C13.2562 15.9914 13.4283 15.9363 13.5784 15.8408C13.804 15.6992 14.012 15.5312 14.1981 15.3405C14.433 15.1253 14.6379 14.9302 14.8078 14.7501C14.9595 14.5936 15.0998 14.4264 15.2276 14.2497C15.3475 14.1096 15.4475 13.9846 15.5324 13.8795C15.6025 13.7915 15.6676 13.6996 15.7273 13.6043C15.8254 13.4579 15.9012 13.2977 15.9522 13.129C15.9916 12.9789 16.0068 12.8235 15.9972 12.6687C15.9776 12.5341 15.9354 12.4038 15.8723 12.2834C15.8094 12.1664 15.7205 12.0653 15.6124 11.9882C15.0027 11.5579 14.428 11.1627 13.8932 10.8024C13.3585 10.4422 12.8487 10.117 12.369 9.80176C12.2948 9.76074 12.2159 9.72882 12.1341 9.7067C12.0476 9.68424 11.9586 9.67248 11.8692 9.67168C11.7404 9.67316 11.6124 9.69338 11.4894 9.73172C11.3516 9.76821 11.2201 9.82558 11.0996 9.90183C10.9896 9.95187 10.8147 10.0469 10.5748 10.182L9.66529 10.7074C9.3011 10.4368 8.95082 10.1479 8.6158 9.84179C8.22599 9.49156 7.7912 9.08128 7.32143 8.60597C6.85166 8.13065 6.45685 7.71537 6.10702 7.3151C5.80096 6.97088 5.514 6.6101 5.24744 6.23438L5.7472 5.31376C5.87714 5.07861 5.96709 4.90849 6.02207 4.81343C6.14766 4.60081 6.22606 4.36362 6.25195 4.11796C6.26956 3.91507 6.22231 3.71183 6.11702 3.53758C5.69722 2.88214 5.31241 2.28674 4.95259 1.74638C4.59276 1.20602 4.26292 0.74571 3.95307 0.310419C3.86226 0.21173 3.74916 0.136244 3.62323 0.090272C3.47813 0.027829 3.32137 -0.00287556 3.16346 0.000211744Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
                <button
                  style={{
                    padding: "5px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M15.4 4.65021C15 3.95017 14.4 3.30013 13.7 2.7501C13 2.20007 12.15 1.75004 11.15 1.45003C10.15 1.15001 9.1 1 8 1C6.9 1 5.85 1.15001 4.9 1.45003C3.95 1.75004 3.05 2.20007 2.35 2.7501C1.65 3.30013 1.05 3.95017 0.6 4.65021C0.2 5.40025 0 6.15029 0 7.00034C0 7.50037 0.1 8.0004 0.25 8.50043C0.4 8.95045 0.6 9.40048 0.9 9.8505C1.15 10.2505 1.5 10.6505 1.9 11.0006C2.3 11.3506 2.8 11.6506 3.3 11.9506C3.3 12.4006 3.2 12.8507 3 13.3007C2.8 13.7507 2.65 14.1007 2.5 14.3508C2.5 14.3508 2.5 14.4008 2.5 14.4508C2.5 14.5008 2.5 14.5008 2.5 14.5508C2.5 14.6508 2.55 14.8008 2.65 14.8508C2.7 14.9508 2.85 15.0008 2.95 15.0008H3.05C3.45 14.9508 3.85 14.8008 4.25 14.6008C4.65 14.4008 5 14.2008 5.35 14.0007C5.7 13.8007 5.95 13.6007 6.2 13.4007C6.45 13.2007 6.6 13.0507 6.7 12.9507C6.9 13.0007 7.05 13.0007 7.15 13.0007C7.3 13.0007 7.4 13.0007 7.55 13.0007H8C9.1 13.0007 10.15 12.8507 11.1 12.5507C12.05 12.2506 12.9 11.8006 13.65 11.2506C14.4 10.7006 14.95 10.0505 15.35 9.35048C15.75 8.65044 15.95 7.85039 15.95 7.00034C16 6.15029 15.8 5.40025 15.4 4.65021ZM14.5 8.85045C14.15 9.45048 13.65 10.0005 13.05 10.4505C12.4 10.9506 11.65 11.3006 10.8 11.6006C9.95 11.8506 9 12.0006 8 12.0006H7.6C7.45 12.0006 7.35 12.0006 7.25 12.0006C7.2 12.0006 7.1 12.0006 6.9 11.9506L6.3 11.8506L5.95 12.3006C5.95 12.3006 5.9 12.4007 5.6 12.6007C5.4 12.8007 5.15 12.9507 4.85 13.1507C4.6 13.3007 4.35 13.4507 4.05 13.6007C4.2 13.2007 4.35 12.7507 4.35 12.3506L4.4 12.3006V11.2506L3.85 10.9506C3.4 10.7006 3 10.4505 2.6 10.1505C2.25 9.8505 1.95 9.55049 1.75 9.20047C1.5 8.85045 1.35 8.50043 1.2 8.1004C1.05 7.80039 1 7.40036 1 7.00034C1 6.35031 1.15 5.75027 1.5 5.15024C1.85 4.5502 2.35 4.00017 2.95 3.55015C3.6 3.05012 4.35 2.7001 5.2 2.40008C6.05 2.15007 7 2.00006 8 2.00006C9 2.00006 9.95 2.15007 10.8 2.40008C11.65 2.7001 12.4 3.05012 13.05 3.55015C13.65 4.00017 14.15 4.5502 14.5 5.15024C14.85 5.70027 15 6.35031 15 7.00034C15 7.65038 14.85 8.25041 14.5 8.85045ZM12 6.00029C11.45 6.00029 11 6.45031 11 7.00034C11 7.55037 11.45 8.0004 12 8.0004C12.55 8.0004 13 7.55037 13 7.00034C13 6.45031 12.55 6.00029 12 6.00029ZM4 6.00029C3.45 6.00029 3 6.45031 3 7.00034C3 7.55037 3.45 8.0004 4 8.0004C4.55 8.0004 5 7.55037 5 7.00034C5 6.45031 4.55 6.00029 4 6.00029ZM8 6.00029C7.45 6.00029 7 6.45031 7 7.00034C7.7 7.55037 7.45 8.0004 8 8.0004C8.55 8.0004 9 7.55037 9 7.00034C9 6.45031 8.55 6.00029 8 6.00029Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
                <button
                  style={{
                    padding: "5px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M1.5 6.50049C1.20333 6.50049 0.913319 6.58847 0.666645 6.7533C0.419972 6.91813 0.227713 7.15241 0.114181 7.42652C0.000649929 7.70062 -0.0290551 8.00224 0.0288228 8.29323C0.0867006 8.58421 0.229562 8.8515 0.439341 9.06129C0.649119 9.27109 0.916394 9.41395 1.20737 9.47184C1.49834 9.52972 1.79994 9.50001 2.07403 9.38647C2.34811 9.27293 2.58238 9.08066 2.74721 8.83398C2.91203 8.58729 3 8.29726 3 8.00057C3 7.60273 2.84197 7.22117 2.56066 6.93985C2.27936 6.65853 1.89783 6.50049 1.5 6.50049ZM8 6.50049C7.70333 6.50049 7.41332 6.58847 7.16665 6.7533C6.91997 6.91813 6.72771 7.15241 6.61418 7.42652C6.50065 7.70062 6.47094 8.00224 6.52882 8.29323C6.5867 8.58421 6.72956 8.8515 6.93934 9.06129C7.14912 9.27109 7.41639 9.41395 7.70737 9.47184C7.99834 9.52972 8.29994 9.50001 8.57403 9.38647C8.84811 9.27293 9.08238 9.08066 9.24721 8.83398C9.41203 8.58729 9.5 8.29726 9.5 8.00057C9.5 7.60273 9.34197 7.22117 9.06066 6.93985C8.77936 6.65853 8.39783 6.50049 8 6.50049ZM14.5 6.50049C14.2033 6.50049 13.9133 6.58847 13.6666 6.7533C13.42 6.91813 13.2277 7.15241 13.1142 7.42652C13.0007 7.70062 12.9709 8.00224 13.0288 8.29323C13.0867 8.58421 13.2296 8.8515 13.4393 9.06129C13.6491 9.27109 13.9164 9.41395 14.2074 9.47184C14.4983 9.52972 14.7999 9.50001 15.074 9.38647C15.3481 9.27293 15.5824 9.08066 15.7472 8.83398C15.912 8.58729 16 8.29726 16 8.00057C16 7.60273 15.842 7.22117 15.5607 6.93985C15.2794 6.65853 14.8978 6.50049 14.5 6.50049Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {contacts.length === 0 && !loading && (
          <div
            style={{ textAlign: "center", padding: "40px", color: "#797E8B" }}
          >
            <p>暂无联系人数据</p>
            <p>请先在 Supabase Dashboard 中执行数据库架构和示例数据脚本</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: "center", padding: "20px" }}>
            <p>加载中...</p>
          </div>
        )}
      </div>

      {/* Create Contact Modal */}
      {showCreateModal && (
        <CreateContactModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateContact}
        />
      )}
    </div>
  );
}

// 简单的创建联系人模态框组件
function CreateContactModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: any) => void;
}) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    type: "Tenant",
    company: "",
    address: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const contactData = {
      ...formData,
      initials: formData.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
      is_active: true,
    };

    onSubmit(contactData);
  };

  const modalStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  };

  const formStyle: React.CSSProperties = {
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "8px",
    width: "500px",
    maxHeight: "80vh",
    overflowY: "auto",
  };

  return (
    <div style={modalStyle} onClick={onClose}>
      <div style={formStyle} onClick={(e) => e.stopPropagation()}>
        <h2>Create New Contact</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "10px" }}>
            <label>Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Type</label>
            <select
              value={formData.type}
              onChange={(e) =>
                setFormData({ ...formData, type: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            >
              <option value="Tenant">Tenant</option>
              <option value="Landlord">Landlord</option>
              <option value="Guarantor">Guarantor</option>
              <option value="Supplier">Supplier</option>
              <option value="Applicant">Applicant</option>
              <option value="New">New</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div style={{ marginBottom: "10px" }}>
            <label>Company</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) =>
                setFormData({ ...formData, company: e.target.value })
              }
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>Address</label>
            <textarea
              value={formData.address}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              rows={3}
              style={{
                width: "100%",
                padding: "8px",
                margin: "5px 0",
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
          </div>
          <div
            style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: "8px 16px",
                border: "1px solid #ccc",
                borderRadius: "4px",
                backgroundColor: "white",
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "4px",
                backgroundColor: "#5D51E2",
                color: "white",
              }}
            >
              Create Contact
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
