import { createClient } from "@supabase/supabase-js";
import { useState, useEffect, useCallback } from "react";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// 联系人数据 Hook
export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchContacts = useCallback(
    async (filters?: {
      search?: string;
      type?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        console.log("🔍 fetchContacts ��始，过滤条件:", filters);
        setLoading(true);
        setError(null);

        let query = supabase.from("contacts").select("*").eq("is_active", true);

        // 应用过滤器
        if (filters?.search) {
          query = query.or(
            `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`,
          );
        }
        if (filters?.type && filters.type !== "All") {
          query = query.eq("type", filters.type);
        }

        // 分页
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) {
          console.error("❌ fetchContacts 查询错误:", error);
          throw error;
        }

        console.log("✅ fetchContacts 查询成功:", data?.length, "条记录");
        setContacts(data || []);
        return { data, count };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return { data: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    contacts,
    loading,
    error,
    fetchContacts,
  };
}

// 任务数据 Hook
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = useCallback(
    async (filters?: {
      status?: string;
      assignee?: string;
      type?: string;
      priority?: string;
      search?: string;
    }) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("tasks").select("*");

        // 应用过滤器
        if (filters?.search) {
          query = query.or(
            `title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`,
          );
        }
        if (filters?.status && filters.status !== "All") {
          query = query.eq("status", filters.status);
        }
        if (filters?.type && filters.type !== "All") {
          query = query.eq("type", filters.type);
        }
        if (filters?.priority && filters.priority !== "All") {
          query = query.eq("priority", filters.priority);
        }

        const { data, error } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        const transformedTasks = (data || []).map((task: any) => ({
          ...task,
          assignees: task.assignees || [],
        }));

        setTasks(transformedTasks);

        // 创建列数据
        const columnData = [
          {
            id: "todo",
            title: "To Do",
            tasks: transformedTasks.filter(
              (task: any) => task.status === "todo",
            ),
            count: transformedTasks.filter(
              (task: any) => task.status === "todo",
            ).length,
          },
          {
            id: "inprogress",
            title: "In Progress",
            tasks: transformedTasks.filter(
              (task: any) => task.status === "inprogress",
            ),
            count: transformedTasks.filter(
              (task: any) => task.status === "inprogress",
            ).length,
          },
          {
            id: "done",
            title: "Done",
            tasks: transformedTasks.filter(
              (task: any) => task.status === "done",
            ),
            count: transformedTasks.filter(
              (task: any) => task.status === "done",
            ).length,
          },
        ];

        setColumns(columnData);
        return transformedTasks;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return [];
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    tasks,
    columns,
    loading,
    error,
    fetchTasks,
  };
}

// 文档数据 Hook
export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(
    async (filters?: {
      search?: string;
      status?: string;
      document_type?: string;
      property_id?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("documents")
          .select("*")
          .eq("is_archived", false);

        // 应用过滤器
        if (filters?.search) {
          query = query.or(
            `file_name.ilike.%${filters.search}%,property.ilike.%${filters.search}%`,
          );
        }
        if (filters?.status && filters.status !== "All") {
          query = query.eq("status", filters.status);
        }
        if (filters?.document_type && filters.document_type !== "All") {
          query = query.eq("document_type", filters.document_type);
        }
        if (filters?.property_id) {
          query = query.eq("property_id", filters.property_id);
        }

        // 分页
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query.order("created_at", {
          ascending: false,
        });

        if (error) throw error;

        setDocuments(data || []);
        return { data, count };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return { data: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Format date utility
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    });
  };

  // Format valid until date
  const formatValidUntil = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get document statistics
  const getDocumentStats = () => {
    const stats = {
      all: documents.length,
      expiring: documents.filter((d) => d.status === "Expiring").length,
      expired: documents.filter((d) => d.status === "Expired").length,
      valid: documents.filter((d) => d.status === "Valid").length,
      uncertain: documents.filter((d) => d.status === "Uncertain").length,
    };
    return stats;
  };

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    formatDate,
    formatValidUntil,
    getDocumentStats,
  };
}

