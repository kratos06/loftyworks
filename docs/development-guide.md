# LoftyWorks Development Guide

## Overview

LoftyWorks is a comprehensive property management system built with Next.js, TypeScript, and Supabase. This guide covers the complete setup, development, and deployment process.

## Project Status ✅

The application has been successfully transformed from using mock data to a fully functional Supabase-powered system with authentication.

### Completed Features:
- ✅ Complete Supabase database integration
- ✅ Authentication system with login/logout
- ✅ Route protection
- ✅ All major pages converted to use real data:
  - Properties management
  - Contacts management  
  - Tasks (Kanban board)
  - Documents library
  - Tenancies management
  - Calendar with events

## Architecture

```
├── app/                    # Next.js App Router pages
│   ├── calendar/          # Calendar with events from tasks
│   ├── contacts/          # Contact management
│   ├── documents/         # Document library
│   ├── login/             # Authentication page
│   ├── properties/        # Property management
│   ├── tasks/             # Kanban task board
│   └── tenancies/         # Tenancy management
├── components/            # Reusable UI components
│   ├── ui/               # UI primitives
│   ├── AuthProvider.tsx  # Authentication wrapper
│   └── Navigation.tsx    # Main navigation
├── hooks/
│   └── useSupabase.ts    # All Supabase hooks
├── lib/
│   └── supabase.ts       # Supabase client configuration
└── docs/                 # Documentation
```

## Database Schema

The application uses the following main tables:

### Core Tables:
- `user_profiles` - User profile information
- `properties` - Property listings and details
- `contacts` - Contact management (tenants, landlords, etc.)
- `tenancies` - Rental agreements and tenancy data
- `documents` - Document storage and metadata
- `tasks` - Task management with kanban workflow

### Relationship Tables:
- `task_assignees` - Many-to-many relationship between tasks and users
- `tenancy_tenants` - Many-to-many relationship between tenancies and contacts

## Development Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### 1. Clone and Install
```bash
git clone [repository-url]
cd loftyworks
npm install
```

### 2. Supabase Setup
1. Create a new Supabase project at https://supabase.com
2. Run the database schema:
   ```sql
   -- Execute the SQL in docs/supabase-schema.sql
   ```
3. Load sample data:
   ```sql
   -- Execute the SQL in scripts/seed-data.sql
   ```

### 3. Environment Configuration
Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run Development Server
```bash
npm run dev
```

## Authentication Flow

### User Registration/Login
1. Users access `/login` for authentication
2. New users can register with email/password
3. Existing users sign in with credentials
4. Successful authentication redirects to `/properties`

### Route Protection
- All pages except `/login` require authentication
- `AuthProvider` component handles route protection
- Unauthenticated users are redirected to login
- Loading states shown during auth checks

### Session Management
- Supabase handles session persistence
- Auto-refresh of access tokens
- Logout clears session and redirects to login

## Data Management

### Hooks Architecture
All data operations are centralized in `hooks/useSupabase.ts`:

- `useSupabase()` - Core auth and session management
- `useProperties()` - Property CRUD operations
- `useContacts()` - Contact management
- `useTasks()` - Task management with kanban
- `useDocuments()` - Document library
- `useTenancies()` - Tenancy management
- `useCalendarEvents()` - Calendar events from tasks

### Real-time Features
- Automatic data refresh after mutations
- Loading states for all operations
- Error handling with user feedback
- Optimistic updates where appropriate

## UI Components

### Design System
- Consistent color palette based on `#5D51E2` primary
- SF Pro font family
- Responsive design patterns
- Hover states and transitions

### Component Structure
- `Navigation.tsx` - Main app navigation with user menu
- `AuthProvider.tsx` - Authentication wrapper
- `ui/` - Reusable UI primitives (buttons, avatars, etc.)

## Testing Strategy

### Manual Testing Checklist
1. **Authentication**
   - [ ] User registration works
   - [ ] Login/logout functions properly
   - [ ] Route protection active
   - [ ] Password reset email sent

2. **Data Operations**
   - [ ] Properties CRUD operations
   - [ ] Contact management
   - [ ] Task creation and kanban workflow
   - [ ] Document uploads and filtering
   - [ ] Tenancy status updates
   - [ ] Calendar event display

3. **UI/UX**
   - [ ] Navigation responsive
   - [ ] Loading states show properly
   - [ ] Error messages display
   - [ ] Form validation works

## Deployment

### Production Setup
1. **Environment Variables**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=production_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=production_key
   ```

2. **Build and Deploy**
   ```bash
   npm run build
   npm start
   ```

### Supabase Production
1. Set up production Supabase project
2. Configure Row Level Security (RLS) policies
3. Set up authentication providers if needed
4. Configure email templates

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Policies defined in database schema

### Authentication
- Secure password requirements (6+ characters)
- Email verification for new accounts
- JWT token-based sessions
- Automatic token refresh

## Performance Optimizations

### Database
- Proper indexing on foreign keys
- Efficient query patterns with select() 
- Pagination for large datasets
- Connection pooling via Supabase

### Frontend
- Component-level loading states
- Optimistic updates for better UX
- Proper error boundaries
- Image optimization

## Common Issues & Solutions

### Authentication Issues
- **Problem**: Users not redirected after login
- **Solution**: Check AuthProvider implementation and route paths

### Database Connection
- **Problem**: "Invalid API key" errors
- **Solution**: Verify environment variables and Supabase configuration

### Data Not Loading
- **Problem**: Empty states showing when data exists
- **Solution**: Check RLS policies and user permissions

## API Reference

### useSupabase Hook
```typescript
const { 
  user,           // Current user object
  session,        // Current session
  loading,        // Loading state
  signIn,         // Login function
  signUp,         // Registration function
  signOut,        // Logout function
  resetPassword   // Password reset
} = useSupabase();
```

### Data Hooks Pattern
```typescript
const {
  items,          // Array of items
  loading,        // Loading state
  error,          // Error message
  fetchItems,     // Fetch function
  createItem,     // Create function
  updateItem,     // Update function
  deleteItem      // Delete function
} = useHookName();
```

## Contributing

### Code Style
- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include loading states

### Git Workflow
1. Create feature branches from main
2. Make atomic commits
3. Write descriptive commit messages
4. Test thoroughly before merging

## Support

For questions or issues:
1. Check this documentation first
2. Review Supabase documentation
3. Check browser console for errors
4. Verify database connections and permissions

---

**Last Updated**: Current
**Version**: 1.0.0
**Status**: Production Ready ✅