# Prompt 01: Database Connection Setup

## Objective
Configure the database connection for Station-2100 following the spec and dev profile guidelines.

## Task
Create a `.env` file at the project root with the MySQL database connection string.

## Requirements

1. **File Location**: Project root (same level as `package.json`)
2. **File Name**: `.env`
3. **Connection String Format**:
   ```
   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/stationv"
   ```

4. **Important Notes**:
   - Replace `USER` with your actual MySQL username (likely `root`)
   - Replace `PASSWORD` with your actual MySQL password
   - Database name is `stationv` (already exists)
   - Port is `3306` (default MySQL port)
   - Host is `localhost`

5. **Constraints**:
   - Do NOT modify the existing `customers` table
   - Do NOT drop or recreate the database
   - Only add new tables for the admin system

## Example

```env
# Database Connection
DATABASE_URL="mysql://root:yourpassword@localhost:3306/stationv"
```

## Verification

After creating the file:
- Ensure it's in `.gitignore` (should already be there)
- The connection string should be valid for your local MySQL instance
- Test connection with: `npx prisma db pull` (should connect without errors)

## Reference
- Dev Profile: https://github.com/gtthande/dev-profiles/blob/main/Dev_Profile_and_Cursor_Prompt_Pack.md
- Station-2100 Spec: Section 3 (Database Architecture)

---
**Next Step**: Prompt 02 - Set up Prisma schema
