# Better Auth Database Adapter Interface Summary

## Overview

Based on the Better Auth repository analysis, here's a comprehensive guide to the database adapter interface and error debugging.

---

## 1. Database Adapter Interface

### Core Adapter Methods (Required)

All adapters must implement the following methods:

```typescript
interface CustomAdapter {
  // Create a new record
  create<T extends Record<string, any>>({
    model: string;           // Transformed model name
    data: T;                 // Record data
    select?: string[];       // Fields to return (optional)
  }): Promise<T>;

  // Find a single record
  findOne<T>({
    model: string;
    where: CleanedWhere[];       // Array of { field, value, operator? } 
    select?: string[];
    join?: JoinConfig;           // For relationships (optional)
  }): Promise<T | null>;

  // Find multiple records
  findMany<T>({
    model: string;
    where?: CleanedWhere[];
    limit: number;               // Required: max records to return
    offset?: number;             // Pagination offset
    select?: string[];
    sortBy?: SortOption[];       // { field, direction }
    join?: JoinConfig;
  }): Promise<T[]>;

  // Count records
  count({
    model: string;
    where: CleanedWhere[];
  }): Promise<number>;

  // Update a single record
  update<T>({
    model: string;
    where: CleanedWhere[];
    update: Record<string, any>;
  }): Promise<T | null>;

  // Update multiple records
  updateMany({
    model: string;
    where: CleanedWhere[];
    update: Record<string, any>;
  }): Promise<number>;          // Returns count of updated records

  // Delete a single record
  delete({
    model: string;
    where: CleanedWhere[];
  }): Promise<void>;

  // Delete multiple records
  deleteMany({
    model: string;
    where: CleanedWhere[];
  }): Promise<number>;          // Returns count of deleted records

  // Execute multiple operations atomically
  transaction<R>(
    callback: (trx: DBTransactionAdapter) => Promise<R>
  ): Promise<R>;                // If DB doesn't support transactions, set to false

  // Optional: Create schema
  createSchema?(
    options: BetterAuthOptions, 
    file?: string
  ): Promise<DBAdapterSchemaCreation>;

  // Optional: Custom options for your adapter
  options?: Record<string, any>;
}
```

### Key Points about Methods

- **`model` parameter**: Always pre-transformed by the factory (use as-is)
- **`where` clauses**: Already cleaned and validated `{ field, value, operator? }`
- **`select` parameter**: For optimization only - factory handles filtering the result
- **Return types**: Factory handles missing fields and transformations automatically
- **Error handling**: Throw appropriate errors; factory will wrap them

---

## 2. Adapter Factory Configuration

### Required Config Options

```typescript
interface DBAdapterFactoryConfig {
  adapterId: string;              // Unique identifier (e.g., "firestore")
  adapterName: string;            // Display name (e.g., "Firestore Adapter")
  usePlural?: boolean;            // Table names are plural (default: false)
  debugLogs?: boolean | object;   // Enable debug logging
  
  // Database capability flags
  supportsJSON?: boolean;         // Default: false
  supportsDates?: boolean;        // Default: true
  supportsBooleans?: boolean;     // Default: true
  supportsNumericIds?: boolean;   // Default: true
  supportsUUIDs?: boolean;        // Default: false
  supportsArrays?: boolean;       // Default: false

  // Transaction support
  transaction?: false | ((callback) => Promise<R>);  // Default: false
}
```

### Optional Advanced Config

```typescript
interface DBAdapterFactoryConfig {
  // Custom ID generation
  customIdGenerator?: () => string | Promise<string>;
  disableIdGeneration?: boolean;  // For auto-increment DBs

  // Key mapping (e.g., MongoDB's _id vs id)
  mapKeysTransformInput?: Record<string, string>;
  mapKeysTransformOutput?: Record<string, string>;

  // Data transformation
  customTransformInput?: (props: {
    data: any;
    field: string;
    fieldAttributes: DBFieldAttribute;
    action: 'create' | 'update' | 'findOne' | 'findMany' | 'delete' | 'deleteMany' | 'count';
    model: string;
    schema: BetterAuthDBSchema;
    options: BetterAuthOptions;
  }) => any;

  customTransformOutput?: (props: {
    data: any;
    field: string;
    fieldAttributes: DBFieldAttribute;
    select?: string[];
    model: string;
  }) => any;

  // Disable automatic transformations if you handle them
  disableTransformInput?: boolean;
  disableTransformOutput?: boolean;
  disableTransformJoin?: boolean;

  // Join support
  supportsJoin?: boolean;         // Default: false
}
```

