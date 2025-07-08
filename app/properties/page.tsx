"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useProperties } from "../../hooks/useSupabase";

interface Property {
  id: string;
  address: string;
  city: string;
  postcode: string;
  reference: string;
  type: string;
  status:
    | "instructed"
    | "active"
    | "draft"
    | "offer-agreed"
    | "vacant"
    | "lost-to-let";
  manager: {
    name: string;
    avatar_url?: string;
    initials?: string;
  };
  image_url: string;
  monthly_rent?: number;
  bedrooms?: number;
  bathrooms?: number;
}

export default function PropertiesPage() {
  const { properties, loading, error, fetchProperties, createProperty } =
    useProperties();

  // Mock properties data with real house images
  const mockProperties: Property[] = [
    {
      id: "1",
      address: "Modern White Villa",
      city: "Beverly Hills",
      postcode: "90210",
      reference: "BWV001",
      type: "Villa",
      status: "instructed",
      manager: {
        name: "Guy Hawkins",
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        initials: "GH",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F402180fea7164df694d234fb78bf9a7e?format=webp&width=800",
      monthly_rent: 5500,
      bedrooms: 4,
      bathrooms: 3,
    },
    {
      id: "2",
      address: "Orange Townhouses",
      city: "San Diego",
      postcode: "92101",
      reference: "OTH002",
      type: "Townhouse",
      status: "active",
      manager: {
        name: "Ralph Edwards",
        avatar_url:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        initials: "RE",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Fe9099ae1cf264df68b57a06c6fc01592?format=webp&width=800",
      monthly_rent: 3200,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      id: "3",
      address: "Waterfront Estate",
      city: "Miami",
      postcode: "33101",
      reference: "WFE003",
      type: "Estate",
      status: "offer-agreed",
      manager: {
        name: "Dianne Russell",
        avatar_url:
          "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Ff0ac841c690d462bb5779b1d3c4eb006?format=webp&width=800",
        initials: "DR",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F54eae25cf4ab4c448ab257a70050478e?format=webp&width=800",
      monthly_rent: 8500,
      bedrooms: 5,
      bathrooms: 4,
    },
    {
      id: "4",
      address: "Spanish Style Home",
      city: "Phoenix",
      postcode: "85001",
      reference: "SSH004",
      type: "House",
      status: "vacant",
      manager: {
        name: "Bessie Cooper",
        avatar_url:
          "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        initials: "BC",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F94f8f696f0d24d3faa68909677151e92?format=webp&width=800",
      monthly_rent: 2800,
      bedrooms: 3,
      bathrooms: 2,
    },
    {
      id: "5",
      address: "Country Craftsman",
      city: "Austin",
      postcode: "73301",
      reference: "CCR005",
      type: "House",
      status: "draft",
      manager: {
        name: "Robert Fox",
        avatar_url:
          "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        initials: "RF",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Ff6c293f429304096b2ceff14165bc287?format=webp&width=800",
      monthly_rent: 3500,
      bedrooms: 4,
      bathrooms: 3,
    },
    {
      id: "6",
      address: "Executive Villa",
      city: "Seattle",
      postcode: "98101",
      reference: "EXV006",
      type: "Villa",
      status: "instructed",
      manager: {
        name: "Jacob Jones",
        avatar_url:
          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        initials: "JJ",
      },
      image_url:
        "https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2F0e072b2771b64a2bb1014bb08b53f349?format=webp&width=800",
      monthly_rent: 4200,
      bedrooms: 4,
      bathrooms: 3,
    },
  ];
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [managerFilter, setManagerFilter] = useState("None");
  const [clientFilter, setClientFilter] = useState("None");
  const [activeTab, setActiveTab] = useState("All Properties");
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [openStatusDropdown, setOpenStatusDropdown] = useState<string | null>(
    null,
  );
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(
    null,
  );
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const statusOptions = [
    "All",
    "Draft",
    "Instructed",
    "Let",
    "Lost For Sale",
    "Lost to Let",
    "Managed",
    "Not Instructed",
    "Offer Agreed",
    "Under Offer",
  ];
  const typeOptions = [
    "All",
    "Maintenance",
    "Apartment Block",
    "Health Center",
    "Retail Unit",
    "Flats",
    "Maisonette",
  ];
  const managerOptions = [
    "None",
    "Guy Hawkins",
    "Ralph Edwards",
    "Dianne Russell",
    "Bessie Cooper",
    "Robert Fox",
    "Jacob Jones",
  ];
  const clientOptions = ["None", "Client A", "Client B", "Client C"];

  const loadProperties = useCallback(async () => {
    const filters: any = {
      page: currentPage,
      limit: pageSize,
    };

    if (searchTerm) {
      filters.search = searchTerm;
    }
    if (statusFilter !== "All") {
      filters.status = statusFilter;
    }
    if (typeFilter !== "All") {
      filters.type = typeFilter;
    }

    await fetchProperties(filters);
  }, [currentPage, pageSize, searchTerm, statusFilter, typeFilter, fetchProperties]);

  useEffect(() => {
    // Only try to load properties if not using mock data
    if (!error) {
      loadProperties();
    }
  }, [error, loadProperties]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      setOpenDropdown(null);
      setOpenStatusDropdown(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDropdownToggle = (dropdownType: string) => {
    setOpenDropdown(openDropdown === dropdownType ? null : dropdownType);
    setDropdownSearch("");
  };

  const handleOptionSelect = (dropdownType: string, value: string) => {
    switch (dropdownType) {
      case "type":
        setTypeFilter(value);
        break;
      case "status":
        setStatusFilter(value);
        break;
      case "manager":
        setManagerFilter(value);
        break;
      case "client":
        setClientFilter(value);
        break;
    }
    setOpenDropdown(null);
  };

  const getFilteredOptions = (options: string[]) => {
    return options.filter((option) =>
      option.toLowerCase().includes(dropdownSearch.toLowerCase()),
    );
  };

  const DropdownComponent = ({
    options,
    selectedValue,
    onSelect,
    dropdownType,
    position = { top: "100%", left: "0" },
  }: {
    options: string[];
    selectedValue: string;
    onSelect: (value: string) => void;
    dropdownType: string;
    position?: { top: string; left: string };
  }) => {
    const filteredOptions = getFilteredOptions(options);

    return (
      <div
        style={{
          position: "absolute",
          top: position.top,
          left: position.left,
          display: "flex",
          width: "200px",
          flexDirection: "column",
          alignItems: "flex-start",
          borderRadius: "6px",
          border: "1px solid #E1E2E6",
          background: "#FFF",
          boxShadow: "0px 2px 5px 0px rgba(0, 0, 0, 0.10)",
          zIndex: 1000,
          maxHeight: "310px",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Area */}
        <div
          style={{
            display: "flex",
            padding: "8px 15px",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: "10px",
            alignSelf: "stretch",
            background: "#FFF",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              alignSelf: "stretch",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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
              value={dropdownSearch}
              onChange={(e) => setDropdownSearch(e.target.value)}
              style={{
                flex: "1 0 0",
                border: "none",
                outline: "none",
                background: "transparent",
                color: "#515666",
                fontSize: "14px",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontWeight: "400",
                lineHeight: "20px",
              }}
            />
          </div>
        </div>

        {/* Options List */}
        <div
          style={{
            display: "flex",
            maxHeight: "274px",
            paddingBottom: "6px",
            flexDirection: "column",
            alignItems: "flex-start",
            alignSelf: "stretch",
            overflowY: "auto",
          }}
        >
          {filteredOptions.map((option) => {
            const isSelected = option === selectedValue;
            return (
              <div
                key={option}
                style={{
                  display: "flex",
                  padding: "6px 15px",
                  alignItems: "center",
                  gap: "10px",
                  alignSelf: "stretch",
                  background: "#FFF",
                  cursor: "pointer",
                }}
                onClick={() => onSelect(option)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#F6F7FB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#FFF";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    flex: "1 0 0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <span
                      style={{
                        color: isSelected ? "#5D51E2" : "#515666",
                        fontSize: "14px",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {option}
                    </span>
                  </div>
                </div>
                {isSelected && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      position: "relative",
                    }}
                  >
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ position: "absolute", left: "2px", top: "2px" }}
                    >
                      <path
                        d="M4.62893 10.3199L0.24797 6.2999C0.175897 6.23884 0.116897 6.16381 0.0745183 6.07933C0.0321393 5.99484 0.00725613 5.90265 0.00136482 5.80829C-0.00452649 5.71393 0.00869571 5.61935 0.0402365 5.53024C0.0717773 5.44112 0.120985 5.35932 0.184902 5.28974C0.248819 5.22016 0.326125 5.16425 0.412172 5.12536C0.498219 5.08646 0.59123 5.0654 0.685613 5.06343C0.779997 5.06146 0.873803 5.07862 0.961394 5.11389C1.04898 5.14916 1.12855 5.2018 1.1953 5.26865L4.56527 8.3624L10.796 1.89365C10.8599 1.82742 10.9362 1.77444 11.0206 1.73774C11.1049 1.70105 11.1957 1.68136 11.2877 1.67979C11.3796 1.67822 11.471 1.69481 11.5566 1.72861C11.6421 1.76241 11.7202 1.81276 11.7864 1.87678C11.8525 1.9408 11.9054 2.01723 11.942 2.10173C11.9787 2.18622 11.9983 2.27711 11.9999 2.36922C12.0015 2.46132 11.9849 2.55283 11.9512 2.63853C11.9174 2.72422 11.8671 2.80242 11.8032 2.86865L4.62893 10.3199Z"
                        fill="#5D51E2"
                      />
                    </svg>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const getStatusStyle = (status: string) => {
    const statusStyles = {
      instructed: { color: "#5D51E2", bg: "#5D51E2" },
      active: { color: "#20C472", bg: "#20C472" },
      draft: { color: "#C6C8D1", bg: "#C6C8D1" },
      "offer-agreed": { color: "#FFA600", bg: "#FFA600" },
      vacant: { color: "#F0454C", bg: "#F0454C" },
      "lost-to-let": { color: "#5D51E2", bg: "#5D51E2" },
    };
    return (
      statusStyles[status as keyof typeof statusStyles] || statusStyles.draft
    );
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
    fontFamily: "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
  };

  const topBarStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    height: "56px",
    padding: "10px 20px 10px 10px",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #EBECF1",
    background: "#FFF",
  };

  const viewsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "5px",
    flex: "1 0 0",
  };

  const activeViewStyle: React.CSSProperties = {
    display: "flex",
    height: "36px",
    padding: "7px 10px",
    alignItems: "center",
    gap: "3px",
    borderRadius: "6px",
    background: "rgba(32, 36, 55, 0.05)",
    cursor: "pointer",
  };

  const inactiveViewStyle: React.CSSProperties = {
    display: "flex",
    height: "36px",
    padding: "8px 10px",
    justifyContent: "center",
    alignItems: "center",
    gap: "3px",
    borderRadius: "6px",
    background: "rgba(32, 36, 55, 0.00)",
    cursor: "pointer",
  };

  const buttonStyle: React.CSSProperties = {
    display: "flex",
    minWidth: "100px",
    minHeight: "36px",
    padding: "8px 20px",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
    borderRadius: "6px",
    background: "#5D51E2",
    color: "#FFF",
    border: "none",
    cursor: "pointer",
    fontFamily: "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
    fontSize: "14px",
    fontWeight: "400",
  };

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    height: "50px",
    padding: "10px",
    alignItems: "flex-start",
    gap: "10px",
    borderRadius: "6px 6px 0px 0px",
    border: "1px solid #EBECF1",
    background: "#FFF",
    marginTop: "0px",
  };

  const searchInputStyle: React.CSSProperties = {
    display: "flex",
    width: "300px",
    height: "30px",
    padding: "0px 10px",
    alignItems: "center",
    gap: "10px",
    borderRadius: "6px",
    border: "1px solid #C6C8D1",
    background: "#FFF",
    fontSize: "14px",
    fontFamily: "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
    outline: "none",
  };

  const tableStyle: React.CSSProperties = {
    width: "100%",
    borderRadius: "0px 0px 6px 6px",
    borderRight: "1px solid #EBECF1",
    borderBottom: "1px solid #EBECF1",
    borderLeft: "1px solid #EBECF1",
    background: "#FFF",
    marginTop: "-1px",
  };

  const tableHeaderStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "40px",
    padding: "12px 20px",
    height: "44px",
    borderBottom: "1px solid #EBECF1",
  };

  const tableRowStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    alignItems: "center",
    gap: "40px",
    padding: "16px 20px",
    borderBottom: "1px solid #EBECF1",
    minHeight: "81px",
  };

  const propertyImageStyle: React.CSSProperties = {
    width: "64px",
    height: "48px",
    borderRadius: "6px",
    objectFit: "cover",
  };

  const statusBadgeStyle = (status: string): React.CSSProperties => {
    const statusStyle = getStatusStyle(status);
    return {
      display: "inline-flex",
      alignItems: "center",
      gap: "8px",
      color: "#515666",
      fontSize: "14px",
      fontFamily: "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
    };
  };

  const statusDotStyle = (status: string): React.CSSProperties => {
    const statusStyle = getStatusStyle(status);
    return {
      width: "8px",
      height: "8px",
      borderRadius: "50%",
      background: statusStyle.bg,
      opacity: "0.8",
    };
  };

  const avatarStyle: React.CSSProperties = {
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    objectFit: "cover",
  };

  const avatarInitialsStyle: React.CSSProperties = {
    display: "flex",
    width: "30px",
    height: "30px",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "15px",
    background: "#8470FD",
    color: "#FFF",
    fontSize: "13px",
    fontWeight: "700",
    fontFamily: "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
  };

  const actionButtonStyle: React.CSSProperties = {
    display: "flex",
    padding: "5px",
    alignItems: "flex-start",
    gap: "10px",
    borderRadius: "6px",
    background: "rgba(93, 81, 226, 0.00)",
    border: "none",
    cursor: "pointer",
  };

  if (loading && properties.length === 0) {
    return (
      <div style={pageStyle}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={pageStyle}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ color: "red" }}>Error: {error}</p>
          <button onClick={loadProperties} style={buttonStyle}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Filter properties based on active tab
  const getFilteredProperties = () => {
    switch (activeTab) {
      case "Occupied":
        return mockProperties.filter((p) => p.status === "active");
      case "Under Offer":
        return mockProperties.filter((p) => p.status === "offer-agreed");
      case "Vacant":
        return mockProperties.filter((p) => p.status === "vacant");
      case "All Properties":
      default:
        return mockProperties;
    }
  };

  const filteredProperties = getFilteredProperties();

  const handleStatusChange = (propertyId: string, newStatus: string) => {
    // Find the property and update its status
    const propertyIndex = mockProperties.findIndex((p) => p.id === propertyId);
    if (propertyIndex !== -1) {
      mockProperties[propertyIndex].status = newStatus as any;
      setOpenStatusDropdown(null); // Close the dropdown
      // Force re-render by updating a state variable
      setActiveTab(activeTab);
    }
  };

  const statusChangeOptions = [
    { value: "instructed", label: "Instructed", color: "#5D51E2" },
    { value: "active", label: "Active", color: "#20C472" },
    { value: "draft", label: "Draft", color: "#C6C8D1" },
    { value: "offer-agreed", label: "Offer Agreed", color: "#FFA600" },
    { value: "vacant", label: "Vacant", color: "#F0454C" },
    { value: "lost-to-let", label: "Lost to Let", color: "#797E8B" },
  ];

  const handleEditProperty = (updatedProperty: Property) => {
    const propertyIndex = mockProperties.findIndex(
      (p) => p.id === updatedProperty.id,
    );
    if (propertyIndex !== -1) {
      mockProperties[propertyIndex] = updatedProperty;
      setShowEditModal(false);
      setEditingProperty(null);
      // Force re-render
      setActiveTab(activeTab);
    }
  };

  const handleDeleteProperty = (property: Property) => {
    setDeletingProperty(property);
    setShowDeleteModal(true);
  };

  const confirmDeleteProperty = () => {
    if (deletingProperty) {
      const propertyIndex = mockProperties.findIndex(
        (p) => p.id === deletingProperty.id,
      );
      if (propertyIndex !== -1) {
        mockProperties.splice(propertyIndex, 1);
        setShowDeleteModal(false);
        setDeletingProperty(null);
        // Force re-render
        setActiveTab(activeTab);
      }
    }
  };

  const EditPropertyModal = () => {
    const initialFormData = useMemo(
      () => ({
        address: editingProperty?.address || "",
        city: editingProperty?.city || "",
        postcode: editingProperty?.postcode || "",
        type: editingProperty?.type || "",
        status: editingProperty?.status || "",
        monthly_rent: editingProperty?.monthly_rent || 0,
        bedrooms: editingProperty?.bedrooms || 0,
        bathrooms: editingProperty?.bathrooms || 0,
      }),
      [editingProperty],
    );

    const [formData, setFormData] = useState(initialFormData);

    useEffect(() => {
      setFormData(initialFormData);
    }, [initialFormData]);

    if (!editingProperty) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      const updatedProperty: Property = {
        ...editingProperty,
        ...formData,
        status: formData.status as Property["status"],
      };
      handleEditProperty(updatedProperty);
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
        onClick={() => setShowEditModal(false)}
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
              Edit Property
            </h2>
            <button
              onClick={() => setShowEditModal(false)}
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
                  Address
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
                    City
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
                    Postcode
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
                    <option value="Villa">Villa</option>
                    <option value="Townhouse">Townhouse</option>
                    <option value="Estate">Estate</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
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
                        status: e.target.value as any,
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
                    <option value="instructed">Instructed</option>
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="offer-agreed">Offer Agreed</option>
                    <option value="vacant">Vacant</option>
                    <option value="lost-to-let">Lost to Let</option>
                  </select>
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
                  Monthly Rent ($)
                </label>
                <input
                  type="number"
                  value={formData.monthly_rent}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      monthly_rent: parseInt(e.target.value) || 0,
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
                    Bedrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bedrooms: parseInt(e.target.value) || 0,
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
                    Bathrooms
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        bathrooms: parseInt(e.target.value) || 0,
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
                  />
                </div>
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
                onClick={() => setShowEditModal(false)}
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
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const DeleteConfirmationModal = () => {
    if (!deletingProperty) return null;

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
        onClick={() => setShowDeleteModal(false)}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "400px",
            textAlign: "center",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ marginBottom: "16px" }}>
            <svg
              width="48"
              height="48"
              viewBox="0 0 48 48"
              fill="none"
              style={{ margin: "0 auto" }}
            >
              <circle cx="24" cy="24" r="24" fill="#FEF2F2" />
              <path
                d="M24 16V26M24 30H24.02M32 24C32 28.4183 28.4183 32 24 32C19.5817 32 16 28.4183 16 24C16 19.5817 19.5817 16 24 16C28.4183 16 32 19.5817 32 24Z"
                stroke="#F87171"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <h3
            style={{
              margin: "0 0 8px 0",
              fontSize: "18px",
              fontWeight: "600",
              color: "#202437",
            }}
          >
            Delete Property
          </h3>

          <p
            style={{
              margin: "0 0 24px 0",
              fontSize: "14px",
              color: "#515666",
              lineHeight: "1.5",
            }}
          >
            Are you sure you want to delete{" "}
            <strong>{deletingProperty.address}</strong>? This action cannot be
            undone.
          </p>

          <div
            style={{ display: "flex", gap: "12px", justifyContent: "center" }}
          >
            <button
              onClick={() => setShowDeleteModal(false)}
              style={{
                padding: "8px 16px",
                border: "1px solid #E1E2E6",
                borderRadius: "6px",
                backgroundColor: "white",
                color: "#515666",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Cancel
            </button>
            <button
              onClick={confirmDeleteProperty}
              style={{
                padding: "8px 16px",
                border: "none",
                borderRadius: "6px",
                backgroundColor: "#F87171",
                color: "white",
                fontSize: "14px",
                cursor: "pointer",
                fontWeight: "500",
              }}
            >
              Delete Property
            </button>
          </div>
        </div>
      </div>
    );
  };

  const tabs = [
    { name: "All Properties", count: mockProperties.length.toString() },
    {
      name: "Occupied",
      count: mockProperties
        .filter((p) => p.status === "active")
        .length.toString(),
    },
    {
      name: "Under Offer",
      count: mockProperties
        .filter((p) => p.status === "offer-agreed")
        .length.toString(),
    },
    {
      name: "Vacant",
      count: mockProperties
        .filter((p) => p.status === "vacant")
        .length.toString(),
    },
  ];

  return (
    <div style={pageStyle}>
      {/* Top Bar */}
      <div style={topBarStyle}>
        <div style={viewsStyle}>
          {tabs.map((tab) => (
            <div
              key={tab.name}
              style={
                activeTab === tab.name ? activeViewStyle : inactiveViewStyle
              }
              onClick={() => setActiveTab(tab.name)}
            >
              <span
                style={{
                  color: activeTab === tab.name ? "#202437" : "#797E8B",
                  fontSize: "14px",
                  fontWeight: activeTab === tab.name ? "500" : "500",
                  fontFamily:
                    "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                {tab.name}
              </span>
              <span
                style={{
                  color: "#A0A3AF",
                  fontSize: "12px",
                  fontWeight: "400",
                  fontFamily:
                    "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                {tab.count}
              </span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button style={buttonStyle}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                fill="white"
              />
            </svg>
            Add Property
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: "0 20px", marginTop: "20px" }}>
        <div style={filterBarStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              flex: "1 0 0",
            }}
          >
            <div style={{ position: "relative" }}>
              <input
                type="text"
                placeholder="Search by Address, City, Zipcode, Neighbourhood"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  ...searchInputStyle,
                  paddingLeft: "35px",
                }}
              />
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
            </div>
            <div
              style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}
            >
              <div
                style={{
                  display: "flex",
                  padding: "5px 10px",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => handleDropdownToggle("type")}
              >
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Type:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  {typeFilter}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                    fill="#A0A3AF"
                  />
                </svg>
                {openDropdown === "type" && (
                  <DropdownComponent
                    options={typeOptions}
                    selectedValue={typeFilter}
                    onSelect={(value) => handleOptionSelect("type", value)}
                    dropdownType="type"
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "5px 10px",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => handleDropdownToggle("status")}
              >
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Status:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  {statusFilter}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                    fill="#A0A3AF"
                  />
                </svg>
                {openDropdown === "status" && (
                  <DropdownComponent
                    options={statusOptions}
                    selectedValue={statusFilter}
                    onSelect={(value) => handleOptionSelect("status", value)}
                    dropdownType="status"
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "5px 10px",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => handleDropdownToggle("manager")}
              >
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Manager:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  {managerFilter}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                    fill="#A0A3AF"
                  />
                </svg>
                {openDropdown === "manager" && (
                  <DropdownComponent
                    options={managerOptions}
                    selectedValue={managerFilter}
                    onSelect={(value) => handleOptionSelect("manager", value)}
                    dropdownType="manager"
                  />
                )}
              </div>
              <div
                style={{
                  display: "flex",
                  padding: "5px 10px",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  position: "relative",
                }}
                onClick={() => handleDropdownToggle("client")}
              >
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  Client:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                >
                  {clientFilter}
                </span>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                    fill="#A0A3AF"
                  />
                </svg>
                {openDropdown === "client" && (
                  <DropdownComponent
                    options={clientOptions}
                    selectedValue={clientFilter}
                    onSelect={(value) => handleOptionSelect("client", value)}
                    dropdownType="client"
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={tableStyle}>
          {/* Table Header */}
          <div style={tableHeaderStyle}>
            <div
              style={{
                width: "300px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Address
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
            </div>
            <div
              style={{
                width: "180px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Reference
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
            </div>
            <div
              style={{
                width: "180px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Type
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
            </div>
            <div
              style={{
                width: "200px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Status
              </span>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
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
            </div>
            <div style={{ width: "200px" }}>
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Manager
              </span>
            </div>
            <div
              style={{
                width: "100px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <span
                style={{
                  color: "#202437",
                  fontSize: "14px",
                  fontWeight: "700",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                Action
              </span>
            </div>
          </div>

          {/* Table Rows */}
          {filteredProperties.slice(0, 6).map((property: Property, index) => (
            <div key={property.id} style={tableRowStyle}>
              <div
                style={{
                  width: "300px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                <img
                  src={
                    property.image_url ||
                    "https://via.placeholder.com/64x48?text=No+Image"
                  }
                  alt={property.address}
                  style={propertyImageStyle}
                />
                <div>
                  <div
                    style={{
                      color: "#202437",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      lineHeight: "20px",
                    }}
                  >
                    {property.address}
                  </div>
                  <div
                    style={{
                      color: "#515666",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      lineHeight: "20px",
                    }}
                  >
                    {property.city}, {property.postcode}
                  </div>
                </div>
              </div>
              <div style={{ width: "180px" }}>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    lineHeight: "20px",
                  }}
                >
                  {property.reference}
                </span>
              </div>
              <div style={{ width: "180px" }}>
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    lineHeight: "20px",
                  }}
                >
                  {property.type}
                </span>
              </div>
              <div style={{ width: "200px", position: "relative" }}>
                <div
                  style={{
                    ...statusBadgeStyle(property.status),
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setOpenStatusDropdown(
                      openStatusDropdown === property.id ? null : property.id,
                    );
                  }}
                >
                  <div style={statusDotStyle(property.status)} />
                  <span>
                    {property.status.charAt(0).toUpperCase() +
                      property.status.slice(1).replace("-", " ")}
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6.0003 9.25492L0.859047 4.14367C0.789203 4.07341 0.75 3.97836 0.75 3.87929C0.75 3.78022 0.789203 3.68518 0.859047 3.61492C0.893908 3.57977 0.935384 3.55187 0.981081 3.53283C1.02678 3.5138 1.07579 3.50399 1.1253 3.50399C1.1748 3.50399 1.22382 3.5138 1.26951 3.53283C1.31521 3.55187 1.35669 3.57977 1.39155 3.61492L6.0003 8.19742L10.609 3.61117C10.6439 3.57602 10.6854 3.54812 10.7311 3.52908C10.7768 3.51005 10.8258 3.50024 10.8753 3.50024C10.9248 3.50024 10.9738 3.51005 11.0195 3.52908C11.0652 3.54812 11.1067 3.57602 11.1415 3.61117C11.2114 3.68143 11.2506 3.77647 11.2506 3.87554C11.2506 3.97461 11.2114 4.06966 11.1415 4.13992L6.0003 9.25492Z"
                      fill="#A0A3AF"
                    />
                  </svg>
                </div>

                {/* Status Dropdown */}
                {openStatusDropdown === property.id && (
                  <div
                    style={{
                      position: "absolute",
                      top: "100%",
                      left: "0",
                      backgroundColor: "white",
                      border: "1px solid #EBECF1",
                      borderRadius: "8px",
                      boxShadow:
                        "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      minWidth: "150px",
                      zIndex: 1000,
                      padding: "4px",
                    }}
                  >
                    {statusChangeOptions.map((status) => (
                      <div
                        key={status.value}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "8px 12px",
                          cursor: "pointer",
                          borderRadius: "4px",
                          fontSize: "14px",
                          color:
                            property.status === status.value
                              ? "#5D51E2"
                              : "#202437",
                          backgroundColor:
                            property.status === status.value
                              ? "#F3F2FF"
                              : "transparent",
                        }}
                        onMouseEnter={(e) => {
                          if (property.status !== status.value) {
                            e.currentTarget.style.backgroundColor = "#F9FAFB";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (property.status !== status.value) {
                            e.currentTarget.style.backgroundColor =
                              "transparent";
                          }
                        }}
                        onClick={() =>
                          handleStatusChange(property.id, status.value)
                        }
                      >
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            backgroundColor: status.color,
                          }}
                        />
                        <span>{status.label}</span>
                        {property.status === status.value && (
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 14 14"
                            fill="none"
                            style={{ marginLeft: "auto" }}
                          >
                            <path
                              d="M11.6667 3.5L5.25 9.91667L2.33333 7"
                              stroke="#5D51E2"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                style={{
                  width: "200px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                {property.manager?.avatar_url ? (
                  <img
                    src={property.manager.avatar_url}
                    alt={property.manager.name}
                    style={avatarStyle}
                  />
                ) : (
                  <div style={avatarInitialsStyle}>
                    {property.manager?.initials || "BC"}
                  </div>
                )}
                <span
                  style={{
                    color: "#515666",
                    fontSize: "14px",
                    fontWeight: "400",
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    lineHeight: "20px",
                  }}
                >
                  {property.manager?.name || "Bessie Cooper"}
                </span>
              </div>
              <div
                style={{
                  width: "100px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "10px",
                  justifyContent: "center",
                }}
              >
                <button
                  style={actionButtonStyle}
                  onClick={() => {
                    setEditingProperty(property);
                    setShowEditModal(true);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M15.805 1.40591C15.655 1.11947 15.4571 0.86075 15.22 0.640912C15.0102 0.440993 14.7664 0.280137 14.5 0.165912C14.2591 0.0588385 13.9986 0.0026657 13.735 0.000912288C13.3669 -0.0107943 13.004 0.0904005 12.695 0.290912C12.499 0.413852 12.3134 0.552649 12.14 0.705912C12.08 0.755912 11.69 1.14591 10.97 1.86591C10.25 2.58591 9.47 3.36591 8.625 4.21091L6.32 6.50091L5.28 7.53591C5.253 7.5647 5.2295 7.59659 5.21 7.63091C5.19456 7.66165 5.1812 7.69339 5.17 7.72591C5.12 7.89091 5.035 8.17091 4.92 8.57091C4.805 8.97091 4.69 9.37091 4.56 9.78091C4.43 10.1909 4.325 10.5559 4.225 10.8759C4.125 11.1959 4.08 11.3759 4.08 11.3759C4.05486 11.4488 4.05486 11.528 4.08 11.6009C4.09625 11.6755 4.13458 11.7434 4.19 11.7959C4.22777 11.839 4.27597 11.8717 4.33 11.8909C4.3792 11.911 4.43187 11.9212 4.485 11.9209H4.545H4.61L5.11 11.7559L6.22 11.4009L7.42 11.0159C7.805 10.8909 8.06 10.8109 8.19 10.7809C8.22027 10.7699 8.24887 10.7548 8.275 10.7359L8.36 10.6709L9.5 9.53091C10.185 8.85591 10.93 8.11591 11.745 7.32091L14 5.08091C14.71 4.38091 15.12 3.97091 15.235 3.84591C15.4719 3.60808 15.6679 3.33269 15.815 3.03091C15.9354 2.77776 15.9985 2.50122 16 2.22091C15.9942 1.9384 15.9277 1.66045 15.805 1.40591ZM14.9 2.66591C14.8041 2.85126 14.6792 3.02006 14.53 3.16591C14.47 3.24091 14.285 3.42591 13.975 3.73091L12.705 4.96091C12.16 5.49591 11.505 6.15091 10.705 6.91591L8.04 9.54591L7.73 9.84591L6.675 10.1809L5.34 10.6109C5.475 10.1709 5.615 9.71591 5.755 9.24091C5.895 8.76591 6 8.40091 6.075 8.14091C6.28 7.93091 6.745 7.47591 7.455 6.76591L9.69 4.54091L12.825 1.40591C12.9174 1.32867 13.0142 1.25688 13.115 1.19091C13.2932 1.0572 13.5125 0.989995 13.735 1.00091C13.8739 1.00074 14.011 1.03329 14.135 1.09591C14.2804 1.16812 14.4137 1.26259 14.53 1.37591C14.6716 1.50023 14.7916 1.64724 14.885 1.81091C14.9557 1.94273 14.9998 2.08711 15.015 2.23591C15.0095 2.38606 14.9702 2.53304 14.9 2.66591ZM12.5 15.0009H1V2.50091H8.5L9.5 1.50091H1C0.734784 1.50091 0.48043 1.60627 0.292893 1.79381C0.105357 1.98134 0 2.2357 0 2.50091L0 15.0009C0 15.2661 0.105357 15.5205 0.292893 15.708C0.48043 15.8956 0.734784 16.0009 1 16.0009H12.5C12.7652 16.0009 13.0196 15.8956 13.2071 15.708C13.3946 15.5205 13.5 15.2661 13.5 15.0009V7.00091L12.5 8.00091V15.0009Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
                <button
                  style={actionButtonStyle}
                  onClick={() => handleDeleteProperty(property)}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M14.5 2.00049H10.5V1.00049C10.5 0.735272 10.3946 0.480918 10.2071 0.293382C10.0196 0.105845 9.76522 0.000488281 9.5 0.000488281L6.5 0.000488281C6.23478 0.000488281 5.98043 0.105845 5.79289 0.293382C5.60536 0.480918 5.5 0.735272 5.5 1.00049V2.00049H1.5C1.36739 2.00049 1.24021 2.05317 1.14645 2.14693C1.05268 2.2407 1 2.36788 1 2.50049C1 2.6331 1.05268 2.76027 1.14645 2.85404C1.24021 2.94781 1.36739 3.00049 1.5 3.00049H2.535L2.965 15.0355C2.97407 15.2946 3.08342 15.54 3.26999 15.7201C3.45655 15.9001 3.70574 16.0006 3.965 16.0005H12.035C12.2943 16.0006 12.5435 15.9001 12.73 15.7201C12.9166 15.54 13.0259 15.2946 13.035 15.0355L13.465 3.00049H14.5C14.6326 3.00049 14.7598 2.94781 14.8536 2.85404C14.9473 2.76027 15 2.6331 15 2.50049C15 2.36788 14.9473 2.2407 14.8536 2.14693C14.7598 2.05317 14.6326 2.00049 14.5 2.00049ZM6.5 1.00049H9.5V2.00049H6.5V1.00049ZM12 15.0005H4L3.5 3.00049H12.5L12 15.0005ZM9.535 13.0005C9.66761 13.0005 9.79479 12.9478 9.88855 12.854C9.98232 12.7603 10.035 12.6331 10.035 12.5005L10.47 5.56549C10.4801 5.4942 10.4747 5.42158 10.4541 5.35259C10.4335 5.2836 10.3983 5.21987 10.3508 5.16575C10.3033 5.11162 10.2447 5.06839 10.179 5.03901C10.1133 5.00962 10.042 4.99478 9.97 4.99549C9.83739 4.99549 9.71021 5.04817 9.61645 5.14193C9.52268 5.2357 9.47 5.36288 9.47 5.49549L9.035 12.4305C9.02492 12.5018 9.03035 12.5744 9.05092 12.6434C9.07149 12.7124 9.10672 12.7761 9.15419 12.8302C9.20167 12.8844 9.26027 12.9276 9.32599 12.957C9.39172 12.9864 9.46301 13.0012 9.535 13.0005ZM6.465 13.0005C6.53699 13.0012 6.60828 12.9864 6.67401 12.957C6.73973 12.9276 6.79833 12.8844 6.84581 12.8302C6.89328 12.7761 6.92851 12.7124 6.94908 12.6434C6.96965 12.5744 6.97508 12.5018 6.965 12.4305L6.53 5.50049C6.53 5.36788 6.47732 5.2407 6.38355 5.14693C6.28979 5.05317 6.16261 5.00049 6.03 5.00049C5.95801 4.99978 5.88672 5.01462 5.82099 5.04401C5.75527 5.07339 5.69667 5.11662 5.64919 5.17074C5.60172 5.22487 5.56649 5.2886 5.54592 5.35759C5.52535 5.42658 5.51992 5.49921 5.53 5.57049L5.97 12.5005C5.96999 12.6322 6.02199 12.7587 6.11467 12.8523C6.20736 12.9459 6.33326 12.9992 6.465 13.0005Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
              </div>
            </div>
          ))}

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              width: "100%",
              padding: "10px 20px",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              borderRadius: "0px 0px 4px 4px",
              border: "1px solid #EBECF1",
              background: "#FFF",
              height: "56px",
            }}
          >
            <div
              style={{
                display: "flex",
                height: "36px",
                padding: "0px 6px 0px 3px",
                alignItems: "center",
                gap: "10px",
                borderRadius: "6px",
                border: "1px solid #E1E2E6",
                background: "#FFF",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "2px",
                }}
              >
                {[1, 2, 3, 4, 5].map((page) => (
                  <div
                    key={page}
                    style={{
                      display: "flex",
                      height: "30px",
                      minWidth: "30px",
                      padding: "5px 8px",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "10px",
                      borderRadius: "6px",
                      background: "#FFF",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        color: page === 1 ? "#5D51E2" : "#515666",
                        fontSize: "14px",
                        fontWeight: page === 1 ? "700" : "400",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      }}
                    >
                      {page}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    height: "30px",
                    minWidth: "30px",
                    padding: "5px 8px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    background: "#FFF",
                  }}
                >
                  <span
                    style={{
                      color: "#515666",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    ...
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    height: "30px",
                    minWidth: "30px",
                    padding: "5px 8px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    background: "#FFF",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      color: "#515666",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    99
                  </span>
                </div>
              </div>
              <div
                style={{ width: "1px", height: "24px", background: "#EBECF1" }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    width: "40px",
                    height: "24px",
                    padding: "0px 10px",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    border: "1px solid #C6C8D1",
                    background: "#FFF",
                  }}
                >
                  <span
                    style={{
                      color: "#202437",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    1
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "60px",
                    height: "24px",
                    padding: "0px 10px",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    border: "1px solid #C6C8D1",
                    background: "#FFF",
                  }}
                >
                  <span
                    style={{
                      color: "#202437",
                      fontSize: "14px",
                      fontWeight: "400",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    }}
                  >
                    50
                  </span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6.5003 9.25492L1.35905 4.14367C1.2892 4.07341 1.25 3.97836 1.25 3.87929C1.25 3.78022 1.2892 3.68518 1.35905 3.61492C1.39391 3.57977 1.43538 3.55187 1.48108 3.53283C1.52678 3.5138 1.57579 3.50399 1.6253 3.50399C1.6748 3.50399 1.72382 3.5138 1.76951 3.53283C1.81521 3.55187 1.85669 3.57977 1.89155 3.61492L6.5003 8.19742L11.109 3.61117C11.1439 3.57602 11.1854 3.54812 11.2311 3.52908C11.2768 3.51005 11.3258 3.50024 11.3753 3.50024C11.4248 3.50024 11.4738 3.51005 11.5195 3.52908C11.5652 3.54812 11.6067 3.57602 11.6415 3.61117C11.7114 3.68143 11.7506 3.77647 11.7506 3.87554C11.7506 3.97461 11.7114 4.06966 11.6415 4.13992L6.5003 9.25492Z"
                      fill="#C6C8D1"
                    />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {filteredProperties.length === 0 && !loading && (
        <div style={{ textAlign: "center", padding: "40px", color: "#797E8B" }}>
          <p>No properties found</p>
          <p>Please add properties to see them listed here</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p>Loading...</p>
        </div>
      )}

      {/* Edit Property Modal */}
      {showEditModal && <EditPropertyModal />}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && <DeleteConfirmationModal />}
    </div>
  );
}
