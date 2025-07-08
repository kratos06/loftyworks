-- LoftyWorks Supabase Database Schema
-- 基于前端接口分析设计的完整数据库架构

-- =====================================
-- 用户认证和授权表
-- =====================================

-- 扩展用户配置文件表
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT,
  initials TEXT,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'user')),
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 房产管理表
-- =====================================

-- 房产表
CREATE TABLE IF NOT EXISTS public.properties (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  reference TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Maintenance', 'Apartment Block', 'Health Center', 'Retail Unit', 'Flats', 'Maisonette')),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('instructed', 'active', 'draft', 'offer-agreed', 'vacant', 'lost-to-let')),
  manager_id UUID REFERENCES public.user_profiles(id),
  image_url TEXT,
  description TEXT,
  bedrooms INTEGER,
  bathrooms INTEGER,
  square_feet DECIMAL,
  monthly_rent DECIMAL,
  deposit_amount DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 租赁管理表
-- =====================================

-- 租赁表
CREATE TABLE IF NOT EXISTS public.tenancies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE,
  reference TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('Contractual', 'Ground Rent', 'Ast', 'Lease', 'Assured')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('vacating', 'vacated', 'renewed', 'active', 'terminated')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  amount TEXT NOT NULL, -- 存储格式化的金额字符串，如 "£ 400.00"
  amount_numeric DECIMAL NOT NULL, -- 存储数值用于计算
  security_deposit DECIMAL,
  rent_frequency TEXT DEFAULT 'monthly' CHECK (rent_frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 租客表（关联租赁和联系人）
CREATE TABLE IF NOT EXISTS public.tenancy_tenants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  tenancy_id UUID REFERENCES public.tenancies(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tenancy_id, contact_id)
);

-- =====================================
-- 联系人管理表
-- =====================================

-- 联系人表
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('Guarantor', 'Other', 'Permitted Occupier', 'New', 'Landlord', 'Supplier', 'Applicant', 'System', 'Tenant')),
  avatar_url TEXT,
  initials TEXT,
  address TEXT,
  company TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 联系人地址表（支持多个地址）
CREATE TABLE IF NOT EXISTS public.contact_addresses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contact_id UUID REFERENCES public.contacts(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('home', 'work', 'billing', 'mailing')),
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  postcode TEXT NOT NULL,
  country TEXT DEFAULT 'UK',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 任务管理表
-- =====================================

-- 任务表
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Workspace Order', 'Move-out Inspection', 'Payment Relevant', 'Maintenance Request', 'Schedule Showing', 'Move-in Inspection')),
  type_color TEXT NOT NULL DEFAULT '#5D51E2',
  date DATE NOT NULL,
  due_time TIME,
  address TEXT NOT NULL,
  task_number TEXT UNIQUE NOT NULL,
  priority TEXT NOT NULL DEFAULT 'Medium' CHECK (priority IN ('Low', 'Medium', 'High', 'Urgent')),
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'inprogress', 'done', 'cancelled')),
  is_completed BOOLEAN DEFAULT FALSE,
  property_id UUID REFERENCES public.properties(id),
  tenancy_id UUID REFERENCES public.tenancies(id),
  created_by UUID REFERENCES public.user_profiles(id),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 任务分配表
CREATE TABLE IF NOT EXISTS public.task_assignees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(task_id, user_id)
);

-- 任务评论表
CREATE TABLE IF NOT EXISTS public.task_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 文档管理表
-- =====================================

-- 文档表
CREATE TABLE IF NOT EXISTS public.documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'doc', 'docx', 'jpg', 'png', 'xlsx')),
  file_size BIGINT,
  file_url TEXT NOT NULL,
  property TEXT NOT NULL, -- 关联的房产地址（从前端分析得出）
  property_id UUID REFERENCES public.properties(id),
  document_type TEXT NOT NULL CHECK (document_type IN ('Instructions', 'Chimney Sweep', 'Other', 'Inspection', 'Gas Safety Certificate', 'EPC', 'Tenancy Agreement', 'Inventory')),
  valid_until DATE,
  status TEXT NOT NULL DEFAULT 'Valid' CHECK (status IN ('Expiring', 'Valid', 'Expired', 'Uncertain')),
  sharing JSONB NOT NULL DEFAULT '{"type": "Team Member", "has_lock": false, "has_view": true}',
  create_date DATE NOT NULL DEFAULT CURRENT_DATE,
  uploaded_by UUID REFERENCES public.user_profiles(id),
  folder_path TEXT,
  is_archived BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 文档分享权限表