// 属性数据 Hook
export function useProperties() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProperties = useCallback(
    async (filters?: {
      search?: string;
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("properties").select("*");

        // 应用过滤器
        if (filters?.search) {
          query = query.ilike("address", `%${filters.search}%`);
        }
        if (filters?.status) {
          query = query.eq("status", filters.status);
        }
        if (filters?.type) {
          query = query.eq("type", filters.type);
        }

        // 分页
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        setProperties(data || []);
        return { data, count };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return { data: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return {
    properties,
    loading,
    error,
    fetchProperties,
  };
}

// 租赁数据 Hook
export function useTenancies() {
  const [tenancies, setTenancies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTenancies = useCallback(
    async (filters?: {
      search?: string;
      status?: string;
      type?: string;
      page?: number;
      limit?: number;
    }) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("tenancies").select("*");

        // 应用过滤器
        if (filters?.search) {
          query = query.ilike("property_address", `%${filters.search}%`);
        }
        if (filters?.status && filters.status !== "All") {
          query = query.eq("status", filters.status);
        }
        if (filters?.type && filters.type !== "All") {
          query = query.eq("type", filters.type);
        }

        // 分页
        const page = filters?.page || 1;
        const limit = filters?.limit || 50;
        const offset = (page - 1) * limit;
        query = query.range(offset, offset + limit - 1);

        const { data, error, count } = await query;

        if (error) throw error;

        setTenancies(data || []);
        return { data, count };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        return { data: [], count: 0 };
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Format date utility
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Get tenancy statistics
  const getTenancyStats = () => {
    const stats = {
      allTenancies: tenancies.length,
      current: tenancies.filter((t) => t.status === "active").length,
      archive: tenancies.filter((t) =>
        ["vacated", "expired"].includes(t.status),
      ).length,
      draft: tenancies.filter((t) => t.status === "draft").length,
      vacating: tenancies.filter((t) => t.status === "vacating").length,
      renewed: tenancies.filter((t) => t.status === "renewed").length,
    };
    return stats;
  };

  // Filter tenancies by status
  const getFilteredTenancies = (tab: string) => {
    switch (tab) {
      case "current":
        return tenancies.filter((t) =>
          ["active", "renewed"].includes(t.status),
        );
      case "archive":
        return tenancies.filter((t) =>
          ["vacated", "expired"].includes(t.status),
        );
      case "draft":
        return tenancies.filter((t) => t.status === "draft");
      default:
        return tenancies;
    }
  };

  return {
    tenancies,
    loading,
    error,
    fetchTenancies,
    formatDate,
    getTenancyStats,
    getFilteredTenancies,
  };
}

// Calendar events data Hook
export function useCalendarEvents() {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEvents = async (filters?: {
    start_date?: string;
    end_date?: string;
    type?: string;
    page?: number;
    limit?: number;
  }) => {
    try {
      setLoading(true);
      setError(null);

      // Get tasks data as calendar events
      let query = supabase.from("tasks").select(`
          *,
          assignees:task_assignees(
            user:user_profiles(name, avatar_url, initials)
          ),
          property:properties(address)
        `);

      // Apply filters
      if (filters?.start_date && filters?.end_date) {
        query = query.gte("date", filters.start_date);
        query = query.lte("date", filters.end_date);
      }
      if (filters?.type) {
        query = query.eq("type", filters.type);
      }

      // Pagination
      const page = filters?.page || 1;
      const limit = filters?.limit || 100;
      const offset = (page - 1) * limit;
      query = query.range(offset, offset + limit - 1);

      const { data, error, count } = await query.order("date", {
        ascending: true,
      });

      if (error) throw error;

      // Transform tasks to calendar event format
      const transformedEvents = (data || []).map((task) => ({
        id: task.id,
        title: task.title,
        type: task.type,
        date: task.date,
        start_time: task.due_time,
        end_time: task.end_time,
        address: task.address || task.property?.address || "",
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignees:
          task.assignees?.map((assignee: any) => ({
            name: assignee.user?.name || "Unknown",
            avatar_url: assignee.user?.avatar_url,
            initials: assignee.user?.initials || "UN",
          })) || [],
        typeColor: getEventTypeColor(task.type),
        backgroundColor: getEventBackgroundColor(task.type),
      }));

      setEvents(transformedEvents);
      return { data: transformedEvents, count };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      return { data: [], count: 0 };
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: any) => {
    try {
      // Create as task record
      const { data, error } = await supabase
        .from("tasks")
        .insert([
          {
            title: event.title,
            type: event.type,
            date: event.date,
            due_time: event.start_time,
            address: event.address,
            description: event.description,
            status: "todo",
            priority: event.priority || "Medium",
            type_color: getEventTypeColor(event.type),
            task_number: "T-" + Date.now(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      // Create task assignment relationships
      if (event.assignee_ids && event.assignee_ids.length > 0) {
        const assignments = event.assignee_ids.map((userId: string) => ({
          task_id: data.id,
          user_id: userId,
        }));

        await supabase.from("task_assignees").insert(assignments);
      }

      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    }
  };

  const updateEvent = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: updates.title,
          type: updates.type,
          date: updates.date,
          due_time: updates.start_time,
          address: updates.address,
          description: updates.description,
          priority: updates.priority,
          type_color: getEventTypeColor(updates.type),
        })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      // First delete task assignment relationships
      await supabase.from("task_assignees").delete().eq("task_id", id);

      // Delete task
      const { error } = await supabase.from("tasks").delete().eq("id", id);

      if (error) throw error;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      throw err;
    }
  };

  // Get event type color
  const getEventTypeColor = (type: string) => {
    const typeColors = {
      "Workspace Order": "#5D51E2",
      "Move-out Inspection": "#5D51E2",
      "Payment Relevant": "#5D51E2",
      "Maintenance Request": "#FFA600",
      "Move-in Inspection": "#20C472",
      "Schedule Showing": "#FFA600",
      "Landlord Request": "#5D51E2",
      "Contract Relevant": "#5D51E2",
      Other: "#A0A3AF",
    };
    return typeColors[type as keyof typeof typeColors] || "#5D51E2";
  };

  // Get event background color
  const getEventBackgroundColor = (type: string) => {
    const backgroundColors = {
      "Workspace Order": "#E7E5FB",
      "Move-out Inspection": "#E7E5FB",
      "Payment Relevant": "#E7E5FB",
      "Maintenance Request": "#FFF2D9",
      "Move-in Inspection": "#DEF6EA",
      "Schedule Showing": "#FFF2D9",
      "Landlord Request": "#E7E5FB",
      "Contract Relevant": "#E7E5FB",
      Other: "#EBECEE",
    };
    return backgroundColors[type as keyof typeof backgroundColors] || "#E7E5FB";
  };

  // Format date utility
  const formatDate = (dateString: string) => {
    if (!dateString) return "No date";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Format time utility
  const formatTime = (timeString: string) => {
    if (!timeString) return "No time";
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Get events for specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];
    return events.filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date).toISOString().split("T")[0];
      return eventDate === dateString;
    });
  };

  // Get events for specific month
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter((event) => {
      if (!event.date) return false;
      const eventDate = new Date(event.date);
      return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
  };

  return {
    events,
    loading,
    error,
    fetchEvents,
    createEvent,
    updateEvent,
    deleteEvent,
    formatDate,
    formatTime,
    getEventsForDate,
    getEventsForMonth,
    getEventTypeColor,
    getEventBackgroundColor,
  };
}
