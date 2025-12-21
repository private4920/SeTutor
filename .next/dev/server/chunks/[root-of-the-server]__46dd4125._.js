module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/db/config.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "closePool",
    ()=>closePool,
    "getPool",
    ()=>getPool,
    "query",
    ()=>query
]);
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
// Use connectionString if available, otherwise fall back to individual params
const poolConfig = process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_SSL === "true" ? {
        rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
} : {
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT || "5432", 10),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === "true" ? {
        rejectUnauthorized: false
    } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000
};
let pool;
function getPool() {
    if (!pool) {
        pool = new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"](poolConfig);
    }
    return pool;
}
async function query(text, params) {
    const client = await getPool().connect();
    try {
        const result = await client.query(text, params);
        return result.rows;
    } finally{
        client.release();
    }
}
async function closePool() {
    if (pool) {
        await pool.end();
        pool = undefined;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/repositories/documentRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "countDocumentsByUserId",
    ()=>countDocumentsByUserId,
    "createDocument",
    ()=>createDocument,
    "deleteDocument",
    ()=>deleteDocument,
    "getAllDocumentsByUserId",
    ()=>getAllDocumentsByUserId,
    "getDocumentById",
    ()=>getDocumentById,
    "getDocumentsByFolderId",
    ()=>getDocumentsByFolderId,
    "getDocumentsPaginated",
    ()=>getDocumentsPaginated,
    "getRecentDocuments",
    ()=>getRecentDocuments,
    "searchDocuments",
    ()=>searchDocuments,
    "updateDocument",
    ()=>updateDocument
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/config.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function createDocument(input) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO documents (name, original_name, folder_id, user_id, s3_key, s3_url, file_size, mime_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`, [
        input.name,
        input.original_name,
        input.folder_id || null,
        input.user_id,
        input.s3_key,
        input.s3_url,
        input.file_size,
        input.mime_type
    ]);
    if (!result[0]) {
        throw new Error('Failed to create document');
    }
    return result[0];
}
async function getDocumentById(id, userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM documents WHERE id = $1 AND user_id = $2', [
        id,
        userId
    ]);
    return result[0] || null;
}
async function getDocumentsByFolderId(folderId, userId) {
    if (folderId === null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM documents WHERE folder_id IS NULL AND user_id = $1 ORDER BY name', [
            userId
        ]);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM documents WHERE folder_id = $1 AND user_id = $2 ORDER BY name', [
        folderId,
        userId
    ]);
}
async function getAllDocumentsByUserId(userId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC', [
        userId
    ]);
}
async function getRecentDocuments(userId, limit = 10) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM documents WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2', [
        userId,
        limit
    ]);
}
async function searchDocuments(userId, searchQuery) {
    const searchPattern = `%${searchQuery}%`;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`SELECT * FROM documents 
     WHERE user_id = $1 AND (name ILIKE $2 OR original_name ILIKE $2)
     ORDER BY name`, [
        userId,
        searchPattern
    ]);
}
async function updateDocument(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
    }
    if (updates.folder_id !== undefined) {
        fields.push(`folder_id = $${paramIndex++}`);
        values.push(updates.folder_id);
    }
    if (fields.length === 0) return getDocumentById(id, userId);
    values.push(id, userId);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE documents SET ${fields.join(', ')} 
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`, values);
    return result[0] || null;
}
async function deleteDocument(id, userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('DELETE FROM documents WHERE id = $1 AND user_id = $2 RETURNING *', [
        id,
        userId
    ]);
    return result[0] || null;
}
async function countDocumentsByUserId(userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT COUNT(*) as count FROM documents WHERE user_id = $1', [
        userId
    ]);
    return parseInt(result[0]?.count ?? '0', 10);
}
async function getDocumentsPaginated(userId, page = 1, pageSize = 20, folderId) {
    const offset = (page - 1) * pageSize;
    let countQuery;
    let dataQuery;
    let params;
    if (folderId === undefined) {
        countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1';
        dataQuery = `SELECT * FROM documents WHERE user_id = $1 
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        params = [
            userId,
            pageSize,
            offset
        ];
    } else if (folderId === null) {
        countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1 AND folder_id IS NULL';
        dataQuery = `SELECT * FROM documents WHERE user_id = $1 AND folder_id IS NULL
                 ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
        params = [
            userId,
            pageSize,
            offset
        ];
    } else {
        countQuery = 'SELECT COUNT(*) as count FROM documents WHERE user_id = $1 AND folder_id = $2';
        dataQuery = `SELECT * FROM documents WHERE user_id = $1 AND folder_id = $2
                 ORDER BY created_at DESC LIMIT $3 OFFSET $4`;
        params = [
            userId,
            folderId,
            pageSize,
            offset
        ];
    }
    const countResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(countQuery, folderId === undefined ? [
        userId
    ] : folderId === null ? [
        userId
    ] : [
        userId,
        folderId
    ]);
    const documents = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(dataQuery, params);
    return {
        documents,
        total: parseInt(countResult[0]?.count ?? '0', 10)
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/repositories/folderRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "countFoldersByUserId",
    ()=>countFoldersByUserId,
    "createFolder",
    ()=>createFolder,
    "deleteFolder",
    ()=>deleteFolder,
    "getAllFoldersByUserId",
    ()=>getAllFoldersByUserId,
    "getChildFolders",
    ()=>getChildFolders,
    "getFolderById",
    ()=>getFolderById,
    "getFolderPath",
    ()=>getFolderPath,
    "getFoldersByParentId",
    ()=>getFoldersByParentId,
    "getFoldersPaginated",
    ()=>getFoldersPaginated,
    "moveFolder",
    ()=>moveFolder,
    "updateFolder",
    ()=>updateFolder
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/config.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function createFolder(input) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO folders (name, parent_id, user_id, path)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [
        input.name,
        input.parent_id || null,
        input.user_id,
        input.path
    ]);
    if (!result[0]) {
        throw new Error('Failed to create folder');
    }
    return result[0];
}
async function getFolderById(id, userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM folders WHERE id = $1 AND user_id = $2', [
        id,
        userId
    ]);
    return result[0] || null;
}
async function getFoldersByParentId(parentId, userId) {
    if (parentId === null) {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM folders WHERE parent_id IS NULL AND user_id = $1 ORDER BY name', [
            userId
        ]);
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM folders WHERE parent_id = $1 AND user_id = $2 ORDER BY name', [
        parentId,
        userId
    ]);
}
async function getAllFoldersByUserId(userId) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM folders WHERE user_id = $1 ORDER BY path, name', [
        userId
    ]);
}
async function updateFolder(id, userId, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
    }
    if (updates.parent_id !== undefined) {
        fields.push(`parent_id = $${paramIndex++}`);
        values.push(updates.parent_id);
    }
    if (updates.path !== undefined) {
        fields.push(`path = $${paramIndex++}`);
        values.push(updates.path);
    }
    if (fields.length === 0) return getFolderById(id, userId);
    values.push(id, userId);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE folders SET ${fields.join(', ')}, updated_at = CURRENT_TIMESTAMP
     WHERE id = $${paramIndex++} AND user_id = $${paramIndex}
     RETURNING *`, values);
    return result[0] || null;
}
async function deleteFolder(id, userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('DELETE FROM folders WHERE id = $1 AND user_id = $2 RETURNING id', [
        id,
        userId
    ]);
    return result.length > 0;
}
async function getFolderPath(id, userId) {
    // Recursive CTE to get full folder path from root to current folder
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`WITH RECURSIVE folder_path AS (
      SELECT * FROM folders WHERE id = $1 AND user_id = $2
      UNION ALL
      SELECT f.* FROM folders f
      INNER JOIN folder_path fp ON f.id = fp.parent_id
      WHERE f.user_id = $2
    )
    SELECT * FROM folder_path ORDER BY path`, [
        id,
        userId
    ]);
    return result;
}
async function getChildFolders(id, userId) {
    // Recursive CTE to get all descendant folders
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`WITH RECURSIVE descendants AS (
      SELECT * FROM folders WHERE parent_id = $1 AND user_id = $2
      UNION ALL
      SELECT f.* FROM folders f
      INNER JOIN descendants d ON f.parent_id = d.id
      WHERE f.user_id = $2
    )
    SELECT * FROM descendants ORDER BY path`, [
        id,
        userId
    ]);
    return result;
}
async function countFoldersByUserId(userId) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT COUNT(*) as count FROM folders WHERE user_id = $1', [
        userId
    ]);
    return parseInt(result[0]?.count ?? '0', 10);
}
async function moveFolder(id, userId, newParentId) {
    // Get the folder to move
    const folder = await getFolderById(id, userId);
    if (!folder) return null;
    // Prevent moving to itself
    if (newParentId === id) {
        throw new Error('Cannot move folder into itself');
    }
    // If moving to a parent, validate it's not a descendant
    if (newParentId) {
        const descendants = await getChildFolders(id, userId);
        if (descendants.some((d)=>d.id === newParentId)) {
            throw new Error('Cannot move folder into its own descendant');
        }
    }
    // Calculate new path
    let newPath;
    if (newParentId) {
        const newParent = await getFolderById(newParentId, userId);
        if (!newParent) {
            throw new Error('Target parent folder not found');
        }
        newPath = `${newParent.path}/${folder.name}`;
    } else {
        newPath = `/${folder.name}`;
    }
    // Update the folder
    const updatedFolder = await updateFolder(id, userId, {
        parent_id: newParentId,
        path: newPath
    });
    // Update paths for all descendants
    if (updatedFolder) {
        const descendants = await getChildFolders(id, userId);
        for (const descendant of descendants){
            const relativePath = descendant.path.substring(folder.path.length);
            const newDescendantPath = newPath + relativePath;
            await updateFolder(descendant.id, userId, {
                path: newDescendantPath
            });
        }
    }
    return updatedFolder;
}
async function getFoldersPaginated(userId, page = 1, pageSize = 20, parentId) {
    const offset = (page - 1) * pageSize;
    let countQuery;
    let dataQuery;
    let countParams;
    let dataParams;
    if (parentId === undefined) {
        countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1';
        dataQuery = `SELECT * FROM folders WHERE user_id = $1 
                 ORDER BY name LIMIT $2 OFFSET $3`;
        countParams = [
            userId
        ];
        dataParams = [
            userId,
            pageSize,
            offset
        ];
    } else if (parentId === null) {
        countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1 AND parent_id IS NULL';
        dataQuery = `SELECT * FROM folders WHERE user_id = $1 AND parent_id IS NULL
                 ORDER BY name LIMIT $2 OFFSET $3`;
        countParams = [
            userId
        ];
        dataParams = [
            userId,
            pageSize,
            offset
        ];
    } else {
        countQuery = 'SELECT COUNT(*) as count FROM folders WHERE user_id = $1 AND parent_id = $2';
        dataQuery = `SELECT * FROM folders WHERE user_id = $1 AND parent_id = $2
                 ORDER BY name LIMIT $3 OFFSET $4`;
        countParams = [
            userId,
            parentId
        ];
        dataParams = [
            userId,
            parentId,
            pageSize,
            offset
        ];
    }
    const countResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(countQuery, countParams);
    const folders = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(dataQuery, dataParams);
    return {
        folders,
        total: parseInt(countResult[0]?.count ?? '0', 10)
    };
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/db/repositories/userRepository.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "createUser",
    ()=>createUser,
    "deleteUser",
    ()=>deleteUser,
    "findOrCreateUser",
    ()=>findOrCreateUser,
    "getOrCreateUser",
    ()=>getOrCreateUser,
    "getUserByEmail",
    ()=>getUserByEmail,
    "getUserByFirebaseUid",
    ()=>getUserByFirebaseUid,
    "getUserById",
    ()=>getUserById,
    "updateUser",
    ()=>updateUser
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/config.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
async function createUser(input) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO users (email, name, photo_url, firebase_uid)
     VALUES ($1, $2, $3, $4)
     RETURNING *`, [
        input.email,
        input.name,
        input.photo_url || null,
        input.firebase_uid
    ]);
    if (!result[0]) {
        throw new Error('Failed to create user');
    }
    return result[0];
}
async function getUserById(id) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM users WHERE id = $1', [
        id
    ]);
    return result[0] || null;
}
async function getUserByFirebaseUid(firebaseUid) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM users WHERE firebase_uid = $1', [
        firebaseUid
    ]);
    return result[0] || null;
}
async function getUserByEmail(email) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('SELECT * FROM users WHERE email = $1', [
        email
    ]);
    return result[0] || null;
}
async function updateUser(id, updates) {
    const fields = [];
    const values = [];
    let paramIndex = 1;
    if (updates.name !== undefined) {
        fields.push(`name = $${paramIndex++}`);
        values.push(updates.name);
    }
    if (updates.photo_url !== undefined) {
        fields.push(`photo_url = $${paramIndex++}`);
        values.push(updates.photo_url);
    }
    if (fields.length === 0) return getUserById(id);
    values.push(id);
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`, values);
    return result[0] || null;
}
async function deleteUser(id) {
    const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])('DELETE FROM users WHERE id = $1 RETURNING id', [
        id
    ]);
    return result.length > 0;
}
async function findOrCreateUser(input) {
    const existing = await getUserByFirebaseUid(input.firebase_uid);
    if (existing) {
        return existing;
    }
    return createUser(input);
}
async function getOrCreateUser(firebaseUid, email, displayName) {
    try {
        // First try to get existing user
        const existing = await getUserByFirebaseUid(firebaseUid);
        if (existing) {
            return existing;
        }
        // Create new user if not found
        // Use displayName, or extract name from email, or use 'User' as fallback
        const name = displayName || (email ? email.split('@')[0] : 'User');
        const result = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$config$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["query"])(`INSERT INTO users (email, name, firebase_uid)
       VALUES ($1, $2, $3)
       ON CONFLICT (firebase_uid) DO UPDATE SET email = EXCLUDED.email
       RETURNING *`, [
            email,
            name,
            firebaseUid
        ]);
        return result[0] || null;
    } catch (error) {
        console.error('Error in getOrCreateUser:', error);
        return null;
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/firebase/admin.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "authenticateRequest",
    ()=>authenticateRequest,
    "verifyIdToken",
    ()=>verifyIdToken
]);
/**
 * Firebase Admin SDK configuration for server-side JWT token verification
 * 
 * This module provides secure backend authentication by verifying Firebase ID tokens.
 * It ensures that API requests are authenticated using cryptographically signed JWTs
 * rather than trusting client-provided user IDs.
 */ var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/app [external] (firebase-admin/app, esm_import, [project]/node_modules/firebase-admin)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__ = __turbopack_context__.i("[externals]/firebase-admin/auth [external] (firebase-admin/auth, esm_import, [project]/node_modules/firebase-admin)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__
]);
[__TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
let adminApp = null;
let adminAuth = null;
/**
 * Initialize Firebase Admin SDK
 * Uses environment variables for service account credentials
 */ function getAdminApp() {
    if (adminApp === null) {
        const existingApps = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getApps"])();
        if (existingApps.length > 0) {
            adminApp = existingApps[0];
        } else {
            // Initialize with service account credentials from environment
            const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
            if (serviceAccount) {
                // Parse JSON service account key from environment variable
                const credentials = JSON.parse(serviceAccount);
                adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
                    credential: (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["cert"])(credentials),
                    projectId: ("TURBOPACK compile-time value", "gabrielseto-956")
                });
            } else {
                // Fallback: Initialize with project ID only (for development with emulator)
                adminApp = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$app__$5b$external$5d$__$28$firebase$2d$admin$2f$app$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["initializeApp"])({
                    projectId: ("TURBOPACK compile-time value", "gabrielseto-956")
                });
            }
        }
    }
    return adminApp;
}
/**
 * Get Firebase Admin Auth instance
 */ function getAdminAuth() {
    if (adminAuth === null) {
        adminAuth = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$firebase$2d$admin$2f$auth__$5b$external$5d$__$28$firebase$2d$admin$2f$auth$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$firebase$2d$admin$29$__["getAuth"])(getAdminApp());
    }
    return adminAuth;
}
async function verifyIdToken(idToken) {
    const auth = getAdminAuth();
    try {
        // Verify the token with checkRevoked=true for additional security
        const decodedToken = await auth.verifyIdToken(idToken, true);
        return decodedToken;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Token verification failed';
        throw new Error(`Invalid authentication token: ${errorMessage}`);
    }
}
async function authenticateRequest(request) {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
        return {
            success: false,
            error: 'Authorization header is required',
            status: 401
        };
    }
    // Extract Bearer token
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
        return {
            success: false,
            error: 'Invalid authorization format. Expected: Bearer <token>',
            status: 401
        };
    }
    const idToken = parts[1];
    if (!idToken || idToken.trim() === '') {
        return {
            success: false,
            error: 'Token is required',
            status: 401
        };
    }
    try {
        const decodedToken = await verifyIdToken(idToken);
        return {
            success: true,
            uid: decodedToken.uid,
            email: decodedToken.email || null,
            displayName: decodedToken.name || null,
            emailVerified: decodedToken.email_verified || false
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        return {
            success: false,
            error: errorMessage,
            status: 401
        };
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/app/api/dashboard/stats/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$documentRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/documentRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$folderRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/folderRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db/repositories/userRepository.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/firebase/admin.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$documentRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$folderRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$documentRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$folderRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
async function GET(request) {
    try {
        // Authenticate request using JWT token
        const authResult = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$firebase$2f$admin$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["authenticateRequest"])(request);
        if (!authResult.success) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: authResult.error
            }, {
                status: authResult.status
            });
        }
        // Get or create user from verified Firebase UID
        const user = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$userRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getOrCreateUser"])(authResult.uid, authResult.email, authResult.displayName);
        if (!user) {
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
                error: 'Failed to get user'
            }, {
                status: 500
            });
        }
        // Fetch counts in parallel
        const [documentsCount, foldersCount] = await Promise.all([
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$documentRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countDocumentsByUserId"])(user.id),
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2f$repositories$2f$folderRepository$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["countFoldersByUserId"])(user.id)
        ]);
        // Flashcards and quizzes counts are placeholders for now
        // Will be implemented when those features are added
        const flashcardsCount = 0;
        const quizzesCount = 0;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            documents: documentsCount,
            folders: foldersCount,
            flashcards: flashcardsCount,
            quizzes: quizzesCount
        });
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: 'Failed to fetch dashboard statistics'
        }, {
            status: 500
        });
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__46dd4125._.js.map