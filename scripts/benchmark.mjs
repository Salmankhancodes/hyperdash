import { chromium } from "playwright";

const BASE_URL = process.env.BENCHMARK_URL ?? "http://127.0.0.1:3000/dashboard";
const SAMPLE_COUNT = 5;
const SAMPLE_INTERVAL_MS = 1000;
const WARMUP_MS = 8000;

process.on("unhandledRejection", (error) => {
  console.error("Unhandled benchmark error:", error);
  process.exitCode = 1;
});

function parseNumber(text) {
  const match = text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : 0;
}

function average(values) {
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

async function readMetric(page, testId) {
  const text = await page.getByTestId(testId).innerText();
  return parseNumber(text);
}

console.log(`Launching benchmark against ${BASE_URL}`);

const browser = await chromium.launch({
  channel: "msedge",
  headless: true,
  timeout: 15000,
});

try {
  console.log("Browser launched");
  const page = await browser.newPage();
  await page.goto(BASE_URL, { waitUntil: "networkidle", timeout: 20000 });
  console.log("Dashboard loaded");

  await page.getByRole("combobox", { name: "Event Volume" }).click();
  await page.getByRole("option", { name: /Extreme/i }).click();
  console.log("Configured extreme load");

  await page.waitForTimeout(WARMUP_MS);
  console.log("Warmup complete");

  const startingTotalProcessed = await readMetric(page, "total-processed-value");
  const benchmarkStart = Date.now();

  const samples = [];

  for (let index = 0; index < SAMPLE_COUNT; index += 1) {
    const throughput = await readMetric(page, "throughput-value");
    const fps = await readMetric(page, "fps-value");
    const avgProcessing = await readMetric(page, "avg-processing-value");
    const dropped = await readMetric(page, "dropped-events-value");

    samples.push({ throughput, fps, avgProcessing, dropped });
    await page.waitForTimeout(SAMPLE_INTERVAL_MS);
  }

  const summary = {
    samples,
    averageThroughput: Math.round(average(samples.map((sample) => sample.throughput))),
    averageFps: Math.round(average(samples.map((sample) => sample.fps))),
    averageProcessingMs: Math.round(average(samples.map((sample) => sample.avgProcessing)) * 100) / 100,
    finalDroppedEvents: samples.at(-1)?.dropped ?? 0,
    sustainedThroughput: Math.round(
      ((await readMetric(page, "total-processed-value")) - startingTotalProcessed) /
        ((Date.now() - benchmarkStart) / 1000),
    ),
  };

  console.log(JSON.stringify(summary, null, 2));
} finally {
  console.log("Closing browser");
  await browser.close();
}