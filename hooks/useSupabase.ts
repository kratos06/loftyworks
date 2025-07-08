'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { User, Session } from '@supabase/supabase-js'

export function useSupabase() {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取当前会话
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      return { user: null, session: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signUp = async (email: string, password: string, metadata?: any) => {
    try {
      setLoading(true)
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata
        }
      })
      
      if (error) throw error
      return { user: data.user, session: data.session, error: null }
    } catch (error: any) {
      return { user: null, session: null, error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const signOut = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    } finally {
      setLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      })
      if (error) throw error
      return { error: null }
    } catch (error: any) {
      return { error: error.message }
    }
  }

  return {
    user,
    session,
    loading,
    supabase,
    signIn,
    signUp,
    signOut,
    resetPassword
  }
}

// 房产数据 Hook
export function useProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = async (filters?: {
    search?: string
    status?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('properties')
        .select(`
          *,
          manager:user_profiles(name, avatar_url, initials)
        `)

      // 应用过滤器
      if (filters?.search) {
        query = query.ilike('address', `%${filters.search}%`)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      setProperties(data || [])
      return { data, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createProperty = async (property: any) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .insert([property])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const updateProperty = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const deleteProperty = async (id: string) => {
    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  return {
    properties,
    loading,
    error,
    fetchProperties,
    createProperty,
    updateProperty,
    deleteProperty
  }
}

// 联系人数据 Hook
export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = async (filters?: {
    search?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('contacts')
        .select('*')
        .eq('is_active', true)

      // 应用过滤器
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,phone.ilike.%${filters.search}%`)
      }
      if (filters?.type && filters.type !== 'All') {
        query = query.eq('type', filters.type)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query

      if (error) throw error

      setContacts(data || [])
      return { data, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createContact = async (contact: any) => {
    try {
      const { data, error } = await supabase
        .from('contacts')
        .insert([contact])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  return {
    contacts,
    loading,
    error,
    fetchContacts,
    createContact
  }
}

// 任务数据 Hook
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = async (filters?: {
    status?: string
    assignee?: string
    type?: string
    priority?: string
    search?: string
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignees:task_assignees(
            user:user_profiles(name, avatar_url, initials)
          )
        `)

      // 应用过滤器
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.priority) {
        query = query.eq('priority', filters.priority)
      }
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,address.ilike.%${filters.search}%`)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // 转换数据格式，处理分配者数据
      const transformedTasks = (data || []).map(task => ({
        ...task,
        assignees: task.assignees?.map((assignee: any) => ({
          name: assignee.user?.name || 'Unknown',
          avatar_url: assignee.user?.avatar_url,
          initials: assignee.user?.initials || 'UN'
        })) || [],
        typeColor: task.type_color || getTypeColor(task.type)
      }))

      setTasks(transformedTasks)
      
      // 组织为看板列数据
      const columnData = [
        {
          id: "todo",
          title: "To Do",
          count: transformedTasks.filter(t => t.status === 'todo').length,
          color: "#5D51E2",
          tasks: transformedTasks.filter(t => t.status === 'todo')
        },
        {
          id: "inprogress",
          title: "In Progress", 
          count: transformedTasks.filter(t => t.status === 'inprogress').length,
          color: "#FFA600",
          tasks: transformedTasks.filter(t => t.status === 'inprogress')
        },
        {
          id: "done",
          title: "Done",
          count: transformedTasks.filter(t => t.status === 'done').length,
          color: "#20C472",
          tasks: transformedTasks.filter(t => t.status === 'done')
        },
        {
          id: "cancelled",
          title: "Cancelled",
          count: transformedTasks.filter(t => t.status === 'cancelled').length,
          color: "#797E8B",
          tasks: transformedTasks.filter(t => t.status === 'cancelled')
        }
      ]
      
      setColumns(columnData)
      return transformedTasks
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (id: string, status: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ 
          status, 
          is_completed: status === 'done',
          completed_at: status === 'done' ? new Date().toISOString() : null
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // 更新本地状态
      await fetchTasks()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const createTask = async (task: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          ...task,
          type_color: task.type_color || getTypeColor(task.type)
        }])
        .select()
        .single()

      if (error) throw error
      
      // 创建任务分配关系
      if (task.assignee_ids && task.assignee_ids.length > 0) {
        const assignments = task.assignee_ids.map((userId: string) => ({
          task_id: data.id,
          user_id: userId
        }))
        
        await supabase
          .from('task_assignees')
          .insert(assignments)
      }
      
      await fetchTasks()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      // 先删除任务分配关系
      await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', id)
      
      // 删除任务
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      await fetchTasks()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const duplicateTask = async (id: string) => {
    try {
      // 获取原任务数据
      const { data: originalTask, error: fetchError } = await supabase
        .from('tasks')
        .select(`
          *,
          assignees:task_assignees(user_id)
        `)
        .eq('id', id)
        .single()

      if (fetchError) throw fetchError

      // 创建副本
      const { created_by, created_at, updated_at, id: taskId, task_number, ...taskData } = originalTask
      const duplicatedTask = {
        ...taskData,
        title: `${taskData.title} (Copy)`,
        task_number: `${taskData.task_number}-copy`,
        status: 'todo'
      }

      const { data: newTask, error: createError } = await supabase
        .from('tasks')
        .insert([duplicatedTask])
        .select()
        .single()

      if (createError) throw createError

      // 复制任务分配
      if (originalTask.assignees && originalTask.assignees.length > 0) {
        const assignments = originalTask.assignees.map((assignee: any) => ({
          task_id: newTask.id,
          user_id: assignee.user_id
        }))
        
        await supabase
          .from('task_assignees')
          .insert(assignments)
      }

      await fetchTasks()
      return newTask
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const updateTaskPriority = async (id: string, priority: string) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({ priority })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      await fetchTasks()
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  // 获取任务类型颜色的辅助函数
  const getTypeColor = (type: string) => {
    const typeColors = {
      'Workspace Order': '#5D51E2',
      'Move-out Inspection': '#5D51E2', 
      'Payment Relevant': '#5D51E2',
      'Maintenance Request': '#FFA600',
      'Move-in Inspection': '#20C472',
      'Schedule Showing': '#797E8B',
      'Other': '#A0A3AF'
    }
    return typeColors[type as keyof typeof typeColors] || '#5D51E2'
  }

  return {
    tasks,
    columns,
    loading,
    error,
    fetchTasks,
    updateTaskStatus,
    createTask,
    deleteTask,
    duplicateTask,
    updateTaskPriority
  }
}

// 文档数据 Hook
export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = async (filters?: {
    search?: string
    status?: string
    document_type?: string
    property_id?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('documents')
        .select(`
          *,
          property:properties(address, city)
        `)

      // 应用过滤器
      if (filters?.search) {
        query = query.ilike('file_name', `%${filters.search}%`)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.document_type) {
        query = query.eq('document_type', filters.document_type)
      }
      if (filters?.property_id) {
        query = query.eq('property_id', filters.property_id)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query.order('create_date', { ascending: false })

      if (error) throw error

      // 转换数据格式
      const transformedDocuments = (data || []).map(doc => ({
        ...doc,
        property: doc.property?.address || doc.property || 'Unknown Property',
        sharing: typeof doc.sharing === 'string' ? JSON.parse(doc.sharing) : doc.sharing
      }))

      setDocuments(transformedDocuments)
      return { data: transformedDocuments, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createDocument = async (document: any) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .insert([{
          ...document,
          sharing: typeof document.sharing === 'object' ? JSON.stringify(document.sharing) : document.sharing
        }])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const updateDocument = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('documents')
        .update({
          ...updates,
          sharing: typeof updates.sharing === 'object' ? JSON.stringify(updates.sharing) : updates.sharing
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short'
    })
  }

  // 格式化有效期
  const formatValidUntil = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // 获取文档状态统计
  const getDocumentStats = () => {
    const stats = {
      all: documents.length,
      expiring: documents.filter(d => d.status === 'Expiring').length,
      expired: documents.filter(d => d.status === 'Expired').length,
      valid: documents.filter(d => d.status === 'Valid').length,
      uncertain: documents.filter(d => d.status === 'Uncertain').length
    }
    return stats
  }

  return {
    documents,
    loading,
    error,
    fetchDocuments,
    createDocument,
    updateDocument,
    deleteDocument,
    formatDate,
    formatValidUntil,
    getDocumentStats
  }
}

// 租赁数据 Hook
export function useTenancies() {
  const [tenancies, setTenancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenancies = async (filters?: {
    search?: string
    status?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      let query = supabase
        .from('tenancies')
        .select(`
          *,
          property:properties(address, city, postcode),
          tenants:tenancy_tenants(
            contact:contacts(name, avatar_url, initials)
          )
        `)

      // 应用过滤器
      if (filters?.search) {
        query = query.or(`reference.ilike.%${filters.search}%,property.address.ilike.%${filters.search}%`)
      }
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 50
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query.order('created_at', { ascending: false })

      if (error) throw error

      // 转换数据格式
      const transformedTenancies = (data || []).map(tenancy => ({
        ...tenancy,
        address: tenancy.property?.address || 'Unknown Property',
        city: tenancy.property?.city || 'Unknown City',
        postcode: tenancy.property?.postcode || 'Unknown Postcode',
        image: `https://via.placeholder.com/128x96?text=${encodeURIComponent(tenancy.property?.address || 'Property')}`,
        tenants: tenancy.tenants?.map((t: any) => t.contact) || []
      }))

      setTenancies(transformedTenancies)
      return { data: transformedTenancies, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createTenancy = async (tenancy: any) => {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .insert([tenancy])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const updateTenancy = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('tenancies')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const deleteTenancy = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tenancies')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // 获取租赁统计数据
  const getTenancyStats = () => {
    const stats = {
      allTenancies: tenancies.length,
      current: tenancies.filter(t => t.status === 'active').length,
      archive: tenancies.filter(t => ['vacated', 'expired'].includes(t.status)).length,
      draft: tenancies.filter(t => t.status === 'draft').length,
      vacating: tenancies.filter(t => t.status === 'vacating').length,
      renewed: tenancies.filter(t => t.status === 'renewed').length
    }
    return stats
  }

  // 根据状态过滤租赁
  const getFilteredTenancies = (tab: string) => {
    switch (tab) {
      case 'current':
        return tenancies.filter(t => ['active', 'renewed'].includes(t.status))
      case 'archive':
        return tenancies.filter(t => ['vacated', 'expired'].includes(t.status))
      case 'draft':
        return tenancies.filter(t => t.status === 'draft')
      default:
        return tenancies
    }
  }

  return {
    tenancies,
    loading,
    error,
    fetchTenancies,
    createTenancy,
    updateTenancy,
    deleteTenancy,
    formatDate,
    getTenancyStats,
    getFilteredTenancies
  }
}

// 日历事件数据 Hook
export function useCalendarEvents() {
  const [events, setEvents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = async (filters?: {
    start_date?: string
    end_date?: string
    type?: string
    page?: number
    limit?: number
  }) => {
    try {
      setLoading(true)
      setError(null)
      
      // 获取任务数据作为日历事件
      let query = supabase
        .from('tasks')
        .select(`
          *,
          assignees:task_assignees(
            user:user_profiles(name, avatar_url, initials)
          ),
          property:properties(address)
        `)

      // 应用过滤器
      if (filters?.start_date && filters?.end_date) {
        query = query.gte('date', filters.start_date)
        query = query.lte('date', filters.end_date)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }

      // 分页
      const page = filters?.page || 1
      const limit = filters?.limit || 100
      const offset = (page - 1) * limit
      query = query.range(offset, offset + limit - 1)

      const { data, error, count } = await query.order('date', { ascending: true })

      if (error) throw error

      // 转换任务为日历事件格式
      const transformedEvents = (data || []).map(task => ({
        id: task.id,
        title: task.title,
        type: task.type,
        date: task.date,
        start_time: task.due_time,
        end_time: task.end_time,
        address: task.address || task.property?.address || '',
        description: task.description,
        status: task.status,
        priority: task.priority,
        assignees: task.assignees?.map((assignee: any) => ({
          name: assignee.user?.name || 'Unknown',
          avatar_url: assignee.user?.avatar_url,
          initials: assignee.user?.initials || 'UN'
        })) || [],
        typeColor: getEventTypeColor(task.type),
        backgroundColor: getEventBackgroundColor(task.type)
      }))

      setEvents(transformedEvents)
      return { data: transformedEvents, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }

  const createEvent = async (event: any) => {
    try {
      // 创建为任务记录
      const { data, error } = await supabase
        .from('tasks')
        .insert([{
          title: event.title,
          type: event.type,
          date: event.date,
          due_time: event.start_time,
          address: event.address,
          description: event.description,
          status: 'todo',
          priority: event.priority || 'Medium',
          type_color: getEventTypeColor(event.type),
          task_number: 'T-' + Date.now()
        }])
        .select()
        .single()

      if (error) throw error

      // 创建任务分配关系
      if (event.assignee_ids && event.assignee_ids.length > 0) {
        const assignments = event.assignee_ids.map((userId: string) => ({
          task_id: data.id,
          user_id: userId
        }))
        
        await supabase
          .from('task_assignees')
          .insert(assignments)
      }

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const updateEvent = async (id: string, updates: any) => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          title: updates.title,
          type: updates.type,
          date: updates.date,
          due_time: updates.start_time,
          address: updates.address,
          description: updates.description,
          priority: updates.priority,
          type_color: getEventTypeColor(updates.type)
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  const deleteEvent = async (id: string) => {
    try {
      // 先删除任务分配关系
      await supabase
        .from('task_assignees')
        .delete()
        .eq('task_id', id)
      
      // 删除任务
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      throw err
    }
  }

  // 获取事件类型颜色
  const getEventTypeColor = (type: string) => {
    const typeColors = {
      'Workspace Order': '#5D51E2',
      'Move-out Inspection': '#5D51E2', 
      'Payment Relevant': '#5D51E2',
      'Maintenance Request': '#FFA600',
      'Move-in Inspection': '#20C472',
      'Schedule Showing': '#FFA600',
      'Landlord Request': '#5D51E2',
      'Contract Relevant': '#5D51E2',
      'Other': '#A0A3AF'
    }
    return typeColors[type as keyof typeof typeColors] || '#5D51E2'
  }

  // 获取事件背景颜色
  const getEventBackgroundColor = (type: string) => {
    const backgroundColors = {
      'Workspace Order': '#E7E5FB',
      'Move-out Inspection': '#E7E5FB', 
      'Payment Relevant': '#E7E5FB',
      'Maintenance Request': '#FFF2D9',
      'Move-in Inspection': '#DEF6EA',
      'Schedule Showing': '#FFF2D9',
      'Landlord Request': '#E7E5FB',
      'Contract Relevant': '#E7E5FB',
      'Other': '#EBECEE'
    }
    return backgroundColors[type as keyof typeof backgroundColors] || '#E7E5FB'
  }

  // 格式化日期
  const formatDate = (dateString: string) => {
    if (!dateString) return 'No date'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  // 格式化时间
  const formatTime = (timeString: string) => {
    if (!timeString) return 'No time'
    const [hours, minutes] = timeString.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  // 根据日期获取事件
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    return events.filter(event => {
      if (!event.date) return false
      const eventDate = new Date(event.date).toISOString().split('T')[0]
      return eventDate === dateString
    })
  }

  // 根据月份获取事件
  const getEventsForMonth = (year: number, month: number) => {
    return events.filter(event => {
      if (!event.date) return false
      const eventDate = new Date(event.date)
      return eventDate.getFullYear() === year && eventDate.getMonth() === month
    })
  }

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
    getEventBackgroundColor
  }
}