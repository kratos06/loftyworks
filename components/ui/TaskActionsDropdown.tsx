"use client";

import React, { useState, useRef, useEffect } from "react";

interface TaskActionsDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  position: { x: number; y: number };
  onEdit: () => void;
  onToggleComplete: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onMoveToCategory: (category: string) => void;
  onSetPriority: (priority: string) => void;
  onSetDueDate: () => void;
  isCompleted?: boolean;
}

export default function TaskActionsDropdown({
  isOpen,
  onClose,
  position,
  onEdit,
  onToggleComplete,
  onDelete,
  onDuplicate,
  onMoveToCategory,
  onSetPriority,
  onSetDueDate,
  isCompleted = false,
}: TaskActionsDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [showMoveSubmenu, setShowMoveSubmenu] = useState(false);
  const [showPrioritySubmenu, setShowPrioritySubmenu] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen, onClose]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      if (event.key === "Escape") {
        onClose();
      } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        // Focus management for menu items could be implemented here
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M15.805 1.40583C15.655 1.1194 15.4571 0.860701 15.22 0.640876C15.0102 0.440968 14.7664 0.280121 14.5 0.165903C14.2591 0.0588351 13.9986 0.00266554 13.735 0.000912236C13.3669 -0.0107937 13.004 0.0903954 12.695 0.290896C12.499 0.413828 12.3134 0.552618 12.14 0.705872C12.08 0.755869 11.69 1.14585 10.97 1.86581C10.25 2.58576 9.47 3.36572 8.625 4.21067L6.32 6.50054L5.28 7.53548C5.253 7.56427 5.2295 7.59616 5.21 7.63048C5.19456 7.66121 5.1812 7.69295 5.17 7.72547C5.12 7.89046 5.035 8.17045 4.92 8.57042C4.805 8.9704 4.69 9.37038 4.56 9.78036C4.43 10.1903 4.325 10.5553 4.225 10.8753C4.125 11.1953 4.08 11.3753 4.08 11.3753C4.05486 11.4482 4.05486 11.5274 4.08 11.6003C4.09625 11.6748 4.13458 11.7428 4.19 11.7952C4.22777 11.8384 4.27597 11.8711 4.33 11.8902C4.3792 11.9103 4.43187 11.9205 4.485 11.9202H4.545H4.61L5.11 11.7552L6.22 11.4003L7.42 11.0153C7.805 10.8903 8.06 10.8103 8.19 10.7803C8.22027 10.7693 8.24887 10.7541 8.275 10.7353L8.36 10.6703L9.5 9.53037C10.185 8.85541 10.93 8.11545 11.745 7.3205L14 5.08062C14.71 4.38066 15.12 3.97069 15.235 3.84569C15.4719 3.60787 15.6679 3.3325 15.815 3.03074C15.9354 2.7776 15.9985 2.50107 16 2.22079C15.9942 1.93829 15.9277 1.66036 15.805 1.40583ZM14.9 2.66576C14.8041 2.85109 14.6792 3.01989 14.53 3.16573C14.47 3.24073 14.285 3.42572 13.975 3.7307L12.705 4.96063C12.16 5.4956 11.505 6.15056 10.705 6.91552L8.04 9.54537L7.73 9.84535L6.675 10.1803L5.34 10.6103C5.475 10.1703 5.615 9.71536 5.755 9.24039C5.895 8.76541 6 8.40043 6.075 8.14045C6.28 7.93046 6.745 7.47549 7.455 6.76553L9.69 4.54065L12.825 1.40583C12.9174 1.3286 13.0142 1.25681 13.115 1.19084C13.2932 1.05714 13.5125 0.989938 13.735 1.00086C13.8739 1.00068 14.011 1.03323 14.135 1.09585C14.2804 1.16805 14.4137 1.26252 14.53 1.37583C14.6716 1.50015 14.7916 1.64714 14.885 1.81081C14.9557 1.94262 14.9998 2.087 15.015 2.23578C15.0095 2.38593 14.9702 2.53289 14.9 2.66576ZM12.5 15.0001H1V2.50077H8.5L9.5 1.50083H1C0.734784 1.50083 0.48043 1.60618 0.292893 1.7937C0.105357 1.98123 0 2.23557 0 2.50077L0 15.0001C0 15.2653 0.105357 15.5196 0.292893 15.7071C0.48043 15.8946 0.734784 16 1 16H12.5C12.7652 16 13.0196 15.8946 13.2071 15.7071C13.3946 15.5196 13.5 15.2653 13.5 15.0001V7.00051L12.5 8.00046V15.0001Z"
            fill="var(--solid-black-515666)"
          />
        </svg>
      ),
      label: "Edit task details",
      action: () => {
        onEdit();
        onClose();
      },
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 15C11.866 15 15 11.866 15 8C15 4.134 11.866 1 8 1C4.134 1 1 4.134 1 8C1 11.866 4.134 15 8 15Z"
            stroke={
              isCompleted
                ? "var(--solid-orange-ffa600)"
                : "var(--solid-green-20c472)"
            }
            strokeWidth="2"
            fill={isCompleted ? "none" : "var(--solid-green-20c472)"}
          />
          {!isCompleted && (
            <path
              d="M5.5 8L7 9.5L10.5 6"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </svg>
      ),
      label: isCompleted ? "Mark as incomplete" : "Mark as complete",
      action: () => {
        onToggleComplete();
        onClose();
      },
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M14.5 2H10.5V1C10.5 0.734784 10.3946 0.48043 10.2071 0.292893C10.0196 0.105357 9.76522 0 9.5 0L6.5 0C6.23478 0 5.98043 0.105357 5.79289 0.292893C5.60536 0.48043 5.5 0.734784 5.5 1V2H1.5C1.36739 2 1.24021 2.05268 1.14645 2.14645C1.05268 2.24021 1 2.36739 1 2.5C1 2.63261 1.05268 2.75979 1.14645 2.85355C1.24021 2.94732 1.36739 3 1.5 3H2.535L2.965 15.035C2.97407 15.2941 3.08342 15.5396 3.26999 15.7196C3.45655 15.8996 3.70574 16.0002 3.965 16H12.035C12.2943 16.0002 12.5435 15.8996 12.73 15.7196C12.9166 15.5396 13.0259 15.2941 13.035 15.035L13.465 3H14.5C14.6326 3 14.7598 2.94732 14.8536 2.85355C14.9473 2.75979 15 2.63261 15 2.5C15 2.36739 14.9473 2.24021 14.8536 2.14645C14.7598 2.05268 14.6326 2 14.5 2ZM6.5 1H9.5V2H6.5V1ZM12 15H4L3.5 3H12.5L12 15Z"
            fill="var(--solid-red-f0454c)"
          />
        </svg>
      ),
      label: "Delete task",
      action: () => {
        onDelete();
        onClose();
      },
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M11 1H13C13.2652 1 13.5196 1.10536 13.7071 1.29289C13.8946 1.48043 14 1.73478 14 2V14C14 14.2652 13.8946 14.5196 13.7071 14.7071C13.5196 14.8946 13.2652 15 13 15H3C2.73478 15 2.48043 14.8946 2.29289 14.7071C2.10536 14.5196 2 14.2652 2 14V2C2 1.73478 2.10536 1.48043 2.29289 1.29289C2.48043 1.10536 2.73478 1 3 1H5M11 1C11 1.26522 10.8946 1.51957 10.7071 1.70711C10.5196 1.89464 10.2652 2 10 2H6C5.73478 2 5.48043 1.89464 5.29289 1.70711C5.10536 1.51957 5 1.26522 5 1M11 1C11 0.734784 10.8946 0.48043 10.7071 0.292893C10.5196 0.105357 10.2652 0 10 0H6C5.73478 0 5.48043 0.105357 5.29289 0.292893C5.10536 0.48043 5 0.734784 5 1"
            stroke="var(--solid-black-515666)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Duplicate task",
      action: () => {
        onDuplicate();
        onClose();
      },
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M8 1L6.83 4.28L3 4.76L5.71 7.16L4.96 11L8 9.28L11.04 11L10.29 7.16L13 4.76L9.17 4.28L8 1Z"
            stroke="var(--solid-orange-ffa600)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Set priority level",
      action: () => setShowPrioritySubmenu(true),
      hasSubmenu: true,
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M1 4C1 3.73478 1.10536 3.48043 1.29289 3.29289C1.48043 3.10536 1.73478 3 2 3H14C14.2652 3 14.5196 3.10536 14.7071 3.29289C14.8946 3.48043 15 3.73478 15 4V12C15 12.2652 14.8946 12.5196 14.7071 12.7071C14.5196 12.8946 14.2652 13 14 13H2C1.73478 13 1.48043 12.8946 1.29289 12.7071C1.10536 12.5196 1 12.2652 1 12V4Z"
            stroke="var(--solid-black-515666)"
            strokeWidth="1.5"
          />
          <path
            d="M15 6L8 10L1 6"
            stroke="var(--solid-black-515666)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ),
      label: "Move",
      action: () => setShowMoveSubmenu(true),
      hasSubmenu: true,
    },
    {
      icon: (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path
            d="M14 2H13V1C13 0.734784 12.8946 0.48043 12.7071 0.292893C12.5196 0.105357 12.2652 0 12 0C11.7348 0 11.4804 0.105357 11.2929 0.292893C11.1054 0.48043 11 0.734784 11 1V2H5V1C5 0.734784 4.89464 0.48043 4.70711 0.292893C4.51957 0.105357 4.26522 0 4 0C3.73478 0 3.48043 0.105357 3.29289 0.292893C3.10536 0.48043 3 0.734784 3 1V2H2C1.46957 2 0.960859 2.21071 0.585786 2.58579C0.210714 2.96086 0 3.46957 0 4L0 14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V4C16 3.46957 15.7893 2.96086 15.4142 2.58579C15.0391 2.21071 14.5304 2 14 2Z"
            fill="var(--solid-black-515666)"
          />
        </svg>
      ),
      label: "Set due date",
      action: () => {
        onSetDueDate();
        onClose();
      },
    },
  ];

  const categories = ["To Do", "In Progress", "Done", "Cancelled"];
  const priorities = ["Low", "Medium", "High", "Urgent"];

  return (
    <div
      ref={dropdownRef}
      className="task-actions-dropdown"
      style={{
        position: "fixed",
        left: `${position.x}px`,
        top: `${position.y}px`,
        zIndex: 1000,
        display: "flex",
        width: "200px",
        padding: "6px 0px",
        flexDirection: "column",
        alignItems: "flex-start",
        borderRadius: "6px",
        border: "1px solid var(--solid-black-e1e2e6)",
        backgroundColor: "var(--solid-black-ffffff)",
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.12)",
      }}
    >
      {!showMoveSubmenu && !showPrioritySubmenu ? (
        <>
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={item.action}
              style={{
                display: "flex",
                height: "36px",
                padding: "0px 16px",
                alignItems: "center",
                gap: "10px",
                alignSelf: "stretch",
                backgroundColor: "var(--solid-black-ffffff)",
                cursor: "pointer",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-f6f7fb)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-ffffff)";
              }}
            >
              <span style={{ flexShrink: 0 }}>{item.icon}</span>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  flex: "1 0 0",
                }}
              >
                <div
                  style={{
                    color: "var(--solid-black-515666)",
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "400",
                    lineHeight: "20px",
                  }}
                >
                  {item.label}
                </div>
              </div>
              {item.hasSubmenu && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M4.5 2.25L7.5 6L4.5 9.75"
                    stroke="var(--solid-black-a0a3af)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          ))}
        </>
      ) : showMoveSubmenu ? (
        <>
          <div
            onClick={() => setShowMoveSubmenu(false)}
            style={{
              display: "flex",
              height: "36px",
              padding: "0px 16px",
              alignItems: "center",
              gap: "10px",
              alignSelf: "stretch",
              backgroundColor: "var(--solid-black-ffffff)",
              cursor: "pointer",
              borderBottom: "1px solid var(--solid-black-ebecf1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--solid-black-f6f7fb)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--solid-black-ffffff)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M7.5 9.75L4.5 6L7.5 2.25"
                stroke="var(--solid-black-a0a3af)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              style={{
                color: "var(--solid-black-515666)",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
              }}
            >
              Back
            </div>
          </div>
          {categories.map((category, index) => (
            <div
              key={index}
              onClick={() => {
                onMoveToCategory(category);
                onClose();
              }}
              style={{
                display: "flex",
                height: "36px",
                padding: "0px 16px",
                alignItems: "center",
                gap: "10px",
                alignSelf: "stretch",
                backgroundColor: "var(--solid-black-ffffff)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-f6f7fb)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-ffffff)";
              }}
            >
              <div
                style={{
                  color: "var(--solid-black-515666)",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "400",
                  lineHeight: "20px",
                }}
              >
                {category}
              </div>
            </div>
          ))}
        </>
      ) : (
        <>
          <div
            onClick={() => setShowPrioritySubmenu(false)}
            style={{
              display: "flex",
              height: "36px",
              padding: "0px 16px",
              alignItems: "center",
              gap: "10px",
              alignSelf: "stretch",
              backgroundColor: "var(--solid-black-ffffff)",
              cursor: "pointer",
              borderBottom: "1px solid var(--solid-black-ebecf1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--solid-black-f6f7fb)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "var(--solid-black-ffffff)";
            }}
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M7.5 9.75L4.5 6L7.5 2.25"
                stroke="var(--solid-black-a0a3af)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div
              style={{
                color: "var(--solid-black-515666)",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
              }}
            >
              Back
            </div>
          </div>
          {priorities.map((priority, index) => (
            <div
              key={index}
              onClick={() => {
                onSetPriority(priority);
                onClose();
              }}
              style={{
                display: "flex",
                height: "36px",
                padding: "0px 16px",
                alignItems: "center",
                gap: "10px",
                alignSelf: "stretch",
                backgroundColor: "var(--solid-black-ffffff)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-f6f7fb)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-ffffff)";
              }}
            >
              <div
                style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor:
                    priority === "Low"
                      ? "var(--solid-green-20c472)"
                      : priority === "Medium"
                        ? "var(--solid-orange-ffa600)"
                        : priority === "High"
                          ? "var(--solid-red-f0454c)"
                          : "var(--solid-sales-theme-5d51e2)",
                }}
              />
              <div
                style={{
                  color: "var(--solid-black-515666)",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "400",
                  lineHeight: "20px",
                }}
              >
                {priority}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
