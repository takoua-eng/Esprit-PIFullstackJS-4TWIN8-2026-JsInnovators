/**
 * Run before Nest bootstraps. Fixes many Windows / ISP setups where
 * `mongodb+srv` fails with `querySrv ECONNREFUSED` (SRV DNS lookup).
 */
import * as dns from 'node:dns';

const extra = process.env.MONGODB_DNS_SERVERS?.split(',')
  .map((s) => s.trim())
  .filter(Boolean);

if (extra?.length) {
  dns.setServers(extra);
}

dns.setDefaultResultOrder('ipv4first');
