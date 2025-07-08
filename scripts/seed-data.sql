-- LoftyWorks 示例数据脚本
-- 基于前端 mockup 数据创建的完整示例数据

-- 首先插入用户配置文件（模拟现有用户）
INSERT INTO public.user_profiles (id, name, avatar_url, initials, role, phone) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'John Admin', 'https://cdn.builder.io/api/v1/image/assets%2Fe253410a68864f0aaefd9114f63e501c%2Fae529bd4c6f04e9589f7097637912d29?format=webp&width=800', 'JA', 'admin', '+44 20 7946 0958'),
('550e8400-e29b-41d4-a716-446655440002', 'Alex Brown', 'https://cdn.builder.io/o/assets%2Fe253410a68864f0aaefd9114f63e501c%2F7ede1fe1014041b99364600f0c4343fd?alt=media&token=7281b505-89b6-4374-886a-b83f04389b3a&apiKey=e253410a68864f0aaefd9114f63e501c', 'AB', 'manager', '+44 20 7946 0959'),
('550e8400-e29b-41d4-a716-446655440003', 'Sarah Wilson', NULL, 'SW', 'user', '+44 20 7946 0960'),
('550e8400-e29b-41d4-a716-446655440004', 'Mike Johnson', NULL, 'MJ', 'user', '+44 20 7946 0961'),
('550e8400-e29b-41d4-a716-446655440005', 'Emma Davis', NULL, 'ED', 'manager', '+44 20 7946 0962')
ON CONFLICT (id) DO NOTHING;

