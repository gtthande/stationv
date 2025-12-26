# Cubic Matrix v5 Development Workflow

## Overview

This document defines the **Cubic Matrix v5** development methodology for Station-2100. This workflow prioritizes **correctness over speed** and follows a structured approach: Architecture → Plan → Code → Test → Handoff → Cursor Prompt.

## Workflow Phases

### 1. Architecture
**Purpose**: Understand and document the system architecture, requirements, and constraints.

**Activities**:
- Review existing architecture documentation
- Identify current system state
- Document data models and relationships
- Define API contracts and service boundaries
- Map user flows and business logic
- Identify dependencies and integrations

**Deliverables**:
- Architecture diagrams (if needed)
- Data model documentation
- API specifications
- Service layer definitions
- RBAC permission matrix

### 2. Plan
**Purpose**: Create a detailed, actionable development plan before writing code.

**Activities**:
- Break down features into tasks
- Define acceptance criteria
- Identify dependencies between tasks
- Estimate complexity
- Plan database migrations
- Design component structure
- Plan test strategy

**Deliverables**:
- Task breakdown with priorities
- Database migration plan
- Component hierarchy
- Test plan
- Risk assessment

### 3. Code
**Purpose**: Implement the planned features following best practices.

**Activities**:
- Set up development environment
- Implement database schema/migrations
- Create service layer with RBAC checks
- Build API routes/server actions
- Implement UI components
- Add error handling and validation
- Follow TypeScript best practices
- Maintain code consistency

**Deliverables**:
- Working code implementation
- Database migrations
- Service layer with RBAC
- UI components
- API endpoints

### 4. Test
**Purpose**: Ensure correctness and reliability through comprehensive testing.

**Activities**:
- Unit tests for services and utilities
- Integration tests for API endpoints
- Component tests for UI
- End-to-end tests for workflows
- RBAC permission tests
- Edge case testing
- Performance testing (if applicable)

**Deliverables**:
- Test suite with good coverage
- Test documentation
- Test results and reports

### 5. Handoff
**Purpose**: Document what was implemented and provide context for future work.

**Activities**:
- Document implementation details
- List changes made
- Note any deviations from plan
- Document configuration changes
- Provide usage examples
- List known issues or limitations
- Update architecture docs if needed

**Deliverables**:
- Implementation summary
- Configuration guide
- Usage documentation
- Known issues log

### 6. Cursor Prompt
**Purpose**: Generate a clear prompt for the next development cycle or continuation.

**Activities**:
- Summarize current state
- Identify next priorities
- Provide context for next tasks
- Include relevant code references
- Specify acceptance criteria

**Deliverables**:
- Next step prompt
- Context summary
- Task priorities

## Principles

1. **Correctness Over Speed**: Take time to understand requirements fully before coding
2. **Documentation First**: Document architecture and plan before implementation
3. **Test-Driven Mindset**: Consider testability during design
4. **Incremental Progress**: Complete each phase before moving to the next
5. **Clear Handoffs**: Each phase should produce clear deliverables for the next

## Current Project State

### Completed
- ✅ Project skeleton with Next.js 14 App Router
- ✅ TypeScript types defined (`lib/types.ts`)
- ✅ MySQL schema defined (`sql/schema.sql`)
- ✅ Basic routing structure
- ✅ Dashboard layout with sidebar
- ✅ Placeholder pages for all modules

### Pending
- ⏳ Prisma schema and migrations
- ⏳ Database connection configuration
- ⏳ NextAuth.js authentication setup
- ⏳ RBAC helper implementation
- ⏳ Service layer (inventory, job cards, etc.)
- ⏳ API routes/server actions
- ⏳ UI component implementation
- ⏳ Test suite setup

## Development Environment

- **Framework**: Next.js 14.1.0 (App Router)
- **Language**: TypeScript 5.3.0
- **Styling**: Tailwind CSS 3.4.0
- **UI Components**: shadcn UI
- **Database**: MySQL (schema defined, connection pending)
- **ORM**: Prisma 5.2.0 (pending setup)
- **Authentication**: NextAuth.js 4.22.0 (pending setup)

## Next Steps

Follow the workflow phases to implement the core infrastructure:
1. **Architecture**: Review and document current state (this document)
2. **Plan**: Create detailed implementation plan for Prisma, Auth, and RBAC
3. **Code**: Implement database connection, Prisma schema, and authentication
4. **Test**: Create test suite for services and RBAC
5. **Handoff**: Document implementation
6. **Cursor Prompt**: Generate next development cycle prompt



