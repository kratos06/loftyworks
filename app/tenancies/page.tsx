"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useTenancies } from "../../hooks/useSupabase";

interface Tenancy {
  id: string;
  address: string;
  city: string;
  postcode: string;
  reference: string;
  type: string;
  status: "vacating" | "vacated" | "renewed" | "active" | "expired" | "draft";
  start_date: string;
  end_date: string;
  amount: string;
  amount_numeric: number;
  image: string;
}

const statusConfig = {
  vacating: { label: "Vacating", color: "#F0454C" },
  vacated: { label: "Vacated", color: "#C6C8D1" },
  renewed: { label: "Renewed", color: "#20C472" },
  active: { label: "Active", color: "#20C472" },
  expired: { label: "Expired", color: "#C6C8D1" },
  draft: { label: "Draft", color: "#A0A3AF" },
};

const typeOptions = [
  "All",
  "Contractual",
  "Ground Rent",
  "Ast",
  "Lease",
  "Assured",
];

export default function TenanciesPage() {
  const {
    tenancies,
    loading,
    error,
    fetchTenancies,
    formatDate,
    getTenancyStats,
    getFilteredTenancies,
  } = useTenancies();

  // Mock tenancy data with real property images
  const mockTenancies: Tenancy[] = [
    {
      id: "1",
      address: "123 Baker Street",
      city: "London",
      postcode: "NW1 6XE",
      reference: "TEN001",
      type: "Ast",
      status: "active",
      start_date: "2023-01-15",
      end_date: "2024-01-14",
      amount: "£2,500",
      amount_numeric: 2500,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F402180fea7164df694d234fb78bf9a7e?format=webp&width=800",
    },
    {
      id: "2",
      address: "456 Oxford Street",
      city: "London",
      postcode: "W1C 1AP",
      reference: "TEN002",
      type: "Contractual",
      status: "vacating",
      start_date: "2023-03-01",
      end_date: "2024-02-29",
      amount: "£3,200",
      amount_numeric: 3200,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Fe9099ae1cf264df68b57a06c6fc01592?format=webp&width=800",
    },
    {
      id: "3",
      address: "789 King's Road",
      city: "London",
      postcode: "SW3 4TZ",
      reference: "TEN003",
      type: "Lease",
      status: "renewed",
      start_date: "2022-06-01",
      end_date: "2025-05-31",
      amount: "£4,800",
      amount_numeric: 4800,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F54eae25cf4ab4c448ab257a70050478e?format=webp&width=800",
    },
    {
      id: "4",
      address: "42 Regent Street",
      city: "London",
      postcode: "W1B 2QD",
      reference: "TEN004",
      type: "Assured",
      status: "expired",
      start_date: "2022-01-01",
      end_date: "2023-12-31",
      amount: "£2,800",
      amount_numeric: 2800,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F94f8f696f0d24d3faa68909677151e92?format=webp&width=800",
    },
    {
      id: "5",
      address: "15 Covent Garden",
      city: "London",
      postcode: "WC2E 8RF",
      reference: "TEN005",
      type: "Ground Rent",
      status: "draft",
      start_date: "2024-04-01",
      end_date: "2025-03-31",
      amount: "£3,500",
      amount_numeric: 3500,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Ff6c293f429304096b2ceff14165bc287?format=webp&width=800",
    },
    {
      id: "6",
      address: "88 Victoria Street",
      city: "London",
      postcode: "SW1E 5JL",
      reference: "TEN006",
      type: "Ast",
      status: "vacated",
      start_date: "2023-08-01",
      end_date: "2023-12-31",
      amount: "£4,200",
      amount_numeric: 4200,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F0e072b2771b64a2bb1014bb08b53f349?format=webp&width=800",
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [selectedType, setSelectedType] = useState("All");
  const [typeSearchTerm, setTypeSearchTerm] = useState("");
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [statusSearchTerm, setStatusSearchTerm] = useState("");
  const [renewalDateFilterOpen, setRenewalDateFilterOpen] = useState(false);
  const [selectedRenewalDate, setSelectedRenewalDate] = useState("All");
  const [endDateFilterOpen, setEndDateFilterOpen] = useState(false);
  const [selectedEndDate, setSelectedEndDate] = useState("All");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTenancyDetailsModal, setShowTenancyDetailsModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showMoreActionsDropdown, setShowMoreActionsDropdown] = useState<
    string | null
  >(null);
  const [selectedTenancy, setSelectedTenancy] = useState<Tenancy | null>(null);

  const loadTenancies = useCallback(async () => {
    const filters: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) {
      filters.search = searchTerm;
    }

    if (selectedType !== "All") {
      filters.type = selectedType;
    }

    await fetchTenancies(filters);
  }, [currentPage, pageSize, searchTerm, selectedType]);

  useEffect(() => {
    loadTenancies();
  }, [loadTenancies]);

  // Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMoreActionsDropdown) {
        setShowMoreActionsDropdown(null);
      }
      if (statusFilterOpen) {
        setStatusFilterOpen(false);
      }
      if (renewalDateFilterOpen) {
        setRenewalDateFilterOpen(false);
      }
      if (endDateFilterOpen) {
        setEndDateFilterOpen(false);
      }
      if (typeFilterOpen) {
        setTypeFilterOpen(false);
      }
    };

    if (
      showMoreActionsDropdown ||
      statusFilterOpen ||
      renewalDateFilterOpen ||
      endDateFilterOpen ||
      typeFilterOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [
    showMoreActionsDropdown,
    statusFilterOpen,
    renewalDateFilterOpen,
    endDateFilterOpen,
    typeFilterOpen,
  ]);

  // Use mock data to show property images
  const actualTenancies = mockTenancies;

  const getFilteredMockTenancies = (tab: string) => {
    let filtered = actualTenancies;

    // Filter by tab
    switch (tab) {
      case "current":
        filtered = filtered.filter((t) =>
          ["active", "renewed"].includes(t.status),
        );
        break;
      case "archive":
        filtered = filtered.filter((t) =>
          ["vacated", "expired"].includes(t.status),
        );
        break;
      case "draft":
        filtered = filtered.filter((t) => t.status === "draft");
        break;
      default:
        // All tenancies
        break;
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.postcode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.reference.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by type
    if (selectedType !== "All") {
      filtered = filtered.filter((t) => t.type === selectedType);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((t) => t.status === selectedStatus);
    }

    // Filter by renewal date (simplified date range filtering)
    if (selectedRenewalDate !== "All") {
      const today = new Date();
      const endDate = new Date(today);

      switch (selectedRenewalDate) {
        case "Next 30 days":
          endDate.setDate(today.getDate() + 30);
          filtered = filtered.filter((t) => {
            const renewalDate = new Date(t.end_date);
            return renewalDate >= today && renewalDate <= endDate;
          });
          break;
        case "Next 60 days":
          endDate.setDate(today.getDate() + 60);
          filtered = filtered.filter((t) => {
            const renewalDate = new Date(t.end_date);
            return renewalDate >= today && renewalDate <= endDate;
          });
          break;
        case "Next 90 days":
          endDate.setDate(today.getDate() + 90);
          filtered = filtered.filter((t) => {
            const renewalDate = new Date(t.end_date);
            return renewalDate >= today && renewalDate <= endDate;
          });
          break;
        case "Overdue":
          filtered = filtered.filter((t) => {
            const renewalDate = new Date(t.end_date);
            return renewalDate < today;
          });
          break;
      }
    }

    // Filter by end date
    if (selectedEndDate !== "All") {
      const today = new Date();
      const endDate = new Date(today);

      switch (selectedEndDate) {
        case "Next 30 days":
          endDate.setDate(today.getDate() + 30);
          filtered = filtered.filter((t) => {
            const endDateValue = new Date(t.end_date);
            return endDateValue >= today && endDateValue <= endDate;
          });
          break;
        case "Next 60 days":
          endDate.setDate(today.getDate() + 60);
          filtered = filtered.filter((t) => {
            const endDateValue = new Date(t.end_date);
            return endDateValue >= today && endDateValue <= endDate;
          });
          break;
        case "Next 90 days":
          endDate.setDate(today.getDate() + 90);
          filtered = filtered.filter((t) => {
            const endDateValue = new Date(t.end_date);
            return endDateValue >= today && endDateValue <= endDate;
          });
          break;
        case "Overdue":
          filtered = filtered.filter((t) => {
            const endDateValue = new Date(t.end_date);
            return endDateValue < today;
          });
          break;
      }
    }

    return filtered;
  };

  const getMockTenancyStats = () => {
    return {
      allTenancies: actualTenancies.length,
      current: actualTenancies.filter((t) =>
        ["active", "renewed"].includes(t.status),
      ).length,
      archive: actualTenancies.filter((t) =>
        ["vacated", "expired"].includes(t.status),
      ).length,
      draft: actualTenancies.filter((t) => t.status === "draft").length,
      vacating: actualTenancies.filter((t) => t.status === "vacating").length,
      renewed: actualTenancies.filter((t) => t.status === "renewed").length,
    };
  };

  const handleAddTenancy = (newTenancy: Omit<Tenancy, "id">) => {
    const tenancyWithId: Tenancy = {
      ...newTenancy,
      id: (mockTenancies.length + 1).toString(),
    };
    mockTenancies.push(tenancyWithId);
    setShowAddModal(false);
    // Force re-render by updating a state variable
    setActiveTab(activeTab);
  };

  const handleViewTenancyDetails = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy);
    setShowTenancyDetailsModal(true);
  };

  const handleChatToLandlord = (tenancy: Tenancy) => {
    setSelectedTenancy(tenancy);
    setShowChatModal(true);
  };

  const handleMoreActions = (tenancyId: string) => {
    setShowMoreActionsDropdown(
      showMoreActionsDropdown === tenancyId ? null : tenancyId,
    );
  };

  const stats = getMockTenancyStats();
  const filteredTenancies = getFilteredMockTenancies(activeTab);

  const AddTenancyModal = () => {
    const [formData, setFormData] = useState({
      address: "",
      city: "",
      postcode: "",
      reference: "",
      type: "Ast",
      status: "draft" as Tenancy["status"],
      start_date: "",
      end_date: "",
      amount: "£0",
      amount_numeric: 0,
      image:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F402180fea7164df694d234fb78bf9a7e?format=webp&width=800",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleAddTenancy(formData);
    };

    return (
      <div
        style={{
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
        }}
        onClick={() => setShowAddModal(false)}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "500px",
            maxHeight: "80vh",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontSize: "20px",
                fontWeight: "600",
                color: "#202437",
              }}
            >
              Add New Tenancy
            </h2>
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: "24px",
                cursor: "pointer",
                color: "#797E8B",
                padding: "0",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: "grid", gap: "16px" }}>
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202437",
                  }}
                >
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    Postcode *
                  </label>
                  <input
                    type="text"
                    value={formData.postcode}
                    onChange={(e) =>
                      setFormData({ ...formData, postcode: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202437",
                  }}
                >
                  Reference *
                </label>
                <input
                  type="text"
                  value={formData.reference}
                  onChange={(e) =>
                    setFormData({ ...formData, reference: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="e.g., TEN007"
                  required
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    Type
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="Ast">Ast</option>
                    <option value="Contractual">Contractual</option>
                    <option value="Lease">Lease</option>
                    <option value="Assured">Assured</option>
                    <option value="Ground Rent">Ground Rent</option>
                  </select>
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        status: e.target.value as Tenancy["status"],
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="renewed">Renewed</option>
                    <option value="vacating">Vacating</option>
                    <option value="vacated">Vacated</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    Start Date *
                  </label>
                  <input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) =>
                      setFormData({ ...formData, start_date: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "4px",
                      fontSize: "14px",
                      fontWeight: "500",
                      color: "#202437",
                    }}
                  >
                    End Date *
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) =>
                      setFormData({ ...formData, end_date: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "4px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202437",
                  }}
                >
                  Monthly Rent *
                </label>
                <input
                  type="text"
                  value={formData.amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numericValue =
                      parseInt(value.replace(/[^\d]/g, "")) || 0;
                    setFormData({
                      ...formData,
                      amount: `£${numericValue.toLocaleString()}`,
                      amount_numeric: numericValue,
                    });
                  }}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="£2,500"
                  required
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "24px",
              }}
            >
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                style={{
                  padding: "8px 16px",
                  border: "1px solid #E1E2E6",
                  borderRadius: "6px",
                  backgroundColor: "white",
                  color: "#515666",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "6px",
                  backgroundColor: "#5D51E2",
                  color: "white",
                  fontSize: "14px",
                  cursor: "pointer",
                }}
              >
                Add Tenancy
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (typeFilterOpen && !target.closest("[data-type-dropdown]")) {
        setTypeFilterOpen(false);
        setTypeSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [typeFilterOpen]);

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "SF UI Text", "SF Pro Text", "SF Pro", "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  };

  const headerStyle: React.CSSProperties = {
    height: "60px",
    backgroundColor: "white",
    borderBottom: "1px solid #EBECF1",
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
  };

  const tabStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
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
  };

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "10px",
    backgroundColor: "white",
    border: "1px solid #EBECF1",
    borderTop: "none",
  };

  const searchInputStyle: React.CSSProperties = {
    width: "300px",
    height: "30px",
    padding: "0 10px 0 35px",
    border: "1px solid #C6C8D1",
    borderRadius: "6px",
    fontSize: "14px",
    outline: "none",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    backgroundColor: "white",
    border: "1px solid #EBECF1",
    borderTop: "none",
    borderRadius: "0 0 6px 6px",
    overflowX: "auto",
  };

  const tableHeaderStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "300px 120px 120px 120px 120px 160px 120px 140px",
    gap: "20px",
    padding: "12px 20px",
    borderBottom: "1px solid #EBECF1",
    fontSize: "14px",
    fontWeight: "700",
    color: "#202437",
    minWidth: "1320px",
  };

  const tableRowStyle: React.CSSProperties = {
    display: "grid",
    gridTemplateColumns: "300px 120px 120px 120px 120px 160px 120px 140px",
    gap: "20px",
    padding: "15px 20px",
    borderBottom: "1px solid #EBECF1",
    alignItems: "center",
    minWidth: "1320px",
  };

  const addressCellStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  };

  const imageStyle: React.CSSProperties = {
    width: "64px",
    height: "48px",
    borderRadius: "6px",
    objectFit: "cover",
  };

  const textPrimaryStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#202437",
    fontWeight: "500",
  };

  const textSecondaryStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#515666",
  };

  const statusBadgeStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const statusDotStyle = (color: string): React.CSSProperties => ({
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    backgroundColor: color,
    opacity: 0.8,
  });

  const actionButtonStyle: React.CSSProperties = {
    padding: "5px",
    border: "none",
    background: "none",
    cursor: "pointer",
    borderRadius: "6px",
  };

  const paginationStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "white",
    border: "1px solid #EBECF1",
    borderTop: "none",
    borderRadius: "0 0 4px 4px",
  };

  const filterItemStyle: React.CSSProperties = {
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
  };

  if (loading && tenancies.length === 0) {
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
          <button
            onClick={loadTenancies}
            style={{
              padding: "8px 16px",
              backgroundColor: "#5D51E2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
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
              All Tenancies
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {stats.allTenancies}
              </span>
            </button>
            <button
              style={
                activeTab === "current" ? activeTabStyle : inactiveTabStyle
              }
              onClick={() => setActiveTab("current")}
            >
              Current
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {stats.current}
              </span>
            </button>
            <button
              style={
                activeTab === "archive" ? activeTabStyle : inactiveTabStyle
              }
              onClick={() => setActiveTab("archive")}
            >
              Archive
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {stats.archive}
              </span>
            </button>
            <button
              style={activeTab === "draft" ? activeTabStyle : inactiveTabStyle}
              onClick={() => setActiveTab("draft")}
            >
              Draft
              <span style={{ fontSize: "12px", color: "#A0A3AF" }}>
                {stats.draft}
              </span>
            </button>
          </div>

          <button style={buttonStyle} onClick={() => setShowAddModal(true)}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                fill="white"
              />
            </svg>
            Add Tenancy
          </button>
        </div>

        {/* Filters */}
        <div style={filterBarStyle}>
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
                style={searchInputStyle}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setStatusFilterOpen(!statusFilterOpen)}
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
                    color: statusFilterOpen ? "#5D51E2" : "#515666",
                  }}
                >
                  <span>Status:</span>
                  <span style={{ fontWeight: "500" }}>{selectedStatus}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      transform: statusFilterOpen
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

                {statusFilterOpen && (
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
                    }}
                  >
                    <div
                      style={{
                        padding: "8px 15px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.8497 15.1401L11.4319 10.7222C12.5242 9.44639 13.0801 7.79708 12.9827 6.12031C12.8854 4.44354 12.1425 2.86963 10.9098 1.72876C9.67713 0.5879 8.05053 -0.0312474 6.37125 0.00121494C4.69198 0.0336772 3.09053 0.715226 1.90288 1.90288C0.715226 3.09053 0.0336772 4.69198 0.00121494 6.37125C-0.0312474 8.05053 0.5879 9.67713 1.72876 10.9098C2.86963 12.1425 4.44354 12.8854 6.12031 12.9827C7.79708 13.0801 9.44639 12.5242 10.7222 11.4319L15.1401 15.8497C15.1865 15.8966 15.2418 15.9337 15.3027 15.9591C15.3636 15.9845 15.4289 15.9975 15.4949 15.9975C15.5609 15.9975 15.6262 15.9845 15.6871 15.9591C15.748 15.9337 15.8033 15.8966 15.8497 15.8497C15.8966 15.8033 15.9337 15.748 15.9591 15.6871C15.9845 15.6262 15.9975 15.5609 15.9975 15.4949C15.9975 15.4289 15.9845 15.3636 15.9591 15.3027C15.9337 15.2418 15.8966 15.1865 15.8497 15.1401ZM6.49929 11.9966C5.41202 11.9966 4.34917 11.6742 3.44514 11.0701C2.54112 10.4661 1.83651 9.60752 1.42043 8.60301C1.00435 7.59851 0.895489 6.49319 1.1076 5.42681C1.31972 4.36044 1.84329 3.38091 2.6121 2.6121C3.38091 1.84329 4.36044 1.31972 5.42681 1.1076C6.49319 0.895489 7.59851 1.00435 8.60301 1.42043C9.60752 1.83651 10.4661 2.54112 11.0701 3.44514C11.6742 4.34917 11.9966 5.41202 11.9966 6.49929C11.9966 7.95726 11.4174 9.35553 10.3865 10.3865C9.35553 11.4174 7.95726 11.9966 6.49929 11.9966Z"
                            fill="#C6C8D1"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search status..."
                          value={statusSearchTerm}
                          onChange={(e) => setStatusSearchTerm(e.target.value)}
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "14px",
                            width: "100%",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {[
                        "All",
                        "active",
                        "draft",
                        "renewed",
                        "vacating",
                        "vacated",
                        "expired",
                      ]
                        .filter((status) =>
                          status
                            .toLowerCase()
                            .includes(statusSearchTerm.toLowerCase()),
                        )
                        .map((status) => (
                          <button
                            key={status}
                            onClick={() => {
                              setSelectedStatus(status);
                              setStatusFilterOpen(false);
                              setStatusSearchTerm("");
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 15px",
                              border: "none",
                              backgroundColor:
                                selectedStatus === status
                                  ? "#F3F2FF"
                                  : "transparent",
                              textAlign: "left",
                              fontSize: "14px",
                              color:
                                selectedStatus === status
                                  ? "#5D51E2"
                                  : "#515666",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                            }}
                          >
                            {status === "All" ? (
                              "All Statuses"
                            ) : (
                              <>
                                <div
                                  style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor:
                                      (statusConfig as any)[status]?.color ||
                                      "#C6C8D1",
                                  }}
                                />
                                {(statusConfig as any)[status]?.label || status}
                              </>
                            )}
                          </button>
                        ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() =>
                    setRenewalDateFilterOpen(!renewalDateFilterOpen)
                  }
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
                    color: renewalDateFilterOpen ? "#5D51E2" : "#515666",
                  }}
                >
                  <span>Renewal Date:</span>
                  <span style={{ fontWeight: "500" }}>
                    {selectedRenewalDate === "All"
                      ? "None"
                      : selectedRenewalDate}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      transform: renewalDateFilterOpen
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

                {renewalDateFilterOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      width: "180px",
                      backgroundColor: "white",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {[
                        "All",
                        "Next 30 days",
                        "Next 60 days",
                        "Next 90 days",
                        "Overdue",
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedRenewalDate(option);
                            setRenewalDateFilterOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 15px",
                            border: "none",
                            backgroundColor:
                              selectedRenewalDate === option
                                ? "#F3F2FF"
                                : "transparent",
                            textAlign: "left",
                            fontSize: "14px",
                            color:
                              selectedRenewalDate === option
                                ? "#5D51E2"
                                : "#515666",
                            cursor: "pointer",
                          }}
                        >
                          {option === "All" ? "All Dates" : option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setEndDateFilterOpen(!endDateFilterOpen)}
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
                    color: endDateFilterOpen ? "#5D51E2" : "#515666",
                  }}
                >
                  <span>End Date:</span>
                  <span style={{ fontWeight: "500" }}>
                    {selectedEndDate === "All" ? "None" : selectedEndDate}
                  </span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    style={{
                      transform: endDateFilterOpen
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

                {endDateFilterOpen && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      width: "180px",
                      backgroundColor: "white",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
                      zIndex: 1000,
                      marginTop: "4px",
                    }}
                  >
                    <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                      {[
                        "All",
                        "Next 30 days",
                        "Next 60 days",
                        "Next 90 days",
                        "Overdue",
                      ].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setSelectedEndDate(option);
                            setEndDateFilterOpen(false);
                          }}
                          style={{
                            width: "100%",
                            padding: "10px 15px",
                            border: "none",
                            backgroundColor:
                              selectedEndDate === option
                                ? "#F3F2FF"
                                : "transparent",
                            textAlign: "left",
                            fontSize: "14px",
                            color:
                              selectedEndDate === option
                                ? "#5D51E2"
                                : "#515666",
                            cursor: "pointer",
                          }}
                        >
                          {option === "All" ? "All Dates" : option}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
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
                    color: typeFilterOpen ? "#5D51E2" : "#515666",
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
                    }}
                  >
                    {/* Search area */}
                    <div
                      style={{
                        padding: "8px 15px",
                        borderBottom: "1px solid #f0f0f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 16 16"
                          fill="none"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M15.8497 15.1401L11.4319 10.7222C12.5242 9.44639 13.0801 7.79708 12.9827 6.12031C12.8854 4.44354 12.1425 2.86963 10.9098 1.72876C9.67713 0.5879 8.05053 -0.0312474 6.37125 0.00121494C4.69198 0.0336772 3.09053 0.715226 1.90288 1.90288C0.715226 3.09053 0.0336772 4.69198 0.00121494 6.37125C-0.0312474 8.05053 0.5879 9.67713 1.72876 10.9098C2.86963 12.1425 4.44354 12.8854 6.12031 12.9827C7.79708 13.0801 9.44639 12.5242 10.7222 11.4319L15.1401 15.8497C15.1865 15.8966 15.2418 15.9337 15.3027 15.9591C15.3636 15.9845 15.4289 15.9975 15.4949 15.9975C15.5609 15.9975 15.6262 15.9845 15.6871 15.9591C15.748 15.9337 15.8033 15.8966 15.8497 15.8497C15.8966 15.8033 15.9337 15.748 15.9591 15.6871C15.9845 15.6262 15.9975 15.5609 15.9975 15.4949C15.9975 15.4289 15.9845 15.3636 15.9591 15.3027C15.9337 15.2418 15.8966 15.1865 15.8497 15.1401ZM6.49929 11.9966C5.41202 11.9966 4.34917 11.6742 3.44514 11.0701C2.54112 10.4661 1.83651 9.60752 1.42043 8.60301C1.00435 7.59851 0.895489 6.49319 1.1076 5.42681C1.31972 4.36044 1.84329 3.38091 2.6121 2.6121C3.38091 1.84329 4.36044 1.31972 5.42681 1.1076C6.49319 0.895489 7.59851 1.00435 8.60301 1.42043C9.60752 1.83651 10.4661 2.54112 11.0701 3.44514C11.6742 4.34917 11.9966 5.41202 11.9966 6.49929C11.9966 7.95726 11.4174 9.35553 10.3865 10.3865C9.35553 11.4174 7.95726 11.9966 6.49929 11.9966Z"
                            fill="#C6C8D1"
                          />
                        </svg>
                        <input
                          type="text"
                          placeholder="Search"
                          value={typeSearchTerm}
                          onChange={(e) => setTypeSearchTerm(e.target.value)}
                          style={{
                            border: "none",
                            outline: "none",
                            fontSize: "14px",
                            color: "#C6C8D1",
                            width: "100%",
                            backgroundColor: "transparent",
                          }}
                        />
                      </div>
                    </div>

                    {/* Options */}
                    <div style={{ maxHeight: "250px", overflowY: "auto" }}>
                      {typeOptions
                        .filter((option) =>
                          option
                            .toLowerCase()
                            .includes(typeSearchTerm.toLowerCase()),
                        )
                        .map((option) => (
                          <div
                            key={option}
                            onClick={() => {
                              setSelectedType(option);
                              setTypeFilterOpen(false);
                              setTypeSearchTerm("");
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "6px 15px",
                              cursor: "pointer",
                              backgroundColor: "white",
                              fontSize: "14px",
                              color:
                                option === selectedType ? "#5D51E2" : "#515666",
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredTenancies.length === 0 && !loading && (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#797E8B",
              backgroundColor: "white",
              border: "1px solid #EBECF1",
              borderTop: "none",
            }}
          >
            <p>暂无租赁数据</p>
            <p>请先在 Supabase Dashboard 中执行数据库架构和示例数据脚本</p>
          </div>
        )}

        {/* Table */}
        {filteredTenancies.length > 0 && (
          <div style={tableStyle}>
            {/* Table Header */}
            <div style={tableHeaderStyle}>
              <div>Address</div>
              <div>Status</div>
              <div>Type</div>
              <div>Start Date</div>
              <div>End Date</div>
              <div>Reference</div>
              <div>Amount</div>
              <div style={{ textAlign: "center", minWidth: "120px" }}>
                Actions
              </div>
            </div>

            {/* Table Body */}
            {filteredTenancies.map((tenancy) => (
              <div key={tenancy.id} style={tableRowStyle}>
                <div style={addressCellStyle}>
                  <img
                    src={tenancy.image}
                    alt={tenancy.address}
                    style={imageStyle}
                  />
                  <div>
                    <div style={textPrimaryStyle}>{tenancy.address}</div>
                    <div style={textSecondaryStyle}>
                      {tenancy.city}, {tenancy.postcode}
                    </div>
                  </div>
                </div>
                <div style={statusBadgeStyle}>
                  <div
                    style={statusDotStyle(
                      (statusConfig as any)[tenancy.status]?.color || "#C6C8D1",
                    )}
                  />
                  <span style={textSecondaryStyle}>
                    {(statusConfig as any)[tenancy.status]?.label ||
                      tenancy.status}
                  </span>
                </div>
                <div style={textSecondaryStyle}>{tenancy.type}</div>
                <div style={textSecondaryStyle}>
                  {formatDate(tenancy.start_date)}
                </div>
                <div style={textSecondaryStyle}>
                  {formatDate(tenancy.end_date)}
                </div>
                <div style={textSecondaryStyle}>{tenancy.reference}</div>
                <div style={textSecondaryStyle}>{tenancy.amount}</div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                    position: "relative",
                  }}
                >
                  <button
                    style={actionButtonStyle}
                    onClick={() => handleViewTenancyDetails(tenancy)}
                    title="View tenancy details"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M15.998 7.9554C15.9957 7.93379 15.9957 7.912 15.998 7.89039C15.995 7.87554 15.995 7.86025 15.998 7.84539V7.81539C16.0007 7.80727 16.0007 7.79851 15.998 7.79039V7.76039C15.6421 6.93594 15.1579 6.1731 14.5633 5.50026C14.02 4.86718 13.3907 4.31343 12.6937 3.85516C11.3021 2.96322 9.68249 2.49264 8.02975 2.50009C6.36668 2.50093 4.73833 2.97621 3.3358 3.87016C2.63256 4.32211 1.99645 4.87086 1.44621 5.50026C0.868458 6.16402 0.39636 6.91284 0.0465239 7.72038V7.76539V7.81539C0.0499546 7.8251 0.0499546 7.83568 0.0465239 7.84539C0.0488295 7.86867 0.0488295 7.89212 0.0465239 7.9154C0.0280785 7.94176 0.0129669 7.97032 0.00153387 8.0004C-0.000511289 8.02202 -0.00051129 8.04378 0.00153387 8.0654C0.00399155 8.08533 0.00399155 8.10548 0.00153387 8.12541C0.00449663 8.14026 0.00449663 8.15556 0.00153387 8.17041V8.20541V8.26042C0.68286 9.84022 1.82377 11.1783 3.27581 12.1006C3.97191 12.5371 4.72575 12.8737 5.51531 13.1007C7.10815 13.5674 8.80139 13.5674 10.3942 13.1007C11.1838 12.8737 11.9376 12.5371 12.6337 12.1006C13.3511 11.6637 14.0011 11.1247 14.5633 10.5005C15.1342 9.83838 15.598 9.09097 15.938 8.28542V8.25041V8.20041C15.9346 8.19071 15.9346 8.18012 15.938 8.17041C15.9357 8.14713 15.9357 8.12368 15.938 8.10041C15.9629 8.07027 15.9831 8.03655 15.998 8.0004C15.9993 7.98543 15.9993 7.97037 15.998 7.9554ZM14.9632 8.0504C14.674 8.70447 14.2881 9.31129 13.8185 9.85051C13.337 10.4094 12.7761 10.8945 12.1538 11.2906C11.5329 11.6831 10.8598 11.9861 10.1543 12.1906C8.74426 12.604 7.24527 12.604 5.83524 12.1906C5.12974 11.9861 4.45659 11.6831 3.83568 11.2906C2.61294 10.5097 1.63833 9.39605 1.02631 8.0804V7.9504C1.32582 7.30692 1.71272 6.7079 2.17605 6.1703C2.67099 5.60735 3.24323 5.11745 3.87568 4.71521C4.49503 4.31857 5.16854 4.01373 5.87523 3.81016C6.57527 3.60606 7.30058 3.50169 8.02975 3.50014C8.76068 3.50007 9.48787 3.60447 10.1893 3.81016C10.8824 4.01418 11.5424 4.31733 12.1488 4.71021C12.7669 5.11774 13.3255 5.60912 13.8085 6.1703C14.2763 6.72192 14.6619 7.33834 14.9532 8.0004L14.9632 8.0504ZM7.99976 5.00023C7.40655 5.00023 6.82666 5.17619 6.33342 5.50585C5.84018 5.83551 5.45575 6.30408 5.22874 6.85228C5.00172 7.40049 4.94233 8.00373 5.05806 8.5857C5.17379 9.16768 5.45945 9.70226 5.87891 10.1218C6.29838 10.5414 6.83281 10.8272 7.41462 10.9429C7.99643 11.0587 8.5995 10.9993 9.14756 10.7722C9.69561 10.5451 10.164 10.1606 10.4936 9.66721C10.8232 9.17383 10.9991 8.59378 10.9991 8.0004C10.9991 7.20471 10.6831 6.4416 10.1206 5.87896C9.55813 5.31632 8.79523 5.00023 7.99976 5.00023ZM7.99976 10.0005C7.60429 10.0005 7.21769 9.88321 6.88887 9.66343C6.56004 9.44366 6.30375 9.13128 6.15241 8.76581C6.00107 8.40034 5.96147 7.99818 6.03863 7.6102C6.11578 7.22221 6.30622 6.86583 6.58586 6.58611C6.8655 6.30639 7.22179 6.11589 7.60967 6.03872C7.99754 5.96154 8.39959 6.00115 8.76496 6.15254C9.13033 6.30392 9.44262 6.56028 9.66233 6.8892C9.88205 7.21811 9.99932 7.60482 9.99932 8.0004C9.99932 8.53086 9.78865 9.0396 9.41366 9.41469C9.03867 9.78979 8.53008 10.0005 7.99976 10.0005Z"
                        fill="#797E8B"
                      />
                    </svg>
                  </button>
                  <button
                    style={actionButtonStyle}
                    onClick={() => handleChatToLandlord(tenancy)}
                    title="Chat to landlord"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M15.9992 9.53043C16.0141 10.2117 15.8299 10.8825 15.4692 11.4605C15.06 12.0677 14.4931 12.5518 13.8293 12.8606V12.8906C13.834 13.2668 13.8912 13.6404 13.9993 14.0007C14.0789 14.3147 14.1947 14.6184 14.3443 14.9057C14.3539 14.9269 14.3623 14.9486 14.3693 14.9707C14.3717 14.9907 14.3717 15.0108 14.3693 15.0307C14.3699 15.0743 14.3619 15.1175 14.3455 15.1578C14.3292 15.1982 14.3049 15.2348 14.2741 15.2656C14.2433 15.2964 14.2067 15.3207 14.1663 15.337C14.126 15.3534 14.0828 15.3614 14.0393 15.3608H13.9493C13.326 15.2323 12.748 14.9407 12.2744 14.5157C11.9202 14.2325 11.5861 13.9251 11.2744 13.5957L10.9494 13.6207H10.3595C9.87517 13.6256 9.39144 13.5854 8.91457 13.5007C8.47623 13.4168 8.0486 13.2843 7.63964 13.1056C7.2569 12.9476 6.89436 12.7445 6.55971 12.5006C6.24393 12.2613 5.95702 11.9861 5.70476 11.6806C5.97662 11.646 6.25104 11.6359 6.52471 11.6506C7.04801 11.6506 7.253 11.6506 7.13967 11.6506C7.56456 11.9819 8.0455 12.2343 8.55959 12.3956C9.14439 12.5642 9.75095 12.645 10.3595 12.6356H10.6645C10.8184 12.639 10.9723 12.629 11.1244 12.6056L11.6544 12.5256L11.9444 12.9156C12.2407 13.2708 12.5858 13.5822 12.9693 13.8407C12.9084 13.536 12.8766 13.2263 12.8743 12.9156L12.8443 12.2306L13.3443 11.9956C13.8556 11.7615 14.2969 11.3978 14.6242 10.9405C14.8847 10.5174 15.0151 10.0271 14.9992 9.53043C15.008 9.13857 14.9312 8.74951 14.7742 8.39037C14.5684 8.0098 14.269 7.68798 13.9043 7.45531C13.9593 7.28531 14.0093 7.1103 14.0543 6.92028C14.0988 6.74083 14.1322 6.55881 14.1543 6.37525C14.7414 6.69071 15.2307 7.16112 15.5692 7.73533C15.8627 8.28745 16.0106 8.90525 15.9992 9.53043ZM5.16979 9.53043L5.71976 9.58044C5.93693 9.60901 6.15567 9.62404 6.37472 9.62544H6.6697C7.38775 9.63265 8.10268 9.52979 8.78958 9.32042C9.40742 9.14095 9.98702 8.84942 10.4995 8.46037C10.9612 8.10775 11.3429 7.66124 11.6194 7.1503C11.8814 6.64045 12.012 6.07328 11.9994 5.5002C11.9971 4.97009 11.8483 4.45094 11.5694 4.00012C11.2704 3.51526 10.8737 3.09804 10.4045 2.77505C9.87506 2.40602 9.2891 2.12567 8.66958 1.945C7.97559 1.73673 7.25425 1.63391 6.52971 1.63998C5.80356 1.63432 5.08063 1.73712 4.38483 1.945C3.75612 2.12308 3.15899 2.39806 2.61494 2.76005C2.13495 3.08285 1.73068 3.50594 1.43001 4.00012C1.15115 4.45094 1.00234 4.97009 1.00003 5.5002C1.01263 6.18189 1.18381 6.85128 1.5 7.45531C1.82249 8.10593 2.34937 8.63287 2.99991 8.9554L3.54488 9.23542L3.49989 9.86045L3.46989 10.1355C3.4044 10.4782 3.30388 10.8133 3.1699 11.1355C3.46127 10.9586 3.73872 10.7596 3.99986 10.5405C4.18252 10.3906 4.34998 10.2231 4.49983 10.0405L5.16979 9.53043ZM6.6397 10.6105H6.29472H5.95974C5.83236 10.6052 5.70544 10.5919 5.57976 10.5705C5.42286 10.7233 5.25582 10.8653 5.07979 10.9955C4.83481 11.1905 4.54982 11.4005 4.21484 11.6206C3.87635 11.8414 3.52397 12.0401 3.15991 12.2156C2.8314 12.3783 2.48115 12.4928 2.11997 12.5556H2.08997H2.02997C1.98241 12.5575 1.935 12.5491 1.89099 12.531C1.84697 12.5129 1.8074 12.4855 1.77499 12.4506C1.70693 12.3792 1.66928 12.2842 1.66999 12.1856C1.66659 12.159 1.66659 12.1321 1.66999 12.1056C1.67697 12.0834 1.68532 12.0617 1.69499 12.0406C1.81998 11.8356 1.98997 11.5155 2.19496 11.0805C2.40144 10.715 2.51638 10.305 2.52994 9.88545V9.85545C2.11504 9.64364 1.73554 9.36868 1.40501 9.04041C1.09741 8.73213 0.834837 8.38199 0.625053 8.00035C0.415677 7.61598 0.257669 7.20579 0.15508 6.78028C0.0512737 6.36153 -0.000778654 5.93163 8.95369e-05 5.5002C-0.00450772 4.83214 0.168005 4.17479 0.50006 3.5951C0.849325 2.98493 1.32491 2.45643 1.89498 2.04501C2.53552 1.58517 3.24637 1.23224 3.99986 0.999947C4.82275 0.739156 5.6815 0.609232 6.54471 0.614925C7.39296 0.612206 8.23643 0.742115 9.04456 0.999947C9.78137 1.2306 10.4755 1.58024 11.0994 2.03501C11.6711 2.45027 12.1482 2.98198 12.4994 3.5951C12.8314 4.17479 13.0039 4.83214 12.9993 5.5002C13.0185 6.22352 12.857 6.94019 12.5294 7.58532C12.2065 8.21684 11.7491 8.76986 11.1894 9.20541C10.5787 9.66962 9.8894 10.0202 9.15455 10.2405C8.34005 10.4914 7.49195 10.6162 6.6397 10.6105Z"
                        fill="#797E8B"
                      />
                    </svg>
                  </button>
                  <button
                    style={actionButtonStyle}
                    onClick={() => handleMoreActions(tenancy.id)}
                    title="More actions"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path
                        d="M1.5 6.50049C1.20333 6.50049 0.913319 6.58847 0.666645 6.7533C0.419972 6.91813 0.227713 7.15241 0.114181 7.42652C0.000649929 7.70062 -0.0290551 8.00224 0.0288228 8.29323C0.0867006 8.58421 0.229562 8.8515 0.439341 9.06129C0.649119 9.27109 0.916394 9.41395 1.20737 9.47184C1.49834 9.52972 1.79994 9.50001 2.07403 9.38647C2.34811 9.27293 2.58238 9.08066 2.74721 8.83398C2.91203 8.58729 3 8.29726 3 8.00057C3 7.60273 2.84197 7.22117 2.56066 6.93985C2.27936 6.65853 1.89783 6.50049 1.5 6.50049ZM8 6.50049C7.70333 6.50049 7.41332 6.58847 7.16665 6.7533C6.91997 6.91813 6.72771 7.15241 6.61418 7.42652C6.50065 7.70062 6.47094 8.00224 6.52882 8.29323C6.5867 8.58421 6.72956 8.8515 6.93934 9.06129C7.14912 9.27109 7.41639 9.41395 7.70737 9.47184C7.99834 9.52972 8.29994 9.50001 8.57403 9.38647C8.84811 9.27293 9.08238 9.08066 9.24721 8.83398C9.41203 8.58729 9.5 8.29726 9.5 8.00057C9.5 7.60273 9.34197 7.22117 9.06066 6.93985C8.77936 6.65853 8.39783 6.50049 8 6.50049ZM14.5 6.50049C14.2033 6.50049 13.9133 6.58847 13.6666 6.7533C13.42 6.91813 13.2277 7.15241 13.1142 7.42652C13.0007 7.70062 12.9709 8.00224 13.0288 8.29323C13.0867 8.58421 13.2296 8.8515 13.4393 9.06129C13.6491 9.27109 13.9164 9.41395 14.2074 9.47184C14.4983 9.52972 14.7999 9.50001 15.074 9.38647C15.3481 9.27293 15.5824 9.08066 15.7472 8.83398C15.912 8.58729 16 8.29726 16 8.00057C16 7.60273 15.842 7.22117 15.5607 6.93985C15.2794 6.65853 14.8978 6.50049 14.5 6.50049Z"
                        fill="#797E8B"
                      />
                    </svg>
                  </button>

                  {/* More Actions Dropdown */}
                  {showMoreActionsDropdown === tenancy.id && (
                    <div
                      style={{
                        position: "absolute",
                        top: "35px",
                        right: "0",
                        backgroundColor: "white",
                        border: "1px solid #E1E2E6",
                        borderRadius: "6px",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        zIndex: 1000,
                        minWidth: "160px",
                      }}
                    >
                      <button
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          background: "none",
                          textAlign: "left",
                          fontSize: "14px",
                          color: "#202437",
                          cursor: "pointer",
                          borderBottom: "1px solid #F5F5F7",
                        }}
                        onClick={() => {
                          alert("Edit Tenancy feature coming soon!");
                          setShowMoreActionsDropdown(null);
                        }}
                      >
                        Edit Tenancy
                      </button>
                      <button
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          background: "none",
                          textAlign: "left",
                          fontSize: "14px",
                          color: "#202437",
                          cursor: "pointer",
                          borderBottom: "1px solid #F5F5F7",
                        }}
                        onClick={() => {
                          alert("View Documents feature coming soon!");
                          setShowMoreActionsDropdown(null);
                        }}
                      >
                        View Documents
                      </button>
                      <button
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          background: "none",
                          textAlign: "left",
                          fontSize: "14px",
                          color: "#202437",
                          cursor: "pointer",
                          borderBottom: "1px solid #F5F5F7",
                        }}
                        onClick={() => {
                          alert("Generate Report feature coming soon!");
                          setShowMoreActionsDropdown(null);
                        }}
                      >
                        Generate Report
                      </button>
                      <button
                        style={{
                          width: "100%",
                          padding: "12px 16px",
                          border: "none",
                          background: "none",
                          textAlign: "left",
                          fontSize: "14px",
                          color: "#DC3545",
                          cursor: "pointer",
                        }}
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this tenancy?",
                            )
                          ) {
                            alert("Delete functionality would go here");
                          }
                          setShowMoreActionsDropdown(null);
                        }}
                      >
                        Delete Tenancy
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filteredTenancies.length > 0 && (
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
                  ...actionButtonStyle,
                  fontWeight: "700",
                  color: "#5D51E2",
                }}
              >
                1
              </button>
              <button style={{ ...actionButtonStyle, color: "#515666" }}>
                2
              </button>
              <button style={{ ...actionButtonStyle, color: "#515666" }}>
                3
              </button>
              <button style={{ ...actionButtonStyle, color: "#515666" }}>
                4
              </button>
              <button style={{ ...actionButtonStyle, color: "#515666" }}>
                5
              </button>
              <span style={{ color: "#515666", padding: "5px 8px" }}>...</span>
              <button style={{ ...actionButtonStyle, color: "#515666" }}>
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
        )}

        {/* Add Tenancy Modal */}
        {showAddModal && <AddTenancyModal />}

        {/* Tenancy Details Modal */}
        {showTenancyDetailsModal && selectedTenancy && (
          <div
            style={{
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
            }}
            onClick={() => setShowTenancyDetailsModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "600px",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#202437",
                  }}
                >
                  Tenancy Details
                </h2>
                <button
                  onClick={() => setShowTenancyDetailsModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#797E8B",
                    padding: "0",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              <div style={{ display: "grid", gap: "20px" }}>
                <div
                  style={{
                    display: "flex",
                    gap: "16px",
                    alignItems: "flex-start",
                  }}
                >
                  <img
                    src={selectedTenancy.image}
                    alt={selectedTenancy.address}
                    style={{
                      width: "120px",
                      height: "90px",
                      objectFit: "cover",
                      borderRadius: "6px",
                    }}
                  />
                  <div>
                    <h3
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "18px",
                        color: "#202437",
                      }}
                    >
                      {selectedTenancy.address}
                    </h3>
                    <p
                      style={{
                        margin: "0",
                        color: "#797E8B",
                        fontSize: "14px",
                      }}
                    >
                      {selectedTenancy.city}, {selectedTenancy.postcode}
                    </p>
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      Reference
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {selectedTenancy.reference}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      Type
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {selectedTenancy.type}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      Status
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {(statusConfig as any)[selectedTenancy.status]?.label ||
                        selectedTenancy.status}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      Monthly Rent
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {selectedTenancy.amount}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      Start Date
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {formatDate(selectedTenancy.start_date)}
                    </p>
                  </div>
                  <div>
                    <label
                      style={{
                        fontSize: "14px",
                        fontWeight: "500",
                        color: "#202437",
                      }}
                    >
                      End Date
                    </label>
                    <p
                      style={{
                        margin: "4px 0 0 0",
                        fontSize: "14px",
                        color: "#797E8B",
                      }}
                    >
                      {formatDate(selectedTenancy.end_date)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Chat to Landlord Modal */}
        {showChatModal && selectedTenancy && (
          <div
            style={{
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
            }}
            onClick={() => setShowChatModal(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "24px",
                width: "500px",
                maxHeight: "70vh",
                display: "flex",
                flexDirection: "column",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: "600",
                    color: "#202437",
                  }}
                >
                  Chat with Landlord
                </h2>
                <button
                  onClick={() => setShowChatModal(false)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                    color: "#797E8B",
                    padding: "0",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  ×
                </button>
              </div>

              <div
                style={{
                  marginBottom: "16px",
                  padding: "12px",
                  backgroundColor: "#F8F9FA",
                  borderRadius: "6px",
                }}
              >
                <p
                  style={{
                    margin: "0",
                    fontSize: "14px",
                    color: "#202437",
                    fontWeight: "500",
                  }}
                >
                  Property: {selectedTenancy.address}
                </p>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "14px",
                    color: "#797E8B",
                  }}
                >
                  {selectedTenancy.city}, {selectedTenancy.postcode}
                </p>
              </div>

              <div
                style={{
                  flex: 1,
                  border: "1px solid #E1E2E6",
                  borderRadius: "6px",
                  padding: "16px",
                  marginBottom: "16px",
                  minHeight: "200px",
                  backgroundColor: "#FAFBFC",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: "#797E8B",
                    fontSize: "14px",
                    textAlign: "center",
                  }}
                >
                  Chat functionality coming soon!
                  <br />
                  This will allow direct communication with the property
                  landlord.
                </p>
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Type your message..."
                  style={{
                    flex: 1,
                    padding: "12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  disabled
                />
                <button
                  style={{
                    padding: "12px 24px",
                    backgroundColor: "#5D51E2",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "not-allowed",
                    opacity: 0.5,
                  }}
                  disabled
                >
                  Send
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
