"use client";

import React, { useState } from "react";

interface Invoice {
  id: string;
  number: string;
  ref: string;
  to: string;
  date: string;
  dueDate: string;
  paid: number;
  due: number;
  status: string;
}

const mockInvoices: Invoice[] = [
  {
    id: "1",
    number: "INV-0735",
    ref: "C-1112-2025-30",
    to: "Anto Bolashvili",
    date: "21 Jan 2025",
    dueDate: "30 Jan 2025",
    paid: 0.0,
    due: 1234.0,
    status: "Author",
  },
  {
    id: "2",
    number: "INV-0734",
    ref: "C-1112-2025-29",
    to: "Darrell Steward",
    date: "21 Jan 2025",
    dueDate: "29 Jan 2025",
    paid: 0.0,
    due: 1234.0,
    status: "Author",
  },
  {
    id: "3",
    number: "INV-0733",
    ref: "C-1112-2025-28",
    to: "Cameron Williamson",
    date: "21 Jan 2025",
    dueDate: "27 Jan 2025",
    paid: 0.0,
    due: 1233.0,
    status: "Author",
  },
  {
    id: "4",
    number: "INV-0732",
    ref: "C-1112-2025-27",
    to: "Kristin Watson",
    date: "20 Jan 2025",
    dueDate: "26 Jan 2025",
    paid: 0.0,
    due: 1233.0,
    status: "Author",
  },
  {
    id: "5",
    number: "INV-0731",
    ref: "C-exfolandlord-2025-8",
    to: "Marvin McKinney",
    date: "20 Jan 2025",
    dueDate: "26 Jan 2025",
    paid: 0.0,
    due: 1234.0,
    status: "Author",
  },
  {
    id: "6",
    number: "INV-0730",
    ref: "C-exfolandlord-2025-7",
    to: "Jacob Jones",
    date: "19 Jan 2025",
    dueDate: "25 Jan 2025",
    paid: 0.0,
    due: 1236.0,
    status: "Author",
  },
];

