import { createClient } from '@supabase/supabase-js'
import { useState, useEffect, useCallback } from 'react'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// 联系人数据 Hook
export function useContacts() {
  const [contacts, setContacts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchContacts = useCallback(async (filters?: {
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
  }, [])

  return {
    contacts,
    loading,
    error,
    fetchContacts
  }
}

// 任务数据 Hook
export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTasks = useCallback(async (filters?: {
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
        .select('*')

      // 应用过滤器
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%`)
      }
      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status)
      }
      if (filters?.type && filters.type !== 'All') {
        query = query.eq('type', filters.type)
      }
      if (filters?.priority && filters.priority !== 'All') {
        query = query.eq('priority', filters.priority)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error

      const transformedTasks = (data || []).map((task: any) => ({
        ...task,
        assignees: task.assignees || []
      }))

      setTasks(transformedTasks)

      // 创建列数据
      const columnData = [
        {
          id: 'todo',
          title: 'To Do',
          tasks: transformedTasks.filter((task: any) => task.status === 'todo'),
          count: transformedTasks.filter((task: any) => task.status === 'todo').length
        },
        {
          id: 'inprogress',
          title: 'In Progress',
          tasks: transformedTasks.filter((task: any) => task.status === 'inprogress'),
          count: transformedTasks.filter((task: any) => task.status === 'inprogress').length
        },
        {
          id: 'done',
          title: 'Done',
          tasks: transformedTasks.filter((task: any) => task.status === 'done'),
          count: transformedTasks.filter((task: any) => task.status === 'done').length
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
  }, [])

  return {
    tasks,
    columns,
    loading,
    error,
    fetchTasks
  }
}

// 文档数据 Hook
export function useDocuments() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchDocuments = useCallback(async (filters?: {
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
        .select('*')
        .eq('is_archived', false)

      // 应用过滤器
      if (filters?.search) {
        query = query.or(`file_name.ilike.%${filters.search}%,property.ilike.%${filters.search}%`)
      }
      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status)
      }
      if (filters?.document_type && filters.document_type !== 'All') {
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

      const { data, error, count } = await query.order('created_at', { ascending: false })

      if (error) throw error

      setDocuments(data || [])
      return { data, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    documents,
    loading,
    error,
    fetchDocuments
  }
}

// 属性数据 Hook
export function useProperties() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchProperties = useCallback(async (filters?: {
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
        .select('*')

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
  }, [])

  return {
    properties,
    loading,
    error,
    fetchProperties
  }
}

// 租赁数据 Hook
export function useTenancies() {
  const [tenancies, setTenancies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTenancies = useCallback(async (filters?: {
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
        .select('*')

      // 应用过滤器
      if (filters?.search) {
        query = query.ilike('property_address', `%${filters.search}%`)
      }
      if (filters?.status && filters.status !== 'All') {
        query = query.eq('status', filters.status)
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

      setTenancies(data || [])
      return { data, count }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      return { data: [], count: 0 }
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    tenancies,
    loading,
    error,
    fetchTenancies
  }
}