-- 插入房产数据
INSERT INTO public.properties (id, address, city, postcode, reference, type, status, manager_id, image_url, description, bedrooms, bathrooms, monthly_rent, deposit_amount) VALUES
('prop-001', '22141 Alizondo DR', 'London', 'SW7 5AG', 'PROP-001', 'Apartment Block', 'active', '550e8400-e29b-41d4-a716-446655440001', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property1.jpg', 'Modern apartment block in prime location', 2, 2, 2500.00, 5000.00),
('prop-002', '1 Andreanne Fold', 'London', 'SW1A 1AA', 'PROP-002', 'Flats', 'instructed', '550e8400-e29b-41d4-a716-446655440002', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property2.jpg', 'Luxury flats in Westminster', 3, 2, 3200.00, 6400.00),
('prop-003', 'Glebe Way', 'London', 'W1K 1AB', 'PROP-003', 'Maisonette', 'active', '550e8400-e29b-41d4-a716-446655440001', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property3.jpg', 'Charming maisonette with garden', 4, 3, 4000.00, 8000.00),
('prop-004', '5 Chandler End', 'London', 'EC1A 1BB', 'PROP-004', 'Health Center', 'draft', '550e8400-e29b-41d4-a716-446655440002', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property4.jpg', 'Commercial health center space', NULL, NULL, 5500.00, 11000.00),
('prop-005', 'Piccadilly Circus', 'London', 'W1J 9HP', 'PROP-005', 'Retail Unit', 'offer-agreed', '550e8400-e29b-41d4-a716-446655440005', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property5.jpg', 'Prime retail space in Piccadilly', NULL, NULL, 8000.00, 16000.00),
('prop-006', 'Terminal Service Ring Road', 'Dover', 'CT18 8XX', 'PROP-006', 'Maintenance', 'vacant', '550e8400-e29b-41d4-a716-446655440003', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property6.jpg', 'Industrial maintenance facility', NULL, NULL, 1200.00, 2400.00),
('prop-007', '100 Queen''s Gate', 'London', 'SW7 5AG', 'PROP-007', 'Apartment Block', 'active', '550e8400-e29b-41d4-a716-446655440001', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property7.jpg', 'Premium apartment block near Hyde Park', 1, 1, 2800.00, 5600.00),
('prop-008', '7 Northumberland Avenue', 'London', 'WC2N 5BY', 'PROP-008', 'Flats', 'lost-to-let', '550e8400-e29b-41d4-a716-446655440004', 'https://cdn.builder.io/api/v1/image/assets/TEMP/property8.jpg', 'Historic building converted to flats', 2, 1, 2200.00, 4400.00)
ON CONFLICT (id) DO NOTHING;

-- 插入租赁数据
INSERT INTO public.tenancies (id, property_id, reference, type, status, start_date, end_date, amount, amount_numeric, security_deposit, rent_frequency) VALUES
('ten-001', 'prop-001', 'TEN-001', 'Contractual', 'active', '2024-01-01', '2025-12-31', '£ 2,500.00', 2500.00, 5000.00, 'monthly'),
('ten-002', 'prop-002', 'TEN-002', 'Ast', 'renewed', '2023-06-01', '2025-05-31', '£ 3,200.00', 3200.00, 6400.00, 'monthly'),
('ten-003', 'prop-003', 'TEN-003', 'Lease', 'vacating', '2024-03-01', '2025-02-28', '£ 4,000.00', 4000.00, 8000.00, 'monthly'),
('ten-004', 'prop-007', 'TEN-004', 'Ground Rent', 'active', '2024-07-01', '2025-06-30', '£ 2,800.00', 2800.00, 5600.00, 'monthly'),
('ten-005', 'prop-008', 'TEN-005', 'Assured', 'vacated', '2023-09-01', '2024-08-31', '£ 2,200.00', 2200.00, 4400.00, 'monthly')
ON CONFLICT (id) DO NOTHING;

-- 插入联系人数据
INSERT INTO public.contacts (id, name, email, phone, type, avatar_url, initials, address, company, is_active) VALUES
('contact-001', 'Guy Hawkins', 'sara.cruz@example.com', '+44 123-456-7890', 'Guarantor', 'https://cdn.builder.io/api/v1/image/assets/TEMP/5337461b4ae6cc7b75cb8143b366cd02ac04903c?width=60', 'GH', '123 Main Street, London, SW1A 1AA', 'Hawkins Ltd', true),
('contact-002', 'Ralph Edwards', 'bill.sanders@example.com', '+44 121-416-7889', 'Other', 'https://cdn.builder.io/api/v1/image/assets/TEMP/27435f1f3a25b92e5541b4540645c08d94bfe46a?width=60', 'RE', '456 Oak Avenue, London, W1K 2AB', NULL, true),
('contact-003', 'Dianne Russell', 'curtis.weaver@example.com', '+44 100-042-0421', 'Permitted Occupier', 'https://cdn.builder.io/api/v1/image/assets/TEMP/afd8f413e0c7836420ec6ed92c56b912ad07ab53?width=60', 'DR', '789 Pine Road, London, EC1A 3CD', NULL, true),
('contact-004', 'Bessie Cooper', 'alma.lawson@example.com', '+44 869-502-4422', 'New', NULL, 'BC', '321 Elm Street, London, SW7 4EF', 'Cooper & Associates', true),
('contact-005', 'Robert Fox', 'deanna.curtis@example.com', '+44 940-332-0954', 'Landlord', 'https://cdn.builder.io/api/v1/image/assets/TEMP/2d87026d43aa5939ad02b02c54556fdcc1f2d9f7?width=60', 'RF', '654 Maple Drive, London, W1J 5GH', 'Fox Properties', true),
('contact-006', 'Jacob Jones', 'kenzi.lawson@example.com', '+44 002-344-4563', 'Supplier', 'https://cdn.builder.io/api/v1/image/assets/TEMP/9c3e51173f3db1fecb4e78d81872a2bec4f0be7c?width=60', 'JJ', '987 Cedar Lane, London, SW1A 6IJ', 'Jones Maintenance', true),
('contact-007', 'Alvena Tromp', 'jackson.graham@example.com', '+44 043-1234-5562', 'Applicant', 'https://cdn.builder.io/api/v1/image/assets/TEMP/cd11cd4a1923159785404311a98bc89ed4483e83?width=60', 'AT', '147 Birch Court, London, W1K 7KL', NULL, true),
('contact-008', 'Dorthy Hills', 'dorthy.hills@example.com', '+44 043-1234-5333', 'Applicant', 'https://cdn.builder.io/api/v1/image/assets/TEMP/eeb135f6d93e69c2e6790abc98ca3076e1f10bf7?width=60', 'DH', '258 Spruce Way, London, EC1A 8MN', NULL, true),
('contact-009', 'Sarah Mitchell', 'sarah.mitchell@example.com', '+44 020-7946-0001', 'Tenant', NULL, 'SM', '22141 Alizondo DR, London, SW7 5AG', NULL, true),
('contact-010', 'David Thompson', 'david.thompson@example.com', '+44 020-7946-0002', 'Tenant', NULL, 'DT', '1 Andreanne Fold, London, SW1A 1AA', 'Thompson Tech', true),
('contact-011', 'Lisa Garcia', 'lisa.garcia@example.com', '+44 020-7946-0003', 'System', NULL, 'LG', NULL, 'System Admin', true),
('contact-012', 'Mark Rodriguez', 'mark.rodriguez@example.com', '+44 020-7946-0004', 'Guarantor', NULL, 'MR', '999 System Drive, London, W1K 9ZZ', 'Rodriguez Finance', true)
ON CONFLICT (id) DO NOTHING;

-- 插入任务数据
INSERT INTO public.tasks (id, title, description, type, type_color, date, address, task_number, priority, status, is_completed, property_id, created_by) VALUES
('task-001', 'Property Posted to RightMove', 'Upload property listing to RightMove portal with all required documentation', 'Workspace Order', '#5D51E2', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-30', 'Medium', 'todo', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-002', 'Property Posted to RightMove', 'Complete property inspection and generate detailed report', 'Move-out Inspection', '#5D51E2', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-31', 'High', 'todo', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-003', 'Property Posted to RightMove', 'Process monthly rent payment and update tenant records', 'Payment Relevant', '#5D51E2', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-32', 'Low', 'todo', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-004', 'Property Posted', 'Schedule maintenance inspection for heating system', 'Payment Relevant', '#5D51E2', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-33', 'Medium', 'todo', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-005', 'Property Posted to RightMove. This is title. Property Posted to RightMove', 'Emergency maintenance request for plumbing issue in apartment 3B', 'Maintenance Request', '#FFA600', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-34', 'High', 'inprogress', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440002'),
('task-006', 'Property Posted to RightMove', 'Create detailed work order for kitchen renovation project', 'Workspace Order', '#FFA600', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-35', 'Medium', 'inprogress', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440002'),
('task-007', 'Property Posted', 'Conduct move-in inspection and prepare inventory checklist', 'Move-in Inspection', '#20C472', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-36', 'Medium', 'done', true, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-008', 'Property Posted to RightMove', 'Final move-in inspection completed successfully', 'Move-in Inspection', '#20C472', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-37', 'Low', 'done', true, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-009', 'Property Posted to RightMove. This is title. Property Posted to RightMove', 'Complete workspace setup and equipment installation', 'Workspace Order', '#20C472', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-38', 'High', 'done', true, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-010', 'Property Posted to RightMove', 'Process final move-out inspection and deposit return', 'Move-out Inspection', '#20C472', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-39', 'Medium', 'done', true, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-011', 'Property Posted', 'Cancelled property showing due to scheduling conflict', 'Schedule Showing', '#797E8B', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-40', 'Low', 'cancelled', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-012', 'Property Posted to RightMove', 'Payment processing cancelled due to insufficient funds', 'Payment Relevant', '#797E8B', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-41', 'Medium', 'cancelled', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-013', 'Property Posted to RightMove. This is title. Property Posted to RightMove', 'Workspace order cancelled per client request', 'Workspace Order', '#797E8B', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-42', 'High', 'cancelled', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-014', 'Property Posted to RightMove. This is title. Property Posted to RightMove', 'Urgent workspace setup required for new tenant', 'Workspace Order', '#797E8B', '2025-08-12', '22141 Alizondo DR, London, SW7 5AG', '#T-43', 'Urgent', 'cancelled', false, 'prop-001', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- 插入任务分配数据
INSERT INTO public.task_assignees (task_id, user_id) VALUES
('task-001', '550e8400-e29b-41d4-a716-446655440001'),
('task-001', '550e8400-e29b-41d4-a716-446655440002'),
('task-002', '550e8400-e29b-41d4-a716-446655440001'),
('task-002', '550e8400-e29b-41d4-a716-446655440002'),
('task-003', '550e8400-e29b-41d4-a716-446655440001'),
('task-005', '550e8400-e29b-41d4-a716-446655440001'),
('task-006', '550e8400-e29b-41d4-a716-446655440001'),
('task-006', '550e8400-e29b-41d4-a716-446655440002'),
('task-007', '550e8400-e29b-41d4-a716-446655440001'),
('task-008', '550e8400-e29b-41d4-a716-446655440001'),
('task-009', '550e8400-e29b-41d4-a716-446655440001'),
('task-009', '550e8400-e29b-41d4-a716-446655440002'),
('task-010', '550e8400-e29b-41d4-a716-446655440001'),
('task-011', '550e8400-e29b-41d4-a716-446655440001'),
('task-012', '550e8400-e29b-41d4-a716-446655440001'),
('task-013', '550e8400-e29b-41d4-a716-446655440001'),
('task-013', '550e8400-e29b-41d4-a716-446655440002'),
('task-014', '550e8400-e29b-41d4-a716-446655440001'),
('task-014', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (task_id, user_id) DO NOTHING;

-- 插入文档数据
INSERT INTO public.documents (id, file_name, file_type, property, property_id, document_type, valid_until, status, sharing, create_date, uploaded_by, file_url, file_size) VALUES
('doc-001', 'online-Meeting.pdf', 'pdf', '7 Northumberland Avenue', 'prop-008', 'Instructions', '2025-01-30', 'Expired', '{"type": "Team Member", "has_lock": true, "has_view": true}', '2025-01-21', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/docs/online-Meeting.pdf', 1024000),
('doc-002', 'Rentancy1.pdf', 'pdf', '1 Andreanne Fold', 'prop-002', 'Instructions', '2025-01-26', 'Expired', '{"type": "Tenants", "has_lock": false, "has_view": true}', '2025-01-21', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/docs/Rentancy1.pdf', 2048000),
('doc-003', 'Rentancy1.doc', 'doc', 'Glebe Way', 'prop-003', 'Chimney Sweep', '2025-01-26', 'Expired', '{"type": "Tenants", "has_lock": false, "has_view": true}', '2025-01-21', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/docs/Rentancy1.doc', 512000),
('doc-004', 'Rentancy1.doc', 'doc', '5 Chandler End', 'prop-004', 'Other', '2025-01-26', 'Expiring', '{"type": "Team Member, Tenants", "has_lock": false, "has_view": true}', '2025-01-20', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/docs/Rentancy1-2.doc', 256000),
('doc-005', '1727014862027Work Order...', 'doc', '1 Andreanne Fold', 'prop-002', 'Inspection', '2025-01-26', 'Uncertain', '{"type": "Team Member", "has_lock": false, "has_view": true}', '2025-01-20', '550e8400-e29b-41d4-a716-446655440003', 'https://example.com/docs/work-order-1.doc', 1536000),
('doc-006', '123456862027Work Order...', 'pdf', 'Piccadilly Circus', 'prop-005', 'Gas Safety Certificate', '2025-01-25', 'Uncertain', '{"type": "Team Member", "has_lock": true, "has_view": true}', '2025-01-19', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/docs/gas-safety-1.pdf', 3072000),
('doc-007', '8392324862027Work Order...', 'pdf', 'Terminal Service Ring Road, CT18', 'prop-006', 'Gas Safety Certificate', '2025-01-24', 'Valid', '{"type": "Team Member", "has_lock": true, "has_view": true}', '2025-01-19', '550e8400-e29b-41d4-a716-446655440002', 'https://example.com/docs/gas-safety-2.pdf', 2560000),
('doc-008', '123401486202Work Order...', 'pdf', '100 Queen''s Gate', 'prop-007', 'Gas Safety Certificate', '2025-01-24', 'Valid', '{"type": "Team Member", "has_lock": true, "has_view": true}', '2025-01-19', '550e8400-e29b-41d4-a716-446655440001', 'https://example.com/docs/gas-safety-3.pdf', 4096000)
ON CONFLICT (id) DO NOTHING;

-- 插入日历事件数据
INSERT INTO public.calendar_events (id, title, description, type, date, start_time, end_time, color, border_color, address, property_id, assignee_id, created_by) VALUES
('event-001', 'Property Inspection', 'Quarterly property inspection for maintenance assessment', 'Schedule Showing', '2025-01-15', '10:00', '11:00', '#5D51E2', '#4A3ED0', '22141 Alizondo DR, London', 'prop-001', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('event-002', 'Tenant Meeting', 'Monthly tenant check-in and feedback session', 'Meeting', '2025-01-18', '14:00', '15:00', '#20C472', '#1AB55F', '1 Andreanne Fold, London', 'prop-002', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002'),
('event-003', 'Maintenance Appointment', 'Scheduled maintenance for heating system repair', 'Maintenance', '2025-01-20', '09:00', '12:00', '#FFA600', '#E8710A', 'Glebe Way, London', 'prop-003', '550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001'),
('event-004', 'Document Review', 'Review and update property documentation', 'Deadline', '2025-01-22', '16:00', '17:30', '#FF6B6B', '#E55555', '5 Chandler End, London', 'prop-004', '550e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440002'),
('event-005', 'Property Viewing', 'Prospective tenant viewing appointment', 'Schedule Showing', '2025-01-25', '11:00', '11:30', '#5D51E2', '#4A3ED0', 'Piccadilly Circus, London', 'prop-005', '550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440001'),
('event-006', 'Payment Processing', 'Monthly rent collection and processing', 'Payment Relevant', '2025-01-28', '13:00', '14:00', '#8E44AD', '#7D3C98', 'Terminal Service Ring Road, Dover', 'prop-006', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001'),
('event-007', 'Final Inspection', 'Move-out inspection and inventory check', 'Inspection', '2025-01-30', '15:00', '16:30', '#E67E22', '#D35400', '100 Queen''s Gate, London', 'prop-007', '550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002')
ON CONFLICT (id) DO NOTHING;

-- 插入租赁租客关系
INSERT INTO public.tenancy_tenants (tenancy_id, contact_id, is_primary) VALUES
('ten-001', 'contact-009', true),
('ten-002', 'contact-010', true),
('ten-003', 'contact-003', true),
('ten-004', 'contact-009', false),
('ten-005', 'contact-008', true)
ON CONFLICT (tenancy_id, contact_id) DO NOTHING;

-- 插入联系人地址
INSERT INTO public.contact_addresses (contact_id, type, address_line1, city, postcode, is_primary) VALUES
('contact-001', 'home', '123 Main Street', 'London', 'SW1A 1AA', true),
('contact-002', 'work', '456 Oak Avenue', 'London', 'W1K 2AB', true),
('contact-003', 'home', '789 Pine Road', 'London', 'EC1A 3CD', true),
('contact-004', 'home', '321 Elm Street', 'London', 'SW7 4EF', true),
('contact-005', 'work', '654 Maple Drive', 'London', 'W1J 5GH', true),
('contact-006', 'work', '987 Cedar Lane', 'London', 'SW1A 6IJ', true),
('contact-007', 'home', '147 Birch Court', 'London', 'W1K 7KL', true),
('contact-008', 'home', '258 Spruce Way', 'London', 'EC1A 8MN', true),
('contact-009', 'home', '22141 Alizondo DR', 'London', 'SW7 5AG', true),
('contact-010', 'home', '1 Andreanne Fold', 'London', 'SW1A 1AA', true)
ON CONFLICT (contact_id, type) DO NOTHING;

-- 插入系统通知示例
INSERT INTO public.user_notifications (user_id, title, message, type, action_url, is_read) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'New Task Assigned', 'You have been assigned a new task: Property Posted to RightMove', 'info', '/tasks', false),
('550e8400-e29b-41d4-a716-446655440001', 'Document Expiring', 'The document "online-Meeting.pdf" will expire on 2025-01-30', 'warning', '/documents', false),
('550e8400-e29b-41d4-a716-446655440002', 'Payment Processed', 'Monthly rent payment has been successfully processed', 'success', '/tenancies', true),
('550e8400-e29b-41d4-a716-446655440002', 'Maintenance Request', 'Emergency maintenance request requires immediate attention', 'error', '/tasks', false)
ON CONFLICT DO NOTHING;

-- 插入任务评论示例
INSERT INTO public.task_comments (task_id, user_id, comment) VALUES
('task-002', '550e8400-e29b-41d4-a716-446655440001', 'Inspection scheduled for next week. All documentation prepared.'),
('task-005', '550e8400-e29b-41d4-a716-446655440002', 'Plumber contacted. Expected arrival time: 2-3 hours.'),
('task-007', '550e8400-e29b-41d4-a716-446655440001', 'Move-in inspection completed successfully. No issues found.'),
('task-009', '550e8400-e29b-41d4-a716-446655440002', 'Workspace setup completed ahead of schedule. Client very satisfied.')
ON CONFLICT DO NOTHING;

-- 更新序列以避免冲突（如果使用序列）
-- 这确保后续插入不会有ID冲突

-- 验证插入的数据
SELECT 'Properties' as table_name, COUNT(*) as count FROM public.properties
UNION ALL
SELECT 'Contacts', COUNT(*) FROM public.contacts
UNION ALL
SELECT 'Tasks', COUNT(*) FROM public.tasks
UNION ALL
SELECT 'Documents', COUNT(*) FROM public.documents
UNION ALL
SELECT 'Tenancies', COUNT(*) FROM public.tenancies
UNION ALL
SELECT 'Calendar Events', COUNT(*) FROM public.calendar_events
UNION ALL
SELECT 'User Profiles', COUNT(*) FROM public.user_profiles;