#!/usr/bin/env node
import { createRequire as __WEBPACK_EXTERNAL_createRequire } from "module";
/******/ var __webpack_modules__ = ({

/***/ 714:
/***/ ((module) => {

module.exports = eval("require")("../../dist/lib/pipeline/scrapingProcessor.js");


/***/ }),

/***/ 63:
/***/ ((module) => {

module.exports = eval("require")("../../dist/lib/supabase/services/scrapingJobService.js");


/***/ }),

/***/ 975:
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_createRequire(import.meta.url)("node:util");

/***/ }),

/***/ 84:
/***/ ((__webpack_module__, __unused_webpack___webpack_exports__, __nccwpck_require__) => {

__nccwpck_require__.a(__webpack_module__, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony import */ var node_util__WEBPACK_IMPORTED_MODULE_0__ = __nccwpck_require__(975);
/* harmony import */ var _dist_lib_pipeline_scrapingProcessor_js__WEBPACK_IMPORTED_MODULE_1__ = __nccwpck_require__(714);
/* harmony import */ var _dist_lib_supabase_services_scrapingJobService_js__WEBPACK_IMPORTED_MODULE_2__ = __nccwpck_require__(63);
/**
 * GitHub Action Scraper Script (TypeScript)
 *
 * This script is designed to run in GitHub Actions to process pending scraping jobs.
 * It uses ESM imports and is compatible with Node.js 20+.
 *
 * Usage: node src/actions/github-action-scraper.js --limit 10
 */



// Parse command line arguments
const options = {
    limit: {
        type: 'string',
        short: 'l',
        default: '10'
    },
    help: {
        type: 'boolean',
        short: 'h',
        default: false
    }
};
const { values } = (0,node_util__WEBPACK_IMPORTED_MODULE_0__.parseArgs)({ options, allowPositionals: false });
if (values.help) {
    console.log(`
GitHub Action Scraper

Usage: node src/actions/github-action-scraper.js [options]

Options:
  -l, --limit <number>  Maximum number of jobs to process (default: 10)
  -h, --help           Show this help message

Environment Variables Required:
  - NEXT_PUBLIC_SUPABASE_URL
  - SUPABASE_SERVICE_ROLE_KEY
  - FIRECRAWL_API_KEY
  - GEMINI_API_KEY or GOOGLE_API_KEY
  `);
    process.exit(0);
}
const limit = parseInt(values.limit || '10', 10);
// Validate environment variables
const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'FIRECRAWL_API_KEY'
];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
if (missingEnvVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingEnvVars.forEach(envVar => console.error(`  - ${envVar}`));
    process.exit(1);
}
// Check for AI API key
if (!process.env.GEMINI_API_KEY && !process.env.GOOGLE_API_KEY) {
    console.error('❌ Missing AI API key: either GEMINI_API_KEY or GOOGLE_API_KEY is required');
    process.exit(1);
}
console.log('🚀 GitHub Action Scraper Starting');
console.log(`📊 Processing up to ${limit} jobs`);
console.log(`🔗 Supabase URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 50)}...`);
/**
 * Main execution function
 */
async function main() {
    let processedCount = 0;
    let successCount = 0;
    let failureCount = 0;
    try {
        console.log('\n📋 Fetching pending scraping jobs...');
        // Get pending jobs from Supabase
        const pendingJobs = await _dist_lib_supabase_services_scrapingJobService_js__WEBPACK_IMPORTED_MODULE_2__.ScrapingJobService.getJobsByStatus('pending');
        if (!pendingJobs || pendingJobs.length === 0) {
            console.log('✅ No pending jobs found');
            return;
        }
        console.log(`📦 Found ${pendingJobs.length} pending jobs`);
        // Limit the number of jobs to process
        const jobsToProcess = pendingJobs.slice(0, limit);
        console.log(`⚡ Processing ${jobsToProcess.length} jobs`);
        // Process jobs sequentially to avoid overwhelming APIs
        for (const job of jobsToProcess) {
            processedCount++;
            console.log(`\n[${processedCount}/${jobsToProcess.length}] Processing job: ${job.id}`);
            console.log(`🎯 Target URL: ${job.target_url}`);
            try {
                // Process the scraping job using the pipeline
                await (0,_dist_lib_pipeline_scrapingProcessor_js__WEBPACK_IMPORTED_MODULE_1__.processScrapingJob)(job.id);
                successCount++;
                console.log(`✅ Job ${job.id} completed successfully`);
            }
            catch (error) {
                failureCount++;
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                console.error(`❌ Job ${job.id} failed:`, errorMessage);
                // Log the error but continue processing other jobs
                console.error('Error details:', error);
            }
            // Add a small delay between jobs to be respectful to APIs
            if (processedCount < jobsToProcess.length) {
                console.log('⏱️  Waiting 2 seconds before next job...');
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
    }
    catch (error) {
        console.error('💥 Fatal error in main execution:', error);
        process.exit(1);
    }
    // Final summary
    console.log('\n📊 Processing Summary:');
    console.log(`  Total processed: ${processedCount}`);
    console.log(`  Successful: ${successCount} ✅`);
    console.log(`  Failed: ${failureCount} ❌`);
    console.log(`  Success rate: ${processedCount > 0 ? Math.round((successCount / processedCount) * 100) : 0}%`);
    if (failureCount > 0) {
        console.log('\n⚠️  Some jobs failed. Check the logs above for details.');
        // Don't exit with error code as partial success is acceptable
    }
    console.log('\n🏁 GitHub Action Scraper completed');
}
// Error handlers
process.on('uncaughtException', (error) => {
    console.error('💥 Uncaught Exception:', error);
    process.exit(1);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
    process.exit(1);
});
// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n⏹️  Received SIGINT, shutting down gracefully...');
    process.exit(0);
});
process.on('SIGTERM', () => {
    console.log('\n⏹️  Received SIGTERM, shutting down gracefully...');
    process.exit(0);
});
// Run the main function using top-level await for pure ESM module
await main().catch((error) => {
    console.error('💥 Unhandled error in main:', error);
    process.exit(1);
});

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } }, 1);

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/
/******/ // The require function
/******/ function __nccwpck_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/
/******/ 	// Execute the module function
/******/ 	var threw = true;
/******/ 	try {
/******/ 		__webpack_modules__[moduleId](module, module.exports, __nccwpck_require__);
/******/ 		threw = false;
/******/ 	} finally {
/******/ 		if(threw) delete __webpack_module_cache__[moduleId];
/******/ 	}
/******/
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/
/************************************************************************/
/******/ /* webpack/runtime/async module */
/******/ (() => {
/******/ 	var webpackQueues = typeof Symbol === "function" ? Symbol("webpack queues") : "__webpack_queues__";
/******/ 	var webpackExports = typeof Symbol === "function" ? Symbol("webpack exports") : "__webpack_exports__";
/******/ 	var webpackError = typeof Symbol === "function" ? Symbol("webpack error") : "__webpack_error__";
/******/ 	var resolveQueue = (queue) => {
/******/ 		if(queue && queue.d < 1) {
/******/ 			queue.d = 1;
/******/ 			queue.forEach((fn) => (fn.r--));
/******/ 			queue.forEach((fn) => (fn.r-- ? fn.r++ : fn()));
/******/ 		}
/******/ 	}
/******/ 	var wrapDeps = (deps) => (deps.map((dep) => {
/******/ 		if(dep !== null && typeof dep === "object") {
/******/ 			if(dep[webpackQueues]) return dep;
/******/ 			if(dep.then) {
/******/ 				var queue = [];
/******/ 				queue.d = 0;
/******/ 				dep.then((r) => {
/******/ 					obj[webpackExports] = r;
/******/ 					resolveQueue(queue);
/******/ 				}, (e) => {
/******/ 					obj[webpackError] = e;
/******/ 					resolveQueue(queue);
/******/ 				});
/******/ 				var obj = {};
/******/ 				obj[webpackQueues] = (fn) => (fn(queue));
/******/ 				return obj;
/******/ 			}
/******/ 		}
/******/ 		var ret = {};
/******/ 		ret[webpackQueues] = x => {};
/******/ 		ret[webpackExports] = dep;
/******/ 		return ret;
/******/ 	}));
/******/ 	__nccwpck_require__.a = (module, body, hasAwait) => {
/******/ 		var queue;
/******/ 		hasAwait && ((queue = []).d = -1);
/******/ 		var depQueues = new Set();
/******/ 		var exports = module.exports;
/******/ 		var currentDeps;
/******/ 		var outerResolve;
/******/ 		var reject;
/******/ 		var promise = new Promise((resolve, rej) => {
/******/ 			reject = rej;
/******/ 			outerResolve = resolve;
/******/ 		});
/******/ 		promise[webpackExports] = exports;
/******/ 		promise[webpackQueues] = (fn) => (queue && fn(queue), depQueues.forEach(fn), promise["catch"](x => {}));
/******/ 		module.exports = promise;
/******/ 		body((deps) => {
/******/ 			currentDeps = wrapDeps(deps);
/******/ 			var fn;
/******/ 			var getResult = () => (currentDeps.map((d) => {
/******/ 				if(d[webpackError]) throw d[webpackError];
/******/ 				return d[webpackExports];
/******/ 			}))
/******/ 			var promise = new Promise((resolve) => {
/******/ 				fn = () => (resolve(getResult));
/******/ 				fn.r = 0;
/******/ 				var fnQueue = (q) => (q !== queue && !depQueues.has(q) && (depQueues.add(q), q && !q.d && (fn.r++, q.push(fn))));
/******/ 				currentDeps.map((dep) => (dep[webpackQueues](fnQueue)));
/******/ 			});
/******/ 			return fn.r ? promise : getResult();
/******/ 		}, (err) => ((err ? reject(promise[webpackError] = err) : outerResolve(exports)), resolveQueue(queue)));
/******/ 		queue && queue.d < 0 && (queue.d = 0);
/******/ 	};
/******/ })();
/******/
/******/ /* webpack/runtime/compat */
/******/
/******/ if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = new URL('.', import.meta.url).pathname.slice(import.meta.url.match(/^file:\/\/\/\w:/) ? 1 : 0, -1) + "/";
/******/
/************************************************************************/
/******/
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module used 'module' so it can't be inlined
/******/ var __webpack_exports__ = __nccwpck_require__(84);
/******/ __webpack_exports__ = await __webpack_exports__;
/******/
