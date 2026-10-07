const os = require("os");
const { execFile } = require("child_process");
const { promisify } = require("util");

const execFileAsync = promisify(execFile);

function cpuSnapshot() {
  return os.cpus().reduce(
    (total, cpu) => {
      const times = cpu.times;
      total.total += Object.values(times).reduce((sum, value) => sum + value, 0);
      total.idle += times.idle;
      return total;
    },
    { total: 0, idle: 0 },
  );
}

let previousCpu = cpuSnapshot();

async function getCpuUsage() {
  const current = cpuSnapshot();
  const totalDelta = current.total - previousCpu.total;
  const idleDelta = current.idle - previousCpu.idle;
  previousCpu = current;
  const usagePercent =
    totalDelta > 0 ? ((totalDelta - idleDelta) / totalDelta) * 100 : 0;

  return {
    usagePercent: Math.round(Math.max(0, Math.min(100, usagePercent)) * 10) / 10,
    cores: os.cpus().length,
  };
}

function getMemoryUsage() {
  const totalBytes = os.totalmem();
  const freeBytes = os.freemem();
  const usedBytes = totalBytes - freeBytes;
  return {
    totalBytes,
    usedBytes,
    freeBytes,
    usagePercent: Math.round((usedBytes / totalBytes) * 1000) / 10,
  };
}

async function getDiskUsage() {
  const { stdout } = await execFileAsync("df", ["-kP", "/"], {
    encoding: "utf8",
    timeout: 5000,
    maxBuffer: 1024 * 16,
  });
  const line = stdout.trim().split(/\r?\n/).at(-1);
  const fields = line?.trim().split(/\s+/);
  if (!fields || fields.length < 6 || !/^\d+%$/.test(fields[4])) {
    throw new Error("Unable to parse root disk usage");
  }

  return {
    mount: fields[5],
    totalBytes: Number(fields[1]) * 1024,
    usedBytes: Number(fields[2]) * 1024,
    freeBytes: Number(fields[3]) * 1024,
    usagePercent: Number.parseInt(fields[4], 10),
  };
}

module.exports = { getCpuUsage, getMemoryUsage, getDiskUsage };
