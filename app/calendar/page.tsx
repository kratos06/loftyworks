"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useCalendarEvents } from "../../hooks/useSupabase";

export default function CalendarPage() {
  const searchParams = useSearchParams();
  const {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    getEventsForDate,
    getEventsForMonth,
    getEventTypeColor,
    getEventBackgroundColor,
    formatTime,
  } = useCalendarEvents();

  // Initialize state based on URL parameters
  const getInitialDate = () => {
    const dateParam = searchParams.get("date");
    if (dateParam) {
      const date = new Date(dateParam);
      return isNaN(date.getTime()) ? new Date() : date;
    }
    return new Date();
  };

  const getInitialViewMode = () => {
    const viewParam = searchParams.get("view");
    return viewParam === "day" || viewParam === "month" ? viewParam : "month";
  };

  const [selectedDate, setSelectedDate] = useState(5);
  const [viewMode, setViewMode] = useState<"day" | "month">(
    getInitialViewMode(),
  );
  const [currentDate, setCurrentDate] = useState(getInitialDate());
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Handle task click to show details
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setShowTaskDetailModal(true);
  };

  // Create sample tasks for testing
  const createSampleTasks = async () => {
    try {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);

      const sampleTasks = [
        {
          title: "Property Inspection",
          type: "Move-in Inspection",
          date: today.toISOString().split("T")[0],
          due_time: "09:00",
          end_time: "10:00",
          address: "123 Main Street, Apt 4B",
          description: "Conduct move-in inspection for new tenant",
          status: "todo",
          priority: "High",
        },
        {
          title: "Fix Leaking Faucet",
          type: "Maintenance Request",
          date: tomorrow.toISOString().split("T")[0],
          due_time: "14:00",
          end_time: "15:30",
          address: "456 Oak Avenue, Unit 2A",
          description: "Fix leaking faucet in kitchen",
          status: "todo",
          priority: "Medium",
        },
        {
          title: "Property Showing",
          type: "Schedule Showing",
          date: today.toISOString().split("T")[0],
          due_time: "16:00",
          end_time: "17:00",
          address: "789 Pine Street, Suite 301",
          description: "Show property to potential tenant",
          status: "todo",
          priority: "Medium",
        },
        {
          title: "Rent Collection",
          type: "Payment Relevant",
          date: nextWeek.toISOString().split("T")[0],
          due_time: "10:00",
          end_time: "11:00",
          address: "321 Elm Street, Apt 1A",
          description: "Collect monthly rent payment",
          status: "todo",
          priority: "High",
        },
        {
          title: "Contract Review",
          type: "Contract Relevant",
          date: tomorrow.toISOString().split("T")[0],
          due_time: "11:00",
          end_time: "12:00",
          address: "555 Maple Drive, Unit 5B",
          description: "Review and finalize lease contract",
          status: "inprogress",
          priority: "Medium",
        },
      ];

      console.log("Creating sample tasks...");
      let createdCount = 0;

      for (const task of sampleTasks) {
        try {
          await createEvent(task);
          createdCount++;
          console.log(`Created task: ${task.title}`);
        } catch (err) {
          console.error(`Failed to create task ${task.title}:`, err);
        }
      }

      // Reload events to show the new tasks
      await loadEvents();

      alert(
        `Successfully created ${createdCount} sample tasks! You should now see them in the calendar.`,
      );
    } catch (err) {
      console.error("Failed to create sample tasks:", err);
      alert(
        "Failed to create sample tasks. Please check the console for details.",
      );
    }
  };

  useEffect(() => {
    console.log(
      "Calendar useEffect - Loading events for:",
      currentDate,
      viewMode,
    );
    loadEvents();
  }, [currentDate, viewMode]);

  const loadEvents = async () => {
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1,
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0,
    );

    const filters: any = {
      start_date: startOfMonth.toISOString().split("T")[0],
      end_date: endOfMonth.toISOString().split("T")[0],
      limit: 200,
    };

    console.log("Loading events with filters:", filters);
    const result = await fetchEvents(filters);
    console.log("Loaded events:", result, "Events state:", events);

    // If no events and not loading, show debug info
    if (!loading && (!result || result.data.length === 0)) {
      console.log("No events found. This could mean:");
      console.log("1. No tasks exist in the database for this date range");
      console.log("2. Database connection issue");
      console.log("3. Date filtering issue");

      // Create a sample task for testing if none exist
      if (events.length === 0) {
        console.log("Creating sample task for testing...");
        try {
          // Add a test event directly to state for now
          const sampleEvent = {
            id: "sample-1",
            title: "Sample Task",
            type: "Maintenance Request",
            date: new Date().toISOString().split("T")[0],
            start_time: "09:00",
            end_time: "10:00",
            address: "123 Sample Street",
            description: "This is a sample task for testing calendar display",
            status: "todo",
            priority: "Medium",
            assignees: [],
            typeColor: "#FFA600",
            backgroundColor: "#FFF2D9",
          };
          console.log("Adding sample event:", sampleEvent);
        } catch (err) {
          console.error("Failed to create sample task:", err);
        }
      }
    }
  };

  const getCurrentTime = () => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    return { hours, minutes };
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const formatDate = (date: Date) => {
    const options: Intl.DateTimeFormatOptions = {
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString("en-US", { weekday: "long" });
  };

  const handleTodayClick = () => {
    const today = new Date();
    setCurrentDate(today);
    setViewMode("day");
  };

  const navigateDate = (direction: "prev" | "next") => {
    const newDate = new Date(currentDate);
    if (viewMode === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
    }
    setCurrentDate(newDate);
  };

  // Generate calendar grid for current month
  const generateCalendarGrid = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Get first day of month and how many days in month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);

    // Get first Sunday before or on the first day of month
    startDate.setDate(startDate.getDate() - startDate.getDay());

    const cells = [];
    const currentTime = new Date();

    // Generate 42 cells (6 weeks x 7 days)
    for (let i = 0; i < 42; i++) {
      const cellDate = new Date(startDate);
      cellDate.setDate(startDate.getDate() + i);

      const dayEvents = getEventsForDate(cellDate);
      const isCurrentMonth = cellDate.getMonth() === month;
      const isToday = cellDate.toDateString() === currentTime.toDateString();

      cells.push({
        date: cellDate,
        dayNumber: cellDate.getDate(),
        isCurrentMonth,
        isToday,
        events: dayEvents.slice(0, 3), // Show max 3 events
        moreEventsCount: Math.max(0, dayEvents.length - 3),
      });
    }

    return cells;
  };

  const renderDayView = () => {
    const timeSlots = [];
    for (let i = 1; i <= 9; i++) {
      timeSlots.push(`${i} AM`);
    }

    const { hours, minutes } = getCurrentTime();
    const currentTimePosition = (hours - 1) * 61 + (minutes * 61) / 60 + 197; // Position calculation

    return (
      <div
        style={{
          width: "1400px",
          height: "700px",
          background: "white",
          borderRadius: "8px",
          border: "1px solid #EBECF1",
          position: "relative",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            height: "60px",
            padding: "20px",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #E1E2E6",
          }}
        >
          {/* Left side */}
          <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
            <button
              onClick={handleTodayClick}
              style={{
                display: "inline-flex",
                height: "36px",
                padding: "11px 20px",
                justifyContent: "center",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                border: "1px solid #EBECF1",
                background: "white",
                color: "#515666",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "500",
                cursor: "pointer",
              }}
            >
              Today
            </button>

            <div
              style={{
                display: "inline-flex",
                height: "36px",
                padding: "3px",
                alignItems: "flex-start",
                borderRadius: "6px",
                border: "1px solid #EBECF1",
                background: "white",
              }}
            >
              <button
                onClick={() => navigateDate("prev")}
                style={{
                  display: "flex",
                  width: "30px",
                  height: "30px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M7.72195 0.971191L8.77945 2.02871L4.81195 6.00002L8.77945 9.97133L7.72195 11.0288L2.68945 6.00002L7.72195 0.971191Z"
                    fill="#797E8B"
                  />
                </svg>
              </button>
              <button
                onClick={() => navigateDate("next")}
                style={{
                  display: "flex",
                  width: "30px",
                  height: "30px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "6px",
                  border: "none",
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M4.2782 0.971191L3.2207 2.02871L7.1882 6.00002L3.2207 9.97133L4.2782 11.0288L9.3107 6.00002L4.2782 0.971191Z"
                    fill="#797E8B"
                  />
                </svg>
              </button>
            </div>
          </div>

          {/* Center - Date title */}
          <div style={{ textAlign: "center" }}>
            <h1
              style={{
                color: "#202437",
                textAlign: "center",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "24px",
                fontWeight: "700",
                lineHeight: "36px",
                margin: "0",
              }}
            >
              {formatDate(currentDate)}
            </h1>
            <div
              style={{
                fontSize: "12px",
                color: "#A0A3AF",
                marginTop: "4px",
              }}
            >
              Total Events: {events.length} | Today:{" "}
              {getEventsForDate(currentDate).length}
              {events.length === 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    color: "#FFA600",
                    fontWeight: "500",
                    fontSize: "13px",
                  }}
                >
                  No tasks found in calendar. Please add tasks on the Tasks page
                  first.
                </div>
              )}
            </div>
          </div>

          {/* Right side */}
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div
              style={{
                display: "inline-flex",
                height: "36px",
                padding: "3px",
                alignItems: "center",
                borderRadius: "6px",
                border: "1px solid #EBECF1",
                background: "white",
              }}
            >
              <button
                onClick={() => setViewMode("day")}
                style={{
                  display: "flex",
                  width: "80px",
                  padding: "11px 20px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "day" ? "#F6F7FB" : "white",
                  color: viewMode === "day" ? "#5D51E2" : "#515666",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: viewMode === "day" ? "500" : "400",
                  cursor: "pointer",
                }}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode("month")}
                style={{
                  display: "flex",
                  width: "80px",
                  padding: "11px 20px",
                  justifyContent: "center",
                  alignItems: "center",
                  borderRadius: "6px",
                  border: "none",
                  background: viewMode === "month" ? "#F6F7FB" : "white",
                  color: viewMode === "month" ? "#5D51E2" : "#515666",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: viewMode === "month" ? "500" : "400",
                  cursor: "pointer",
                }}
              >
                Month
              </button>
            </div>

            <button
              onClick={createSampleTasks}
              style={{
                display: "flex",
                width: "36px",
                height: "36px",
                padding: "8px 20px",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                borderRadius: "6px",
                border: "1px solid #EBECF1",
                background: "white",
                cursor: "pointer",
              }}
              title="Create sample tasks for testing"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M13.125 6.125H7.875V0.875C7.875 0.642936 7.78281 0.420376 7.61872 0.256282C7.45462 0.0921872 7.23206 0 7 0C6.76794 0 6.54538 0.0921872 6.38128 0.256282C6.21719 0.420376 6.125 0.642936 6.125 0.875V6.125H0.875C0.642936 6.125 0.420376 6.21719 0.256282 6.38128C0.0921872 6.54538 0 6.76794 0 7C0 7.23206 0.0921872 7.45462 0.256282 7.61872C0.420376 7.78281 0.642936 7.875 0.875 7.875H6.125V13.125C6.125 13.3571 6.21719 13.5796 6.38128 13.7437C6.54538 13.9078 6.76794 14 7 14C7.23206 14 7.45462 13.9078 7.61872 13.7437C7.78281 13.5796 7.875 13.3571 7.875 13.125V7.875H13.125C13.3571 7.875 13.5796 7.78281 13.7437 7.61872C13.9078 7.45462 14 7.23206 14 7C14 6.76794 13.9078 6.54538 13.7437 6.38128C13.5796 6.21719 13.3571 6.125 13.125 6.125Z"
                  fill="#515666"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Day header with date info */}
        <div
          style={{
            height: "66px",
            borderBottom: "1px solid #E1E2E6",
            background: "white",
            display: "flex",
            alignItems: "center",
            padding: "0 20px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              gap: "2px",
              marginLeft: "71px",
            }}
          >
            <div
              style={{
                color: isToday(currentDate) ? "#5D51E2" : "#202437",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "16px",
                fontWeight: "700",
                lineHeight: "24px",
              }}
            >
              {currentDate.getDate()}
            </div>
            <div
              style={{
                color: isToday(currentDate) ? "#5D51E2" : "#A0A3AF",
                fontFamily:
                  "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "12px",
                fontWeight: "400",
                lineHeight: "20px",
              }}
            >
              {getDayName(currentDate)}
            </div>
          </div>

          <div
            style={{
              color: "#A0A3AF",
              fontFamily:
                "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "12px",
              fontWeight: "400",
              lineHeight: "20px",
              position: "absolute",
              left: "20px",
              top: "107px",
            }}
          >
            UTC+1
          </div>
        </div>

        {/* Time grid */}
        <div style={{ position: "relative", height: "calc(100% - 126px)" }}>
          {/* Vertical line */}
          <div
            style={{
              width: "1px",
              height: "563px",
              background: "#EBECF1",
              position: "absolute",
              left: "80px",
              top: "66px",
            }}
          ></div>

          {/* Time labels */}
          <div
            style={{
              position: "absolute",
              left: "20px",
              top: "116px",
              display: "flex",
              flexDirection: "column",
              gap: "41px",
            }}
          >
            {timeSlots.map((time, index) => (
              <div
                key={time}
                style={{
                  color: "#A0A3AF",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "12px",
                  fontWeight: "400",
                  lineHeight: "20px",
                }}
              >
                {time}
              </div>
            ))}
          </div>

          {/* Horizontal grid lines */}
          {timeSlots.map((_, index) => (
            <div
              key={index}
              style={{
                width: "1325px",
                height: "1px",
                background: "#EBECF1",
                position: "absolute",
                left: "75px",
                top: `${126 + index * 61}px`,
              }}
            ></div>
          ))}

          {/* Current time indicator (only show if today) */}
          {isToday(currentDate) && (
            <div
              style={{
                position: "absolute",
                left: "95px",
                top: `${Math.min(Math.max(currentTimePosition, 126), 563)}px`,
                width: "1325px",
                height: "10px",
                display: "flex",
                alignItems: "center",
              }}
            >
              <svg width="1325" height="10" viewBox="0 0 1325 10" fill="none">
                <circle cx="5" cy="5" r="5" fill="#FB6F67" />
                <path d="M10 5H1325" stroke="#FB6F67" />
              </svg>
            </div>
          )}

          {/* Real events from Supabase */}
          {(() => {
            const eventsForDate = getEventsForDate(currentDate);
            console.log("Events for current date:", currentDate, eventsForDate);
            return eventsForDate;
          })().map((event: any, index: number) => {
            // Calculate position based on start time
            let topPosition = 126; // Default start position
            if (event.start_time) {
              const [hours, minutes] = event.start_time.split(":");
              const hour = parseInt(hours);
              const minute = parseInt(minutes);
              // Each hour is 61px apart, starting at 126px for 1 AM
              topPosition = 126 + (hour - 1) * 61 + (minute * 61) / 60;
            }

            // Calculate width based on duration or default
            let width = 1309; // Default full width
            let leftPosition = 86; // Default left position

            if (event.start_time && event.end_time) {
              const [startHours, startMinutes] = event.start_time.split(":");
              const [endHours, endMinutes] = event.end_time.split(":");
              const startMinutesTotal =
                parseInt(startHours) * 60 + parseInt(startMinutes);
              const endMinutesTotal =
                parseInt(endHours) * 60 + parseInt(endMinutes);
              const durationMinutes = endMinutesTotal - startMinutesTotal;

              // Adjust width based on duration, max 1309px
              width = Math.min(
                1309,
                Math.max(200, (durationMinutes / 60) * 200),
              );

              // If there are multiple events at the same time, offset them
              if (index > 0) {
                leftPosition = 86 + index * 20;
                width = Math.max(200, width - index * 20);
              }
            }

            return (
              <div
                key={event.id}
                onClick={() => handleTaskClick(event)}
                style={{
                  position: "absolute",
                  left: `${leftPosition}px`,
                  top: `${Math.max(126, Math.min(topPosition, 563))}px`,
                  width: `${width}px`,
                  height: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "5px",
                  borderRadius: "4px",
                  border: "1px solid white",
                  background: event.backgroundColor,
                  paddingRight: "5px",
                  cursor: "pointer",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
                title={`${event.title}\n${event.address}\n${event.start_time ? formatTime(event.start_time) : ""} ${event.end_time ? "- " + formatTime(event.end_time) : ""}\nClick to view details`}
              >
                <div
                  style={{
                    width: "2px",
                    height: "20px",
                    background: event.typeColor,
                  }}
                ></div>
                <div
                  style={{
                    color: event.typeColor,
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "12px",
                    fontWeight: "400",
                    lineHeight: "14px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    flex: "1",
                  }}
                >
                  {event.title} {event.address && `/ ${event.address}`}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  if (loading && events.length === 0) {
    return (
      <div style={{ backgroundColor: "#F6F7FB", minHeight: "100vh" }}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p>Loading calendar events...</p>
          <div
            style={{ color: "#A0A3AF", fontSize: "12px", marginTop: "10px" }}
          >
            Fetching tasks from database...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ backgroundColor: "#F6F7FB", minHeight: "100vh" }}>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <p style={{ color: "red" }}>Failed to load events: {error}</p>
          <div
            style={{ color: "#A0A3AF", fontSize: "12px", marginTop: "10px" }}
          >
            There might be an issue with the database connection or task data.
          </div>
          <button
            onClick={loadEvents}
            style={{
              padding: "8px 16px",
              backgroundColor: "#5D51E2",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "15px",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#F6F7FB", minHeight: "100vh" }}>
      <div
        style={{
          display: "flex",
          width: "100%",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
          padding: "20px",
        }}
      >
        {viewMode === "day" ? (
          renderDayView()
        ) : (
          <div
            style={{
              width: "1400px",
              height: "700px",
              background: "white",
              borderRadius: "8px",
              border: "1px solid #EBECF1",
              position: "relative",
            }}
          >
            {/* Header with controls */}
            <div
              style={{
                display: "flex",
                height: "60px",
                padding: "20px",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #E1E2E6",
              }}
            >
              {/* Left side - Today button and navigation */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "20px" }}
              >
                <button
                  onClick={handleTodayClick}
                  style={{
                    display: "inline-flex",
                    height: "36px",
                    padding: "11px 20px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "5px",
                    borderRadius: "6px",
                    border: "1px solid #EBECF1",
                    background: "white",
                    color: "#515666",
                    fontFamily:
                      "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  Today
                </button>

                <div
                  style={{
                    display: "inline-flex",
                    height: "36px",
                    padding: "3px",
                    alignItems: "flex-start",
                    borderRadius: "6px",
                    border: "1px solid #EBECF1",
                    background: "white",
                  }}
                >
                  <button
                    style={{
                      display: "flex",
                      width: "30px",
                      height: "30px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M7.72195 0.971191L8.77945 2.02871L4.81195 6.00002L8.77945 9.97133L7.72195 11.0288L2.68945 6.00002L7.72195 0.971191Z"
                        fill="#797E8B"
                      />
                    </svg>
                  </button>
                  <button
                    style={{
                      display: "flex",
                      width: "30px",
                      height: "30px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M4.2782 0.971191L3.2207 2.02871L7.1882 6.00002L3.2207 9.97133L4.2782 11.0288L9.3107 6.00002L4.2782 0.971191Z"
                        fill="#797E8B"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Center - Month/Year title */}
              <h1
                style={{
                  color: "#202437",
                  textAlign: "center",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  lineHeight: "36px",
                  margin: "0",
                }}
              >
                {currentDate.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                })}
              </h1>

              {/* Right side - View toggle and add button */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "16px" }}
              >
                <div
                  style={{
                    display: "inline-flex",
                    height: "36px",
                    padding: "3px",
                    alignItems: "center",
                    borderRadius: "6px",
                    border: "1px solid #EBECF1",
                    background: "white",
                  }}
                >
                  <button
                    onClick={() => setViewMode("day")}
                    style={{
                      display: "flex",
                      width: "80px",
                      padding: "11px 20px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "none",
                      background:
                        (viewMode as string) === "day" ? "#F6F7FB" : "white",
                      color:
                        (viewMode as string) === "day" ? "#5D51E2" : "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight:
                        (viewMode as string) === "day" ? "500" : "400",
                      cursor: "pointer",
                    }}
                  >
                    Day
                  </button>
                  <button
                    onClick={() => setViewMode("month")}
                    style={{
                      display: "flex",
                      width: "80px",
                      padding: "11px 20px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                      border: "none",
                      background:
                        (viewMode as string) === "month" ? "#F6F7FB" : "white",
                      color:
                        (viewMode as string) === "month"
                          ? "#5D51E2"
                          : "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight:
                        (viewMode as string) === "month" ? "500" : "400",
                      cursor: "pointer",
                    }}
                  >
                    Month
                  </button>
                </div>

                <button
                  onClick={createSampleTasks}
                  style={{
                    display: "flex",
                    width: "36px",
                    height: "36px",
                    padding: "8px 20px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                    borderRadius: "6px",
                    border: "1px solid #EBECF1",
                    background: "white",
                    cursor: "pointer",
                  }}
                  title="Create sample tasks for testing"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M13.125 6.125H7.875V0.875C7.875 0.642936 7.78281 0.420376 7.61872 0.256282C7.45462 0.0921872 7.23206 0 7 0C6.76794 0 6.54538 0.0921872 6.38128 0.256282C6.21719 0.420376 6.125 0.642936 6.125 0.875V6.125H0.875C0.642936 6.125 0.420376 6.21719 0.256282 6.38128C0.0921872 6.54538 0 6.76794 0 7C0 7.23206 0.0921872 7.45462 0.256282 7.61872C0.420376 7.78281 0.642936 7.875 0.875 7.875H6.125V13.125C6.125 13.3571 6.21719 13.5796 6.38128 13.7437C6.54538 13.9078 6.76794 14 7 14C7.23206 14 7.45462 13.9078 7.61872 13.7437C7.78281 13.5796 7.875 13.3571 7.875 13.125V7.875H13.125C13.3571 7.875 13.5796 7.78281 13.7437 7.61872C13.9078 7.45462 14 7.23206 14 7C14 6.76794 13.9078 6.54538 13.7437 6.38128C13.5796 6.21719 13.3571 6.125 13.125 6.125Z"
                      fill="#515666"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Day headers */}
            <div
              style={{
                height: "44px",
                borderBottom: "1px solid #E1E2E6",
                background: "white",
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                alignItems: "center",
              }}
            >
              <div
                style={{
                  color: "#A0A3AF",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Sunday
              </div>
              <div
                style={{
                  color: "#A0A3AF",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Monday
              </div>
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Tuesday
              </div>
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Wednesday
              </div>
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Thursday
              </div>
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Friday
              </div>
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                  padding: "0 10px",
                }}
              >
                Saturday
              </div>
            </div>

            {/* Calendar Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gridTemplateRows: "repeat(6, 1fr)",
                height: "calc(100% - 104px)",
                position: "relative",
              }}
            >
              {generateCalendarGrid().map((cell, index) => (
                <div
                  key={index}
                  style={{
                    borderRight: index % 7 !== 6 ? "1px solid #EBECF1" : "none",
                    borderBottom: index < 35 ? "1px solid #EBECF1" : "none",
                    padding: "8px",
                    position: "relative",
                    minHeight: "98px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setCurrentDate(cell.date);
                    setViewMode("day");
                  }}
                >
                  {/* Date number */}
                  <div style={{ position: "relative" }}>
                    {cell.isToday && (
                      <svg
                        style={{
                          position: "absolute",
                          left: "-4px",
                          top: "-2px",
                          zIndex: 1,
                        }}
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle cx="12" cy="12" r="12" fill="#5D51E2" />
                      </svg>
                    )}
                    <div
                      style={{
                        color: cell.isToday
                          ? "white"
                          : cell.isCurrentMonth
                            ? "#515666"
                            : "#A0A3AF",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "400",
                        lineHeight: "20px",
                        position: "relative",
                        zIndex: 2,
                        textAlign: cell.isToday ? "center" : "left",
                        width: cell.isToday ? "16px" : "auto",
                      }}
                    >
                      {cell.dayNumber}
                    </div>
                  </div>

                  {/* Events */}
                  {cell.events.length > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        top: "32px",
                        left: "8px",
                        right: "8px",
                      }}
                    >
                      {cell.events.map((event: any, eventIndex: number) => (
                        <div
                          key={event.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTaskClick(event);
                          }}
                          style={{
                            display: "flex",
                            padding: "2px 5px",
                            alignItems: "center",
                            gap: "5px",
                            borderRadius: "4px",
                            border: "1px solid white",
                            background: event.backgroundColor,
                            height: "20px",
                            marginBottom: "2px",
                            cursor: "pointer",
                            transition:
                              "transform 0.2s ease, box-shadow 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow =
                              "0 2px 8px rgba(0, 0, 0, 0.15)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                          title={`${event.title}\n${event.address}\n${event.start_time ? formatTime(event.start_time) : ""} ${event.end_time ? "- " + formatTime(event.end_time) : ""}\nClick to view details`}
                        >
                          <div
                            style={{
                              width: "2px",
                              height: "20px",
                              background: event.typeColor,
                              borderRadius: "1px",
                            }}
                          ></div>
                          <div
                            style={{
                              overflow: "hidden",
                              color: event.typeColor,
                              fontFamily:
                                "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                              fontSize: "12px",
                              fontWeight: "400",
                              lineHeight: "14px",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {event.title}{" "}
                            {event.address &&
                              `/ ${event.address.substring(0, 10)}...`}
                          </div>
                        </div>
                      ))}

                      {/* Show "more" indicator if there are additional events */}
                      {cell.moreEventsCount > 0 && (
                        <div
                          style={{
                            color: "#A0A3AF",
                            fontFamily:
                              "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                            fontSize: "12px",
                            fontWeight: "400",
                            lineHeight: "14px",
                            padding: "0 5px",
                          }}
                        >
                          {cell.moreEventsCount} more
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {showTaskDetailModal && selectedTask && (
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
            zIndex: 10000,
          }}
          onClick={() => setShowTaskDetailModal(false)}
        >
          <div
            style={{
              backgroundColor: "#FFF",
              borderRadius: "12px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.1)",
              width: "600px",
              maxHeight: "80vh",
              overflow: "hidden",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "24px 24px 0 24px",
                borderBottom: "1px solid #EBECF1",
                paddingBottom: "20px",
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "24px",
                  fontWeight: "700",
                  lineHeight: "32px",
                }}
              >
                Task Details
              </h2>
              <button
                onClick={() => setShowTaskDetailModal(false)}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#F6F7FB",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M13 1L1 13M1 1L13 13"
                    stroke="#A0A3AF"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div
              style={{
                padding: "24px",
                maxHeight: "calc(80vh - 120px)",
                overflowY: "auto",
              }}
            >
              {/* Task Title and Type */}
              <div style={{ marginBottom: "24px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px 8px",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "6px",
                      backgroundColor: selectedTask.backgroundColor,
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor: selectedTask.typeColor,
                      }}
                    />
                    <span
                      style={{
                        color: selectedTask.typeColor,
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedTask.type}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "inline-flex",
                      padding: "4px 8px",
                      alignItems: "center",
                      gap: "4px",
                      borderRadius: "6px",
                      backgroundColor:
                        selectedTask.status === "todo"
                          ? "#E8F0FE"
                          : selectedTask.status === "inprogress"
                            ? "#FFF3E0"
                            : selectedTask.status === "done"
                              ? "#E8F5E8"
                              : "#F5F5F5",
                    }}
                  >
                    <div
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        backgroundColor:
                          selectedTask.status === "todo"
                            ? "#1967D2"
                            : selectedTask.status === "inprogress"
                              ? "#E8710A"
                              : selectedTask.status === "done"
                                ? "#2E7D2E"
                                : "#797E8B",
                      }}
                    />
                    <span
                      style={{
                        color:
                          selectedTask.status === "todo"
                            ? "#1967D2"
                            : selectedTask.status === "inprogress"
                              ? "#E8710A"
                              : selectedTask.status === "done"
                                ? "#2E7D2E"
                                : "#797E8B",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "12px",
                        fontWeight: "500",
                      }}
                    >
                      {selectedTask.status === "todo"
                        ? "To Do"
                        : selectedTask.status === "inprogress"
                          ? "In Progress"
                          : selectedTask.status === "done"
                            ? "Done"
                            : "Unknown"}
                    </span>
                  </div>
                </div>
                <h3
                  style={{
                    margin: 0,
                    color: "#202437",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    fontSize: "20px",
                    fontWeight: "600",
                    lineHeight: "28px",
                  }}
                >
                  {selectedTask.title}
                </h3>
              </div>

              {/* Task Details Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "24px",
                  marginBottom: "24px",
                }}
              >
                {/* Left Column */}
                <div>
                  {/* Date and Time */}
                  <div style={{ marginBottom: "20px" }}>
                    <div
                      style={{
                        color: "#A0A3AF",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "12px",
                        fontWeight: "500",
                        lineHeight: "16px",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                        marginBottom: "8px",
                      }}
                    >
                      Date & Time
                    </div>
                    <div
                      style={{
                        color: "#202437",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "500",
                        lineHeight: "20px",
                      }}
                    >
                      {selectedTask.date
                        ? new Date(selectedTask.date).toLocaleDateString(
                            "en-US",
                            {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            },
                          )
                        : "No date set"}
                    </div>
                    {selectedTask.start_time && (
                      <div
                        style={{
                          color: "#515666",
                          fontFamily:
                            "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                          fontSize: "14px",
                          fontWeight: "400",
                          lineHeight: "20px",
                        }}
                      >
                        {formatTime(selectedTask.start_time)}
                        {selectedTask.end_time &&
                          ` - ${formatTime(selectedTask.end_time)}`}
                      </div>
                    )}
                  </div>

                  {/* Priority */}
                  {selectedTask.priority && (
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          color: "#A0A3AF",
                          fontFamily:
                            "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "16px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "8px",
                        }}
                      >
                        Priority
                      </div>
                      <div
                        style={{
                          color: "#202437",
                          fontFamily:
                            "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                          fontSize: "14px",
                          fontWeight: "500",
                          lineHeight: "20px",
                        }}
                      >
                        {selectedTask.priority}
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Column */}
                <div>
                  {/* Address */}
                  {selectedTask.address && (
                    <div style={{ marginBottom: "20px" }}>
                      <div
                        style={{
                          color: "#A0A3AF",
                          fontFamily:
                            "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                          fontSize: "12px",
                          fontWeight: "500",
                          lineHeight: "16px",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          marginBottom: "8px",
                        }}
                      >
                        Location
                      </div>
                      <div
                        style={{
                          color: "#202437",
                          fontFamily:
                            "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                          fontSize: "14px",
                          fontWeight: "500",
                          lineHeight: "20px",
                        }}
                      >
                        {selectedTask.address}
                      </div>
                    </div>
                  )}

                  {/* Assignees */}
                  {selectedTask.assignees &&
                    selectedTask.assignees.length > 0 && (
                      <div style={{ marginBottom: "20px" }}>
                        <div
                          style={{
                            color: "#A0A3AF",
                            fontFamily:
                              "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                            fontSize: "12px",
                            fontWeight: "500",
                            lineHeight: "16px",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            marginBottom: "8px",
                          }}
                        >
                          Assigned To
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "8px",
                          }}
                        >
                          {selectedTask.assignees.map(
                            (assignee: any, index: number) => (
                              <div
                                key={index}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "8px",
                                }}
                              >
                                {assignee.avatar_url ? (
                                  <img
                                    src={assignee.avatar_url}
                                    alt={assignee.name}
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      borderRadius: "50%",
                                      border: "1px solid #EBECF1",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "24px",
                                      height: "24px",
                                      borderRadius: "50%",
                                      backgroundColor: "#F6F7FB",
                                      border: "1px solid #EBECF1",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      fontSize: "10px",
                                      fontWeight: "500",
                                      color: "#A0A3AF",
                                    }}
                                  >
                                    {assignee.initials}
                                  </div>
                                )}
                                <span
                                  style={{
                                    color: "#202437",
                                    fontFamily:
                                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                                    fontSize: "14px",
                                    fontWeight: "500",
                                    lineHeight: "20px",
                                  }}
                                >
                                  {assignee.name}
                                </span>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>

              {/* Description */}
              {selectedTask.description && (
                <div>
                  <div
                    style={{
                      color: "#A0A3AF",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "12px",
                      fontWeight: "500",
                      lineHeight: "16px",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: "8px",
                    }}
                  >
                    Description
                  </div>
                  <div
                    style={{
                      color: "#515666",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                      padding: "12px",
                      backgroundColor: "#F6F7FB",
                      borderRadius: "8px",
                      border: "1px solid #EBECF1",
                    }}
                  >
                    {selectedTask.description}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                padding: "20px 24px 24px",
                borderTop: "1px solid #EBECF1",
                gap: "12px",
              }}
            >
              <button
                onClick={() => setShowTaskDetailModal(false)}
                style={{
                  height: "36px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "1px solid #EBECF1",
                  backgroundColor: "#FFF",
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F6F7FB";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#FFF";
                }}
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to tasks page to edit
                  window.location.href = "/tasks";
                }}
                style={{
                  height: "36px",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#5D51E2",
                  color: "#FFF",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#4A3FBD";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#5D51E2";
                }}
              >
                Edit Task
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
