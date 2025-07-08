"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import TaskActionsDropdown from "../../components/ui/TaskActionsDropdown";
import { useTasks } from "../../hooks/useSupabase";

interface Task {
  id: string;
  title: string;
  type: string;
  typeColor: string;
  date: string;
  address: string;
  assignees: Array<{ name: string; avatar_url?: string; initials: string }>;
  task_number: string;
  is_completed?: boolean;
  priority?: string;
  status: string;
}

interface Column {
  id: string;
  title: string;
  count: number;
  color: string;
  tasks: Task[];
}

export default function TasksPage() {
  const router = useRouter();
  const {
    tasks,
    columns,
    loading,
    error,
    fetchTasks,
    updateTaskStatus,
    deleteTask,
    duplicateTask,
    updateTaskPriority,
  } = useTasks();
  const [selectedView, setSelectedView] = useState("All Tasks");
  const [searchTerm, setSearchTerm] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [viewMode, setViewMode] = useState("kanban"); // kanban or list
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ x: 0, y: 0 });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskColumn, setNewTaskColumn] = useState("todo");
  const [showAddTagModal, setShowAddTagModal] = useState(false);
  const [customTags, setCustomTags] = useState<string[]>([
    "Urgent",
    "Review",
    "Meeting",
  ]);
  const [tagFilter, setTagFilter] = useState("All");

  // Filter dropdown states
  const [assigneeFilterOpen, setAssigneeFilterOpen] = useState(false);
  const [dateFilterOpen, setDateFilterOpen] = useState(false);
  const [typeFilterOpen, setTypeFilterOpen] = useState(false);
  const [tagFilterOpen, setTagFilterOpen] = useState(false);

  // Pagination state
  const [currentPageInput, setCurrentPageInput] = useState("1");
  const [itemsPerPage, setItemsPerPage] = useState("50");

  // Click outside handler for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        setActiveDropdown(null);
      }
      if (showAddTaskModal) {
        return; // Don't close filters when modal is open
      }
      if (showAddTagModal) {
        return; // Don't close filters when tag modal is open
      }
      if (assigneeFilterOpen) {
        setAssigneeFilterOpen(false);
      }
      if (dateFilterOpen) {
        setDateFilterOpen(false);
      }
      if (typeFilterOpen) {
        setTypeFilterOpen(false);
      }
      if (tagFilterOpen) {
        setTagFilterOpen(false);
      }
    };

    if (
      activeDropdown ||
      assigneeFilterOpen ||
      dateFilterOpen ||
      typeFilterOpen ||
      tagFilterOpen
    ) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [
    activeDropdown,
    assigneeFilterOpen,
    dateFilterOpen,
    typeFilterOpen,
    tagFilterOpen,
    showAddTaskModal,
    showAddTagModal,
  ]);

  useEffect(() => {
    console.log("Tasks page - loading tasks with filters:", {
      searchTerm,
      assigneeFilter,
      dateFilter,
      typeFilter,
      tagFilter,
    });
    loadTasks();
  }, [searchTerm, assigneeFilter, dateFilter, typeFilter, tagFilter]);

  // Log task data when it changes
  useEffect(() => {
    console.log("Tasks data updated:", {
      tasksCount: tasks.length,
      tasks: tasks.slice(0, 3), // Log first 3 tasks
      columns: columns.map((c) => ({
        id: c.id,
        title: c.title,
        count: c.count,
      })),
    });
  }, [tasks, columns]);

  const loadTasks = async () => {
    const filters: any = {};

    if (searchTerm) {
      filters.search = searchTerm;
    }
    if (assigneeFilter !== "All") {
      filters.assignee = assigneeFilter;
    }
    if (typeFilter !== "All") {
      filters.type = typeFilter;
    }

    await fetchTasks(filters);
  };

  // Local filtering function for tasks
  const getFilteredTasks = () => {
    let filtered = tasks;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (task) =>
          task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
          task.address.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Filter by assignee
    if (assigneeFilter !== "All") {
      filtered = filtered.filter((task) =>
        task.assignees.some((assignee: { name: string; avatar_url?: string; initials: string }) => assignee.name === assigneeFilter),
      );
    }

    // Filter by date
    if (dateFilter !== "All") {
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const thisWeekEnd = new Date(today);
      thisWeekEnd.setDate(today.getDate() + (7 - today.getDay()));
      const nextWeekEnd = new Date(thisWeekEnd);
      nextWeekEnd.setDate(thisWeekEnd.getDate() + 7);

      filtered = filtered.filter((task) => {
        const taskDate = new Date(task.date);

        switch (dateFilter) {
          case "Today":
            return taskDate.toDateString() === today.toDateString();
          case "Tomorrow":
            return taskDate.toDateString() === tomorrow.toDateString();
          case "This Week":
            return taskDate >= today && taskDate <= thisWeekEnd;
          case "Next Week":
            return taskDate > thisWeekEnd && taskDate <= nextWeekEnd;
          case "Overdue":
            return taskDate < today && !task.is_completed;
          default:
            return true;
        }
      });
    }

    // Filter by type
    if (typeFilter !== "All") {
      filtered = filtered.filter((task) => task.type === typeFilter);
    }

    // Filter by tag (assuming tasks have tags property)
    if (tagFilter !== "All") {
      filtered = filtered.filter(
        (task) => task.tags && task.tags.includes(tagFilter),
      );
    }

    return filtered;
  };

  // Get filtered columns for kanban view
  const getFilteredColumns = () => {
    const filteredTasks = getFilteredTasks();

    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) =>
        filteredTasks.some((filteredTask) => filteredTask.id === task.id),
      ),
      count: column.tasks.filter((task) =>
        filteredTasks.some((filteredTask) => filteredTask.id === task.id),
      ).length,
    }));
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Task action handlers
  const handleTaskEdit = (taskId: string) => {
    console.log("Edit task:", taskId);
    // TODO: Implement edit functionality
  };

  const handleTaskToggleComplete = async (taskId: string) => {
    try {
      const task = tasks.find((t) => t.id === taskId);
      if (!task) return;

      const newStatus = task.is_completed ? "todo" : "done";
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to toggle task completion:", err);
      alert("更新任���状态失败，请重试");
    }
  };

  const handleTaskDelete = async (taskId: string) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Failed to delete task:", err);
        alert("删除任务��败，请重试");
      }
    }
  };

  const handleTaskDuplicate = async (taskId: string) => {
    try {
      await duplicateTask(taskId);
    } catch (err) {
      console.error("Failed to duplicate task:", err);
      alert("复制任务失败，请重试");
    }
  };

  const handleTaskMoveToCategory = async (
    taskId: string,
    newCategory: string,
  ) => {
    try {
      const newStatus = newCategory.toLowerCase().replace(" ", "");
      await updateTaskStatus(taskId, newStatus);
    } catch (err) {
      console.error("Failed to move task:", err);
      alert("移动任务失败，请重试");
    }
  };

  const handleTaskSetPriority = async (taskId: string, priority: string) => {
    try {
      await updateTaskPriority(taskId, priority);
    } catch (err) {
      console.error("Failed to set priority:", err);
      alert("设置优先级失败，请重试");
    }
  };

  const handleTaskSetDueDate = (taskId: string) => {
    console.log("Set due date for task:", taskId);
    // TODO: Implement date picker functionality
  };

  // Filter handlers
  const handleAssigneeFilterClick = () => {
    setAssigneeFilterOpen(!assigneeFilterOpen);
    setDateFilterOpen(false);
    setTypeFilterOpen(false);
    setTagFilterOpen(false);
  };

  const handleDateFilterClick = () => {
    setDateFilterOpen(!dateFilterOpen);
    setAssigneeFilterOpen(false);
    setTypeFilterOpen(false);
    setTagFilterOpen(false);
  };

  const handleTypeFilterClick = () => {
    setTypeFilterOpen(!typeFilterOpen);
    setAssigneeFilterOpen(false);
    setDateFilterOpen(false);
    setTagFilterOpen(false);
  };

  const handleTagFilterClick = () => {
    setTagFilterOpen(!tagFilterOpen);
    setAssigneeFilterOpen(false);
    setDateFilterOpen(false);
    setTypeFilterOpen(false);
  };

  // Handle task date click to navigate to calendar
  const handleTaskDateClick = (taskDate: string) => {
    // Parse the date and format it for URL parameters
    const date = new Date(taskDate);
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-based month
    const day = date.getDate();

    // Navigate to calendar with date parameters
    router.push(
      `/calendar?date=${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}&view=day`,
    );
  };

  const handleDropdownToggle = (taskId: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const rect = (event.target as HTMLElement).getBoundingClientRect();

    if (activeDropdown === taskId) {
      setActiveDropdown(null);
    } else {
      setDropdownPosition({
        x: rect.right - 200, // Position dropdown to the left of the button
        y: rect.bottom + 5, // Position below the button with small gap
      });
      setActiveDropdown(taskId);
    }
  };

  const pageStyle: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: "#F6F7FB",
  };

  const topBarStyle: React.CSSProperties = {
    display: "flex",
    width: "100%",
    height: "56px",
    padding: "10px 20px 10px 10px",
    alignItems: "center",
    gap: "20px",
    borderBottom: "1px solid #EBECF1",
    backgroundColor: "#FFF",
  };

  const viewsStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "5px",
    flex: "1 0 0",
  };

  const filterBarStyle: React.CSSProperties = {
    display: "flex",
    width: "calc(100% - 40px)",
    height: "50px",
    padding: "10px",
    alignItems: "center",
    gap: "10px",
    borderRadius: "6px 6px 0px 0px",
    border: "1px solid #EBECF1",
    backgroundColor: "#FFF",
    margin: "0 20px",
    marginTop: "20px",
  };

  const kanbanStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "20px",
    padding: "0 20px",
    marginTop: "0",
    width: "calc(100% - 40px)",
    height: "calc(100vh - 200px)",
    overflowX: "auto",
  };

  const columnStyle: React.CSSProperties = {
    display: "flex",
    width: "300px",
    flexDirection: "column",
    alignItems: "flex-start",
    minHeight: "100%",
  };

  const TaskCard = ({ task }: { task: Task }) => (
    <div
      style={{
        display: "flex",
        padding: "15px",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: "15px",
        alignSelf: "stretch",
        borderRadius: "6px",
        border: "1px solid #EBECF1",
        backgroundColor: "#FFF",
        marginBottom: "10px",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          alignSelf: "stretch",
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
                height: "20px",
                padding: "0px 6px",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                borderRadius: "6px",
                backgroundColor:
                  task.status === "todo"
                    ? "#E8F0FE"
                    : task.status === "inprogress"
                      ? "#FFF3E0"
                      : task.status === "done"
                        ? "#E8F5E8"
                        : "#F5F5F5",
              }}
            >
              <div
                style={{
                  color:
                    task.status === "todo"
                      ? "#1967D2"
                      : task.status === "inprogress"
                        ? "#E8710A"
                        : task.status === "done"
                          ? "#2E7D2E"
                          : "#797E8B",
                  fontFamily:
                    "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "12px",
                  fontWeight: "400",
                  lineHeight: "14px",
                }}
              >
                {task.type}
              </div>
            </div>
          </div>
          <div
            onClick={(e) => handleDropdownToggle(task.id, e)}
            style={{
              display: "flex",
              width: "20px",
              height: "20px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "6px",
              cursor: "pointer",
              backgroundColor:
                activeDropdown === task.id
                  ? "var(--solid-sales-theme-5d51e2)"
                  : "transparent",
            }}
            onMouseEnter={(e) => {
              if (activeDropdown !== task.id) {
                e.currentTarget.style.backgroundColor =
                  "var(--solid-black-f6f7fb)";
              }
            }}
            onMouseLeave={(e) => {
              if (activeDropdown !== task.id) {
                e.currentTarget.style.backgroundColor = "transparent";
              }
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M1.3125 5.6875C1.05291 5.6875 0.799154 5.76448 0.583315 5.9087C0.367475 6.05292 0.199249 6.2579 0.0999087 6.49773C0.000568688 6.73756 -0.0254232 7.00146 0.0252199 7.25606C0.075863 7.51066 0.200867 7.74452 0.384423 7.92808C0.567979 8.11163 0.801845 8.23664 1.05644 8.28728C1.31104 8.33792 1.57494 8.31193 1.81477 8.21259C2.0546 8.11325 2.25959 7.94503 2.4038 7.72919C2.54802 7.51335 2.625 7.25959 2.625 7C2.625 6.6519 2.48672 6.31806 2.24058 6.07192C1.99444 5.82578 1.6606 5.6875 1.3125 5.6875ZM7 5.6875C6.74041 5.6875 6.48665 5.76448 6.27081 5.9087C6.05498 6.05292 5.88675 6.2579 5.78741 6.49773C5.68807 6.73756 5.66208 7.00146 5.71272 7.25606C5.76336 7.51066 5.88837 7.74452 6.07192 7.92808C6.25548 8.11163 6.48934 8.23664 6.74394 8.28728C6.99854 8.33792 7.26244 8.31193 7.50227 8.21259C7.7421 8.11325 7.94709 7.94503 8.0913 7.72919C8.23552 7.51335 8.3125 7.25959 8.3125 7C8.3125 6.6519 8.17422 6.31806 7.92808 6.07192C7.68194 5.82578 7.3481 5.6875 7 5.6875ZM12.6875 5.6875C12.4279 5.6875 12.1742 5.76448 11.9583 5.9087C11.7425 6.05292 11.5742 6.2579 11.4749 6.49773C11.3756 6.73756 11.3496 7.00146 11.4002 7.25606C11.4509 7.51066 11.5759 7.74452 11.7594 7.92808C11.943 8.11163 12.1768 8.23664 12.4314 8.28728C12.686 8.33792 12.9499 8.31193 13.1898 8.21259C13.4296 8.11325 13.6346 7.94503 13.7788 7.72919C13.923 7.51335 14 7.25959 14 7C14 6.6519 13.8617 6.31806 13.6156 6.07192C13.3694 5.82578 13.0356 5.6875 12.6875 5.6875Z"
                fill={activeDropdown === task.id ? "#FFFFFF" : "#A0A3AF"}
              />
            </svg>
          </div>
        </div>
        <div
          style={{
            alignSelf: "stretch",
            color: "#202437",
            fontFamily:
              "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "14px",
            fontWeight: "500",
            lineHeight: "20px",
          }}
        >
          {task.title}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          gap: "10px",
          alignSelf: "stretch",
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            handleTaskDateClick(task.date);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            alignSelf: "stretch",
            cursor: "pointer",
            borderRadius: "4px",
            padding: "2px",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#F6F7FB";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M11.25 0.75H8.25V0.375C8.25 0.275544 8.21049 0.180161 8.14017 0.109835C8.06984 0.0395088 7.97446 0 7.875 0C7.77554 0 7.68016 0.0395088 7.60983 0.109835C7.53951 0.180161 7.5 0.275544 7.5 0.375V0.75H4.5V0.375C4.5 0.275544 4.46049 0.180161 4.39016 0.109835C4.31984 0.0395088 4.22446 0 4.125 0C4.02554 0 3.93016 0.0395088 3.85984 0.109835C3.78951 0.180161 3.75 0.275544 3.75 0.375V0.75H0.75C0.551088 0.75 0.360322 0.829018 0.21967 0.96967C0.0790176 1.11032 0 1.30109 0 1.5L0 11.25C0 11.4489 0.0790176 11.6397 0.21967 11.7803C0.360322 11.921 0.551088 12 0.75 12H11.25C11.4489 12 11.6397 11.921 11.7803 11.7803C11.921 11.6397 12 11.4489 12 11.25V1.5C12 1.30109 11.921 1.11032 11.7803 0.96967C11.6397 0.829018 11.4489 0.75 11.25 0.75ZM11.25 11.25H0.75V1.5H3.75V1.875C3.75 1.97446 3.78951 2.06984 3.85984 2.14016C3.93016 2.21049 4.02554 2.25 4.125 2.25C4.22446 2.25 4.31984 2.21049 4.39016 2.14016C4.46049 2.06984 4.5 1.97446 4.5 1.875V1.5H7.5V1.875C7.5 1.97446 7.53951 2.06984 7.60983 2.14016C7.68016 2.21049 7.77554 2.25 7.875 2.25C7.97446 2.25 8.06984 2.21049 8.14017 2.14016C8.21049 2.06984 8.25 1.97446 8.25 1.875V1.5H11.25V11.25ZM3.375 3.75H2.625C2.52554 3.75 2.43016 3.78951 2.35984 3.85984C2.28951 3.93016 2.25 4.02554 2.25 4.125V4.875C2.25 4.97446 2.28951 5.06984 2.35984 5.14016C2.43016 5.21049 2.52554 5.25 2.625 5.25H3.375C3.47446 5.25 3.56984 5.21049 3.64016 5.14016C3.71049 5.06984 3.75 4.97446 3.75 4.875V4.125C3.75 4.02554 3.71049 3.93016 3.64016 3.85984C3.56984 3.78951 3.47446 3.75 3.375 3.75Z"
              fill="#A0A3AF"
            />
          </svg>
          <div
            style={{
              flex: "1 0 0",
              color: "#515666",
              fontFamily:
                "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "12px",
              fontWeight: "400",
              lineHeight: "16px",
            }}
          >
            {formatDate(task.date)}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            alignSelf: "stretch",
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M11.295 3.3114L6.19875 0.123895C6.13915 0.0866457 6.07028 0.0668945 6 0.0668945C5.92972 0.0668945 5.86085 0.0866457 5.80125 0.123895L0.705 3.3114C0.48937 3.44616 0.31154 3.63354 0.188217 3.85591C0.0648938 4.07829 0.000126561 4.32836 0 4.58264L0 10.5001C0 10.898 0.158035 11.2795 0.43934 11.5608C0.720644 11.8421 1.10218 12.0001 1.5 12.0001H10.5C10.8978 12.0001 11.2794 11.8421 11.5607 11.5608C11.842 11.2795 12 10.898 12 10.5001V4.58264C11.9999 4.32836 11.9351 4.07829 11.8118 3.85591C11.6885 3.63354 11.5106 3.44616 11.295 3.3114ZM4.5 11.2501V7.50014H7.5V11.2501H4.5ZM11.25 10.5001C11.25 10.6991 11.171 10.8898 11.0303 11.0305C10.8897 11.1711 10.6989 11.2501 10.5 11.2501H8.25V7.50014C8.25 7.30123 8.17098 7.11047 8.03033 6.96981C7.88968 6.82916 7.69891 6.75014 7.5 6.75014H4.5C4.30109 6.75014 4.11032 6.82916 3.96967 6.96981C3.82902 7.11047 3.75 7.30123 3.75 7.50014V11.2501H1.5C1.30109 11.2501 1.11032 11.1711 0.96967 11.0305C0.829018 10.8898 0.75 10.6991 0.75 10.5001V4.58264C0.749745 4.45519 0.781977 4.32977 0.843653 4.21822C0.90533 4.10668 0.994415 4.0127 1.1025 3.94515L6 0.885145L10.8975 3.94515C11.0056 4.0127 11.0947 4.10668 11.1563 4.21822C11.218 4.32977 11.2503 4.45519 11.25 4.58264V10.5001Z"
              fill="#A0A3AF"
            />
          </svg>
          <div
            style={{
              flex: "1 0 0",
              color: "#515666",
              fontFamily:
                "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
              fontSize: "12px",
              fontWeight: "400",
              lineHeight: "16px",
            }}
          >
            {task.address}
          </div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          alignSelf: "stretch",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "-8px",
            flex: "1 0 0",
          }}
        >
          {task.assignees.map((assignee, index) => (
            <div key={index} style={{ marginLeft: index > 0 ? "-8px" : "0" }}>
              {assignee.avatar_url ? (
                <img
                  src={assignee.avatar_url}
                  alt={assignee.name}
                  style={{
                    width: "24px",
                    height: "24px",
                    borderRadius: "50%",
                    border: "1px solid #FFF",
                  }}
                />
              ) : (
                <div
                  style={{
                    display: "flex",
                    width: "24px",
                    height: "24px",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "12px",
                    border: "1px solid #FFF",
                    backgroundColor: "#EBECF1",
                  }}
                >
                  <div
                    style={{
                      color: "#A0A3AF",
                      textAlign: "center",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "10px",
                      fontWeight: "500",
                      lineHeight: "12px",
                      letterSpacing: "0.2px",
                      textTransform: "capitalize",
                    }}
                  >
                    {assignee.initials}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div
          style={{
            color: "#A0A3AF",
            fontFamily:
              "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
            fontSize: "12px",
            fontWeight: "400",
            lineHeight: "14px",
          }}
        >
          {task.task_number}
        </div>
      </div>
    </div>
  );

  if (loading && tasks.length === 0) {
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
            onClick={loadTasks}
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
      {/* Top Bar */}
      <div style={topBarStyle}>
        <div style={viewsStyle}>
          {["All Tasks", "My Tasks", "Archived"].map((view) => (
            <div
              key={view}
              onClick={() => setSelectedView(view)}
              style={{
                display: "flex",
                height: "36px",
                padding: "7px 10px",
                alignItems: "center",
                gap: "3px",
                borderRadius: "6px",
                backgroundColor:
                  selectedView === view
                    ? "rgba(32, 36, 55, 0.05)"
                    : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: selectedView === view ? "#202437" : "#797E8B",
                  fontFamily:
                    "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "500",
                  lineHeight: "20px",
                }}
              >
                {view}
              </div>
              <div
                style={{
                  color: "#A0A3AF",
                  fontFamily:
                    "SF UI Text, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "12px",
                  fontWeight: selectedView === view ? "500" : "400",
                  lineHeight: "20px",
                }}
              >
                {view === "All Tasks"
                  ? tasks.length.toString()
                  : view === "My Tasks"
                    ? tasks
                        .filter((t: any) =>
                          t.assignees?.some(
                            (a: any) => a.name === "Current User",
                          ),
                        )
                        .length.toString()
                    : "0"}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
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
              backgroundColor: "#5D51E2",
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
              Create Task
            </span>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                fill="white"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={filterBarStyle}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "1 0 0",
          }}
        >
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
              backgroundColor: "#FFF",
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
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1 0 0",
                border: "none",
                outline: "none",
                color: "#C6C8D1",
                fontFamily:
                  "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                fontSize: "14px",
                fontWeight: "400",
                lineHeight: "20px",
                backgroundColor: "transparent",
              }}
            />
          </div>

          {/* Filter Dropdowns */}
          {/* Assignee Filter */}
          <div style={{ position: "relative" }}>
            <div
              onClick={handleAssigneeFilterClick}
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                backgroundColor: assigneeFilterOpen ? "#F6F7FB" : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                Assignee:
              </div>
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                {assigneeFilter}
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>
            {assigneeFilterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  zIndex: 1000,
                  backgroundColor: "#FFF",
                  border: "1px solid #EBECF1",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  minWidth: "160px",
                  padding: "5px 0",
                  marginTop: "5px",
                }}
              >
                {[
                  "All",
                  "John Smith",
                  "Sarah Johnson",
                  "Mike Wilson",
                  "Emily Brown",
                ].map((assignee) => (
                  <div
                    key={assignee}
                    onClick={() => {
                      setAssigneeFilter(assignee);
                      setAssigneeFilterOpen(false);
                    }}
                    style={{
                      padding: "8px 15px",
                      cursor: "pointer",
                      backgroundColor:
                        assigneeFilter === assignee ? "#F6F7FB" : "transparent",
                      fontSize: "14px",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      color: "#202437",
                    }}
                    onMouseEnter={(e) => {
                      if (assigneeFilter !== assignee) {
                        e.currentTarget.style.backgroundColor = "#F6F7FB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (assigneeFilter !== assignee) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {assignee}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Date Filter */}
          <div style={{ position: "relative" }}>
            <div
              onClick={handleDateFilterClick}
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                backgroundColor: dateFilterOpen ? "#F6F7FB" : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                Date:
              </div>
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                {dateFilter}
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>
            {dateFilterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  zIndex: 1000,
                  backgroundColor: "#FFF",
                  border: "1px solid #EBECF1",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  minWidth: "160px",
                  padding: "5px 0",
                  marginTop: "5px",
                }}
              >
                {[
                  "All",
                  "Today",
                  "Tomorrow",
                  "This Week",
                  "Next Week",
                  "Overdue",
                ].map((date) => (
                  <div
                    key={date}
                    onClick={() => {
                      setDateFilter(date);
                      setDateFilterOpen(false);
                    }}
                    style={{
                      padding: "8px 15px",
                      cursor: "pointer",
                      backgroundColor:
                        dateFilter === date ? "#F6F7FB" : "transparent",
                      fontSize: "14px",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      color: "#202437",
                    }}
                    onMouseEnter={(e) => {
                      if (dateFilter !== date) {
                        e.currentTarget.style.backgroundColor = "#F6F7FB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (dateFilter !== date) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {date}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type Filter */}
          <div style={{ position: "relative" }}>
            <div
              onClick={handleTypeFilterClick}
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                backgroundColor: typeFilterOpen ? "#F6F7FB" : "transparent",
                cursor: "pointer",
              }}
            >
              <div
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
              </div>
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                {typeFilter}
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>
            {typeFilterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  zIndex: 1000,
                  backgroundColor: "#FFF",
                  border: "1px solid #EBECF1",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  minWidth: "160px",
                  padding: "5px 0",
                  marginTop: "5px",
                }}
              >
                {[
                  "All",
                  "Maintenance",
                  "Inspection",
                  "Cleaning",
                  "Administration",
                  "Emergency",
                ].map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setTypeFilter(type);
                      setTypeFilterOpen(false);
                    }}
                    style={{
                      padding: "8px 15px",
                      cursor: "pointer",
                      backgroundColor:
                        typeFilter === type ? "#F6F7FB" : "transparent",
                      fontSize: "14px",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      color: "#202437",
                    }}
                    onMouseEnter={(e) => {
                      if (typeFilter !== type) {
                        e.currentTarget.style.backgroundColor = "#F6F7FB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (typeFilter !== type) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tag Filter */}
          <div style={{ position: "relative" }}>
            <div
              onClick={handleTagFilterClick}
              style={{
                display: "flex",
                padding: "5px 10px",
                alignItems: "center",
                gap: "5px",
                borderRadius: "6px",
                backgroundColor: tagFilterOpen ? "#F6F7FB" : "transparent",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                Tag:
              </div>
              <div
                style={{
                  color: "#515666",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "510",
                  lineHeight: "20px",
                }}
              >
                {tagFilter}
              </div>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path
                  d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                  fill="#A0A3AF"
                />
              </svg>
            </div>
            {tagFilterOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: "0",
                  zIndex: 1000,
                  backgroundColor: "#FFF",
                  border: "1px solid #EBECF1",
                  borderRadius: "6px",
                  boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                  minWidth: "160px",
                  padding: "5px 0",
                  marginTop: "5px",
                }}
              >
                {["All", ...customTags].map((tag) => (
                  <div
                    key={tag}
                    onClick={() => {
                      setTagFilter(tag);
                      setTagFilterOpen(false);
                    }}
                    style={{
                      padding: "8px 15px",
                      cursor: "pointer",
                      backgroundColor:
                        tagFilter === tag ? "#F6F7FB" : "transparent",
                      fontSize: "14px",
                      fontFamily:
                        "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                      color: "#202437",
                    }}
                    onMouseEnter={(e) => {
                      if (tagFilter !== tag) {
                        e.currentTarget.style.backgroundColor = "#F6F7FB";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (tagFilter !== tag) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    {tag}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div
            style={{
              display: "flex",
              height: "30px",
              padding: "3px",
              justifyContent: "flex-end",
              alignItems: "center",
              borderRadius: "6px",
              border: "1px solid #E1E2E6",
            }}
          >
            <div
              onClick={() => setViewMode("kanban")}
              style={{
                display: "flex",
                width: "44px",
                padding: "5px 15px",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "stretch",
                borderRadius: "4px",
                backgroundColor: viewMode === "kanban" ? "#F6F7FB" : "#FFF",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.25 0H0.875C0.642936 0 0.420376 0.0921872 0.256282 0.256282C0.0921872 0.420376 0 0.642936 0 0.875L0 5.25C0 5.48206 0.0921872 5.70462 0.256282 5.86872C0.420376 6.03281 0.642936 6.125 0.875 6.125H5.25C5.48206 6.125 5.70462 6.03281 5.86872 5.86872C6.03281 5.70462 6.125 5.48206 6.125 5.25V0.875C6.125 0.642936 6.03281 0.420376 5.86872 0.256282C5.70462 0.0921872 5.48206 0 5.25 0V0ZM13.125 0H8.75C8.51794 0 8.29538 0.0921872 8.13128 0.256282C7.96719 0.420376 7.875 0.642936 7.875 0.875V5.25C7.875 5.48206 7.96719 5.70462 8.13128 5.86872C8.29538 6.03281 8.51794 6.125 8.75 6.125H13.125C13.3571 6.125 13.5796 6.03281 13.7437 5.86872C13.9078 5.70462 14 5.48206 14 5.25V0.875C14 0.642936 13.9078 0.420376 13.7437 0.256282C13.5796 0.0921872 13.3571 0 13.125 0V0ZM5.25 7.875H0.875C0.642936 7.875 0.420376 7.96719 0.256282 8.13128C0.0921872 8.29538 0 8.51794 0 8.75L0 13.125C0 13.3571 0.0921872 13.5796 0.256282 13.7437C0.420376 13.9078 0.642936 14 0.875 14H5.25C5.48206 14 5.70462 13.9078 5.86872 13.7437C6.03281 13.5796 6.125 13.3571 6.125 13.125V8.75C6.125 8.51794 6.03281 8.29538 5.86872 8.13128C5.70462 7.96719 5.48206 7.875 5.25 7.875ZM13.125 7.875H8.75C8.51794 7.875 8.29538 7.96719 8.13128 8.13128C7.96719 8.29538 7.875 8.51794 7.875 8.75V13.125C7.875 13.3571 7.96719 13.5796 8.13128 13.7437C8.29538 13.9078 8.51794 14 8.75 14H13.125C13.3571 14 13.5796 13.9078 13.7437 13.7437C13.9078 13.5796 14 13.3571 14 13.125V8.75C14 8.51794 13.9078 8.29538 13.7437 8.13128C13.5796 7.96719 13.3571 7.875 13.125 7.875Z"
                  fill={viewMode === "kanban" ? "#5D51E2" : "#A0A3AF"}
                />
              </svg>
            </div>
            <div
              onClick={() => setViewMode("list")}
              style={{
                display: "flex",
                width: "44px",
                padding: "5px 15px",
                justifyContent: "center",
                alignItems: "center",
                alignSelf: "stretch",
                borderRadius: "4px",
                backgroundColor: viewMode === "list" ? "#F6F7FB" : "#FFF",
                cursor: "pointer",
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.25 0H0.875C0.642936 0 0.420376 0.0921872 0.256282 0.256282C0.0921872 0.420376 0 0.642936 0 0.875L0 5.25C0 5.48206 0.0921872 5.70462 0.256282 5.86872C0.420376 6.03281 0.642936 6.125 0.875 6.125H5.25C5.48206 6.125 5.70462 6.03281 5.86872 5.86872C6.03281 5.70462 6.125 5.48206 6.125 5.25V0.875C6.125 0.642936 6.03281 0.420376 5.86872 0.256282C5.70462 0.0921872 5.48206 0 5.25 0V0ZM5.25 7.875H0.875C0.642936 7.875 0.420376 7.96719 0.256282 8.13128C0.0921872 8.29538 0 8.51794 0 8.75L0 13.125C0 13.3571 0.0921872 13.5796 0.256282 13.7437C0.420376 13.9078 0.642936 14 0.875 14H5.25C5.48206 14 5.70462 13.9078 5.86872 13.7437C6.03281 13.5796 6.125 13.3571 6.125 13.125V8.75C6.125 8.51794 6.03281 8.29538 5.86872 8.13128C5.70462 7.96719 5.48206 7.875 5.25 7.875ZM8.3125 1.75H13.5625C13.6785 1.75 13.7898 1.70391 13.8719 1.62186C13.9539 1.53981 14 1.42853 14 1.3125C14 1.19647 13.9539 1.08519 13.8719 1.00314C13.7898 0.921094 13.6785 0.875 13.5625 0.875H8.3125C8.19647 0.875 8.08519 0.921094 8.00314 1.00314C7.92109 1.08519 7.875 1.19647 7.875 1.3125C7.875 1.42853 7.92109 1.53981 8.00314 1.62186C8.08519 1.70391 8.19647 1.75 8.3125 1.75ZM13.5625 4.375H8.3125C8.19647 4.375 8.08519 4.42109 8.00314 4.50314C7.92109 4.58519 7.875 4.69647 7.875 4.8125C7.875 4.92853 7.92109 5.03981 8.00314 5.12186C8.08519 5.20391 8.19647 5.25 8.3125 5.25H13.5625C13.6785 5.25 13.7898 5.20391 13.8719 5.12186C13.9539 5.03981 14 4.92853 14 4.8125C14 4.69647 13.9539 4.58519 13.8719 4.50314C13.7898 4.42109 13.6785 4.375 13.5625 4.375ZM13.5625 12.25H8.3125C8.19647 12.25 8.08519 12.2961 8.00314 12.3781C7.92109 12.4602 7.875 12.5715 7.875 12.6875C7.875 12.8035 7.92109 12.9148 8.00314 12.9969C8.08519 13.0789 8.19647 13.125 8.3125 13.125H13.5625C13.6785 13.125 13.7898 13.0789 13.8719 12.9969C13.9539 12.9148 14 12.8035 14 12.6875C14 12.5715 13.9539 12.4602 13.8719 12.3781C13.7898 12.2961 13.6785 12.25 13.5625 12.25ZM13.5625 8.75H8.3125C8.19647 8.75 8.08519 8.79609 8.00314 8.87814C7.92109 8.96019 7.875 9.07147 7.875 9.1875C7.875 9.30353 7.92109 9.41481 8.00314 9.49686C8.08519 9.57891 8.19647 9.625 8.3125 9.625H13.5625C13.6785 9.625 13.7898 9.57891 13.8719 9.49686C13.9539 9.41481 14 9.30353 14 9.1875C14 9.07147 13.9539 8.96019 13.8719 8.87814C13.7898 8.79609 13.6785 8.75 13.5625 8.75Z"
                  fill={viewMode === "list" ? "#5D51E2" : "#A0A3AF"}
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && (
        <div
          style={{
            width: "100%",
            backgroundColor: "#F6F7FB",
            minHeight: "calc(100vh - 200px)",
            padding: "20px",
          }}
        >
          {/* Filter Bar */}
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "50px",
              padding: "10px",
              alignItems: "center",
              gap: "10px",
              borderRadius: "6px 6px 0px 0px",
              border: "1px solid #EBECF1",
              backgroundColor: "#FFF",
              marginBottom: "0",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                flex: 1,
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
                  backgroundColor: "#FFF",
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
                  placeholder="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    outline: "none",
                    fontSize: "14px",
                    width: "100%",
                    backgroundColor: "transparent",
                    color: "#C6C8D1",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  }}
                />
              </div>

              {/* Filter Items */}
              <div
                style={{ display: "flex", alignItems: "center", gap: "10px" }}
              >
                {/* Assignee Filter */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={handleAssigneeFilterClick}
                    style={{
                      display: "flex",
                      padding: "5px 10px",
                      alignItems: "center",
                      gap: "5px",
                      borderRadius: "6px",
                      backgroundColor: assigneeFilterOpen
                        ? "#F6F7FB"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      Assignee:
                    </div>
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      {assigneeFilter}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                        fill="#A0A3AF"
                      />
                    </svg>
                  </div>
                  {assigneeFilterOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        zIndex: 1000,
                        backgroundColor: "#FFF",
                        border: "1px solid #EBECF1",
                        borderRadius: "6px",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        minWidth: "160px",
                        padding: "5px 0",
                        marginTop: "5px",
                      }}
                    >
                      {[
                        "All",
                        "John Smith",
                        "Sarah Johnson",
                        "Mike Wilson",
                        "Emily Brown",
                      ].map((assignee) => (
                        <div
                          key={assignee}
                          onClick={() => {
                            setAssigneeFilter(assignee);
                            setAssigneeFilterOpen(false);
                          }}
                          style={{
                            padding: "8px 15px",
                            cursor: "pointer",
                            backgroundColor:
                              assigneeFilter === assignee
                                ? "#F6F7FB"
                                : "transparent",
                            fontSize: "14px",
                            fontFamily:
                              "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                            color: "#202437",
                          }}
                          onMouseEnter={(e) => {
                            if (assigneeFilter !== assignee) {
                              e.currentTarget.style.backgroundColor = "#F6F7FB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (assigneeFilter !== assignee) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          {assignee}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Date Filter */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={handleDateFilterClick}
                    style={{
                      display: "flex",
                      padding: "5px 10px",
                      alignItems: "center",
                      gap: "5px",
                      borderRadius: "6px",
                      backgroundColor: dateFilterOpen
                        ? "#F6F7FB"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      Date:
                    </div>
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      {dateFilter}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                        fill="#A0A3AF"
                      />
                    </svg>
                  </div>
                  {dateFilterOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        zIndex: 1000,
                        backgroundColor: "#FFF",
                        border: "1px solid #EBECF1",
                        borderRadius: "6px",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        minWidth: "160px",
                        padding: "5px 0",
                        marginTop: "5px",
                      }}
                    >
                      {[
                        "All",
                        "Today",
                        "Tomorrow",
                        "This Week",
                        "Next Week",
                        "Overdue",
                      ].map((date) => (
                        <div
                          key={date}
                          onClick={() => {
                            setDateFilter(date);
                            setDateFilterOpen(false);
                          }}
                          style={{
                            padding: "8px 15px",
                            cursor: "pointer",
                            backgroundColor:
                              dateFilter === date ? "#F6F7FB" : "transparent",
                            fontSize: "14px",
                            fontFamily:
                              "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                            color: "#202437",
                          }}
                          onMouseEnter={(e) => {
                            if (dateFilter !== date) {
                              e.currentTarget.style.backgroundColor = "#F6F7FB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (dateFilter !== date) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          {date}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Type Filter */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={handleTypeFilterClick}
                    style={{
                      display: "flex",
                      padding: "5px 10px",
                      alignItems: "center",
                      gap: "5px",
                      borderRadius: "6px",
                      backgroundColor: typeFilterOpen
                        ? "#F6F7FB"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div
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
                    </div>
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      {typeFilter}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                        fill="#A0A3AF"
                      />
                    </svg>
                  </div>
                  {typeFilterOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        zIndex: 1000,
                        backgroundColor: "#FFF",
                        border: "1px solid #EBECF1",
                        borderRadius: "6px",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        minWidth: "160px",
                        padding: "5px 0",
                        marginTop: "5px",
                      }}
                    >
                      {[
                        "All",
                        "Maintenance",
                        "Inspection",
                        "Cleaning",
                        "Administration",
                        "Emergency",
                      ].map((type) => (
                        <div
                          key={type}
                          onClick={() => {
                            setTypeFilter(type);
                            setTypeFilterOpen(false);
                          }}
                          style={{
                            padding: "8px 15px",
                            cursor: "pointer",
                            backgroundColor:
                              typeFilter === type ? "#F6F7FB" : "transparent",
                            fontSize: "14px",
                            fontFamily:
                              "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                            color: "#202437",
                          }}
                          onMouseEnter={(e) => {
                            if (typeFilter !== type) {
                              e.currentTarget.style.backgroundColor = "#F6F7FB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (typeFilter !== type) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          {type}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tag Filter */}
                <div style={{ position: "relative" }}>
                  <div
                    onClick={handleTagFilterClick}
                    style={{
                      display: "flex",
                      padding: "5px 10px",
                      alignItems: "center",
                      gap: "5px",
                      borderRadius: "6px",
                      backgroundColor: tagFilterOpen
                        ? "#F6F7FB"
                        : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      Tag:
                    </div>
                    <div
                      style={{
                        color: "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "510",
                        lineHeight: "20px",
                      }}
                    >
                      {tagFilter}
                    </div>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M6.0003 9.25516L0.859047 4.14391C0.789203 4.07365 0.75 3.97861 0.75 3.87954C0.75 3.78047 0.789203 3.68542 0.859047 3.61516C0.893908 3.58001 0.935384 3.55212 0.981081 3.53308C1.02678 3.51404 1.07579 3.50424 1.1253 3.50424C1.1748 3.50424 1.22382 3.51404 1.26951 3.53308C1.31521 3.55212 1.35669 3.58001 1.39155 3.61516L6.0003 8.19766L10.609 3.61141C10.6439 3.57626 10.6854 3.54837 10.7311 3.52933C10.7768 3.51029 10.8258 3.50049 10.8753 3.50049C10.9248 3.50049 10.9738 3.51029 11.0195 3.52933C11.0652 3.54837 11.1067 3.57626 11.1415 3.61141C11.2114 3.68167 11.2506 3.77672 11.2506 3.87579C11.2506 3.97486 11.2114 4.0699 11.1415 4.14016L6.0003 9.25516Z"
                        fill="#A0A3AF"
                      />
                    </svg>
                  </div>
                  {tagFilterOpen && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        left: "0",
                        zIndex: 1000,
                        backgroundColor: "#FFF",
                        border: "1px solid #EBECF1",
                        borderRadius: "6px",
                        boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
                        minWidth: "160px",
                        padding: "5px 0",
                        marginTop: "5px",
                      }}
                    >
                      {["All", ...customTags].map((tag) => (
                        <div
                          key={tag}
                          onClick={() => {
                            setTagFilter(tag);
                            setTagFilterOpen(false);
                          }}
                          style={{
                            padding: "8px 15px",
                            cursor: "pointer",
                            backgroundColor:
                              tagFilter === tag ? "#F6F7FB" : "transparent",
                            fontSize: "14px",
                            fontFamily:
                              "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                            color: "#202437",
                          }}
                          onMouseEnter={(e) => {
                            if (tagFilter !== tag) {
                              e.currentTarget.style.backgroundColor = "#F6F7FB";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (tagFilter !== tag) {
                              e.currentTarget.style.backgroundColor =
                                "transparent";
                            }
                          }}
                        >
                          {tag}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* View Mode Toggle */}
            <div
              style={{
                display: "flex",
                height: "30px",
                padding: "3px",
                justifyContent: "flex-end",
                alignItems: "center",
                borderRadius: "6px",
                border: "1px solid #E1E2E6",
              }}
            >
              <div
                onClick={() => setViewMode("kanban")}
                style={{
                  display: "flex",
                  width: "44px",
                  padding: "5px 15px",
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "stretch",
                  borderRadius: "4px",
                  backgroundColor: "#FFF",
                  cursor: "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4.8125 7.875C5.53737 7.875 6.125 8.46263 6.125 9.1875V12.6875C6.125 13.4124 5.53737 14 4.8125 14H1.3125C0.587626 14 7.04666e-09 13.4124 0 12.6875V9.1875C5.63733e-08 8.46263 0.587626 7.875 1.3125 7.875H4.8125ZM12.6875 7.875C13.4124 7.875 14 8.46263 14 9.1875V12.6875C14 13.4124 13.4124 14 12.6875 14H9.1875C8.46263 14 7.875 13.4124 7.875 12.6875V9.1875C7.875 8.46263 8.46263 7.875 9.1875 7.875H12.6875ZM4.8125 0C5.53737 5.63724e-08 6.125 0.587626 6.125 1.3125V4.8125C6.125 5.53737 5.53737 6.125 4.8125 6.125H1.3125C0.587626 6.125 7.04666e-09 5.53737 0 4.8125V1.3125C5.63733e-08 0.587626 0.587626 7.04655e-09 1.3125 0H4.8125ZM12.6875 0C13.4124 5.63724e-08 14 0.587626 14 1.3125V4.8125C14 5.53737 13.4124 6.125 12.6875 6.125H9.1875C8.46263 6.125 7.875 5.53737 7.875 4.8125V1.3125C7.875 0.587626 8.46263 7.04655e-09 9.1875 0H12.6875Z"
                    fill="#A0A3AF"
                  />
                </svg>
              </div>
              <div
                style={{
                  display: "flex",
                  width: "44px",
                  padding: "5px 15px",
                  justifyContent: "center",
                  alignItems: "center",
                  alignSelf: "stretch",
                  borderRadius: "4px",
                  backgroundColor: "#F6F7FB",
                  cursor: "pointer",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M4.8125 7.875C5.53737 7.875 6.125 8.46263 6.125 9.1875V12.6875C6.125 13.4124 5.53737 14 4.8125 14H1.3125C0.587626 14 7.04666e-09 13.4124 0 12.6875V9.1875C5.63733e-08 8.46263 0.587626 7.875 1.3125 7.875H4.8125Z"
                    fill="#5D51E2"
                  />
                  <path
                    d="M13.3438 11.8125C13.7062 11.8125 14 12.1063 14 12.4688C14 12.8312 13.7062 13.125 13.3438 13.125H8.53125C8.16881 13.125 7.875 12.8312 7.875 12.4688C7.875 12.1063 8.16881 11.8125 8.53125 11.8125H13.3438Z"
                    fill="#5D51E2"
                  />
                  <path
                    d="M13.3438 8.75C13.7062 8.75 14 9.04381 14 9.40625C14 9.76869 13.7062 10.0625 13.3438 10.0625H8.53125C8.16881 10.0625 7.875 9.76869 7.875 9.40625C7.875 9.04381 8.16881 8.75 8.53125 8.75H13.3438Z"
                    fill="#5D51E2"
                  />
                  <path
                    d="M4.8125 0C5.53737 5.63724e-08 6.125 0.587626 6.125 1.3125V4.8125C6.125 5.53737 5.53737 6.125 4.8125 6.125H1.3125C0.587626 6.125 7.04666e-09 5.53737 0 4.8125V1.3125C5.63733e-08 0.587626 0.587626 7.04655e-09 1.3125 0H4.8125Z"
                    fill="#5D51E2"
                  />
                  <path
                    d="M13.3438 3.9375C13.7062 3.9375 14 4.23131 14 4.59375C14 4.95619 13.7062 5.25 13.3438 5.25H8.53125C8.16881 5.25 7.875 4.95619 7.875 4.59375C7.875 4.23131 8.16881 3.9375 8.53125 3.9375H13.3438Z"
                    fill="#5D51E2"
                  />
                  <path
                    d="M13.3438 0.875C13.7062 0.875 14 1.16881 14 1.53125C14 1.89369 13.7062 2.1875 13.3438 2.1875H8.53125C8.16881 2.1875 7.875 1.89369 7.875 1.53125C7.875 1.16881 8.16881 0.875 8.53125 0.875H13.3438Z"
                    fill="#5D51E2"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Table */}
          <div
            style={{
              width: "100%",
              borderRadius: "0px 0px 6px 6px",
              border: "1px solid #EBECF1",
              borderTop: "none",
              backgroundColor: "#FFF",
            }}
          >
            {/* Table Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "160px 280px 200px 200px 200px 160px",
                gap: "40px",
                padding: "12px 20px",
                borderBottom: "1px solid #EBECF1",
                backgroundColor: "#FFF",
              }}
            >
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Due Date/Time
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
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Property
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
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Status
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
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Task Type
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
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                }}
              >
                Assignee
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
              <div
                style={{
                  color: "#202437",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                  fontSize: "14px",
                  fontWeight: "700",
                  lineHeight: "20px",
                  textAlign: "center",
                }}
              >
                Action
              </div>
            </div>

            {/* Table Rows */}
            {getFilteredTasks().length > 0 ? (
              getFilteredTasks().map((task) => (
                <div
                  key={task.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "160px 280px 200px 200px 200px 160px",
                    gap: "40px",
                    padding: "15px 20px",
                    borderBottom: "1px solid #EBECF1",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      color: "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                    }}
                  >
                    {task.date}
                  </div>
                  <div
                    style={{
                      color: "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                    }}
                  >
                    {task.address}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                      <circle
                        opacity="0.8"
                        cx="4"
                        cy="4"
                        r="4"
                        fill={
                          task.status === "todo"
                            ? "#5D51E2"
                            : task.status === "inprogress"
                              ? "#FFA600"
                              : task.status === "done"
                                ? "#20C472"
                                : "#5D51E2"
                        }
                      />
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
                      {task.status === "todo"
                        ? "To Do"
                        : task.status === "inprogress"
                          ? "In Progress"
                          : task.status === "done"
                            ? "Done"
                            : "To Do"}
                    </span>
                  </div>
                  <div
                    style={{
                      color: "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                    }}
                  >
                    {task.type}
                  </div>
                  <div
                    style={{
                      color: "#515666",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                    }}
                  >
                    {task.assignees
                      .map((assignee: any) => assignee.name)
                      .join(", ")}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      justifyContent: "center",
                    }}
                  >
                    {/* Edit Button */}
                    <button
                      style={{
                        display: "flex",
                        padding: "5px",
                        alignItems: "center",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M15.805 1.40591C15.655 1.11947 15.4571 0.86075 15.22 0.640912C15.0102 0.440993 14.7664 0.280137 14.5 0.165912C14.2591 0.0588385 13.9986 0.0026657 13.735 0.000912288C13.3669 -0.0107943 13.004 0.0904005 12.695 0.290912C12.499 0.413852 12.3134 0.552649 12.14 0.705912C12.08 0.755912 11.69 1.14591 10.97 1.86591C10.25 2.58591 9.47 3.36591 8.625 4.21091L6.32 6.50091L5.28 7.53591C5.253 7.5647 5.2295 7.59659 5.21 7.63091C5.19456 7.66165 5.1812 7.69339 5.17 7.72591C5.12 7.89091 5.035 8.17091 4.92 8.57091C4.805 8.97091 4.69 9.37091 4.56 9.78091C4.43 10.1909 4.325 10.5559 4.225 10.8759C4.125 11.1959 4.08 11.3759 4.08 11.3759C4.05486 11.4488 4.05486 11.528 4.08 11.6009C4.09625 11.6755 4.13458 11.7434 4.19 11.7959C4.22777 11.839 4.27597 11.8717 4.33 11.8909C4.3792 11.911 4.43187 11.9212 4.485 11.9209H4.545H4.61L5.11 11.7559L6.22 11.4009L7.42 11.0159C7.805 10.8909 8.06 10.8109 8.19 10.7809C8.22027 10.7699 8.24887 10.7548 8.275 10.7359L8.36 10.6709L9.5 9.53091C10.185 8.85591 10.93 8.11591 11.745 7.32091L14 5.08091C14.71 4.38091 15.12 3.97091 15.235 3.84591C15.4719 3.60808 15.6679 3.33269 15.815 3.03091C15.9354 2.77776 15.9985 2.50122 16 2.22091C15.9942 1.9384 15.9277 1.66045 15.805 1.40591ZM14.9 2.66591C14.8041 2.85126 14.6792 3.02006 14.53 3.16591C14.47 3.24091 14.285 3.42591 13.975 3.73091L12.705 4.96091C12.16 5.49591 11.505 6.15091 10.705 6.91591L8.04 9.54591L7.73 9.84591L6.675 10.1809L5.34 10.6109C5.475 10.1709 5.615 9.71591 5.755 9.24091C5.895 8.76591 6 8.40091 6.075 8.14091C6.28 7.93091 6.745 7.47591 7.455 6.76591L9.69 4.54091L12.825 1.40591C12.9174 1.32867 13.0142 1.25688 13.115 1.19091C13.2932 1.0572 13.5125 0.989995 13.735 1.00091C13.8739 1.00074 14.011 1.03329 14.135 1.09591C14.2804 1.16812 14.4137 1.26259 14.53 1.37591C14.6716 1.50023 14.7916 1.64724 14.885 1.81091C14.9557 1.94273 14.9998 2.08711 15.015 2.23591C15.0095 2.38606 14.9702 2.53304 14.9 2.66591ZM12.5 15.0009H1V2.50091H8.5L9.5 1.50091H1C0.734784 1.50091 0.48043 1.60627 0.292893 1.79381C0.105357 1.98134 0 2.2357 0 2.50091L0 15.0009C0 15.2661 0.105357 15.5205 0.292893 15.708C0.48043 15.8956 0.734784 16.0009 1 16.0009H12.5C12.7652 16.0009 13.0196 15.8956 13.2071 15.708C13.3946 15.5205 13.5 15.2661 13.5 15.0009V7.00091L12.5 8.00091V15.0009Z"
                          fill="#797E8B"
                        />
                      </svg>
                    </button>

                    {/* Archive Button */}
                    <button
                      style={{
                        display: "flex",
                        padding: "5px",
                        alignItems: "center",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
                      }}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                      >
                        <path
                          d="M14.23 1.68504C14.1638 1.48547 14.0363 1.31186 13.8658 1.18888C13.6952 1.0659 13.4903 0.999809 13.28 1H2.72C2.50974 0.999809 2.30477 1.0659 2.13422 1.18888C1.96368 1.31186 1.83623 1.48547 1.77 1.68504L0 7.00034V14.0007C0 14.266 0.105357 14.5203 0.292893 14.7079C0.48043 14.8954 0.734784 15.0008 1 15.0008H15C15.2652 15.0008 15.5196 14.8954 15.7071 14.7079C15.8946 14.5203 16 14.266 16 14.0007V7.00034L14.23 1.68504ZM2.72 2.00006H13.28L14.945 7.00034H10C10 7.53081 9.78929 8.03954 9.41421 8.41464C9.03914 8.78973 8.53043 9.00046 8 9.00046C7.46957 9.00046 6.96086 8.78973 6.58579 8.41464C6.21071 8.03954 6 7.53081 6 7.00034H1.055L2.72 2.00006ZM15 14.0007H1V8.0004H5.175C5.3832 8.58298 5.76641 9.08695 6.27213 9.44328C6.77785 9.79961 7.38136 9.99087 8 9.99087C8.61864 9.99087 9.22215 9.79961 9.72787 9.44328C10.2336 9.08695 10.6168 8.58298 10.825 8.0004H15V14.0007Z"
                          fill="#797E8B"
                        />
                      </svg>
                    </button>

                    {/* Delete Button */}
                    <button
                      style={{
                        display: "flex",
                        padding: "5px",
                        alignItems: "center",
                        borderRadius: "6px",
                        border: "none",
                        backgroundColor: "transparent",
                        cursor: "pointer",
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
                          d="M14.5 2.00049H10.5V1.00049C10.5 0.735272 10.3946 0.480918 10.2071 0.293382C10.0196 0.105845 9.76522 0.000488281 9.5 0.000488281L6.5 0.000488281C6.23478 0.000488281 5.98043 0.105845 5.79289 0.293382C5.60536 0.480918 5.5 0.735272 5.5 1.00049V2.00049H1.5C1.36739 2.00049 1.24021 2.05317 1.14645 2.14693C1.05268 2.2407 1 2.36788 1 2.50049C1 2.6331 1.05268 2.76027 1.14645 2.85404C1.24021 2.94781 1.36739 3.00049 1.5 3.00049H2.535L2.965 15.0355C2.97407 15.2946 3.08342 15.54 3.26999 15.7201C3.45655 15.9001 3.70574 16.0006 3.965 16.0005H12.035C12.2943 16.0006 12.5435 15.9001 12.73 15.7201C12.9166 15.54 13.0259 15.2946 13.035 15.0355L13.465 3.00049H14.5C14.6326 3.00049 14.7598 2.94781 14.8536 2.85404C14.9473 2.76027 15 2.6331 15 2.50049C15 2.36788 14.9473 2.2407 14.8536 2.14693C14.7598 2.05317 14.6326 2.00049 14.5 2.00049ZM6.5 1.00049H9.5V2.00049H6.5V1.00049ZM12 15.0005H4L3.5 3.00049H12.5L12 15.0005ZM9.535 13.0005C9.66761 13.0005 9.79479 12.9478 9.88855 12.854C9.98232 12.7603 10.035 12.6331 10.035 12.5005L10.47 5.56549C10.4801 5.4942 10.4747 5.42158 10.4541 5.35259C10.4335 5.2836 10.3983 5.21987 10.3508 5.16575C10.3033 5.11162 10.2447 5.06839 10.179 5.03901C10.1133 5.00962 10.042 4.99478 9.97 4.99549C9.83739 4.99549 9.71021 5.04817 9.61645 5.14193C9.52268 5.2357 9.47 5.36288 9.47 5.49549L9.035 12.4305C9.02492 12.5018 9.03035 12.5744 9.05092 12.6434C9.07149 12.7124 9.10672 12.7761 9.15419 12.8302C9.20167 12.8844 9.26027 12.9276 9.32599 12.957C9.39172 12.9864 9.46301 13.0012 9.535 13.0005ZM6.465 13.0005C6.53699 13.0012 6.60828 12.9864 6.67401 12.957C6.73973 12.9276 6.79833 12.8844 6.84581 12.8302C6.89328 12.7761 6.92851 12.7124 6.94908 12.6434C6.96965 12.5744 6.97508 12.5018 6.965 12.4305L6.53 5.50049C6.53 5.36788 6.47732 5.2407 6.38355 5.14693C6.28979 5.05317 6.16261 5.00049 6.03 5.00049C5.95801 4.99978 5.88672 5.01462 5.82099 5.04401C5.75527 5.07339 5.69667 5.11662 5.64919 5.17074C5.60172 5.22487 5.56649 5.2886 5.54592 5.35759C5.52535 5.42658 5.51992 5.49921 5.53 5.57049L5.97 12.5005C5.96999 12.6322 6.02199 12.7587 6.11467 12.8523C6.20736 12.9459 6.33326 12.9992 6.465 13.0005Z"
                          fill="#797E8B"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "40px",
                  textAlign: "center",
                  color: "#797E8B",
                  fontFamily:
                    "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                }}
              >
                No tasks found
              </div>
            )}
          </div>

          {/* Pagination */}
          <div
            style={{
              display: "flex",
              width: "100%",
              padding: "10px 20px",
              justifyContent: "center",
              alignItems: "center",
              borderRadius: "0px 0px 4px 4px",
              border: "1px solid #EBECF1",
              backgroundColor: "#FFF",
              marginTop: "0",
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
                backgroundColor: "#FFF",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "2px" }}
              >
                {[1, 2, 3, 4, 5].map((num) => (
                  <div
                    key={num}
                    style={{
                      display: "flex",
                      height: "30px",
                      minWidth: "30px",
                      padding: "5px 8px",
                      justifyContent: "center",
                      alignItems: "center",
                      borderRadius: "6px",
                      backgroundColor: "#FFF",
                      cursor: "pointer",
                    }}
                  >
                    <span
                      style={{
                        color: num === 1 ? "#5D51E2" : "#515666",
                        fontFamily:
                          "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: num === 1 ? "700" : "400",
                        lineHeight: "20px",
                      }}
                    >
                      {num}
                    </span>
                  </div>
                ))}
                <div
                  style={{
                    display: "flex",
                    height: "30px",
                    minWidth: "30px",
                    padding: "5px 8px",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "6px",
                    backgroundColor: "#FFF",
                  }}
                >
                  <span
                    style={{
                      color: "#515666",
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
                    padding: "5px 8px",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "6px",
                    backgroundColor: "#FFF",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      color: "#515666",
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
              <div
                style={{
                  width: "1px",
                  height: "24px",
                  backgroundColor: "#EBECF1",
                }}
              />
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <input
                  type="text"
                  value={currentPageInput}
                  onChange={(e) => setCurrentPageInput(e.target.value)}
                  style={{
                    width: "40px",
                    height: "24px",
                    padding: "0 10px",
                    border: "1px solid #C6C8D1",
                    borderRadius: "6px",
                    backgroundColor: "#FFF",
                    textAlign: "center",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    color: "#202437",
                  }}
                />
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  style={{
                    width: "60px",
                    height: "24px",
                    padding: "0 10px",
                    border: "1px solid #C6C8D1",
                    borderRadius: "6px",
                    backgroundColor: "#FFF",
                    fontSize: "14px",
                    fontFamily:
                      "SF Pro, -apple-system, Roboto, Helvetica, sans-serif",
                    color: "#202437",
                  }}
                >
                  <option value="50">50</option>
                  <option value="100">100</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Empty State */}
      {getFilteredTasks().length === 0 && !loading && viewMode === "kanban" && (
        <div style={{ textAlign: "center", padding: "40px", color: "#797E8B" }}>
          <p>暂无任务数据</p>
          <p>请先在 Supabase Dashboard 中执行数据库架构和示例数据脚本</p>
        </div>
      )}

      {/* Kanban Board */}
      {tasks.length > 0 && (
        <div style={kanbanStyle}>
          {getFilteredColumns().map((column) => (
            <div key={column.id} style={columnStyle}>
              {/* Column Header */}
              <div
                style={{
                  display: "flex",
                  height: "50px",
                  alignItems: "center",
                  gap: "10px",
                  alignSelf: "stretch",
                  marginBottom: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    flex: "1 0 0",
                  }}
                >
                  <div
                    style={{
                      width: "8px",
                      height: "8px",
                      borderRadius: "10px",
                      backgroundColor: column.color,
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                    }}
                  >
                    <div
                      style={{
                        color: "#202437",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "14px",
                        fontWeight: "600",
                        lineHeight: "20px",
                      }}
                    >
                      {column.title}
                    </div>
                    <div
                      style={{
                        color: "#A0A3AF",
                        fontFamily:
                          "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                        fontSize: "12px",
                        fontWeight: "400",
                        lineHeight: "20px",
                      }}
                    >
                      {column.count}
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    width: "30px",
                    height: "30px",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "6px",
                    backgroundColor: "transparent",
                    cursor: "pointer",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path
                      d="M1.3125 5.6875C1.05291 5.6875 0.799154 5.76448 0.583315 5.9087C0.367475 6.05292 0.199249 6.2579 0.0999087 6.49773C0.000568688 6.73756 -0.0254232 7.00146 0.0252199 7.25606C0.075863 7.51066 0.200867 7.74452 0.384423 7.92808C0.567979 8.11163 0.801845 8.23664 1.05644 8.28728C1.31104 8.33792 1.57494 8.31193 1.81477 8.21259C2.0546 8.11325 2.25959 7.94503 2.4038 7.72919C2.54802 7.51335 2.625 7.25959 2.625 7C2.625 6.6519 2.48672 6.31806 2.24058 6.07192C1.99444 5.82578 1.6606 5.6875 1.3125 5.6875ZM7 5.6875C6.74041 5.6875 6.48665 5.76448 6.27081 5.9087C6.05498 6.05292 5.88675 6.2579 5.78741 6.49773C5.68807 6.73756 5.66208 7.00146 5.71272 7.25606C5.76336 7.51066 5.88837 7.74452 6.07192 7.92808C6.25548 8.11163 6.48934 8.23664 6.74394 8.28728C6.99854 8.33792 7.26244 8.31193 7.50227 8.21259C7.7421 8.11325 7.94709 7.94503 8.0913 7.72919C8.23552 7.51335 8.3125 7.25959 8.3125 7C8.3125 6.6519 8.17422 6.31806 7.92808 6.07192C7.68194 5.82578 7.3481 5.6875 7 5.6875ZM12.6875 5.6875C12.4279 5.6875 12.1742 5.76448 11.9583 5.9087C11.7425 6.05292 11.5742 6.2579 11.4749 6.49773C11.3756 6.73756 11.3496 7.00146 11.4002 7.25606C11.4509 7.51066 11.5759 7.74452 11.7594 7.92808C11.943 8.11163 12.1768 8.23664 12.4314 8.28728C12.686 8.33792 12.9499 8.31193 13.1898 8.21259C13.4296 8.11325 13.6346 7.94503 13.7788 7.72919C13.923 7.51335 14 7.25959 14 7C14 6.6519 13.8617 6.31806 13.6156 6.07192C13.3694 5.82578 13.0356 5.6875 12.6875 5.6875Z"
                      fill="#797E8B"
                    />
                  </svg>
                </div>
              </div>

              {/* Column Tasks */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  gap: "10px",
                  alignSelf: "stretch",
                  flex: "1",
                  overflowY: "auto",
                }}
              >
                {column.tasks.map((task: any) => (
                  <TaskCard key={task.id} task={task} />
                ))}

                {/* Add Task Button */}
                <div
                  onClick={() => {
                    setNewTaskColumn(column.id);
                    setShowAddTaskModal(true);
                  }}
                  style={{
                    display: "flex",
                    height: "36px",
                    padding: "0px 15px",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    alignSelf: "stretch",
                    borderRadius: "6px",
                    border: "1px solid #EBECF1",
                    backgroundColor: "#FFF",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F8F9FA";
                    e.currentTarget.style.borderColor = "#5D51E2";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFF";
                    e.currentTarget.style.borderColor = "#EBECF1";
                  }}
                >
                  <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                    <path
                      d="M13.625 6.125H8.375V0.875C8.375 0.642936 8.28281 0.420376 8.11872 0.256282C7.95462 0.0921872 7.73206 0 7.5 0C7.26794 0 7.04538 0.0921872 6.88128 0.256282C6.71719 0.420376 6.625 0.642936 6.625 0.875V6.125H1.375C1.14294 6.125 0.920376 6.21719 0.756282 6.38128C0.592187 6.54538 0.5 6.76794 0.5 7C0.5 7.23206 0.592187 7.45462 0.756282 7.61872C0.920376 7.78281 1.14294 7.875 1.375 7.875H6.625V13.125C6.625 13.3571 6.71719 13.5796 6.88128 13.7437C7.04538 13.9078 7.26794 14 7.5 14C7.73206 14 7.95462 13.9078 8.11872 13.7437C8.28281 13.5796 8.375 13.3571 8.375 13.125V7.875H13.625C13.8571 7.875 14.0796 7.78281 14.2437 7.61872C14.4078 7.45462 14.5 7.23206 14.5 7C14.5 6.76794 14.4078 6.54538 14.2437 6.38128C14.0796 6.21719 13.8571 6.125 13.625 6.125Z"
                      fill="#797E8B"
                    />
                  </svg>
                  <div
                    style={{
                      color: "#797E8B",
                      fontFamily:
                        "SF Pro Text, -apple-system, Roboto, Helvetica, sans-serif",
                      fontSize: "14px",
                      fontWeight: "400",
                      lineHeight: "20px",
                    }}
                  >
                    Add Task
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Add Column */}
          <div
            style={{
              display: "flex",
              height: "50px",
              alignItems: "center",
              gap: "10px",
              minWidth: "50px",
            }}
          >
            <div
              onClick={() => setShowAddTagModal(true)}
              style={{
                display: "flex",
                width: "30px",
                height: "30px",
                padding: "0px 15px",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                borderRadius: "6px",
                border: "1px solid #EBECF1",
                backgroundColor: "#FFF",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8F9FA";
                e.currentTarget.style.borderColor = "#5D51E2";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFF";
                e.currentTarget.style.borderColor = "#EBECF1";
              }}
            >
              <svg width="15" height="14" viewBox="0 0 15 14" fill="none">
                <path
                  d="M13.625 6.125H8.375V0.875C8.375 0.642936 8.28281 0.420376 8.11872 0.256282C7.95462 0.0921872 7.73206 0 7.5 0C7.26794 0 7.04538 0.0921872 6.88128 0.256282C6.71719 0.420376 6.625 0.642936 6.625 0.875V6.125H1.375C1.14294 6.125 0.920376 6.21719 0.756282 6.38128C0.592187 6.54538 0.5 6.76794 0.5 7C0.5 7.23206 0.592187 7.45462 0.756282 7.61872C0.920376 7.78281 1.14294 7.875 1.375 7.875H6.625V13.125C6.625 13.3571 6.71719 13.5796 6.88128 13.7437C7.04538 13.9078 7.26794 14 7.5 14C7.73206 14 7.95462 13.9078 8.11872 13.7437C8.28281 13.5796 8.375 13.3571 8.375 13.125V7.875H13.625C13.8571 7.875 14.0796 7.78281 14.2437 7.61872C14.4078 7.45462 14.5 7.23206 14.5 7C14.5 6.76794 14.4078 6.54538 14.2437 6.38128C14.0796 6.21719 13.8571 6.125 13.625 6.125Z"
                  fill="#797E8B"
                />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && tasks.length > 0 && (
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "8px",
            border: "1px solid #EBECF1",
            margin: "20px",
            overflow: "hidden",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "150px 200px 120px 150px 200px 150px 100px",
              gap: "20px",
              padding: "16px 20px",
              borderBottom: "1px solid #EBECF1",
              fontSize: "14px",
              fontWeight: "600",
              color: "#202437",
              backgroundColor: "#F8F9FA",
            }}
          >
            <div>Due Date/Time</div>
            <div>Property</div>
            <div>Status</div>
            <div>Task Type</div>
            <div>Assignee</div>
            <div>Action</div>
          </div>

          {/* Table Body */}
          {getFilteredTasks().map((task) => (
            <div
              key={task.id}
              style={{
                display: "grid",
                gridTemplateColumns:
                  "150px 200px 120px 150px 200px 150px 100px",
                gap: "20px",
                padding: "16px 20px",
                borderBottom: "1px solid #EBECF1",
                alignItems: "center",
              }}
            >
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  handleTaskDateClick(task.date);
                }}
                style={{
                  fontSize: "14px",
                  color: "#515666",
                  cursor: "pointer",
                  padding: "4px",
                  borderRadius: "4px",
                  transition: "background-color 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#F6F7FB";
                  e.currentTarget.style.color = "#5D51E2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#515666";
                }}
              >
                {formatDate(task.date)}
              </div>
              <div style={{ fontSize: "14px", color: "#515666" }}>
                {task.address}
              </div>
              <div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: "500",
                    backgroundColor:
                      task.status === "todo"
                        ? "#E8F0FE"
                        : task.status === "inprogress"
                          ? "#FFF3E0"
                          : task.status === "done"
                            ? "#E8F5E8"
                            : "#FFEAEA",
                    color:
                      task.status === "todo"
                        ? "#1967D2"
                        : task.status === "inprogress"
                          ? "#E8710A"
                          : task.status === "done"
                            ? "#2E7D2E"
                            : "#D32F2F",
                  }}
                >
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor:
                        task.status === "todo"
                          ? "#1967D2"
                          : task.status === "inprogress"
                            ? "#E8710A"
                            : task.status === "done"
                              ? "#2E7D2E"
                              : "#D32F2F",
                    }}
                  />
                  {task.status === "todo"
                    ? "To Do"
                    : task.status === "inprogress"
                      ? "In Progress"
                      : task.status === "done"
                        ? "Done"
                        : "Cancelled"}
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "#515666" }}>
                {task.type}
              </div>
              <div style={{ fontSize: "14px", color: "#515666" }}>
                {task.assignees
                  .map((assignee: any) => assignee.name)
                  .join(", ")}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <button
                  style={{
                    padding: "4px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1C8.55228 1 9 1.44772 9 2V7H14C14.5523 7 15 7.44772 15 8C15 8.55228 14.5523 9 14 9H9V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V9H2C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7H7V2C7 1.44772 7.44772 1 8 1Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
                <button
                  style={{
                    padding: "4px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M8 1C8.55228 1 9 1.44772 9 2V7H14C14.5523 7 15 7.44772 15 8C15 8.55228 14.5523 9 14 9H9V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V9H2C1.44772 9 1 8.55228 1 8C1 7.44772 1.44772 7 2 7H7V2C7 1.44772 7.44772 1 8 1Z"
                      fill="#797E8B"
                    />
                  </svg>
                </button>
                <button
                  onClick={(e) => handleDropdownToggle(task.id, e)}
                  style={{
                    padding: "4px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    borderRadius: "4px",
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
      )}

      {/* Task Actions Dropdown */}
      {activeDropdown && (
        <TaskActionsDropdown
          isOpen={true}
          onClose={() => setActiveDropdown(null)}
          position={dropdownPosition}
          onEdit={() => handleTaskEdit(activeDropdown)}
          onToggleComplete={() => handleTaskToggleComplete(activeDropdown)}
          onDelete={() => handleTaskDelete(activeDropdown)}
          onDuplicate={() => handleTaskDuplicate(activeDropdown)}
          onMoveToCategory={(category) =>
            handleTaskMoveToCategory(activeDropdown, category)
          }
          onSetPriority={(priority) =>
            handleTaskSetPriority(activeDropdown, priority)
          }
          onSetDueDate={() => handleTaskSetDueDate(activeDropdown)}
          isCompleted={
            tasks.find((task) => task.id === activeDropdown)?.is_completed ||
            false
          }
        />
      )}

      {/* Add Task Modal */}
      {showAddTaskModal && <AddTaskModal />}

      {/* Add Tag Modal */}
      {showAddTagModal && <AddTagModal />}
    </div>
  );

  function AddTaskModal() {
    const [formData, setFormData] = useState({
      title: "",
      type: "Property Maintenance",
      date: new Date().toISOString().split("T")[0],
      address: "",
      priority: "Medium",
      description: "",
      assignee: "",
    });

    const taskTypes = [
      "Property Maintenance",
      "Tenant Management",
      "Financial",
      "Legal",
      "Marketing",
      "General",
    ];

    const priorities = ["Low", "Medium", "High", "Critical"];

    const assignees = [
      { id: "1", name: "John Smith", initials: "JS" },
      { id: "2", name: "Sarah Johnson", initials: "SJ" },
      { id: "3", name: "Mike Brown", initials: "MB" },
      { id: "4", name: "Lisa Davis", initials: "LD" },
    ];

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const newTask: Task = {
        id: Date.now().toString(),
        title: formData.title,
        type: formData.type,
        typeColor: getTypeColor(formData.type),
        date: formData.date,
        address: formData.address,
        assignees: formData.assignee
          ? [assignees.find((a) => a.id === formData.assignee)!]
          : [],
        task_number: `T${Date.now().toString().slice(-4)}`,
        priority: formData.priority,
        status: newTaskColumn,
        is_completed: false,
      };

      // Add task to the appropriate column
      // This would typically call an API or update state
      console.log("Adding new task:", newTask);
      setShowAddTaskModal(false);

      // Reset form
      setFormData({
        title: "",
        type: "Property Maintenance",
        date: new Date().toISOString().split("T")[0],
        address: "",
        priority: "Medium",
        description: "",
        assignee: "",
      });
    };

    const getTypeColor = (type: string) => {
      const colors: { [key: string]: string } = {
        "Property Maintenance": "#E8710A",
        "Tenant Management": "#1967D2",
        Financial: "#2E7D2E",
        Legal: "#8E24AA",
        Marketing: "#D32F2F",
        General: "#797E8B",
      };
      return colors[type] || "#797E8B";
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
        onClick={() => setShowAddTaskModal(false)}
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
              Add New Task
            </h2>
            <button
              onClick={() => setShowAddTaskModal(false)}
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
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                  }}
                  placeholder="Enter task title"
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
                    Type *
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
                      backgroundColor: "white",
                    }}
                    required
                  >
                    {taskTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
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
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) =>
                      setFormData({ ...formData, priority: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  >
                    {priorities.map((priority) => (
                      <option key={priority} value={priority}>
                        {priority}
                      </option>
                    ))}
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
                  Property Address
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
                  placeholder="Enter property address"
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
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
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
                    Assignee
                  </label>
                  <select
                    value={formData.assignee}
                    onChange={(e) =>
                      setFormData({ ...formData, assignee: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                      backgroundColor: "white",
                    }}
                  >
                    <option value="">Unassigned</option>
                    {assignees.map((assignee) => (
                      <option key={assignee.id} value={assignee.id}>
                        {assignee.name}
                      </option>
                    ))}
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
                  Column
                </label>
                <select
                  value={newTaskColumn}
                  onChange={(e) => setNewTaskColumn(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    backgroundColor: "white",
                  }}
                >
                  <option value="todo">To Do</option>
                  <option value="inprogress">In Progress</option>
                  <option value="done">Done</option>
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
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    fontSize: "14px",
                    outline: "none",
                    minHeight: "80px",
                    resize: "vertical",
                  }}
                  placeholder="Enter task description (optional)"
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#515666",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "6px",
                    backgroundColor: "#5D51E2",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Add Task
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  function AddTagModal() {
    const [newTagName, setNewTagName] = useState("");

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (newTagName.trim() && !customTags.includes(newTagName.trim())) {
        setCustomTags([...customTags, newTagName.trim()]);
        setNewTagName("");
        setShowAddTagModal(false);
      }
    };

    const handleDeleteTag = (tagToDelete: string) => {
      setCustomTags(customTags.filter((tag) => tag !== tagToDelete));
      if (tagFilter === tagToDelete) {
        setTagFilter("All");
      }
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
        onClick={() => setShowAddTagModal(false)}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "12px",
            padding: "24px",
            width: "400px",
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
              Manage Tags
            </h2>
            <button
              onClick={() => setShowAddTagModal(false)}
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
                  Add New Tag
                </label>
                <div style={{ display: "flex", gap: "8px" }}>
                  <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      border: "1px solid #E1E2E6",
                      borderRadius: "6px",
                      fontSize: "14px",
                      outline: "none",
                    }}
                    placeholder="Enter tag name"
                    maxLength={20}
                  />
                  <button
                    type="submit"
                    disabled={
                      !newTagName.trim() ||
                      customTags.includes(newTagName.trim())
                    }
                    style={{
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      backgroundColor:
                        !newTagName.trim() ||
                        customTags.includes(newTagName.trim())
                          ? "#E1E2E6"
                          : "#5D51E2",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500",
                      cursor:
                        !newTagName.trim() ||
                        customTags.includes(newTagName.trim())
                          ? "not-allowed"
                          : "pointer",
                      transition: "background-color 0.2s ease",
                    }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontSize: "14px",
                    fontWeight: "500",
                    color: "#202437",
                  }}
                >
                  Existing Tags
                </label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {customTags.map((tag) => (
                    <div
                      key={tag}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "4px 8px",
                        backgroundColor: "#F8F9FA",
                        border: "1px solid #E1E2E6",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#515666",
                      }}
                    >
                      <span>{tag}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteTag(tag)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#797E8B",
                          cursor: "pointer",
                          padding: "0",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "14px",
                          height: "14px",
                        }}
                        title="Delete tag"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {customTags.length === 0 && (
                    <div
                      style={{
                        padding: "20px",
                        textAlign: "center",
                        color: "#797E8B",
                        fontSize: "14px",
                        fontStyle: "italic",
                      }}
                    >
                      No tags created yet. Add your first tag above.
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  marginTop: "20px",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowAddTagModal(false)}
                  style={{
                    padding: "10px 20px",
                    border: "1px solid #E1E2E6",
                    borderRadius: "6px",
                    backgroundColor: "white",
                    color: "#515666",
                    fontSize: "14px",
                    fontWeight: "500",
                    cursor: "pointer",
                  }}
                >
                  Done
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }
}