---

## 3. Creating an Adapter with `createAdapterFactory`

### Basic Structure

```typescript
import { createAdapterFactory } from "@better-auth/core/db/adapter";
import type { AdapterFactory } from "@better-auth/core/db/adapter";

export const firestoreAdapter = (db: Firestore, config?: FirestoreConfig): AdapterFactory => {
  let lazyOptions: BetterAuthOptions | null = null;

  const adapterOptions = {
    config: {
      adapterId: "firestore",
      adapterName: "Firestore Adapter",
      usePlural: config?.usePlural ?? false,
      debugLogs: config?.debugLogs ?? false,
      
      // Firestore-specific capabilities
      supportsJSON: true,         // Firestore has native JSON support
      supportsDates: true,        // Firestore has native Date support
      supportsBooleans: true,
      supportsNumericIds: false,  // Firestore uses string IDs
      supportsArrays: true,       // Firestore supports arrays
      
      // Key transformation for Firestore
      mapKeysTransformInput: {
        id: '__id',  // Use __id for Firestore doc ID
      },
      mapKeysTransformOutput: {
        __id: 'id',
      },

      // Transactions
      transaction: (callback) => {
        return db.runTransaction((transaction) => {
          const adapter = createAdapterFactory({
            config: adapterOptions.config,
            adapter: createCustomAdapter(transaction),
          })(lazyOptions!);
          return callback(adapter);
        });
      },
    },
    adapter: createCustomAdapter(db),
  };

  const adapter = createAdapterFactory(adapterOptions);

  return (options: BetterAuthOptions): DBAdapter<BetterAuthOptions> => {
    lazyOptions = options;
    return adapter(options);
  };
};

// CustomAdapter factory function
const createCustomAdapter = (
  db: Firestore | Transaction
): AdapterFactoryCustomizeAdapterCreator => {
  return ({
    getFieldName,
    getModelName,
    getDefaultModelName,
    schema,
  }) => {
    return {
      async create({ model, data, select }) {
        const docId = generateId(); // Your ID generation
        const docRef = db.collection(model).doc(docId);
        await docRef.set({ ...data, id: docId });
        return { ...data, id: docId } as any;
      },

      async findOne({ model, where }) {
        let query = db.collection(model);
        
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const doc = await query.limit(1).get();
        return doc.docs[0]?.data() || null;
      },

      async findMany({ model, where, limit, offset, sortBy }) {
        let query = db.collection(model);
        
        // Apply where clauses
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        // Apply sorting
        if (sortBy) {
          for (const sort of sortBy) {
            query = query.orderBy(
              getFieldName({ model, field: sort.field }),
              sort.direction === 'asc' ? 'asc' : 'desc'
            );
          }
        }

        // Apply offset and limit
        if (offset) query = query.offset(offset);
        query = query.limit(limit);

        const docs = await query.get();
        return docs.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      },

      async count({ model, where }) {
        let query = db.collection(model);
        
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const result = await query.count().get();
        return result.data().count;
      },

      async update({ model, where, update: values }) {
        // Get the document first
        let query = db.collection(model);
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const doc = await query.limit(1).get();
        if (doc.empty) return null;

        const docRef = doc.docs[0].ref;
        await docRef.update(values);
        return { id: doc.docs[0].id, ...doc.docs[0].data(), ...values } as any;
      },

      async updateMany({ model, where, update: values }) {
        let query = db.collection(model);
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const docs = await query.get();
        let count = 0;
        
        for (const doc of docs.docs) {
          await doc.ref.update(values);
          count++;
        }

        return count;
      },

      async delete({ model, where }) {
        let query = db.collection(model);
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const docs = await query.get();
        for (const doc of docs.docs) {
          await doc.ref.delete();
        }
      },

      async deleteMany({ model, where }) {
        let query = db.collection(model);
        for (const clause of where) {
          query = query.where(
            getFieldName({ model, field: clause.field }),
            parseOperator(clause.operator),
            clause.value
          );
        }

        const docs = await query.get();
        let count = 0;
        
        for (const doc of docs.docs) {
          await doc.ref.delete();
          count++;
        }

        return count;
      },
    };
  };
};
```

---

## 4. "Failed to initialize database adapter" Error

### Where It Comes From

The error is thrown in `packages/better-auth/src/db/adapter-kysely.ts`:

```typescript
if (!kysely) {
  throw new BetterAuthError("Failed to initialize database adapter");
}
```

### Triggers & Conditions

This error occurs when:

1. **Missing/Invalid Database Config**
   - `options.database` is undefined
   - Database instance cannot be detected/created
   - Invalid Kysely dialect configuration

2. **Adapter Selection Issues**
   - Database type cannot be determined
   - No appropriate adapter factory exists for the database
   - Adapter factory returns null/undefined

3. **Connection Problems**
   - Database connection cannot be established
   - Driver initialization fails
   - Missing required dependencies

### For Custom Adapters (Like Firestore)

To avoid this error:

```typescript
export async function getAdapter(
  options: BetterAuthOptions
): Promise<DBAdapter<BetterAuthOptions>> {
  return getBaseAdapter(options, async (opts) => {
    // Your adapter initialization
    const db = opts.database;

    if (!db) {
      throw new BetterAuthError("Database instance not provided");
    }

    try {
      // Initialize your adapter
      const adapter = firestoreAdapter(db);
      return adapter(opts);
    } catch (error) {
      throw new BetterAuthError(
        `Failed to initialize Firestore adapter: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
}
```

---

## 5. Known Firestore Adapter Implementations

Based on the Better Auth community adapters, there **is** a community Firestore adapter:

### Community Firestore Adapter

**Repository**: https://github.com/yultyyev/better-auth-firestore  
**Author**: yultyyev  
**Database**: Firebase Firestore  

This is a production-ready adapter maintained by the community.

### MongoDB Adapter (Reference Implementation)

For NoSQL databases, the MongoDB adapter is a good reference:

- **Location**: `packages/mongo-adapter/src/mongodb-adapter.ts`
- **File Path**: `packages/better-auth/src/adapters/mongodb-adapter/index.ts`
- **Key Features**:
  - Key mapping: `id` ↔ `_id`
  - ID generation: `ObjectId` or `UUID`
  - Transactions: Optional with client session
  - Aggregation support for joins
  - Custom transform functions for ID handling

---

## 6. Adapter Configuration Requirements

### What's Required

1. **Unique `adapterId`** - Without this, factory initialization fails
2. **`adapterName`** - For logging and identification
3. **All 8 core methods** - `create`, `findOne`, `findMany`, `count`, `update`, `updateMany`, `delete`, `deleteMany`
4. **Feature flags** (tell factory what your DB supports):
   - `supportsDates`, `supportsBooleans`, `supportsJSON`, etc.
5. **Transaction handling** - Even if DB doesn't support it, set to `false`

### What's Optional

- `select` parameter handling (factory does filtering)
- `join` support (factory has fallback)
- `createSchema` method (if you want migrations)
- Custom ID generation
- Key transformation functions

---

## 7. Data Type Handling

### Type Support Matrix

| Database | JSON | Dates | Booleans | NumericIDs | UUIDs | Arrays |
|----------|------|-------|----------|------------|-------|--------|
| Firestore | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| MongoDB | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| PostgreSQL | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MySQL | ❌ | ✅ | ✅ | ✅ | ❌ | ❌ |
| SQLite | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ |

When unsupported, Better Auth:
- Stores as strings
- Automatically converts on retrieval
- Handles serialization/deserialization

---

## 8. Transaction Pattern

### If Supported

```typescript
transaction: (cb) => {
  return db.transaction(async (transaction) => {
    const txAdapter = createAdapterFactory({
      config: adapterOptions.config,
      adapter: createCustomAdapter(transaction), // Use transaction context
    })(lazyOptions!);
    return cb(txAdapter);
  });
}
```

### If Not Supported

```typescript
transaction: false  // Operations execute sequentially
```

---

## 9. Debugging Tips

1. **Enable debug logs** in config:
   ```typescript
   debugLogs: true  // or { logCondition: () => true }
   ```

2. **Check factory initialization** - ensure all required config options present

3. **Verify `where` clause handling** - clauses are pre-cleaned, use them directly

4. **Test key transformations** - if using `mapKeysTransformInput/Output`, verify they work

5. **Validate return types**:
   - `create/update`: Return the full object including ID
   - `findOne`: Return single object or null
   - `findMany`: Return array (empty if none found)
   - `count`: Return number
   - `delete/deleteMany`: Return void or count
   - `updateMany/deleteMany`: Return count

---

## Summary

Better Auth's adapter interface is designed to be **flexible and framework-agnostic**. By implementing the 8 core methods and providing proper configuration, you can adapt any database. The factory handles:
- Data transformations
- Type conversions
- Field/model name mapping
- Relationship joins
- Transaction management

For Firestore specifically, the community adapter at `https://github.com/yultyyev/better-auth-firestore` is the recommended implementation.
