import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ShieldAlert,
  ShieldCheck,
  ShieldQuestion,
  Globe,
  Calendar,
  Server,
  Lock,
  Eye,
  Plus,
  X,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const API_BASE = 'http://localhost:8000';

interface ScanResult {
  domain: string;
  risk_score: number;
  classification: string;
  domain_age_days: number;
  registrar: string;
  ssl_valid: boolean;
  osint_mentions: number;
}

const getRiskColor = (score: number) => {
  if (score >= 75) return { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', badge: 'bg-red-500/20 text-red-400', dot: 'bg-red-500' };
  if (score >= 45) return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-400', dot: 'bg-amber-500' };
  return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', badge: 'bg-emerald-500/20 text-emerald-400', dot: 'bg-emerald-500' };
};

const getRiskLabel = (score: number) => {
  if (score >= 75) return 'High Risk';
  if (score >= 45) return 'Medium Risk';
  return 'Low Risk';
};

const getRiskIcon = (score: number) => {
  if (score >= 75) return ShieldAlert;
  if (score >= 45) return ShieldQuestion;
  return ShieldCheck;
};

const DomainScanner = () => {
  const [domains, setDomains] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [customDomain, setCustomDomain] = useState('');
  const [results, setResults] = useState<ScanResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDomains, setFetchingDomains] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Fetch domains on mount
  useEffect(() => {
    const fetchDomains = async () => {
      try {
        setFetchingDomains(true);
        setError(null);
        const res = await fetch(`${API_BASE}/api/domains`);
        if (!res.ok) throw new Error(`Failed to fetch domains (${res.status})`);
        const data = await res.json();
        setDomains(data.domains || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load domains. Is the backend running?');
      } finally {
        setFetchingDomains(false);
      }
    };
    fetchDomains();
  }, []);

  const toggleDomain = useCallback((domain: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  }, []);

  const addCustomDomain = useCallback(() => {
    const d = customDomain.trim().toLowerCase();
    if (!d) return;
    if (!domains.includes(d)) {
      setDomains((prev) => [...prev, d]);
    }
    setSelected((prev) => new Set(prev).add(d));
    setCustomDomain('');
  }, [customDomain, domains]);

  const handleScan = useCallback(async () => {
    if (selected.size === 0) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/api/scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domains: Array.from(selected) }),
      });
      if (!res.ok) throw new Error(`Scan failed (${res.status})`);
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Scan failed. WHOIS/SSL lookups may have timed out.');
    } finally {
      setLoading(false);
    }
  }, [selected]);

  const toggleCard = (domain: string) => {
    setExpandedCards((prev) => {
      const next = new Set(prev);
      if (next.has(domain)) next.delete(domain);
      else next.add(domain);
      return next;
    });
  };

  const highRisk = results.filter((r) => r.risk_score >= 75).length;
  const mediumRisk = results.filter((r) => r.risk_score >= 45 && r.risk_score < 75).length;

  return (
    <section id="scanner" className="bg-[#0a0e1a] py-20 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h2
            className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-4"
            style={{ letterSpacing: '-0.04em' }}
          >
            Threat <span className="font-playfair italic text-[#2ac9a0]">Scanner</span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base max-w-xl leading-relaxed">
            Select domains to scan for potential security risks. Our analysis checks domain age,
            registrar data, SSL certificates, and OSINT mentions to produce a unified risk score.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-8 flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-2xl px-5 py-4">
            <AlertCircle size={18} className="text-red-400 shrink-0" />
            <p className="text-sm text-red-400">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-400/60 hover:text-red-400 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Domain Selection */}
        <div className="bg-white/[0.03] border border-white/[0.06] rounded-3xl p-6 sm:p-8 mb-8">
          <h3 className="text-white text-lg font-medium mb-5">Select Domains</h3>

          {fetchingDomains ? (
            <div className="flex items-center gap-3 py-8 justify-center">
              <Loader2 size={20} className="text-white/40 animate-spin" />
              <span className="text-white/40 text-sm">Loading domains…</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
              {domains.map((domain) => (
                <button
                  key={domain}
                  onClick={() => toggleDomain(domain)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all border ${
                    selected.has(domain)
                      ? 'bg-[#2ac9a0]/10 border-[#2ac9a0]/30 text-[#2ac9a0]'
                      : 'bg-white/[0.02] border-white/[0.06] text-white/60 hover:bg-white/[0.05] hover:text-white/80'
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center transition-colors ${
                      selected.has(domain)
                        ? 'bg-[#2ac9a0] border-[#2ac9a0]'
                        : 'border-white/20'
                    }`}
                  >
                    {selected.has(domain) && (
                      <svg viewBox="0 0 12 12" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                  <Globe size={14} className="shrink-0 opacity-60" />
                  <span className="truncate">{domain}</span>
                </button>
              ))}
            </div>
          )}

          {/* Add custom domain */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={customDomain}
                onChange={(e) => setCustomDomain(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addCustomDomain()}
                placeholder="Add a custom domain…"
                className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 focus:outline-none focus:border-[#2ac9a0]/40 focus:ring-1 focus:ring-[#2ac9a0]/20 transition-colors"
              />
            </div>
            <button
              onClick={addCustomDomain}
              className="bg-white/[0.06] hover:bg-white/[0.1] border border-white/[0.08] text-white/70 hover:text-white px-4 rounded-xl transition-all"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Scan Button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleScan}
              disabled={selected.size === 0 || loading}
              className="bg-[#2ac9a0] hover:bg-[#22b18c] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium px-8 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#2ac9a0]/30 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Search size={16} />
              )}
              {loading ? 'Scanning…' : `Scan ${selected.size} Domain${selected.size !== 1 ? 's' : ''}`}
            </button>
            {selected.size > 0 && (
              <button
                onClick={() => setSelected(new Set())}
                className="text-white/40 hover:text-white/70 text-sm transition-colors"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Summary Bar */}
        {results.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-5">
              <p className="text-white/40 text-xs uppercase tracking-wider mb-1">Total Scanned</p>
              <p className="text-white text-2xl font-semibold">{results.length}</p>
            </div>
            <div className="bg-red-500/[0.06] border border-red-500/[0.12] rounded-2xl p-5">
              <p className="text-red-400/60 text-xs uppercase tracking-wider mb-1">High Risk</p>
              <p className="text-red-400 text-2xl font-semibold">{highRisk}</p>
            </div>
            <div className="bg-amber-500/[0.06] border border-amber-500/[0.12] rounded-2xl p-5">
              <p className="text-amber-400/60 text-xs uppercase tracking-wider mb-1">Medium Risk</p>
              <p className="text-amber-400 text-2xl font-semibold">{mediumRisk}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-4">
            {results.map((result) => {
              const risk = getRiskColor(result.risk_score);
              const RiskIcon = getRiskIcon(result.risk_score);
              const expanded = expandedCards.has(result.domain);

              return (
                <div
                  key={result.domain}
                  className={`${risk.bg} border ${risk.border} rounded-2xl overflow-hidden transition-all`}
                >
                  {/* Card Header */}
                  <button
                    onClick={() => toggleCard(result.domain)}
                    className="w-full flex items-center justify-between p-5 sm:p-6 text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl ${risk.badge} flex items-center justify-center`}>
                        <RiskIcon size={20} />
                      </div>
                      <div>
                        <p className="text-white font-medium">{result.domain}</p>
                        <p className={`text-xs ${risk.text} mt-0.5`}>{result.classification}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right hidden sm:block">
                        <p className={`text-2xl font-bold ${risk.text}`}>{result.risk_score}</p>
                        <p className="text-white/30 text-xs">{getRiskLabel(result.risk_score)}</p>
                      </div>
                      <div className={`sm:hidden px-3 py-1 rounded-full text-xs font-medium ${risk.badge}`}>
                        {result.risk_score}
                      </div>
                      {expanded ? (
                        <ChevronUp size={18} className="text-white/30" />
                      ) : (
                        <ChevronDown size={18} className="text-white/30" />
                      )}
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {expanded && (
                    <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                          <Calendar size={14} />
                          <span className="text-xs uppercase tracking-wider">Domain Age</span>
                        </div>
                        <p className="text-white font-medium">
                          {result.domain_age_days} day{result.domain_age_days !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                          <Server size={14} />
                          <span className="text-xs uppercase tracking-wider">Registrar</span>
                        </div>
                        <p className="text-white font-medium truncate">{result.registrar}</p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                          <Lock size={14} />
                          <span className="text-xs uppercase tracking-wider">SSL</span>
                        </div>
                        <p className={`font-medium ${result.ssl_valid ? 'text-emerald-400' : 'text-red-400'}`}>
                          {result.ssl_valid ? 'Valid' : 'Invalid'}
                        </p>
                      </div>
                      <div className="bg-black/20 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-white/40 mb-2">
                          <Eye size={14} />
                          <span className="text-xs uppercase tracking-wider">OSINT Mentions</span>
                        </div>
                        <p className="text-white font-medium">{result.osint_mentions}</p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default DomainScanner;
