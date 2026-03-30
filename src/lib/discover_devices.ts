import { getLocalIPAddress } from "@/lib/getLocalIp";

export interface DiscoveredDevice {
  ip: string;
  deviceId: string;
  deviceName: string;
}

/**
 * Extract subnet base from an IP address.
 * e.g. "192.168.1.42" → "192.168.1"
 */
export function getSubnetBase(ip: string): string | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  if (parts.some((p) => !/^\d{1,3}$/.test(p))) return null;
  const nums = parts.map(Number);
  if (nums.some((n) => n < 0 || n > 255)) return null;
  return parts.slice(0, 3).join(".");
}

/**
 * Probe a single IP for a DWARF device via POST /deviceInfo on port 8082.
 * Returns device info or null if unreachable / not a DWARF.
 */
export async function probeDevice(
  ip: string,
  timeout = 500
): Promise<DiscoveredDevice | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const res = await fetch(`http://${ip}:8082/deviceInfo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
      signal: controller.signal,
    });

    if (!res.ok) return null;

    const data = await res.json();
    // DWARF API returns { code, data: { deviceId, deviceName, ... } }
    const inner = data?.data;
    if (!inner) return null;

    const deviceId = inner.deviceId ?? inner.id ?? "";
    const deviceName = inner.deviceName ?? inner.name ?? ip;

    return { ip, deviceId: String(deviceId), deviceName: String(deviceName) };
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Scan all 254 hosts on a /24 subnet for DWARF devices.
 * Uses batched parallel requests to limit concurrency.
 */
export async function discoverDevices(
  subnetBase?: string,
  batchSize = 50,
  timeout = 500
): Promise<DiscoveredDevice[]> {
  // Auto-detect subnet from local IP if not provided
  if (!subnetBase) {
    const localIPs = getLocalIPAddress();
    if (localIPs.length > 0) {
      subnetBase = getSubnetBase(localIPs[0]) ?? undefined;
    }
  }
  if (!subnetBase) {
    return [];
  }

  const ips = Array.from({ length: 254 }, (_, i) => `${subnetBase}.${i + 1}`);
  const devices: DiscoveredDevice[] = [];

  // Process in batches to limit concurrency
  for (let i = 0; i < ips.length; i += batchSize) {
    const batch = ips.slice(i, i + batchSize);
    const results = await Promise.all(
      batch.map((ip) => probeDevice(ip, timeout))
    );
    for (const result of results) {
      if (result) devices.push(result);
    }
  }

  return devices;
}