export default function AccountingPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeSection, setActiveSection] = useState("invoices");
  const [startDate, setStartDate] = useState("None");
  const [endDate, setEndDate] = useState("All");
  const [filterInArrears, setFilterInArrears] = useState("No");
  const [showBillsWithWarning, setShowBillsWithWarning] = useState("No");

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF UI Text", "SF Pro Text", "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const mainContentStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
  };

  const sidebarStyle: React.CSSProperties = {
    width: "240px",
    backgroundColor: "#202437",
    minHeight: "calc(100vh - 60px)",
    padding: "0",
    flexShrink: 0,
  };

  const sidebarHeaderStyle: React.CSSProperties = {
    padding: "20px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
  };

  const sidebarTitleStyle: React.CSSProperties = {
    color: "white",
    fontSize: "18px",
    fontWeight: "600",
    margin: "0",
  };

  const sidebarMenuStyle: React.CSSProperties = {
    padding: "10px 0",
  };

  const menuItemStyle: React.CSSProperties = {
    display: "block",
    width: "100%",
    padding: "12px 20px",
    color: "rgba(255, 255, 255, 0.7)",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: "500",
    border: "none",
    backgroundColor: "transparent",
    cursor: "pointer",
    textAlign: "left",
  };

  const activeMenuItemStyle: React.CSSProperties = {
    ...menuItemStyle,
    backgroundColor: "rgba(93, 81, 226, 0.2)",
    color: "white",
  };

  const contentAreaStyle: React.CSSProperties = {
    flex: 1,
    padding: "0",
  };

  const statsBarStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 30px",
    backgroundColor: "white",
    borderBottom: "1px solid #EBECF1",
  };

  const statItemStyle: React.CSSProperties = {
    textAlign: "center",
  };

  const statLabelStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#797E8B",
    margin: "0 0 4px 0",
    fontWeight: "500",
  };

  const statValueStyle: React.CSSProperties = {
    fontSize: "20px",
    fontWeight: "700",
    color: "#202437",
    margin: "0",
  };

  const createButtonStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 16px",
    backgroundColor: "#5D51E2",
    color: "white",
    border: "none",
    borderRadius: "6px",
    fontSize: "14px",
    fontWeight: "500",
    cursor: "pointer",
  };

  const filtersBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "20px",
    padding: "15px 30px",
    backgroundColor: "white",
    borderBottom: "1px solid #EBECF1",
  };

  const searchInputStyle: React.CSSProperties = {
    width: "280px",
    height: "36px",
    padding: "0 12px 0 36px",
    border: "1px solid #EBECF1",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  };

  const filterStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#515666",
  };

  const tableContainerStyle: React.CSSProperties = {
    backgroundColor: "white",
    margin: "0",
  };

  const tableHeaderStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "140px 120px 180px 100px 100px 80px 80px 100px 100px",
    gap: "20px",
    padding: "12px 30px",
    borderBottom: "1px solid #EBECF1",
    fontSize: "14px",
    fontWeight: "600",
    color: "#202437",
    alignItems: "center",
  };

  const tableRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "140px 120px 180px 100px 100px 80px 80px 100px 100px",
    gap: "20px",
    padding: "16px 30px",
    borderBottom: "1px solid #EBECF1",
    alignItems: "center",
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "6px",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "500",
    backgroundColor: "#E8F5E8",
    color: "#2E7D2E",
  };

  const actionButtonStyle: React.CSSProperties = {
    padding: "4px",
    border: "none",
    background: "none",
    cursor: "pointer",
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const paginationStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    backgroundColor: "white",
    borderTop: "1px solid #EBECF1",
  };

  return (
    <div style={pageStyle}>
      <div style={mainContentStyle}>
        {/* Sidebar */}
        <div style={sidebarStyle}>
          <div style={sidebarHeaderStyle}>
            <h2 style={sidebarTitleStyle}>ACCOUNTING</h2>
          </div>

          <nav style={sidebarMenuStyle}>
            <button
              style={
                activeSection === "invoices"
                  ? activeMenuItemStyle
                  : menuItemStyle
              }
              onClick={() => setActiveSection("invoices")}
            >
              Invoices
            </button>
            <button
              style={
                activeSection === "bill" ? activeMenuItemStyle : menuItemStyle
              }
              onClick={() => setActiveSection("bill")}
            >
              Bill
            </button>
            <button
              style={
                activeSection === "bank" ? activeMenuItemStyle : menuItemStyle
              }
              onClick={() => setActiveSection("bank")}
            >
              Bank
            </button>
            <button
              style={
                activeSection === "payouts"
                  ? activeMenuItemStyle
                  : menuItemStyle
              }
              onClick={() => setActiveSection("payouts")}
            >
              Payouts
            </button>
            <button
              style={
                activeSection === "balance"
                  ? activeMenuItemStyle
                  : menuItemStyle
              }
              onClick={() => setActiveSection("balance")}
            >
              Balance
            </button>
            <button
              style={
                activeSection === "arrears"
                  ? activeMenuItemStyle
                  : menuItemStyle
              }
              onClick={() => setActiveSection("arrears")}
            >
              Arrears
            </button>
            <button
              style={
                activeSection === "deposit-management"
                  ? activeMenuItemStyle
                  : menuItemStyle
              }
              onClick={() => setActiveSection("deposit-management")}
            >
              Deposit Management
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div style={contentAreaStyle}>
          {/* Stats Bar */}
          <div style={statsBarStyle}>
            <div style={statItemStyle}>
              <p style={statLabelStyle}>Paid Total</p>
              <p style={statValueStyle}>0.00</p>
            </div>
            <div style={statItemStyle}>
              <p style={statLabelStyle}>Paid This Month</p>
              <p style={statValueStyle}>0.00</p>
            </div>
            <div style={statItemStyle}>
              <p style={statLabelStyle}>Due</p>
              <p style={statValueStyle}>289,770.33</p>
            </div>
            <div style={statItemStyle}>
              <p style={statLabelStyle}>In Arrears</p>
              <p style={statValueStyle}>138,206.13</p>
            </div>
            <div style={statItemStyle}>
              <p style={statLabelStyle}>Last Update</p>
              <p style={statValueStyle}>28 min ago</p>
            </div>
            <button style={createButtonStyle}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                  fill="white"
                />
              </svg>
              Create Invoice
            </button>
          </div>

          {/* Filters */}
          <div style={filtersBarStyle}>
            <div style={{ position: "relative" }}>
              <svg
                style={{
                  position: "absolute",
                  left: "12px",
                  top: "11px",
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
                placeholder="Search number, ref or to..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={searchInputStyle}
              />
            </div>
            <div style={filterStyle}>
              <span>
                Start Date: <strong>{startDate}</strong>
              </span>
            </div>
            <div style={filterStyle}>
              <span>
                End Date: <strong>{endDate}</strong>
              </span>
            </div>
            <div style={filterStyle}>
              <span>
                Filter in Arrears: <strong>{filterInArrears}</strong>
              </span>
            </div>
            <div style={filterStyle}>
              <span>
                Show Bills with Warning: <strong>{showBillsWithWarning}</strong>
              </span>
            </div>
          </div>

          {/* Table */}
          <div style={tableContainerStyle}>
            {/* Table Header */}
            <div style={tableHeaderStyle}>
              <div>Number</div>
              <div>Ref</div>
              <div>To</div>
              <div>Date</div>
              <div>Due Date</div>
              <div>Paid</div>
              <div>Due</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Table Body */}
            {mockInvoices.map((invoice) => (
              <div key={invoice.id} style={tableRowStyle}>
                <div
                  style={{
                    fontSize: "14px",
                    color: "#202437",
                    fontWeight: "500",
                  }}
                >
                  {invoice.number}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  {invoice.ref}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  {invoice.to}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  {invoice.date}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  {invoice.dueDate}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  £{invoice.paid.toFixed(2)}
                </div>
                <div style={{ fontSize: "14px", color: "#515666" }}>
                  £{invoice.due.toFixed(2)}
                </div>
                <div>
                  <span style={statusBadgeStyle}>
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: "#2E7D2E",
                      }}
                    />
                    {invoice.status}
                  </span>
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button style={actionButtonStyle} title="Download">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M8.5 11L8.5 1L7.5 1L7.5 11L4.5 8L3.79 8.71L8 12.92L12.21 8.71L11.5 8L8.5 11Z"
                        fill="#797E8B"
                      />
                      <path d="M2 14L14 14L14 15L2 15L2 14Z" fill="#797E8B" />
                    </svg>
                  </button>
                  <button style={actionButtonStyle} title="More options">
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

          {/* Pagination */}
          <div style={paginationStyle}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "0 6px",
                border: "1px solid #E1E2E6",
                borderRadius: "6px",
                backgroundColor: "white",
              }}
            >
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: "700",
                  color: "#5D51E2",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                1
              </button>
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#515666",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                2
              </button>
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#515666",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                3
              </button>
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#515666",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                4
              </button>
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#515666",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                5
              </button>
              <span style={{ color: "#515666", padding: "5px 8px" }}>...</span>
              <button
                style={{
                  padding: "5px",
                  border: "none",
                  background: "none",
                  cursor: "pointer",
                  borderRadius: "6px",
                  color: "#515666",
                  minWidth: "30px",
                  minHeight: "30px",
                }}
              >
                99
              </button>
              <div
                style={{
                  width: "1px",
                  height: "24px",
                  backgroundColor: "#EBECF1",
                }}
              />
              <input
                type="text"
                value={currentPage}
                onChange={(e) => setCurrentPage(Number(e.target.value) || 1)}
                style={{
                  width: "40px",
                  height: "24px",
                  padding: "0 10px",
                  border: "1px solid #C6C8D1",
                  borderRadius: "6px",
                  textAlign: "center",
                  fontSize: "14px",
                }}
              />
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                style={{
                  width: "60px",
                  height: "24px",
                  padding: "0 10px",
                  border: "1px solid #C6C8D1",
                  borderRadius: "6px",
                  fontSize: "14px",
                }}
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
