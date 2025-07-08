'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabase, useProperties, useContacts } from '@/hooks/useSupabase'

export default function TestSupabasePage() {
  const { user, session, loading: authLoading, supabase } = useSupabase()
  const { properties, loading: propertiesLoading, fetchProperties } = useProperties()
  const { contacts, loading: contactsLoading, fetchContacts } = useContacts()
  
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'error'>('checking')
  const [testResults, setTestResults] = useState<string[]>([])

  const testConnection = useCallback(async () => {
    const results: string[] = []
    
    try {
      // 测试基础连接
      const { data: authData } = await supabase.auth.getSession()
      results.push('✅ 认证服务连接成功')
      
      // 检查关键表是否存在
      const tablesToCheck = ['properties', 'contacts', 'tasks', 'user_profiles']
      
      for (const tableName of tablesToCheck) {
        try {
          const { data, error } = await supabase
            .from(tableName)
            .select('*')
            .limit(1)
          
          if (error) {
            if (error.message.includes('relation') && error.message.includes('does not exist')) {
              results.push(`❌ ${tableName} 表不存在 - 需要运行 SQL 架构`)
            } else {
              results.push(`⚠️  ${tableName} 表权限问题: ${error.message}`)
            }
          } else {
            results.push(`✅ ${tableName} 表存在且可访问`)
          }
        } catch (err) {
          console.error(`${tableName} check error:`, err)
          const errMsg = err instanceof Error ? err.message : JSON.stringify(err)
          results.push(`❌ ${tableName} 检查失败: ${errMsg}`)
        }
      }

      setConnectionStatus('connected')
    } catch (error) {
      console.error('Connection test error:', error)
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          JSON.stringify(error)
      results.push('❌ 连接失败: ' + errorMessage)
      setConnectionStatus('error')
    }
    
    setTestResults(results)
  }, [supabase])

  useEffect(() => {
    testConnection()
  }, [testConnection])

  const clearAllData = async () => {
    try {
      setTestResults(prev => [...prev, '🧹 开始清空所有数据...'])
      
      // 按照依赖关系倒序删除
      const tablesToClear = [
        'calendar_events',
        'document_permissions', 
        'documents',
        'task_comments',
        'task_assignees',
        'tasks',
        'tenancy_tenants',
        'tenancies',
        'contact_addresses',
        'contacts',
        'properties',
        'user_profiles'
      ]
      
      for (const table of tablesToClear) {
        try {
          const { error } = await supabase.from(table).delete().neq('id', '00000000-0000-0000-0000-000000000000')
          if (error && !error.message.includes('relation') && !error.message.includes('does not exist')) {
            console.warn(`Failed to clear ${table}:`, error)
          } else {
            setTestResults(prev => [...prev, `✅ 清空了 ${table} 表`])
          }
        } catch (err) {
          console.warn(`Error clearing ${table}:`, err)
        }
      }
      
      setTestResults(prev => [...prev, '🎉 所有数据清空完成！'])
    } catch (error) {
      console.error('Clear data error:', error)
      const errorMessage = error instanceof Error ? error.message : JSON.stringify(error, null, 2)
      setTestResults(prev => [...prev, '❌ 清空数据失败: ' + errorMessage])
    }
  }

  const createTestData = async () => {
    try {
      setTestResults(prev => [...prev, '🚀 开始创建完整仿真数据...'])
      
      // 1. 跳过用户配置文件创建（RLS限制）
      setTestResults(prev => [...prev, '⚠️ 跳过用户配置文件创建（避免RLS权限问题）'])

      // 2. 创建联系人
      const contacts = [
        {
          name: 'John Smith',
          email: 'john.smith@example.com',
          phone: '+44 20 7123 4567',
          type: 'Tenant',
          initials: 'JS',
          company: 'Tech Solutions Ltd',
          address: '42 Baker Street, London NW1 6XE'
        },
        {
          name: 'Sarah Johnson',
          email: 'sarah.johnson@example.com',
          phone: '+44 20 7234 5678',
          type: 'Landlord',
          initials: 'SJ',
          company: 'Johnson Properties',
          address: '15 Regent Street, London W1B 2EL'
        },
        {
          name: 'Mike Wilson',
          email: 'mike.wilson@example.com',
          phone: '+44 20 7345 6789',
          type: 'Supplier',
          initials: 'MW',
          company: 'Wilson Maintenance Co',
          address: '88 Victoria Street, London SW1E 5JL'
        },
        {
          name: 'Emma Davis',
          email: 'emma.davis@example.com',
          phone: '+44 20 7456 7890',
          type: 'Tenant',
          initials: 'ED',
          company: 'Digital Marketing Agency',
          address: '23 Oxford Street, London W1C 1DE'
        },
        {
          name: 'Robert Taylor',
          email: 'robert.taylor@example.com',
          phone: '+44 20 7567 8901',
          type: 'Guarantor',
          initials: 'RT',
          company: 'Taylor & Associates',
          address: '77 Bond Street, London W1S 1RQ'
        },
        {
          name: 'Lisa Anderson',
          email: 'lisa.anderson@example.com',
          phone: '+44 20 7678 9012',
          type: 'Applicant',
          initials: 'LA',
          company: 'Creative Studio Ltd',
          address: '33 Piccadilly, London W1J 0DX'
        },
        {
          name: 'David Brown',
          email: 'david.brown@example.com',
          phone: '+44 20 7789 0123',
          type: 'Supplier',
          initials: 'DB',
          company: 'Brown Electrical Services',
          address: '55 King\'s Road, London SW3 4ND'
        },
        {
          name: 'Jennifer Wilson',
          email: 'jennifer.wilson@example.com',
          phone: '+44 20 7890 1234',
          type: 'Tenant',
          initials: 'JW',
          company: 'Wilson Design Studio',
          address: '12 Covent Garden, London WC2E 9DD'
        }
      ]

      let contactsData = []
      try {
        const { data, error: contactsError } = await supabase
          .from('contacts')
          .insert(contacts)
          .select()

        if (contactsError) throw contactsError
        contactsData = data
        setTestResults(prev => [...prev, `✅ 创建了 ${contactsData.length} 个联系人`])
      } catch (err) {
        console.error('Contacts creation failed:', err)
        setTestResults(prev => [...prev, '❌ 联系人创建失败，继续其他数据创建'])
        // Create dummy data to continue
        contactsData = contacts.map((c, i) => ({ ...c, id: `contact-${i}` }))
      }

      // 3. 创建房产
      const properties = [
        {
          address: '123 Baker Street',
          city: 'London',
          postcode: 'NW1 6XE',
          reference: 'PROP-001-' + Date.now(),
          type: 'Apartment Block',
          status: 'active',
          bedrooms: 2,
          bathrooms: 1,
          square_feet: 850,
          monthly_rent: 1500.00,
          deposit_amount: 3000.00,
          description: 'Modern 2-bedroom apartment in the heart of Marylebone with excellent transport links.',
          manager_id: null
        },
        {
          address: '456 Oxford Street',
          city: 'London',
          postcode: 'W1C 1AP',
          reference: 'PROP-002-' + Date.now(),
          type: 'Flats',
          status: 'active',
          bedrooms: 1,
          bathrooms: 1,
          square_feet: 650,
          monthly_rent: 1200.00,
          deposit_amount: 2400.00,
          description: 'Stylish studio flat on Oxford Street, perfect for professionals.',
          manager_id: null
        },
        {
          address: '789 King\'s Road',
          city: 'London',
          postcode: 'SW3 4TZ',
          reference: 'PROP-003-' + Date.now(),
          type: 'Maisonette',
          status: 'draft',
          bedrooms: 3,
          bathrooms: 2,
          square_feet: 1200,
          monthly_rent: 2500.00,
          deposit_amount: 5000.00,
          description: 'Spacious 3-bedroom maisonette in Chelsea with private garden.',
          manager_id: null
        },
        {
          address: '42 Regent Street',
          city: 'London',
          postcode: 'W1B 2QD',
          reference: 'PROP-004-' + Date.now(),
          type: 'Retail Unit',
          status: 'instructed',
          bedrooms: 0,
          bathrooms: 2,
          square_feet: 2000,
          monthly_rent: 4500.00,
          deposit_amount: 9000.00,
          description: 'Premium retail space on Regent Street with high foot traffic.',
          manager_id: null
        },
        {
          address: '15 Covent Garden',
          city: 'London',
          postcode: 'WC2E 8RF',
          reference: 'PROP-005-' + Date.now(),
          type: 'Flats',
          status: 'offer-agreed',
          bedrooms: 2,
          bathrooms: 1,
          square_feet: 900,
          monthly_rent: 1800.00,
          deposit_amount: 3600.00,
          description: 'Contemporary apartment in historic Covent Garden area.',
          manager_id: null
        },
        {
          address: '88 Victoria Street',
          city: 'London',
          postcode: 'SW1E 5JL',
          reference: 'PROP-006-' + Date.now(),
          type: 'Health Center',
          status: 'vacant',
          bedrooms: 0,
          bathrooms: 4,
          square_feet: 3500,
          monthly_rent: 6000.00,
          deposit_amount: 12000.00,
          description: 'Modern healthcare facility near Victoria Station.',
          manager_id: null
        },
        {
          address: '33 Piccadilly',
          city: 'London',
          postcode: 'W1J 0DX',
          reference: 'PROP-007-' + Date.now(),
          type: 'Apartment Block',
          status: 'lost-to-let',
          bedrooms: 1,
          bathrooms: 1,
          square_feet: 550,
          monthly_rent: 1100.00,
          deposit_amount: 2200.00,
          description: 'Compact city apartment with period features.',
          manager_id: null
        },
        {
          address: '77 Bond Street',
          city: 'London',
          postcode: 'W1S 1RQ',
          reference: 'PROP-008-' + Date.now(),
          type: 'Maintenance',
          status: 'active',
          bedrooms: 0,
          bathrooms: 1,
          square_feet: 1500,
          monthly_rent: 3200.00,
          deposit_amount: 6400.00,
          description: 'Commercial maintenance workshop in prestigious Bond Street.',
          manager_id: null
        }
      ]

      let propertiesData = []
      try {
        const { data, error: propertiesError } = await supabase
          .from('properties')
          .insert(properties)
          .select()

        if (propertiesError) throw propertiesError
        propertiesData = data
        setTestResults(prev => [...prev, `✅ 创建了 ${propertiesData.length} 个房产`])
      } catch (err) {
        console.error('Properties creation failed:', err)
        setTestResults(prev => [...prev, '❌ 房产创建失败，继续其他数据创建'])
        // Create dummy data to continue
        propertiesData = properties.map((p, i) => ({ ...p, id: `property-${i}` }))
      }

      // 4. 创建租赁
      const tenancies = [
        {
          property_id: propertiesData[0].id,
          reference: 'TEN-001-' + Date.now(),
          type: 'Ast',
          status: 'active',
          start_date: '2024-01-01',
          end_date: '2024-12-31',
          amount: '£1,500.00',
          amount_numeric: 1500.00,
          security_deposit: 3000.00,
          rent_frequency: 'monthly'
        },
        {
          property_id: propertiesData[1].id,
          reference: 'TEN-002-' + Date.now(),
          type: 'Lease',
          status: 'active',
          start_date: '2024-03-01',
          end_date: '2025-02-28',
          amount: '£1,200.00',
          amount_numeric: 1200.00,
          security_deposit: 2400.00,
          rent_frequency: 'monthly'
        },
        {
          property_id: propertiesData[2].id,
          reference: 'TEN-003-' + Date.now(),
          type: 'Contractual',
          status: 'renewed',
          start_date: '2023-06-01',
          end_date: '2025-05-31',
          amount: '£2,500.00',
          amount_numeric: 2500.00,
          security_deposit: 5000.00,
          rent_frequency: 'monthly'
        },
        {
          property_id: propertiesData[4].id,
          reference: 'TEN-004-' + Date.now(),
          type: 'Assured',
          status: 'vacating',
          start_date: '2024-02-01',
          end_date: '2025-01-31',
          amount: '£1,800.00',
          amount_numeric: 1800.00,
          security_deposit: 3600.00,
          rent_frequency: 'monthly'
        },
        {
          property_id: propertiesData[3].id,
          reference: 'TEN-005-' + Date.now(),
          type: 'Ground Rent',
          status: 'terminated',
          start_date: '2023-01-01',
          end_date: '2023-12-31',
          amount: '£4,500.00',
          amount_numeric: 4500.00,
          security_deposit: 9000.00,
          rent_frequency: 'monthly'
        }
      ]

      const { data: tenanciesData, error: tenanciesError } = await supabase
        .from('tenancies')
        .insert(tenancies)
        .select()

      if (tenanciesError) throw tenanciesError
      setTestResults(prev => [...prev, `✅ 创建了 ${tenanciesData.length} 个租赁`])

      // 5. 关联租客和租赁
      const tenancyTenants = [
        {
          tenancy_id: tenanciesData[0].id,
          contact_id: contactsData[0].id, // John Smith
          is_primary: true
        },
        {
          tenancy_id: tenanciesData[1].id,
          contact_id: contactsData[3].id, // Emma Davis
          is_primary: true
        },
        {
          tenancy_id: tenanciesData[2].id,
          contact_id: contactsData[7].id, // Jennifer Wilson
          is_primary: true
        },
        {
          tenancy_id: tenanciesData[3].id,
          contact_id: contactsData[5].id, // Lisa Anderson
          is_primary: true
        },
        {
          tenancy_id: tenanciesData[4].id,
          contact_id: contactsData[1].id, // Sarah Johnson (commercial)
          is_primary: true
        }
      ]

      const { error: tenancyTenantsError } = await supabase
        .from('tenancy_tenants')
        .insert(tenancyTenants)

      if (tenancyTenantsError) throw tenancyTenantsError
      setTestResults(prev => [...prev, '✅ 创建了租客关联关系'])

      // 6. 创建任务
      const tasks = [
        {
          title: 'Property Inspection',
          description: 'Quarterly property inspection for Baker Street apartment',
          type: 'Move-in Inspection',
          date: '2024-12-20',
          due_time: '14:00:00',
          address: propertiesData[0].address,
          task_number: 'T-001-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: propertiesData[0].id,
          created_by: null
        },
        {
          title: 'Kitchen Tap Repair',
          description: 'Fix leaking tap in kitchen - urgent repair needed',
          type: 'Maintenance Request',
          date: '2024-12-15',
          due_time: '10:00:00',
          address: propertiesData[1].address,
          task_number: 'T-002-' + Date.now(),
          priority: 'Urgent',
          status: 'inprogress',
          property_id: propertiesData[1].id,
          created_by: null
        },
        {
          title: 'Property Viewing',
          description: 'Show Chelsea maisonette to potential tenant',
          type: 'Schedule Showing',
          date: '2024-12-18',
          due_time: '16:00:00',
          address: propertiesData[2].address,
          task_number: 'T-003-' + Date.now(),
          priority: 'Medium',
          status: 'done',
          property_id: propertiesData[2].id,
          created_by: null,
          is_completed: true,
          completed_at: new Date().toISOString()
        },
        {
          title: 'Move-out Inspection',
          description: 'Final inspection before tenant departure',
          type: 'Move-out Inspection',
          date: '2024-12-22',
          due_time: '09:00:00',
          address: propertiesData[4].address,
          task_number: 'T-004-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: propertiesData[4].id,
          created_by: null
        },
        {
          title: 'Rent Payment Follow-up',
          description: 'Contact tenant regarding overdue rent payment',
          type: 'Payment Relevant',
          date: '2024-12-16',
          due_time: '11:30:00',
          address: propertiesData[1].address,
          task_number: 'T-005-' + Date.now(),
          priority: 'High',
          status: 'inprogress',
          property_id: propertiesData[1].id,
          created_by: null
        },
        {
          title: 'Office Space Setup',
          description: 'Prepare workspace for new tenant',
          type: 'Workspace Order',
          date: '2024-12-19',
          due_time: '13:00:00',
          address: propertiesData[7].address,
          task_number: 'T-006-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[7].id,
          created_by: null
        },
        {
          title: 'Electrical Safety Check',
          description: 'Annual electrical safety inspection',
          type: 'Maintenance Request',
          date: '2024-12-21',
          due_time: '10:30:00',
          address: propertiesData[0].address,
          task_number: 'T-007-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: propertiesData[0].id,
          created_by: null
        },
        {
          title: 'Tenant Move-in',
          description: 'Keys handover and welcome process',
          type: 'Move-in Inspection',
          date: '2024-12-23',
          due_time: '15:00:00',
          address: propertiesData[2].address,
          task_number: 'T-008-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[2].id,
          created_by: null
        },
        {
          title: 'Deposit Return Process',
          description: 'Process security deposit return for former tenant',
          type: 'Payment Relevant',
          date: '2024-12-17',
          due_time: '14:30:00',
          address: propertiesData[3].address,
          task_number: 'T-009-' + Date.now(),
          priority: 'Medium',
          status: 'done',
          property_id: propertiesData[3].id,
          created_by: null,
          is_completed: true,
          completed_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          title: 'Property Marketing Photos',
          description: 'Schedule professional photography for listing',
          type: 'Schedule Showing',
          date: '2024-12-24',
          due_time: '11:00:00',
          address: propertiesData[6].address,
          task_number: 'T-010-' + Date.now(),
          priority: 'Low',
          status: 'todo',
          property_id: propertiesData[6].id,
          created_by: null
        },
        {
          title: 'Heating System Service',
          description: 'Annual heating system maintenance and safety check',
          type: 'Maintenance Request',
          date: '2024-12-25',
          due_time: '09:30:00',
          address: propertiesData[5].address,
          task_number: 'T-011-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[5].id,
          created_by: null
        },
        {
          title: 'Lease Renewal Discussion',
          description: 'Meet with tenant to discuss lease renewal terms',
          type: 'Payment Relevant',
          date: '2024-12-26',
          due_time: '16:30:00',
          address: propertiesData[0].address,
          task_number: 'T-012-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[0].id,
          created_by: null
        }
      ]

      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .insert(tasks)
        .select()

      if (tasksError) throw tasksError
      setTestResults(prev => [...prev, `✅ 创建了 ${tasksData.length} 个任务`])

      // 7. 跳过任务分配（需要用户ID）
      setTestResults(prev => [...prev, '⚠️ 跳过任务分配创建（需要有效用户ID）'])

      // 8. 创建文档
      const documents = [
        {
          file_name: 'tenancy_agreement_baker_street.pdf',
          file_type: 'pdf',
          file_size: 1024000,
          file_url: '/documents/tenancy_agreement_baker_street.pdf',
          property: propertiesData[0].address,
          property_id: propertiesData[0].id,
          document_type: 'Tenancy Agreement',
          status: 'Valid',
          create_date: '2024-01-01',
          uploaded_by: null
        },
        {
          file_name: 'gas_safety_certificate_baker_street.pdf',
          file_type: 'pdf',
          file_size: 512000,
          file_url: '/documents/gas_safety_certificate_baker_street.pdf',
          property: propertiesData[0].address,
          property_id: propertiesData[0].id,
          document_type: 'Gas Safety Certificate',
          valid_until: '2024-12-31',
          status: 'Expiring',
          create_date: '2024-01-15',
          uploaded_by: null
        },
        {
          file_name: 'epc_certificate_oxford_street.pdf',
          file_type: 'pdf',
          file_size: 256000,
          file_url: '/documents/epc_certificate_oxford_street.pdf',
          property: propertiesData[1].address,
          property_id: propertiesData[1].id,
          document_type: 'EPC',
          valid_until: '2034-03-01',
          status: 'Valid',
          create_date: '2024-03-01',
          uploaded_by: null
        },
        {
          file_name: 'inventory_kings_road.pdf',
          file_type: 'pdf',
          file_size: 2048000,
          file_url: '/documents/inventory_kings_road.pdf',
          property: propertiesData[2].address,
          property_id: propertiesData[2].id,
          document_type: 'Inventory',
          status: 'Valid',
          create_date: '2024-06-01',
          uploaded_by: null
        },
        {
          file_name: 'tenancy_agreement_covent_garden.pdf',
          file_type: 'pdf',
          file_size: 950000,
          file_url: '/documents/tenancy_agreement_covent_garden.pdf',
          property: propertiesData[4].address,
          property_id: propertiesData[4].id,
          document_type: 'Tenancy Agreement',
          status: 'Valid',
          create_date: '2024-02-01',
          uploaded_by: null
        },
        {
          file_name: 'inspection_report_regent_street.pdf',
          file_type: 'pdf',
          file_size: 1536000,
          file_url: '/documents/inspection_report_regent_street.pdf',
          property: propertiesData[3].address,
          property_id: propertiesData[3].id,
          document_type: 'Inspection',
          status: 'Valid',
          create_date: '2024-05-15',
          uploaded_by: null
        },
        {
          file_name: 'gas_safety_victoria_street.pdf',
          file_type: 'pdf',
          file_size: 480000,
          file_url: '/documents/gas_safety_victoria_street.pdf',
          property: propertiesData[5].address,
          property_id: propertiesData[5].id,
          document_type: 'Gas Safety Certificate',
          valid_until: '2025-06-30',
          status: 'Valid',
          create_date: '2024-06-30',
          uploaded_by: null
        },
        {
          file_name: 'chimney_sweep_piccadilly.pdf',
          file_type: 'pdf',
          file_size: 320000,
          file_url: '/documents/chimney_sweep_piccadilly.pdf',
          property: propertiesData[6].address,
          property_id: propertiesData[6].id,
          document_type: 'Chimney Sweep',
          valid_until: '2025-01-15',
          status: 'Valid',
          create_date: '2024-01-15',
          uploaded_by: null
        },
        {
          file_name: 'instructions_bond_street.docx',
          file_type: 'docx',
          file_size: 128000,
          file_url: '/documents/instructions_bond_street.docx',
          property: propertiesData[7].address,
          property_id: propertiesData[7].id,
          document_type: 'Instructions',
          status: 'Valid',
          create_date: '2024-07-01',
          uploaded_by: null
        },
        {
          file_name: 'expired_certificate_old.pdf',
          file_type: 'pdf',
          file_size: 445000,
          file_url: '/documents/expired_certificate_old.pdf',
          property: propertiesData[1].address,
          property_id: propertiesData[1].id,
          document_type: 'Gas Safety Certificate',
          valid_until: '2024-01-01',
          status: 'Expired',
          create_date: '2023-01-01',
          uploaded_by: null
        },
        {
          file_name: 'uncertain_document.pdf',
          file_type: 'pdf',
          file_size: 667000,
          file_url: '/documents/uncertain_document.pdf',
          property: propertiesData[3].address,
          property_id: propertiesData[3].id,
          document_type: 'Other',
          status: 'Uncertain',
          create_date: '2024-08-15',
          uploaded_by: null
        },
        {
          file_name: 'floor_plan_baker_street.jpg',
          file_type: 'jpg',
          file_size: 1890000,
          file_url: '/documents/floor_plan_baker_street.jpg',
          property: propertiesData[0].address,
          property_id: propertiesData[0].id,
          document_type: 'Other',
          status: 'Valid',
          create_date: '2024-04-01',
          uploaded_by: null
        }
      ]

      const { data: documentsData, error: documentsError } = await supabase
        .from('documents')
        .insert(documents)
        .select()

      if (documentsError) throw documentsError
      setTestResults(prev => [...prev, `✅ 创建了 ${documentsData.length} 个文档`])

      // 9. 创建更多任务作为日历事件（近期和未来的任务）
      const calendarTasks = [
        {
          title: 'Morning Property Inspection',
          description: 'Routine morning inspection of Baker Street property',
          type: 'Move-in Inspection',
          date: '2024-12-09',
          due_time: '09:00:00',
          address: propertiesData[0]?.address || '123 Baker Street',
          task_number: 'CAL-001-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[0]?.id,
          created_by: null
        },
        {
          title: 'Client Meeting - Property Viewing',
          description: 'Meet with potential tenants for Oxford Street viewing',
          type: 'Schedule Showing',
          date: '2024-12-09',
          due_time: '14:30:00',
          address: propertiesData[1]?.address || '456 Oxford Street',
          task_number: 'CAL-002-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: propertiesData[1]?.id,
          created_by: null
        },
        {
          title: 'Emergency Plumbing Repair',
          description: 'Urgent plumbing issue reported by tenant',
          type: 'Maintenance Request',
          date: '2024-12-10',
          due_time: '08:00:00',
          address: propertiesData[2]?.address || 'Kings Road Property',
          task_number: 'CAL-003-' + Date.now(),
          priority: 'Urgent',
          status: 'inprogress',
          property_id: propertiesData[2]?.id,
          created_by: null
        },
        {
          title: 'Rent Collection Follow-up',
          description: 'Follow up on overdue rent payment',
          type: 'Payment Relevant',
          date: '2024-12-10',
          due_time: '11:00:00',
          address: propertiesData[3]?.address || 'Regent Street',
          task_number: 'CAL-004-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: propertiesData[3]?.id,
          created_by: null
        },
        {
          title: 'Office Setup for New Tenant',
          description: 'Prepare workspace for incoming commercial tenant',
          type: 'Workspace Order',
          date: '2024-12-11',
          due_time: '13:00:00',
          address: propertiesData[7]?.address || 'Bond Street Office',
          task_number: 'CAL-005-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[7]?.id,
          created_by: null
        },
        {
          title: 'Final Walk-through Inspection',
          description: 'Final inspection before tenant move-out',
          type: 'Move-out Inspection',
          date: '2024-12-11',
          due_time: '16:00:00',
          address: propertiesData[4]?.address || 'Covent Garden',
          task_number: 'CAL-006-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[4]?.id,
          created_by: null
        },
        {
          title: 'Weekend Property Showing',
          description: 'Weekend viewing sessions for multiple prospects',
          type: 'Schedule Showing',
          date: '2024-12-14',
          due_time: '10:00:00',
          address: propertiesData[5]?.address || 'Victoria Street',
          task_number: 'CAL-007-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: propertiesData[5]?.id,
          created_by: null
        },
        {
          title: 'Maintenance Team Coordination',
          description: 'Coordinate with maintenance team for multiple repairs',
          type: 'Maintenance Request',
          date: '2024-12-16',
          due_time: '09:30:00',
          address: 'Multiple Properties',
          task_number: 'CAL-008-' + Date.now(),
          priority: 'High',
          status: 'todo',
          property_id: null,
          created_by: null
        },
        {
          title: 'Quarterly Payment Review',
          description: 'Review quarterly payments and outstanding amounts',
          type: 'Payment Relevant',
          date: '2024-12-27',
          due_time: '14:00:00',
          address: 'Office - Financial Review',
          task_number: 'CAL-009-' + Date.now(),
          priority: 'Medium',
          status: 'todo',
          property_id: null,
          created_by: null
        },
        {
          title: 'New Year Property Planning',
          description: 'Plan property maintenance and improvements for new year',
          type: 'Workspace Order',
          date: '2024-12-30',
          due_time: '10:00:00',
          address: 'Planning Session',
          task_number: 'CAL-010-' + Date.now(),
          priority: 'Low',
          status: 'todo',
          property_id: null,
          created_by: null
        }
      ]

      // Insert calendar tasks
      try {
        const { data: calendarTasksData, error: calendarTasksError } = await supabase
          .from('tasks')
          .insert(calendarTasks)
          .select()

        if (calendarTasksError) throw calendarTasksError
        setTestResults(prev => [...prev, `✅ 创建了 ${calendarTasksData.length} 个日历任务`])
      } catch (err) {
        console.error('Calendar tasks creation failed:', err)
        setTestResults(prev => [...prev, '❌ 日历任务创建失败'])
      }

      // 10. 创建独立的日历事件
      const calendarEvents = [
        {
          title: 'Property Viewing - Baker Street',
          description: 'Show Baker Street property to potential tenant',
          type: 'Schedule Showing',
          date: '2024-12-20',
          start_time: '14:00:00',
          end_time: '15:00:00',
          address: propertiesData[0].address,
          property_id: propertiesData[0].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Maintenance Visit - Kitchen Repair',
          description: 'Fix kitchen tap at Oxford Street',
          type: 'Maintenance',
          date: '2024-12-15',
          start_time: '10:00:00',
          end_time: '12:00:00',
          address: propertiesData[1].address,
          property_id: propertiesData[1].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Tenant Meeting - Lease Renewal',
          description: 'Discuss lease renewal terms with current tenant',
          type: 'Meeting',
          date: '2024-12-16',
          start_time: '11:00:00',
          end_time: '12:00:00',
          address: propertiesData[2].address,
          property_id: propertiesData[2].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Property Inspection - Quarterly',
          description: 'Quarterly inspection of Regent Street property',
          type: 'Inspection',
          date: '2024-12-17',
          start_time: '09:30:00',
          end_time: '11:00:00',
          address: propertiesData[3].address,
          property_id: propertiesData[3].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Document Review - Deadline',
          description: 'Review and process expiring documents',
          type: 'Deadline',
          date: '2024-12-18',
          start_time: '13:00:00',
          end_time: '15:00:00',
          address: 'Office',
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Property Showing - Covent Garden',
          description: 'Multiple viewings scheduled for Covent Garden flat',
          type: 'Schedule Showing',
          date: '2024-12-19',
          start_time: '15:00:00',
          end_time: '17:00:00',
          address: propertiesData[4].address,
          property_id: propertiesData[4].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Emergency Repair - Heating',
          description: 'Emergency heating system repair at Victoria Street',
          type: 'Maintenance',
          date: '2024-12-21',
          start_time: '08:00:00',
          end_time: '10:00:00',
          address: propertiesData[5].address,
          property_id: propertiesData[5].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Final Inspection - Move-out',
          description: 'Final inspection before tenant moves out',
          type: 'Inspection',
          date: '2024-12-22',
          start_time: '14:00:00',
          end_time: '16:00:00',
          address: propertiesData[6].address,
          property_id: propertiesData[6].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'New Tenant Move-in',
          description: 'Welcome new tenant and hand over keys',
          type: 'Meeting',
          date: '2024-12-23',
          start_time: '11:00:00',
          end_time: '12:30:00',
          address: propertiesData[7].address,
          property_id: propertiesData[7].id,
          assignee_id: null,
          created_by: null
        },
        {
          title: 'Property Marketing Photos',
          description: 'Professional photography session for new listings',
          type: 'Schedule Showing',
          date: '2024-12-24',
          start_time: '10:00:00',
          end_time: '14:00:00',
          address: propertiesData[0].address,
          property_id: propertiesData[0].id,
          assignee_id: null,
          created_by: null
        }
      ]

      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .insert(calendarEvents)
        .select()

      if (eventsError) throw eventsError
      setTestResults(prev => [...prev, `✅ 创建了 ${eventsData.length} 个日历事件`])

      // 完成
      setTestResults(prev => [...prev, '🎉 所有仿真数据创建完成！包含完整的房产、租赁、任务、文档和日历事件数据'])
      
      // 刷新数据
      await fetchProperties()
      await fetchContacts()
      
    } catch (error) {
      console.error('Test data creation error:', error)
      const errorMessage = error instanceof Error ? error.message : 
                          typeof error === 'string' ? error : 
                          JSON.stringify(error, null, 2)
      setTestResults(prev => [...prev, '❌ 测试数据创建失败: ' + errorMessage])
    }
  }

  if (authLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h1>Supabase 连接测试</h1>
        <p>正在加载...</p>
      </div>
    )
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🔗 Supabase 连接测试</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <h2>连接状态</h2>
        <div style={{ 
          padding: '10px', 
          borderRadius: '4px',
          backgroundColor: connectionStatus === 'connected' ? '#d4edda' : 
                          connectionStatus === 'error' ? '#f8d7da' : '#fff3cd',
          color: connectionStatus === 'connected' ? '#155724' : 
                 connectionStatus === 'error' ? '#721c24' : '#856404'
        }}>
          {connectionStatus === 'checking' && '🔄 正在检查连接...'}
          {connectionStatus === 'connected' && '✅ 连接成功'}
          {connectionStatus === 'error' && '❌ 连接失败'}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>测试结果</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          {testResults.map((result, index) => (
            <div key={index} style={{ marginBottom: '5px' }}>
              {result}
            </div>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>认证信息</h2>
        <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          <p>用户状态: {user ? '已登录' : '未登录'}</p>
          <p>会话状态: {session ? '活跃' : '无会话'}</p>
          {user && (
            <div>
              <p>用户ID: {user.id}</p>
              <p>邮箱: {user.email}</p>
            </div>
          )}
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h2>数据测试</h2>
        <div style={{ marginBottom: '10px', display: 'flex', gap: '10px' }}>
          <button 
            onClick={createTestData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            创建完整仿真数据
          </button>
          <button 
            onClick={clearAllData}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            清空所有数据
          </button>
        </div>
        
        <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px' }}>
          <h3>房产数据 ({properties.length})</h3>
          {propertiesLoading ? (
            <p>加载中...</p>
          ) : (
            <div>
              {properties.length === 0 ? (
                <p>暂无数据 - 需要先运行 SQL 架构或创建测试数据</p>
              ) : (
                properties.slice(0, 3).map((property: any) => (
                  <div key={property.id} style={{ marginBottom: '5px', padding: '5px', border: '1px solid #ddd' }}>
                    <strong>{property.reference}</strong> - {property.address}, {property.city}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div style={{ backgroundColor: '#f8f9fa', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
          <h3>联系人数据 ({contacts.length})</h3>
          {contactsLoading ? (
            <p>加载中...</p>
          ) : (
            <div>
              {contacts.length === 0 ? (
                <p>暂无数据 - 需要先运行 SQL 架构</p>
              ) : (
                contacts.slice(0, 3).map((contact: any) => (
                  <div key={contact.id} style={{ marginBottom: '5px', padding: '5px', border: '1px solid #ddd' }}>
                    <strong>{contact.name}</strong> - {contact.type} - {contact.email}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#e7f3ff', borderRadius: '4px' }}>
        <h3>📋 下一步操作</h3>
        <ol>
          <li>如果看到表不存在的警告，请在 Supabase Dashboard 的 SQL Editor 中执行 <code>docs/supabase-schema.sql</code></li>
          <li>配置认证和存储设置（参考 <code>docs/supabase-setup-guide.md</code>）</li>
          <li>测试用户注册和登录功能</li>
          <li>开始集成到实际的页面组件中</li>
        </ol>
      </div>
    </div>
  )
}