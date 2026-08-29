module.exports = [
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[project]/frontend/src/app/favicon.ico (static in ecmascript, tag client)", (() => {{

throw new Error("An error occurred while generating the chunk item [project]/frontend/src/app/favicon.ico (static in ecmascript, tag client)\n\nCaused by:\n- Missing content when trying to generate the content hash for static asset\n\nDebug info:\n- An error occurred while generating the chunk item [project]/frontend/src/app/favicon.ico (static in ecmascript, tag client)\n- Execution of <StaticUrlJsModule as EcmascriptChunkPlaceable>::chunk_item_content failed\n- Execution of <NodeJsChunkingContext as ChunkingContext>::asset_path failed\n- Missing content when trying to generate the content hash for static asset");

}}),
"[project]/frontend/src/app/favicon.ico.mjs { IMAGE => \"[project]/frontend/src/app/favicon.ico (static in ecmascript, tag client)\" } [app-rsc] (structured image object, ecmascript)", ((__turbopack_context__, module, exports) => {

var e = new Error("Could not parse module '[project]/frontend/src/app/favicon.ico.mjs'\n\nInput image not found\n\nDebug info:\n- Execution of <StructuredImageFileSource as Asset>::content failed\n- Execution of get_meta_data failed\n- Input image not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/frontend/src/app/page.tsx [app-rsc] (ecmascript)", ((__turbopack_context__, module, exports) => {

var e = new Error("Could not parse module '[project]/frontend/src/app/page.tsx', file not found");
e.code = 'MODULE_UNPARSABLE';
throw e;
}),
"[project]/frontend/src/app/page.tsx [app-rsc] (ecmascript, Next.js Server Component)", (function(__turbopack_context__){

__turbopack_context__.n(__turbopack_context__.i("[project]/frontend/src/app/page.tsx [app-rsc] (ecmascript)"));
}),
];