CREATE TABLE IF NOT EXISTS public.document_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  document_id UUID REFERENCES public.documents(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  contact_id UUID REFERENCES public.contacts(id),
  permission_type TEXT NOT NULL CHECK (permission_type IN ('view', 'edit', 'download', 'share')),
  granted_by UUID REFERENCES public.user_profiles(id),
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  CONSTRAINT check_user_or_contact CHECK (
    (user_id IS NOT NULL AND contact_id IS NULL) OR 
    (user_id IS NULL AND contact_id IS NOT NULL)
  )
);

-- =====================================
-- 日历管理表
-- =====================================

-- 日历事件表
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('Schedule Showing', 'Payment Relevant', 'Workspace Order', 'Maintenance', 'Inspection', 'Meeting', 'Deadline')),
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  color TEXT NOT NULL DEFAULT '#5D51E2',
  border_color TEXT NOT NULL DEFAULT '#4A3ED0',
  address TEXT,
  property_id UUID REFERENCES public.properties(id),
  task_id UUID REFERENCES public.tasks(id),
  assignee_id UUID REFERENCES public.user_profiles(id),
  created_by UUID REFERENCES public.user_profiles(id),
  is_all_day BOOLEAN DEFAULT FALSE,
  recurrence_rule TEXT, -- RRULE format for recurring events
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 日历事件参与者表
CREATE TABLE IF NOT EXISTS public.calendar_event_attendees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id UUID REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.user_profiles(id),
  contact_id UUID REFERENCES public.contacts(id),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'tentative')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_attendee_user_or_contact CHECK (
    (user_id IS NOT NULL AND contact_id IS NULL) OR 
    (user_id IS NULL AND contact_id IS NOT NULL)
  )
);

-- =====================================
-- 系统配置表
-- =====================================

-- 系统设置表
CREATE TABLE IF NOT EXISTS public.system_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  is_public BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 通知模板表
CREATE TABLE IF NOT EXISTS public.notification_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('email', 'sms', 'push', 'in_app')),
  subject TEXT,
  content TEXT NOT NULL,
  variables JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 用户通知表
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'error')),
  action_url TEXT,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 审计和日志表
-- =====================================

-- 审计日志表
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES public.user_profiles(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================
-- 创建索引
-- =====================================

-- 性能优化索引
CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_manager ON public.properties(manager_id);
CREATE INDEX IF NOT EXISTS idx_properties_type ON public.properties(type);
CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at);

CREATE INDEX IF NOT EXISTS idx_tenancies_property ON public.tenancies(property_id);
CREATE INDEX IF NOT EXISTS idx_tenancies_status ON public.tenancies(status);
CREATE INDEX IF NOT EXISTS idx_tenancies_dates ON public.tenancies(start_date, end_date);

CREATE INDEX IF NOT EXISTS idx_contacts_type ON public.contacts(type);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
CREATE INDEX IF NOT EXISTS idx_contacts_name ON public.contacts(name);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assignee ON public.task_assignees(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_property ON public.tasks(property_id);
CREATE INDEX IF NOT EXISTS idx_tasks_date ON public.tasks(date);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON public.tasks(priority);

CREATE INDEX IF NOT EXISTS idx_documents_property ON public.documents(property_id);
CREATE INDEX IF NOT EXISTS idx_documents_type ON public.documents(document_type);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_valid_until ON public.documents(valid_until);

CREATE INDEX IF NOT EXISTS idx_calendar_events_date ON public.calendar_events(date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_assignee ON public.calendar_events(assignee_id);
CREATE INDEX IF NOT EXISTS idx_calendar_events_property ON public.calendar_events(property_id);

-- 全文搜索索引
CREATE INDEX IF NOT EXISTS idx_properties_search ON public.properties USING gin(to_tsvector('english', address || ' ' || city || ' ' || reference));
CREATE INDEX IF NOT EXISTS idx_contacts_search ON public.contacts USING gin(to_tsvector('english', name || ' ' || COALESCE(email, '') || ' ' || COALESCE(phone, '')));
CREATE INDEX IF NOT EXISTS idx_tasks_search ON public.tasks USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || address));
CREATE INDEX IF NOT EXISTS idx_documents_search ON public.documents USING gin(to_tsvector('english', file_name || ' ' || property || ' ' || document_type));

