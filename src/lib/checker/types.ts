export type CheckResult = {
  status: 'ONLINE' | 'BLOCKED' | 'OFFLINE' | 'ERROR' | 'UNKNOWN';
  blockType: 'DNS' | 'IP' | 'SNI' | 'HTTP' | null;
  stage: 'dns' | 'tcp' | 'tls' | 'http' | null;
  resolvedIps: {
    local: string[];
    doh: string[];
  };
  httpStatus: number | null;
  redirectChain: string[];
  errorCode: string | null;
  latencyMs: number | null;
  probeId: string | null;
  checkedAt: Date;
};

export type BlockSignatures = {
  ips: string[];
  hostnames: string[];
  keywords: string[];
};
