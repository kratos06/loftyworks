"use client";

import React, { useState, useEffect, useRef } from "react";
import { useDocuments } from "../../hooks/useSupabase";

interface Document {
  id: string;
  file_name: string;
  file_type: "pdf" | "doc" | "docx";
  property: string;
  document_type: string;
  valid_until: string;
  status: "Expiring" | "Valid" | "Expired" | "Uncertain";
  sharing: {
    type: string;
    has_lock?: boolean;
    has_view?: boolean;
  };
  create_date: string;
}

export default function DocumentsPage() {
  const {
    documents,
    loading,
    error,
    fetchDocuments,
    formatDate,
    formatValidUntil,
    getDocumentStats,
  } = useDocuments();

  // State management
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [currentPageInput, setCurrentPageInput] = useState("1");

  // Filter dropdown states
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [statusFilterOpen, setStatusFilterOpen] = useState(false);
  const [propertyFilterOpen, setPropertyFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);

  // Filter values
  const [selectedType, setSelectedType] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedProperty, setSelectedProperty] = useState("None");
  const [selectedDate, setSelectedDate] = useState("None");

  // Refs for click outside
  const typeFilterRef = useRef<HTMLDivElement>(null);
  const statusFilterRef = useRef<HTMLDivElement>(null);
  const propertyFilterRef = useRef<HTMLDivElement>(null);
  const dateFilterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDocuments();
  }, [activeTab, searchTerm, currentPage, itemsPerPage, loadDocuments]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        typeFilterRef.current &&
        !typeFilterRef.current.contains(event.target as Node)
      ) {
        setTypeFilterOpen(false);
      }
      if (
        statusFilterRef.current &&
        !statusFilterRef.current.contains(event.target as Node)
      ) {
        setStatusFilterOpen(false);
      }
      if (
        propertyFilterRef.current &&
        !propertyFilterRef.current.contains(event.target as Node)
      ) {
        setPropertyFilterOpen(false);
      }
      if (
        dateFilterRef.current &&
        !dateFilterRef.current.contains(event.target as Node)
      ) {
        setDateFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const loadDocuments = async () => {
    const filters: any = {
      page: currentPage,
      limit: itemsPerPage,
    };

    if (searchTerm) {
      filters.search = searchTerm;
    }

    if (activeTab !== "all") {
      if (activeTab === "expiring") {
        filters.status = "Expiring";
      }
    }

    await fetchDocuments(filters);
  };

  const getFilteredDocuments = () => {
    let filtered = documents;

    if (activeTab === "expiring") {
      filtered = filtered.filter((d: any) => d.status === "Expiring");
    } else if (activeTab === "archive") {
      filtered = filtered.filter((d: any) => d.status === "Expired");
    }

    if (searchTerm) {
      filtered = filtered.filter((d: any) =>
        d.file_name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedType !== "All") {
      filtered = filtered.filter((d: any) => d.document_type === selectedType);
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((d: any) => d.status === selectedStatus);
    }

    return filtered;
  };

  const stats = getDocumentStats();
  const filteredDocuments = getFilteredDocuments();

  const renderFileIcon = (fileType: string) => {
    const isDoc = fileType === "doc" || fileType === "docx";

    return (
      <div
        style={{
          width: "20px",
          height: "20px",
          position: "relative",
          backgroundColor: "#000",
          borderRadius: "0px",
          flexShrink: 0,
        }}
      >
        <svg
          width="15"
          height="20"
          viewBox="0 0 16 20"
          fill="none"
          style={{
            position: "absolute",
            left: "3px",
            top: "0px",
          }}
        >
          <path
            d="M0.5 3.33333C0.5 1.49238 1.99238 0 3.83333 0H10.0475L15.5 5.33203V16.6667C15.5 18.5076 14.0076 20 12.1667 20H3.83333C1.99238 20 0.5 18.5076 0.5 16.6667V3.33333Z"
            fill="#F4F4F8"
          />
        </svg>
        <svg
          width="6"
          height="5"
          viewBox="0 0 7 6"
          fill="none"
          style={{
            position: "absolute",
            left: "12px",
            top: "0px",
          }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M6.50065 5.33333H4.30253C2.40962 5.33333 0.896602 3.75894 0.971829 1.86753L1.04611 0L6.50065 5.33333Z"
            fill="#C4C9D6"
          />
        </svg>
        {!isDoc ? (
          <svg
            width="8"
            height="8"
            viewBox="0 0 10 9"
            fill="none"
            style={{
              position: "absolute",
              left: "6px",
              top: "7px",
            }}
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M1.68755 8.58843C1.55689 8.58976 1.42741 8.56307 1.30788 8.51042C1.03647 8.38821 0.854499 8.12659 0.834625 7.82968C0.820536 7.40552 1.03959 7.00776 1.40532 6.79271C2.09094 6.40859 2.81854 6.10515 3.57373 5.88818C3.87494 5.28635 4.14382 4.66894 4.37919 4.03848C3.97624 3.47209 3.74087 2.80367 3.70009 2.10973C3.70009 1.11829 4.17245 0.666992 4.61129 0.666992C5.05014 0.666992 5.5225 1.11829 5.5225 2.10973C5.44938 2.74093 5.29366 3.35997 5.05933 3.95068C5.38887 4.40139 5.76765 4.81384 6.18855 5.18045C6.76725 5.03926 7.35766 4.95176 7.95238 4.91928C8.74998 4.91928 9.16732 5.37755 9.16732 5.83049C9.16732 6.28342 8.74998 6.74169 7.95238 6.74169C7.44516 6.74169 6.73076 6.38605 6.03179 5.83449C5.3819 5.98443 4.66869 6.17708 4.00441 6.38383C3.68273 7.07138 3.22832 7.68834 2.66742 8.19956C2.39201 8.43285 2.04793 8.56944 1.68755 8.58843Z"
              fill="#FF285F"
            />
          </svg>
        ) : (
          <div
            style={{
              position: "absolute",
              left: "6px",
              top: "8px",
              width: "8px",
              height: "6px",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "1px",
                backgroundColor: "#C4C9D6",
                borderRadius: "0.833px",
                position: "absolute",
                top: "0px",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "1px",
                backgroundColor: "#C4C9D6",
                borderRadius: "0.833px",
                position: "absolute",
                top: "2px",
              }}
            />
            <div
              style={{
                width: "8px",
                height: "1px",
                backgroundColor: "#C4C9D6",
                borderRadius: "0.833px",
                position: "absolute",
                top: "3px",
              }}
            />
            <div
              style={{
                width: "5px",
                height: "1px",
                backgroundColor: "#C4C9D6",
                borderRadius: "0.833px",
                position: "absolute",
                top: "5px",
              }}
            />
          </div>
        )}
      </div>
    );
  };

  const renderStatusBadge = (status: string) => {
    const colors = {
      Expired: "#F0454C",
      Expiring: "#FFA600",
      Valid: "#20C472",
      Uncertain: "#C6C8D1",
    };

    const color = colors[status as keyof typeof colors] || "#C6C8D1";

    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
          <circle opacity="0.8" cx="4" cy="4" r="4" fill={color} />
        </svg>
        <span
          style={{
            color: "#515666",
            fontFamily:
              "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "20px",
          }}
        >
          {status}
        </span>
      </div>
    );
  };

  const renderSharingIcons = (sharing: any) => {
    const isLocked = sharing?.has_lock || sharing?.type === "Team Member";
    const hasView = sharing?.has_view || sharing?.type === "Tenants";
    const shareType = sharing?.type || "Team Member";

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        {isLocked && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M12.5002 6.00031C13.0306 6.00031 13.5394 6.21102 13.9144 6.58607C14.2895 6.96112 14.5002 7.4698 14.5002 8.00021V13.9999C14.5002 14.5303 14.2895 15.039 13.9144 15.414C13.5394 15.7891 13.0306 15.9998 12.5002 15.9998H3.50021C3.23696 16.0037 2.97569 15.9538 2.73239 15.8532C2.48908 15.7526 2.26886 15.6035 2.08521 15.4148C1.89657 15.2312 1.74739 15.011 1.6468 14.7677C1.54621 14.5244 1.49633 14.2631 1.50021 13.9999V8.00021C1.49633 7.73697 1.54621 7.47572 1.6468 7.23242C1.74739 6.98913 1.89657 6.76893 2.08521 6.58528C2.26886 6.39665 2.48908 6.24748 2.73239 6.14689C2.97569 6.04631 3.23696 5.99643 3.50021 6.00031H4.00021V4.09541C3.99596 3.55029 4.09434 3.00924 4.29021 2.5005C4.47067 2.01595 4.74605 1.57231 5.10021 1.19557C5.45681 0.821826 5.88543 0.524189 6.36021 0.320611C6.87825 0.0996919 7.43711 -0.00934789 8.00021 0.000627614C8.54987 -0.00377306 9.09453 0.105154 9.60021 0.320611C10.0782 0.524047 10.5115 0.819661 10.8752 1.19057C11.2375 1.56665 11.5199 2.01226 11.7052 2.5005C11.9019 3.00917 12.0019 3.55006 12.0002 4.09541V6.00031H12.5002ZM13.5002 13.9999V8.00021C13.5002 7.73501 13.3949 7.48067 13.2073 7.29314C13.0198 7.10561 12.7654 7.00026 12.5002 7.00026H3.50021C3.23499 7.00026 2.98064 7.10561 2.7931 7.29314C2.60557 7.48067 2.50021 7.73501 2.50021 8.00021V13.9999C2.50021 14.2651 2.60557 14.5194 2.7931 14.707C2.98064 14.8945 3.23499 14.9998 3.50021 14.9998H12.5002C12.7654 14.9998 13.0198 14.8945 13.2073 14.707C13.3949 14.5194 13.5002 14.2651 13.5002 13.9999ZM5.00021 4.09541V6.00031H11.0002V4.09541C11.0189 3.28287 10.7193 2.4952 10.1652 1.90053C9.88901 1.60531 9.55305 1.37235 9.17973 1.21717C8.80642 1.06199 8.40431 0.988149 8.00021 1.00058C7.59357 0.98333 7.18809 1.05542 6.81231 1.21177C6.43653 1.36812 6.09959 1.60493 5.82521 1.90553C5.28139 2.50382 4.98633 3.28704 5.00021 4.09541ZM8.00021 9.00016C8.26543 9.00016 8.51978 9.10551 8.70732 9.29303C8.89485 9.48056 9.00021 9.7349 9.00021 10.0001C9.00114 10.1766 8.95265 10.3498 8.86021 10.5001C8.77044 10.6443 8.64687 10.7644 8.50021 10.8501V12.5C8.50101 12.5655 8.48808 12.6306 8.46224 12.6908C8.43641 12.7511 8.39825 12.8053 8.35021 12.85C8.2579 12.9442 8.13209 12.9981 8.00021 12.9999C7.8676 12.9999 7.74043 12.9473 7.64666 12.8535C7.55289 12.7597 7.50021 12.6326 7.50021 12.5V10.8601C7.35355 10.7744 7.22998 10.6543 7.14021 10.5101C7.04596 10.3569 6.99739 10.18 7.00021 10.0001C7.00021 9.7349 7.10557 9.48056 7.2931 9.29303C7.48064 9.10551 7.73499 9.00016 8.00021 9.00016Z"
              fill="#797E8B"
            />
          </svg>
        )}
        {hasView && !isLocked && (
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M15.998 7.95509C15.9957 7.93348 15.9957 7.91169 15.998 7.89009C15.995 7.87523 15.995 7.85994 15.998 7.84509V7.81509C16.0007 7.80697 16.0007 7.79821 15.998 7.79009V7.76009C15.6421 6.93568 15.1579 6.17289 14.5633 5.50009C14.02 4.86705 13.3907 4.31333 12.6937 3.85509C11.3021 2.96319 9.68249 2.49264 8.02975 2.50009C6.36668 2.50093 4.73833 2.97618 3.3358 3.87009C2.63256 4.322 1.99645 4.87073 1.44621 5.50009C0.868458 6.16382 0.39636 6.91259 0.0465239 7.72009V7.76509V7.81509C0.0499546 7.82479 0.0499546 7.83538 0.0465239 7.84509C0.0488295 7.86836 0.0488295 7.89181 0.0465239 7.91509C0.0280785 7.94145 0.0129669 7.97001 0.00153387 8.00009C-0.000511289 8.02171 -0.00051129 8.04347 0.00153387 8.06509C0.00399155 8.08501 0.00399155 8.10516 0.00153387 8.12509C0.00449663 8.13994 0.00449663 8.15523 0.00153387 8.17009V8.20509V8.26009C0.68286 9.8398 1.82377 11.1778 3.27581 12.1001C3.97191 12.5365 4.72575 12.8731 5.51531 13.1001C7.10815 13.5668 8.80139 13.5668 10.3942 13.1001C11.1838 12.8731 11.9376 12.5365 12.6337 12.1001C13.3511 11.6632 14.0011 11.1242 14.5633 10.5001C15.1342 9.83796 15.598 9.09059 15.938 8.28509V8.25009V8.20009C15.9346 8.19038 15.9346 8.17979 15.938 8.17009C15.9357 8.14681 15.9357 8.12336 15.938 8.10009C15.9629 8.06995 15.9831 8.03624 15.998 8.00009C15.9993 7.98512 15.9993 7.97006 15.998 7.95509Z"
              fill="#797E8B"
            />
          </svg>
        )}
        <span
          style={{
            color: "#515666",
            fontFamily:
              "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "14px",
            fontWeight: "400",
            lineHeight: "20px",
          }}
        >
          {shareType}
        </span>
      </div>
    );
  };

  const renderActionButtons = () => (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <button
        style={{
          display: "flex",
          padding: "5px",
          alignItems: "flex-start",
          gap: "10px",
          borderRadius: "6px",
          background: "rgba(93, 81, 226, 0.00)",
          cursor: "pointer",
          border: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <g clipPath="url(#clip0_850_900)">
            <path
              d="M15.5 12.0007C15.225 12.0007 15 12.2257 15 12.5007V13.5008C15 14.3258 14.325 15.0009 13.5 15.0009H2.5C1.675 15.0009 1 14.3258 1 13.5008V12.5007C1 12.2257 0.775 12.0007 0.5 12.0007C0.225 12.0007 0 12.2257 0 12.5007V13.5008C0 14.8808 1.12 16.0009 2.5 16.0009H13.5C14.88 16.0009 16 14.8808 16 13.5008V12.5007C16 12.2257 15.775 12.0007 15.5 12.0007ZM8 13.3408L12.855 8.37548C13.05 8.18047 13.045 7.86045 12.845 7.67044C12.645 7.48043 12.33 7.48043 12.14 7.68044L8.495 11.4056V0.500028C8.495 0.225013 8.27 0 7.995 0C7.72 0 7.495 0.225013 7.495 0.500028V11.3956L3.85 7.67044C3.655 7.47043 3.34 7.47043 3.145 7.66044C2.945 7.85545 2.945 8.17047 3.135 8.36548L7.99 13.3308L8 13.3408Z"
              fill="#797E8B"
            />
          </g>
        </svg>
      </button>
      <button
        style={{
          display: "flex",
          padding: "5px",
          alignItems: "flex-start",
          gap: "10px",
          borderRadius: "6px",
          background: "rgba(93, 81, 226, 0.00)",
          cursor: "pointer",
          border: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14.23 1.68504C14.1638 1.48547 14.0363 1.31186 13.8658 1.18888C13.6952 1.0659 13.4903 0.999809 13.28 1H2.72C2.50974 0.999809 2.30477 1.0659 2.13422 1.18888C1.96368 1.31186 1.83623 1.48547 1.77 1.68504L0 7.00034V14.0007C0 14.266 0.105357 14.5203 0.292893 14.7079C0.48043 14.8954 0.734784 15.0008 1 15.0008H15C15.2652 15.0008 15.5196 14.8954 15.7071 14.7079C15.8946 14.5203 16 14.266 16 14.0007V7.00034L14.23 1.68504ZM2.72 2.00006H13.28L14.945 7.00034H10C10 7.53081 9.78929 8.03954 9.41421 8.41464C9.03914 8.78973 8.53043 9.00046 8 9.00046C7.46957 9.00046 6.96086 8.78973 6.58579 8.41464C6.21071 8.03954 6 7.53081 6 7.00034H1.055L2.72 2.00006ZM15 14.0007H1V8.0004H5.175C5.3832 8.58298 5.76641 9.08695 6.27213 9.44328C6.77785 9.79961 7.38136 9.99087 8 9.99087C8.61864 9.99087 9.22215 9.79961 9.72787 9.44328C10.2336 9.08695 10.6168 8.58298 10.825 8.0004H15V14.0007Z"
            fill="#797E8B"
          />
        </svg>
      </button>
      <button
        style={{
          display: "flex",
          padding: "5px",
          alignItems: "flex-start",
          gap: "10px",
          borderRadius: "6px",
          background: "rgba(93, 81, 226, 0.00)",
          cursor: "pointer",
          border: "none",
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1.5 6.5C1.20333 6.5 0.913319 6.58798 0.666645 6.75281C0.419972 6.91764 0.227713 7.15192 0.114181 7.42603C0.000649929 7.70013 -0.0290551 8.00175 0.0288228 8.29274C0.0867006 8.58373 0.229562 8.85102 0.439341 9.06081C0.649119 9.2706 0.916394 9.41347 1.20737 9.47135C1.49834 9.52923 1.79994 9.49952 2.07403 9.38598C2.34811 9.27245 2.58238 9.08018 2.74721 8.83349C2.91203 8.5868 3 8.29677 3 8.00009C3 7.60224 2.84197 7.22069 2.56066 6.93936C2.27936 6.65804 1.89783 6.5 1.5 6.5ZM8 6.5C7.70333 6.5 7.41332 6.58798 7.16665 6.75281C6.91997 6.91764 6.72771 7.15192 6.61418 7.42603C6.50065 7.70013 6.47094 8.00175 6.52882 8.29274C6.5867 8.58373 6.72956 8.85102 6.93934 9.06081C7.14912 9.2706 7.41639 9.41347 7.70737 9.47135C7.99834 9.52923 8.29994 9.49952 8.57403 9.38598C8.84811 9.27245 9.08238 9.08018 9.24721 8.83349C9.41203 8.5868 9.5 8.29677 9.5 8.00009C9.5 7.60224 9.34197 7.22069 9.06066 6.93936C8.77936 6.65804 8.39783 6.5 8 6.5ZM14.5 6.5C14.2033 6.5 13.9133 6.58798 13.6666 6.75281C13.42 6.91764 13.2277 7.15192 13.1142 7.42603C13.0007 7.70013 12.9709 8.00175 13.0288 8.29274C13.0867 8.58373 13.2296 8.85102 13.4393 9.06081C13.6491 9.2706 13.9164 9.41347 14.2074 9.47135C14.4983 9.52923 14.7999 9.49952 15.074 9.38598C15.3481 9.27245 15.5824 9.08018 15.7472 8.83349C15.912 8.5868 16 8.29677 16 8.00009C16 7.60224 15.842 7.22069 15.5607 6.93936C15.2794 6.65804 14.8978 6.5 14.5 6.5Z"
            fill="#797E8B"
          />
        </svg>
      </button>
    </div>
  );

  if (loading && documents.length === 0) {
    return (
      <div
        style={{
          width: "1440px",
          height: "800px",
          background: "#F6F7FB",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
        }}
      >
        <span style={{ color: "#797E8B", fontSize: "14px" }}>
          Loading documents...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          width: "1440px",
          height: "800px",
          background: "#F6F7FB",
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "20px",
          fontFamily:
            "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
        }}
      >
        <span style={{ color: "#F0454C", fontSize: "14px" }}>
          Error loading documents: {error}
        </span>
        <button
          onClick={loadDocuments}
          style={{
            display: "flex",
            minWidth: "100px",
            minHeight: "36px",
            padding: "8px 20px",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            borderRadius: "6px",
            background: "#5D51E2",
            border: "none",
            cursor: "pointer",
            color: "#FFF",
            fontSize: "14px",
            fontFamily: "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F6F7FB",
        fontFamily: "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
      }}
    >
      {/* Top Bar with Tabs */}
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "56px",
          padding: "10px 20px 10px 10px",
          alignItems: "center",
          gap: "20px",
          flexShrink: 0,
          borderBottom: "1px solid #EBECF1",
          background: "#FFF",
        }}
      >
        {/* Views Section */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "5px",
            flex: "1 0 0",
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              height: "36px",
              padding: "7px 10px",
              alignItems: "center",
              gap: "3px",
              borderRadius: "6px",
              background:
                activeTab === "all"
                  ? "rgba(32, 36, 55, 0.05)"
                  : "rgba(32, 36, 55, 0.00)",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("all")}
          >
            <span
              style={{
                color: activeTab === "all" ? "#202437" : "#797E8B",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              All Documents
            </span>
            <span
              style={{
                color: "#A0A3AF",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              {stats.all}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              height: "36px",
              padding: "8px 10px",
              justifyContent: "center",
              alignItems: "center",
              gap: "3px",
              borderRadius: "6px",
              background:
                activeTab === "expiring"
                  ? "rgba(32, 36, 55, 0.05)"
                  : "rgba(32, 36, 55, 0.00)",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("expiring")}
          >
            <span
              style={{
                color: activeTab === "expiring" ? "#202437" : "#797E8B",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              Expiring
            </span>
            <span
              style={{
                color: "#A0A3AF",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              {stats.expiring}
            </span>
          </div>

          <div
            style={{
              display: "flex",
              height: "36px",
              padding: "8px 10px",
              justifyContent: "center",
              alignItems: "center",
              gap: "3px",
              borderRadius: "6px",
              background:
                activeTab === "archive"
                  ? "rgba(32, 36, 55, 0.05)"
                  : "rgba(32, 36, 55, 0.00)",
              cursor: "pointer",
            }}
            onClick={() => setActiveTab("archive")}
          >
            <span
              style={{
                color: activeTab === "archive" ? "#202437" : "#797E8B",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              Archive
            </span>
            <span
              style={{
                color: "#A0A3AF",
                fontFamily:
                  "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "500",
                lineHeight: "20px",
              }}
            >
              {stats.expired}
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <button
            style={{
              display: "flex",
              minWidth: "100px",
              minHeight: "36px",
              padding: "8px 20px",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              borderRadius: "6px",
              background: "#5D51E2",
              border: "none",
              cursor: "pointer",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M15 7H9V1C9 0.734784 8.89464 0.48043 8.70711 0.292893C8.51957 0.105357 8.26522 0 8 0C7.73478 0 7.48043 0.105357 7.29289 0.292893C7.10536 0.48043 7 0.734784 7 1V7H1C0.734784 7 0.48043 7.10536 0.292893 7.29289C0.105357 7.48043 0 7.73478 0 8C0 8.26522 0.105357 8.51957 0.292893 8.70711C0.48043 8.89464 0.734784 9 1 9H7V15C7 15.2652 7.10536 15.5196 7.29289 15.7071C7.48043 15.8946 7.73478 16 8 16C8.26522 16 8.51957 15.8946 8.70711 15.7071C8.89464 15.5196 9 15.2652 9 15V9H15C15.2652 9 15.5196 8.89464 15.7071 8.70711C15.8946 8.51957 16 8.26522 16 8C16 7.73478 15.8946 7.48043 15.7071 7.29289C15.5196 7.10536 15.2652 7 15 7Z"
                fill="white"
              />
            </svg>
            <span
              style={{
                color: "#FFF",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
              }}
            >
              Add Document
            </span>
          </button>
        </div>
      </div>

      {/* Big Filter Section */}
      <div
        style={{
          display: "flex",
          width: "calc(100% - 40px)",
          maxWidth: "1400px",
          height: "50px",
          padding: "10px",
          alignItems: "flex-start",
          gap: "10px",
          flexShrink: 0,
          borderRadius: "6px 6px 0px 0px",
          border: "1px solid #EBECF1",
          background: "#FFF",
          margin: "0 20px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "1 0 0",
          }}
        >
          {/* Search Input */}
          <div
            style={{
              display: "flex",
              width: "300px",
              height: "30px",
              padding: "0px 10px",
              alignItems: "center",
              gap: "10px",
              borderRadius: "6px",
              border: "1px solid #C6C8D1",
              background: "#FFF",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M13.8685 13.2476L10.0029 9.38194C10.9587 8.26559 11.4451 6.82244 11.3599 5.35527C11.2747 3.8881 10.6246 2.51092 9.54607 1.51267C8.46749 0.514412 7.04422 -0.0273414 5.57485 0.00106307C4.10548 0.0294676 2.70421 0.625823 1.66502 1.66502C0.625823 2.70421 0.0294676 4.10548 0.00106307 5.57485C-0.0273414 7.04422 0.514412 8.46749 1.51267 9.54607C2.51092 10.6246 3.8881 11.2747 5.35527 11.3599C6.82244 11.4451 8.26559 10.9587 9.38194 10.0029L13.2476 13.8685C13.2882 13.9095 13.3366 13.942 13.3899 13.9642C13.4431 13.9864 13.5003 13.9978 13.558 13.9978C13.6157 13.9978 13.6729 13.9864 13.7262 13.9642C13.7795 13.942 13.8278 13.9095 13.8685 13.8685C13.9095 13.8278 13.942 13.7795 13.9642 13.7262C13.9864 13.6729 13.9978 13.6157 13.9978 13.558C13.9978 13.5003 13.9864 13.4431 13.9642 13.3899C13.942 13.3366 13.9095 13.2882 13.8685 13.2476ZM5.68687 10.497C4.73552 10.497 3.80552 10.2149 3.0145 9.68637C2.22348 9.15782 1.60695 8.40658 1.24288 7.52764C0.87881 6.6487 0.783553 5.68154 0.969154 4.74846C1.15475 3.81538 1.61288 2.9583 2.28559 2.28559C2.9583 1.61288 3.81538 1.15475 4.74846 0.969154C5.68154 0.783553 6.6487 0.87881 7.52764 1.24288C8.40658 1.60695 9.15782 2.22348 9.68637 3.0145C10.2149 3.80552 10.497 4.73552 10.497 5.68687C10.497 6.9626 9.99024 8.18608 9.08816 9.08816C8.18608 9.99024 6.9626 10.497 5.68687 10.497Z"
                fill="#C6C8D1"
              />
            </svg>
            <input
              type="text"
              placeholder="Search file name"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
                WebkitLineClamp: 1,
                flex: "1 0 0",
                overflow: "hidden",
                color: searchTerm ? "#202437" : "#C6C8D1",
                textOverflow: "ellipsis",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
                border: "none",
                outline: "none",
                background: "transparent",
              }}
            />
          </div>

          {/* Filter Items */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: "10px",
            }}
          >
            <div
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.00)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  Type:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  {selectedType}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25467L0.859047 4.14342C0.789203 4.07316 0.75 3.97812 0.75 3.87905C0.75 3.77998 0.789203 3.68494 0.859047 3.61467C0.893908 3.57953 0.935384 3.55163 0.981081 3.53259C1.02678 3.51355 1.07579 3.50375 1.1253 3.50375C1.1748 3.50375 1.22382 3.51355 1.26951 3.53259C1.31521 3.55163 1.35669 3.57953 1.39155 3.61467L6.0003 8.19717L10.609 3.61092C10.6439 3.57578 10.6854 3.54788 10.7311 3.52884C10.7768 3.5098 10.8258 3.5 10.8753 3.5C10.9248 3.5 10.9738 3.5098 11.0195 3.52884C11.0652 3.54788 11.1067 3.57578 11.1415 3.61092C11.2114 3.68119 11.2506 3.77623 11.2506 3.8753C11.2506 3.97437 11.2114 4.06941 11.1415 4.13967L6.0003 9.25467Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.00)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  Status:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  {selectedStatus}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25467L0.859047 4.14342C0.789203 4.07316 0.75 3.97812 0.75 3.87905C0.75 3.77998 0.789203 3.68494 0.859047 3.61467C0.893908 3.57953 0.935384 3.55163 0.981081 3.53259C1.02678 3.51355 1.07579 3.50375 1.1253 3.50375C1.1748 3.50375 1.22382 3.51355 1.26951 3.53259C1.31521 3.55163 1.35669 3.57953 1.39155 3.61467L6.0003 8.19717L10.609 3.61092C10.6439 3.57578 10.6854 3.54788 10.7311 3.52884C10.7768 3.5098 10.8258 3.5 10.8753 3.5C10.9248 3.5 10.9738 3.5098 11.0195 3.52884C11.0652 3.54788 11.1067 3.57578 11.1415 3.61092C11.2114 3.68119 11.2506 3.77623 11.2506 3.8753C11.2506 3.97437 11.2114 4.06941 11.1415 4.13967L6.0003 9.25467Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.00)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  Property:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  {selectedProperty}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25467L0.859047 4.14342C0.789203 4.07316 0.75 3.97812 0.75 3.87905C0.75 3.77998 0.789203 3.68494 0.859047 3.61467C0.893908 3.57953 0.935384 3.55163 0.981081 3.53259C1.02678 3.51355 1.07579 3.50375 1.1253 3.50375C1.1748 3.50375 1.22382 3.51355 1.26951 3.53259C1.31521 3.55163 1.35669 3.57953 1.39155 3.61467L6.0003 8.19717L10.609 3.61092C10.6439 3.57578 10.6854 3.54788 10.7311 3.52884C10.7768 3.5098 10.8258 3.5 10.8753 3.5C10.9248 3.5 10.9738 3.5098 11.0195 3.52884C11.0652 3.54788 11.1067 3.57578 11.1415 3.61092C11.2114 3.68119 11.2506 3.77623 11.2506 3.8753C11.2506 3.97437 11.2114 4.06941 11.1415 4.13967L6.0003 9.25467Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>

            <div
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                background: "rgba(255, 255, 255, 0.00)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                }}
              >
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  Create Date:
                </span>
                <span
                  style={{
                    color: "#515666",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "510",
                    lineHeight: "20px",
                  }}
                >
                  {selectedDate}
                </span>
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25467L0.859047 4.14342C0.789203 4.07316 0.75 3.97812 0.75 3.87905C0.75 3.77998 0.789203 3.68494 0.859047 3.61467C0.893908 3.57953 0.935384 3.55163 0.981081 3.53259C1.02678 3.51355 1.07579 3.50375 1.1253 3.50375C1.1748 3.50375 1.22382 3.51355 1.26951 3.53259C1.31521 3.55163 1.35669 3.57953 1.39155 3.61467L6.0003 8.19717L10.609 3.61092C10.6439 3.57578 10.6854 3.54788 10.7311 3.52884C10.7768 3.5098 10.8258 3.5 10.8753 3.5C10.9248 3.5 10.9738 3.5098 11.0195 3.52884C11.0652 3.54788 11.1067 3.57578 11.1415 3.61092C11.2114 3.68119 11.2506 3.77623 11.2506 3.8753C11.2506 3.97437 11.2114 4.06941 11.1415 4.13967L6.0003 9.25467Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          width: "calc(100% - 40px)",
          maxWidth: "1400px",
          height: "594px",
          flexShrink: 0,
          borderRadius: "0px 0px 6px 6px",
          borderRight: "1px solid #EBECF1",
          borderBottom: "1px solid #EBECF1",
          borderLeft: "1px solid #EBECF1",
          background: "#FFF",
          margin: "0 20px",
          position: "relative",
        }}
      >
        {/* Table Header */}
        <div
          style={{
            display: "flex",
            width: "calc(100% - 40px)",
            alignItems: "center",
            position: "absolute",
            left: "20px",
            top: "0px",
            height: "44px",
          }}
        >
          <div
            style={{
              display: "flex",
              width: "220px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              File Name
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "180px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
              marginLeft: "40px",
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Property
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "160px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Type
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "120px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Valid Until
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "100px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Status
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "160px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Sharing
            </span>
          </div>
          <div
            style={{
              display: "flex",
              width: "120px",
              padding: "12px 0px",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Create Date
            </span>
            <div
              style={{
                display: "flex",
                width: "10px",
                height: "16px",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                flexShrink: 0,
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
              display: "flex",
              width: "120px",
              padding: "12px 0px",
              justifyContent: "center",
              alignItems: "center",
              gap: "10px",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: "#202437",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "700",
                lineHeight: "20px",
              }}
            >
              Action
            </span>
          </div>
        </div>

        {/* Empty state or data */}
        {filteredDocuments.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px",
              color: "#797E8B",
              position: "absolute",
              left: "20px",
              top: "100px",
              width: "calc(100% - 40px)",
            }}
          >
            <span>No documents found</span>
          </div>
        ) : (
          <>
            {/* Sample Data Rows - showing layout exactly as Figma */}
            {filteredDocuments
              .slice(0, 9)
              .map((document: any, index: number) => (
                <div
                  key={document.id}
                  style={{
                    position: "absolute",
                    left: "20px",
                    top: `${64 + index * 59}px`,
                    width: "calc(100% - 40px)",
                    height: "59px",
                    borderBottom: index < 8 ? "1px solid #EBECF1" : "none",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {/* File Name Column */}
                  <div
                    style={{
                      width: "220px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    {renderFileIcon(document.file_type)}
                    <span
                      style={{
                        display: "-webkit-box",
                        width: "190px",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 1,
                        overflow: "hidden",
                        color: "#515666",
                        textOverflow: "ellipsis",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {document.file_name}
                    </span>
                  </div>

                  {/* Property Column */}
                  <div
                    style={{
                      width: "180px",
                      marginLeft: "40px",
                    }}
                  >
                    <span
                      style={{
                        display: "-webkit-box",
                        width: "180px",
                        WebkitBoxOrient: "vertical",
                        WebkitLineClamp: 1,
                        overflow: "hidden",
                        color: "#515666",
                        textOverflow: "ellipsis",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {document.property}
                    </span>
                  </div>

                  {/* Type Column */}
                  <div
                    style={{
                      width: "160px",
                    }}
                  >
                    <span
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {document.document_type}
                    </span>
                  </div>

                  {/* Valid Until Column */}
                  <div
                    style={{
                      width: "120px",
                    }}
                  >
                    <span
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {formatValidUntil(document.valid_until)}
                    </span>
                  </div>

                  {/* Status Column */}
                  <div
                    style={{
                      width: "100px",
                    }}
                  >
                    {renderStatusBadge(document.status)}
                  </div>

                  {/* Sharing Column */}
                  <div
                    style={{
                      width: "160px",
                    }}
                  >
                    {renderSharingIcons(document.sharing)}
                  </div>

                  {/* Create Date Column */}
                  <div
                    style={{
                      width: "120px",
                    }}
                  >
                    <span
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {formatDate(document.create_date)}
                    </span>
                  </div>

                  {/* Action Column */}
                  <div
                    style={{
                      width: "120px",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    {renderActionButtons()}
                  </div>
                </div>
              ))}
          </>
        )}

        {/* Table borders */}
        <div
          style={{
            width: "100%",
            height: "1px",
            background: "#EBECF1",
            position: "absolute",
            left: "0px",
            top: "44px",
          }}
        />

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
            position: "absolute",
            left: "0px",
            top: "538px",
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
            {/* Page Numbers */}
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
                    minHeight: "30px",
                    padding: "5px 8px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    background: "#FFF",
                    cursor: "pointer",
                  }}
                  onClick={() => setCurrentPage(page)}
                >
                  <span
                    style={{
                      color: currentPage === page ? "#5D51E2" : "#515666",
                      textAlign: "center",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: currentPage === page ? "700" : "400",
                      lineHeight: "20px",
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
                  minHeight: "30px",
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
                    textAlign: "center",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
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
                  minHeight: "30px",
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
                    textAlign: "center",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
                  }}
                >
                  99
                </span>
              </div>
            </div>

            {/* Separator */}
            <div
              style={{
                width: "1px",
                height: "24px",
                background: "#EBECF1",
              }}
            />

            {/* Right Controls */}
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
                <input
                  type="text"
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(e.target.value)}
                  style={{
                    color: "#202437",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    textAlign: "center",
                    width: "20px",
                  }}
                />
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
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(parseInt(e.target.value))}
                  style={{
                    color: "#202437",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
                    border: "none",
                    outline: "none",
                    background: "transparent",
                    width: "40px",
                  }}
                >
                  <option value="25">25</option>
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M6.0003 9.25467L0.859047 4.14342C0.789203 4.07316 0.75 3.97812 0.75 3.87905C0.75 3.77998 0.789203 3.68494 0.859047 3.61467C0.893908 3.57953 0.935384 3.55163 0.981081 3.53259C1.02678 3.51355 1.07579 3.50375 1.1253 3.50375C1.1748 3.50375 1.22382 3.51355 1.26951 3.53259C1.31521 3.55163 1.35669 3.57953 1.39155 3.61467L6.0003 8.19717L10.609 3.61092C10.6439 3.57578 10.6854 3.54788 10.7311 3.52884C10.7768 3.5098 10.8258 3.5 10.8753 3.5C10.9248 3.5 10.9738 3.5098 11.0195 3.52884C11.0652 3.54788 11.1067 3.57578 11.1415 3.61092C11.2114 3.68119 11.2506 3.77623 11.2506 3.8753C11.2506 3.97437 11.2114 4.06941 11.1415 4.13967L6.0003 9.25467Z"
                    fill="#C6C8D1"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