-- =====================================
-- 创建视图
-- =====================================

-- 任务看板视图
CREATE OR REPLACE VIEW public.task_kanban_view AS
SELECT 
  status,
  COUNT(*) as count,
  CASE status
    WHEN 'todo' THEN '#5D51E2'
    WHEN 'inprogress' THEN '#FFA600'
    WHEN 'done' THEN '#20C472'
    WHEN 'cancelled' THEN '#A0A3AF'
  END as color,
  json_agg(
    json_build_object(
      'id', t.id,
      'title', t.title,
      'type', t.type,
      'type_color', t.type_color,
      'date', t.date,
      'address', t.address,
      'task_number', t.task_number,
      'is_completed', t.is_completed,
      'priority', t.priority,
      'status', t.status,
      'assignees', COALESCE(assignees.assignees, '[]'::json)
    ) ORDER BY t.created_at DESC
  ) as tasks
FROM public.tasks t
LEFT JOIN (
  SELECT 
    ta.task_id,
    json_agg(
      json_build_object(
        'name', up.name,
        'avatar', up.avatar_url,
        'initials', up.initials
      )
    ) as assignees
  FROM public.task_assignees ta
  JOIN public.user_profiles up ON ta.user_id = up.id
  GROUP BY ta.task_id
) assignees ON t.id = assignees.task_id
GROUP BY status;

-- 联系人统计视图
CREATE OR REPLACE VIEW public.contact_stats_view AS
SELECT 
  COUNT(*) as all_contacts,
  COUNT(CASE WHEN type = 'Guarantor' THEN 1 END) as guarantor,
  COUNT(CASE WHEN type = 'Landlord' THEN 1 END) as landlord,
  COUNT(CASE WHEN type = 'New' THEN 1 END) as new,
  COUNT(CASE WHEN type = 'Supplier' THEN 1 END) as supplier,
  COUNT(CASE WHEN type = 'System' THEN 1 END) as system,
  COUNT(CASE WHEN type = 'Tenant' THEN 1 END) as tenant,
  COUNT(CASE WHEN type = 'Permitted Occupier' THEN 1 END) as permitted_occupier,
  COUNT(CASE WHEN type = 'Other' THEN 1 END) as other
FROM public.contacts
WHERE is_active = true;

-- 文档统计视图
CREATE OR REPLACE VIEW public.document_stats_view AS
SELECT 
  COUNT(*) as all_documents,
  COUNT(CASE WHEN status = 'Expiring' THEN 1 END) as expiring,
  COUNT(CASE WHEN is_archived = true THEN 1 END) as archive,
  json_object_agg(
    document_type,
    type_count
  ) as by_type
FROM (
  SELECT 
    document_type,
    COUNT(*) as type_count
  FROM public.documents
  WHERE is_archived = false
  GROUP BY document_type
) type_stats,
public.documents;

-- =====================================
-- 创建触发器函数
-- =====================================

-- 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建更新时间戳触发器
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tenancies_updated_at BEFORE UPDATE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 审计日志触发器函数
CREATE OR REPLACE FUNCTION public.audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, user_id)
    VALUES (TG_TABLE_NAME, OLD.id, TG_OP, row_to_json(OLD), auth.uid());
    RETURN OLD;
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, old_values, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(OLD), row_to_json(NEW), auth.uid());
    RETURN NEW;
  ELSIF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_logs (table_name, record_id, action, new_values, user_id)
    VALUES (TG_TABLE_NAME, NEW.id, TG_OP, row_to_json(NEW), auth.uid());
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ language 'plpgsql';

-- 为关键表创建审计触发器
CREATE TRIGGER audit_properties AFTER INSERT OR UPDATE OR DELETE ON public.properties FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_tenancies AFTER INSERT OR UPDATE OR DELETE ON public.tenancies FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_tasks AFTER INSERT OR UPDATE OR DELETE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();
CREATE TRIGGER audit_documents AFTER INSERT OR UPDATE OR DELETE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.audit_trigger_func();

