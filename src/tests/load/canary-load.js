/**
 * Canary Load Testing Script
 *
 * @business-context Simple load testing for canary deployments to ensure
 *                   new features can handle expected traffic before full rollout.
 *                   Uses native Node.js to avoid additional dependencies.
 * @decision-date 2024-01-22
 * @decision-by Development team for deployment validation
 */

import http from "http";
import https from "https";
import { URL } from "url";

/**
 * Load test configuration
 */
const CONFIG = {
  baseUrl: process.env.LOAD_TEST_URL || "http://localhost:3000",
  concurrency: Number.parseInt(process.env.LOAD_TEST_CONCURRENCY) || 10,
  duration: Number.parseInt(process.env.LOAD_TEST_DURATION) || 60, // seconds
  requestDelay: Number.parseInt(process.env.LOAD_TEST_DELAY) || 1000, // ms between requests
  scenarios: [
    { path: "/", weight: 40 },
    { path: "/episodes", weight: 30 },
    { path: "/sources", weight: 15 },
    { path: "/queue", weight: 10 },
    { path: "/internal", weight: 5 },
  ],
};

/**
 * Test statistics
 */
const stats = {
  endTime: null,
  errorsByType: new Map(),
  failedRequests: 0,
  maxResponseTime: 0,
  minResponseTime: Infinity,
  responseTimes: [],
  startTime: null,
  statusCodes: new Map(),
  successfulRequests: 0,
  totalRequests: 0,
  totalResponseTime: 0,
};

/**
 * Make HTTP/HTTPS request
 */
function makeRequest(url) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const urlObj = new URL(url);
    const client = urlObj.protocol === "https:" ? https : http;

    const options = {
      headers: {
        Accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "User-Agent": "CanaryLoadTest/1.0",
      },
      hostname: urlObj.hostname,
      method: "GET",
      path: urlObj.pathname + urlObj.search,
      port: urlObj.port,
      timeout: 30000, // 30 second timeout
    };

    const req = client.request(options, (res) => {
      const responseTime = Date.now() - startTime;
      let data = "";

      res.on("data", (chunk) => {
        data += chunk;
      });

      res.on("end", () => {
        resolve({
          error: null,
          responseTime,
          size: data.length,
          statusCode: res.statusCode,
          success: res.statusCode >= 200 && res.statusCode < 400,
        });
      });
    });

    req.on("error", (error) => {
      const responseTime = Date.now() - startTime;
      resolve({
        error: error.message,
        responseTime,
        size: 0,
        statusCode: 0,
        success: false,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      const responseTime = Date.now() - startTime;
      resolve({
        error: "Request timeout",
        responseTime,
        size: 0,
        statusCode: 0,
        success: false,
      });
    });

    req.end();
  });
}

/**
 * Select random scenario based on weight
 */
function selectScenario() {
  const totalWeight = CONFIG.scenarios.reduce((sum, s) => sum + s.weight, 0);
  let random = Math.random() * totalWeight;

  for (const scenario of CONFIG.scenarios) {
    random -= scenario.weight;
    if (random <= 0) {
      return scenario;
    }
  }

  return CONFIG.scenarios[0]; // fallback
}

/**
 * Update statistics
 */
function updateStats(result) {
  stats.totalRequests++;

  if (result.success) {
    stats.successfulRequests++;
  } else {
    stats.failedRequests++;

    const errorType = result.error || `HTTP ${result.statusCode}`;
    stats.errorsByType.set(
      errorType,
      (stats.errorsByType.get(errorType) || 0) + 1
    );
  }

  // Response time tracking
  stats.totalResponseTime += result.responseTime;
  stats.minResponseTime = Math.min(stats.minResponseTime, result.responseTime);
  stats.maxResponseTime = Math.max(stats.maxResponseTime, result.responseTime);
  stats.responseTimes.push(result.responseTime);

  // Status code tracking
  const statusCode = result.statusCode.toString();
  stats.statusCodes.set(
    statusCode,
    (stats.statusCodes.get(statusCode) || 0) + 1
  );

  // Keep only last 1000 response times to prevent memory issues
  if (stats.responseTimes.length > 1000) {
    stats.responseTimes = stats.responseTimes.slice(-1000);
  }
}

/**
 * Calculate percentiles
 */
function calculatePercentile(values, percentile) {
  const sorted = [...values].sort((a, b) => a - b);
  const index = Math.ceil((percentile / 100) * sorted.length) - 1;
  return sorted[Math.max(0, index)];
}

/**
 * Print current statistics
 */
