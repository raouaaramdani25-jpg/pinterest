'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, Globe, ShoppingBag, ShieldCheck, CheckCircle2, 
  AlertCircle, RefreshCw, Save, Key, Lock, ExternalLink 
} from 'lucide-react';

export default function SettingsPage() {
  const [wpSiteUrl, setWpSiteUrl] = useState('https://cozyspace.company');
  const [wpUsername, setWpUsername] = useState('CozySpaceApp');
  const [wpAppPassword, setWpAppPassword] = useState('WfSP R4rl v3Aq DDaD jksn Iy2l');
  const [amazonTag, setAmazonTag] = useState('cozyplace04-20');

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.settings) {
          if (data.settings.wpSiteUrl) setWpSiteUrl(data.settings.wpSiteUrl);
          if (data.settings.wpUsername) setWpUsername(data.settings.wpUsername);
          if (data.settings.wpAppPassword) setWpAppPassword(data.settings.wpAppPassword);
          if (data.settings.amazonTag) setAmazonTag(data.settings.amazonTag);
        }
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wpSiteUrl,
          wpUsername,
          wpAppPassword,
          amazonTag,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/wordpress/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteUrl: wpSiteUrl,
          username: wpUsername,
          appPassword: wpAppPassword,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: data.message || 'Connection successful!',
        });
      } else {
        setTestResult({
          success: false,
          message: data.error || 'Failed to authenticate with WordPress.',
        });
      }
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Network error occurred.',
      });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#2f1f1a] flex items-center gap-2">
          <Settings className="w-7 h-7 text-[#9b7053]" />
          Platform Settings & Compliance
        </h1>
        <p className="text-xs sm:text-sm text-[#7c5742]">
          Manage your WordPress credentials, Amazon Associate Tag, and compliance protocols.
        </p>
      </div>

      {/* Main Settings Card */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e8dbca] shadow-sm space-y-6">
        <h2 className="text-base font-bold font-serif text-[#2f1f1a] flex items-center gap-2 border-b border-[#f4ede2] pb-3">
          <Globe className="w-5 h-5 text-[#9b7053]" />
          WordPress REST API Configuration (cozyspace.company)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#7c5742]">WordPress Site URL</label>
            <input
              type="text"
              value={wpSiteUrl}
              onChange={(e) => setWpSiteUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-mono text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[#7c5742]">WordPress Username</label>
            <input
              type="text"
              value={wpUsername}
              onChange={(e) => setWpUsername(e.target.value)}
              placeholder="e.g. CozySpaceApp or admin username"
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <label className="text-xs font-bold text-[#7c5742] flex items-center justify-between">
              <span>WordPress Application Password</span>
              <span className="text-[10px] text-[#9b7053] font-normal">
                Generated from WP Admin → Users → Profile
              </span>
            </label>
            <input
              type="text"
              value={wpAppPassword}
              onChange={(e) => setWpAppPassword(e.target.value)}
              placeholder="e.g. WfSP R4rl v3Aq DDaD jksn Iy2l"
              className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-mono text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
            />
          </div>
        </div>

        {/* Test Connection Button */}
        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            onClick={handleTestConnection}
            disabled={testing}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#f4ede2] hover:bg-[#e8dbca] text-[#2f1f1a] text-xs font-bold transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Testing Connection...' : 'Test WordPress REST API'}
          </button>

          {testResult && (
            <div
              className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 ${
                testResult.success
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}
            >
              {testResult.success ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-red-600 flex-shrink-0" />
              )}
              <span>{testResult.message}</span>
            </div>
          )}
        </div>

        <h2 className="text-base font-bold font-serif text-[#2f1f1a] flex items-center gap-2 border-b border-[#f4ede2] pb-3 pt-4">
          <ShoppingBag className="w-5 h-5 text-amber-600" />
          Amazon Associates Settings
        </h2>

        <div className="space-y-1">
          <label className="text-xs font-bold text-[#7c5742]">Amazon Associate Store ID / Tag</label>
          <input
            type="text"
            value={amazonTag}
            onChange={(e) => setAmazonTag(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#faf7f2] border border-[#d7c1a8] rounded-xl text-xs font-mono font-bold text-[#2f1f1a] focus:outline-none focus:ring-2 focus:ring-[#9b7053]"
          />
          <p className="text-[11px] text-[#7c5742]">
            This tag is automatically appended to all Amazon search links and direct product buttons across your articles.
          </p>
        </div>

        {/* Save button */}
        <div className="pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#b28867] hover:bg-[#9b7053] text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving...' : saveSuccess ? 'Saved Successfully!' : 'Save All Settings'}
          </button>
        </div>
      </div>

      {/* Compliance & Policy Checklist */}
      <div className="bg-[#f4ede2] p-6 rounded-2xl border border-[#d7c1a8] space-y-4">
        <h3 className="text-sm font-bold text-[#553c30] uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          CozySpace Safe Growth Checklist
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-[#553c30]">
          <div className="p-3 rounded-xl bg-white/70 border border-[#e8dbca] space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              FTC Transparency Banner
            </div>
            <p className="text-[11px] leading-relaxed">
              Injected automatically at the top of every generated article before any affiliate links.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-[#e8dbca] space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              No Cloned Amazon Photos
            </div>
            <p className="text-[11px] leading-relaxed">
              We generate fresh 100% original AI scenes or use licensed stock so your account is never banned for image scraping.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-[#e8dbca] space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              rel="nofollow sponsored"
            </div>
            <p className="text-[11px] leading-relaxed">
              All external affiliate links have proper Google SEO tags and open in safe new tabs.
            </p>
          </div>

          <div className="p-3 rounded-xl bg-white/70 border border-[#e8dbca] space-y-1">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Astra Theme Gutenberg Styling
            </div>
            <p className="text-[11px] leading-relaxed">
              Native blocks match Astra’s typography and responsive mobile container widths automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