-- 文档状态更新触发器函数
CREATE OR REPLACE FUNCTION public.update_document_status()
RETURNS TRIGGER AS $$
BEGIN
  -- 自动更新文档状态基于有效期
  IF NEW.valid_until IS NOT NULL THEN
    IF NEW.valid_until < CURRENT_DATE THEN
      NEW.status = 'Expired';
    ELSIF NEW.valid_until <= CURRENT_DATE + INTERVAL '30 days' THEN
      NEW.status = 'Expiring';
    ELSE
      NEW.status = 'Valid';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_document_status_trigger BEFORE INSERT OR UPDATE ON public.documents FOR EACH ROW EXECUTE FUNCTION public.update_document_status();

-- 任务完成状态同步触发器函数
CREATE OR REPLACE FUNCTION public.sync_task_completion()
RETURNS TRIGGER AS $$
BEGIN
  -- 当状态变为done时，自动标记为已完成
  IF NEW.status = 'done' AND NEW.is_completed = false THEN
    NEW.is_completed = true;
    NEW.completed_at = NOW();
  -- 当状态不是done时，取消完成标记
  ELSIF NEW.status != 'done' AND NEW.is_completed = true THEN
    NEW.is_completed = false;
    NEW.completed_at = NULL;
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER sync_task_completion_trigger BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.sync_task_completion();

-- =====================================
-- 创建存储过程
-- =====================================