function printStats() {
  const duration = (Date.now() - stats.startTime) / 1000;
  const requestsPerSecond = stats.totalRequests / duration;
  const averageResponseTime =
    stats.totalRequests > 0 ? stats.totalResponseTime / stats.totalRequests : 0;

  const successRate =
    stats.totalRequests > 0
      ? (stats.successfulRequests / stats.totalRequests) * 100
      : 0;

  console.clear();
  console.log("🚀 Canary Load Test - Real-time Stats");
  console.log("=====================================");
  console.log(`Duration: ${duration.toFixed(1)}s / ${CONFIG.duration}s`);
  console.log(`Concurrency: ${CONFIG.concurrency} virtual users`);
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log("");

  console.log("📊 Request Statistics:");
  console.log(`  Total Requests: ${stats.totalRequests}`);
  console.log(
    `  Successful: ${stats.successfulRequests} (${successRate.toFixed(1)}%)`
  );
  console.log(`  Failed: ${stats.failedRequests}`);
  console.log(`  Requests/sec: ${requestsPerSecond.toFixed(2)}`);
  console.log("");

  if (stats.responseTimes.length > 0) {
    console.log("⏱️  Response Times:");
    console.log(`  Average: ${averageResponseTime.toFixed(0)}ms`);
    console.log(`  Min: ${stats.minResponseTime}ms`);
    console.log(`  Max: ${stats.maxResponseTime}ms`);
    console.log(`  P50: ${calculatePercentile(stats.responseTimes, 50)}ms`);
    console.log(`  P95: ${calculatePercentile(stats.responseTimes, 95)}ms`);
    console.log(`  P99: ${calculatePercentile(stats.responseTimes, 99)}ms`);
    console.log("");
  }

  if (stats.statusCodes.size > 0) {
    console.log("📈 Status Codes:");
    for (const [code, count] of [...stats.statusCodes.entries()].sort()) {
      const percentage = ((count / stats.totalRequests) * 100).toFixed(1);
      console.log(`  ${code}: ${count} (${percentage}%)`);
    }
    console.log("");
  }

  if (stats.errorsByType.size > 0) {
    console.log("❌ Errors:");
    for (const [error, count] of [...stats.errorsByType.entries()].sort(
      (a, b) => b[1] - a[1]
    )) {
      console.log(`  ${error}: ${count}`);
    }
    console.log("");
  }

  // Health indicator
  if (successRate >= 99) {
    console.log("✅ Status: EXCELLENT");
  } else if (successRate >= 95) {
    console.log("🟡 Status: GOOD");
  } else if (successRate >= 90) {
    console.log("🟠 Status: WARNING");
  } else {
    console.log("🔴 Status: CRITICAL");
  }
}

/**
 * Worker function for each virtual user
 */
async function worker(workerId) {
  while (Date.now() - stats.startTime < CONFIG.duration * 1000) {
    try {
      const scenario = selectScenario();
      const url = `${CONFIG.baseUrl}${scenario.path}`;

      const result = await makeRequest(url);
      updateStats(result);

      // Wait between requests
      if (CONFIG.requestDelay > 0) {
        await new Promise((resolve) =>
          setTimeout(resolve, CONFIG.requestDelay)
        );
      }
    } catch (error) {
      updateStats({
        error: error.message,
        responseTime: 0,
        size: 0,
        statusCode: 0,
        success: false,
      });
    }
  }
}

/**
 * Generate final report
 */
function generateFinalReport() {
  const duration = (stats.endTime - stats.startTime) / 1000;
  const requestsPerSecond = stats.totalRequests / duration;
  const averageResponseTime =
    stats.totalRequests > 0 ? stats.totalResponseTime / stats.totalRequests : 0;
  const successRate =
    stats.totalRequests > 0
      ? (stats.successfulRequests / stats.totalRequests) * 100
      : 0;

  const report = {
    config: CONFIG,
    errors: Object.fromEntries(stats.errorsByType),
    performance: {
      maxResponseTime: stats.maxResponseTime,
      minResponseTime:
        stats.minResponseTime === Infinity ? 0 : stats.minResponseTime,
      p50ResponseTime:
        stats.responseTimes.length > 0
          ? calculatePercentile(stats.responseTimes, 50)
          : 0,
      p95ResponseTime:
        stats.responseTimes.length > 0
          ? calculatePercentile(stats.responseTimes, 95)
          : 0,
      p99ResponseTime:
        stats.responseTimes.length > 0
          ? calculatePercentile(stats.responseTimes, 99)
          : 0,
    },
    statusCodes: Object.fromEntries(stats.statusCodes),
    summary: {
      averageResponseTime,
      duration,
      failedRequests: stats.failedRequests,
      requestsPerSecond,
      successfulRequests: stats.successfulRequests,
      successRate,
      totalRequests: stats.totalRequests,
    },
    timestamp: new Date().toISOString(),
  };

  console.log("\n🎯 Final Load Test Report");
  console.log("========================");
  console.log(JSON.stringify(report, null, 2));

  // Determine if test passed
  const testPassed = successRate >= 95 && averageResponseTime < 5000; // 95% success, <5s avg response

  console.log(
    `\n${testPassed ? "✅ PASS" : "❌ FAIL"}: Load test ${testPassed ? "passed" : "failed"}`
  );

  return report;
}

/**
 * Main load test function
 */
async function runLoadTest() {
  console.log("🚀 Starting Canary Load Test...");
  console.log(`Target: ${CONFIG.baseUrl}`);
  console.log(`Duration: ${CONFIG.duration}s`);
  console.log(`Concurrency: ${CONFIG.concurrency} virtual users`);
  console.log(`Request delay: ${CONFIG.requestDelay}ms`);
  console.log("");

  stats.startTime = Date.now();

  // Start workers
  const workers = [];
  for (let i = 0; i < CONFIG.concurrency; i++) {
    workers.push(worker(i));
  }

  // Start stats reporting
  const statsInterval = setInterval(printStats, 2000);

  // Wait for all workers to complete
  await Promise.all(workers);

  stats.endTime = Date.now();
  clearInterval(statsInterval);

  // Generate final report
  const report = generateFinalReport();

  // Exit with appropriate code
  const success = report.summary.successRate >= 95;
  process.exit(success ? 0 : 1);
}

/**
 * Handle graceful shutdown
 */
process.on("SIGINT", () => {
  console.log("\n\n🛑 Load test interrupted by user");
  stats.endTime = Date.now();
  generateFinalReport();
  process.exit(130);
});

process.on("SIGTERM", () => {
  console.log("\n\n🛑 Load test terminated");
  stats.endTime = Date.now();
  generateFinalReport();
  process.exit(143);
});

// Start the load test
if (import.meta.url === `file://${process.argv[1]}`) {
  runLoadTest().catch((error) => {
    console.error("❌ Load test failed:", error);
    process.exit(1);
  });
}

export { CONFIG, runLoadTest };