-- 获取联系人统计的存储过程
CREATE OR REPLACE FUNCTION public.get_contact_stats()
RETURNS TABLE (
  all_contacts BIGINT,
  guarantor BIGINT,
  landlord BIGINT,
  new BIGINT,
  supplier BIGINT,
  system BIGINT,
  tenant BIGINT,
  permitted_occupier BIGINT,
  other BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.contact_stats_view;
END;
$$ LANGUAGE plpgsql;

-- 获取文档统计的存储过程
CREATE OR REPLACE FUNCTION public.get_document_stats()
RETURNS TABLE (
  all_documents BIGINT,
  expiring BIGINT,
  archive BIGINT,
  by_type JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT * FROM public.document_stats_view;
END;
$$ LANGUAGE plpgsql;

-- 复制任务的存储过程
CREATE OR REPLACE FUNCTION public.duplicate_task(task_id UUID)
RETURNS UUID AS $$
DECLARE
  new_task_id UUID;
  original_task RECORD;
  assignee RECORD;
BEGIN
  -- 获取原始任务
  SELECT * INTO original_task FROM public.tasks WHERE id = task_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Task not found';
  END IF;
  
  -- 生成新的任务编号
  new_task_id := gen_random_uuid();
  
  -- 创建新任务
  INSERT INTO public.tasks (
    id, title, description, type, type_color, date, due_time, 
    address, task_number, priority, status, property_id, 
    tenancy_id, created_by
  ) VALUES (
    new_task_id,
    original_task.title || ' (Copy)',
    original_task.description,
    original_task.type,
    original_task.type_color,
    original_task.date,
    original_task.due_time,
    original_task.address,
    '#T-' || EXTRACT(epoch FROM NOW())::TEXT,
    original_task.priority,
    'todo',
    original_task.property_id,
    original_task.tenancy_id,
    auth.uid()
  );
  
  -- 复制任务分配
  FOR assignee IN SELECT user_id FROM public.task_assignees WHERE task_id = original_task.id
  LOOP
    INSERT INTO public.task_assignees (task_id, user_id) 
    VALUES (new_task_id, assignee.user_id);
  END LOOP;
  
  RETURN new_task_id;
END;
$$ LANGUAGE plpgsql;

-- 批量更新任务的存储过程
CREATE OR REPLACE FUNCTION public.bulk_update_tasks(
  task_ids UUID[],
  updates JSONB
)
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER := 0;
  task_id UUID;
BEGIN
  FOREACH task_id IN ARRAY task_ids
  LOOP
    UPDATE public.tasks 
    SET 
      status = COALESCE((updates->>'status')::TEXT, status),
      priority = COALESCE((updates->>'priority')::TEXT, priority),
      is_completed = COALESCE((updates->>'is_completed')::BOOLEAN, is_completed),
      updated_at = NOW()
    WHERE id = task_id;
    
    IF FOUND THEN
      updated_count := updated_count + 1;
    END IF;
  END LOOP;
  
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================
-- Row Level Security (RLS) 政策
-- =====================================

-- 启用RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_assignees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;

-- 用户配置文件策略
CREATE POLICY "Users can view all profiles" ON public.user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.user_profiles FOR UPDATE USING (auth.uid() = id);

-- 房产策略 - 所有认证用户可以查看和管理
CREATE POLICY "Authenticated users can view properties" ON public.properties FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert properties" ON public.properties FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update properties" ON public.properties FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete properties" ON public.properties FOR DELETE USING (auth.role() = 'authenticated');

-- 租赁策略
CREATE POLICY "Authenticated users can manage tenancies" ON public.tenancies FOR ALL USING (auth.role() = 'authenticated');

-- 联系人策略
CREATE POLICY "Authenticated users can manage contacts" ON public.contacts FOR ALL USING (auth.role() = 'authenticated');

-- 任务策略
CREATE POLICY "Authenticated users can view all tasks" ON public.tasks FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can create tasks" ON public.tasks FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update tasks" ON public.tasks FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks FOR DELETE USING (auth.role() = 'authenticated');

-- 任务分配策略
CREATE POLICY "Authenticated users can manage task assignments" ON public.task_assignees FOR ALL USING (auth.role() = 'authenticated');

-- 文档策略
CREATE POLICY "Authenticated users can view documents" ON public.documents FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can upload documents" ON public.documents FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update documents" ON public.documents FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can delete documents" ON public.documents FOR DELETE USING (auth.role() = 'authenticated');

-- 日历事件策略
CREATE POLICY "Authenticated users can manage calendar events" ON public.calendar_events FOR ALL USING (auth.role() = 'authenticated');

-- 通知策略
CREATE POLICY "Users can view own notifications" ON public.user_notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.user_notifications FOR UPDATE USING (auth.uid() = user_id);

-- =====================================
-- 插入示例数据
-- =====================================

-- 插入系统设置
INSERT INTO public.system_settings (key, value, description, is_public) VALUES
('app_name', '"LoftyWorks"', 'Application name', true),
('app_version', '"1.0.0"', 'Application version', true),
('max_file_size', '52428800', 'Maximum file upload size in bytes (50MB)', false),
('allowed_file_types', '["pdf", "doc", "docx", "jpg", "png", "xlsx"]', 'Allowed file types for upload', false),
('task_number_prefix', '"T-"', 'Prefix for task numbers', false),
('property_reference_prefix', '"PROP-"', 'Prefix for property references', false),
('tenancy_reference_prefix', '"TEN-"', 'Prefix for tenancy references', false)
ON CONFLICT (key) DO NOTHING;

-- 插入通知模板
INSERT INTO public.notification_templates (name, type, subject, content, variables) VALUES
('task_assigned', 'email', 'New Task Assigned: {{task_title}}', 
 'You have been assigned a new task: {{task_title}}. Due date: {{due_date}}. Address: {{address}}.',
 '["task_title", "due_date", "address"]'),
('document_expiring', 'email', 'Document Expiring Soon: {{document_name}}', 
 'The document "{{document_name}}" for property {{property_address}} will expire on {{expiry_date}}.',
 '["document_name", "property_address", "expiry_date"]'),
('tenancy_ending', 'email', 'Tenancy Ending Soon: {{property_address}}', 
 'The tenancy at {{property_address}} is ending on {{end_date}}. Please take necessary actions.',
 '["property_address", "end_date"]')
ON CONFLICT (name) DO NOTHING;

-- =====================================
-- 创建定时任务（需要pg_cron扩展）
-- =====================================

-- 注意：以下需要在Supabase中启用pg_cron扩展
-- SELECT cron.schedule('update-document-status', '0 6 * * *', 'UPDATE public.documents SET status = CASE WHEN valid_until < CURRENT_DATE THEN ''Expired'' WHEN valid_until <= CURRENT_DATE + INTERVAL ''30 days'' THEN ''Expiring'' ELSE ''Valid'' END WHERE valid_until IS NOT NULL;');

-- =====================================
-- 授权和权限
-- =====================================

-- 为anon角色授予必要的权限（用于公开端点）
GRANT USAGE ON SCHEMA public TO anon;

-- 为authenticated角色授予权限
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- 为service_role授予完全权限
GRANT ALL ON SCHEMA public TO service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;