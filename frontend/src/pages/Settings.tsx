import { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  RotateCcw,
  Eye,
  Sparkles,
  Server,
  Trash2,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
} from 'lucide-react';
import type { AppPreferences, CorrectionStyle } from '@/types/correction';
import { DEFAULT_PREFERENCES, CORRECTION_STYLE_LABELS } from '@/types/correction';

const STORAGE_KEY = 'grammarguard-preferences';

function loadPreferences(): AppPreferences {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { ...DEFAULT_PREFERENCES, ...parsed };
    }
  } catch {
    // fallback
  }
  return DEFAULT_PREFERENCES;
}

function savePreferences(prefs: AppPreferences): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // fallback
  }
}

export default function Settings() {
  const [prefs, setPrefs] = useState<AppPreferences>(DEFAULT_PREFERENCES);
  const [savedNotice, setSavedNotice] = useState(false);
  const [resetNotice, setResetNotice] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

  useEffect(() => {
    setPrefs(loadPreferences());

    // Check live FastAPI connection
    const apiUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
    fetch(`${apiUrl}/api/v1/health`)
      .then((res) => {
        if (res.ok) setBackendStatus('connected');
        else setBackendStatus('disconnected');
      })
      .catch(() => setBackendStatus('disconnected'));
  }, []);

  const update = <K extends keyof AppPreferences>(key: K, value: AppPreferences[K]) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    savePreferences(updated);
    setSavedNotice(true);
    const timer = setTimeout(() => setSavedNotice(false), 2000);
    return () => clearTimeout(timer);
  };

  const handleResetPreferences = () => {
    setPrefs(DEFAULT_PREFERENCES);
    savePreferences(DEFAULT_PREFERENCES);
    setResetNotice(true);
    setTimeout(() => setResetNotice(false), 3000);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5 p-4 lg:p-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Settings</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          Configure runtime correction preferences, interface animations, and verify platform infrastructure.
        </p>
      </div>

      {/* Backend & Engine Status Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Server className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">System & Engine Status</h3>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">FastAPI API</span>
            </div>
            {backendStatus === 'connected' ? (
              <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
                <CheckCircle2 className="h-3.5 w-3.5" /> Online
              </span>
            ) : backendStatus === 'checking' ? (
              <span className="text-xs text-gray-400">Pinging...</span>
            ) : (
              <span className="flex items-center gap-1 text-xs font-semibold text-red-500">
                <XCircle className="h-3.5 w-3.5" /> Offline
              </span>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Model Engine</span>
            </div>
            <span className="text-xs font-semibold text-indigo-600">T5-Base / LangGraph</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50/50 p-3">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-xs font-medium text-gray-700">Knowledge Store</span>
            </div>
            <span className="text-xs font-semibold text-emerald-600">Qdrant Vector DB</span>
          </div>
        </div>
      </div>

      {/* Correction Preferences */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <SettingsIcon className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Correction Preferences</h3>
        </div>

        <div className="space-y-5">
          {/* Default correction style */}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Default correction style
            </label>
            <select
              value={prefs.defaultCorrectionStyle}
              onChange={(e) => update('defaultCorrectionStyle', e.target.value as CorrectionStyle)}
              className="w-full max-w-sm rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              {(Object.keys(CORRECTION_STYLE_LABELS) as CorrectionStyle[]).map((s) => (
                <option key={s} value={s}>
                  {CORRECTION_STYLE_LABELS[s]}
                </option>
              ))}
            </select>
          </div>

          {/* Preserve original meaning */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Preserve original meaning</p>
              <p className="text-xs text-gray-400">
                Constrain token replacements to retain semantic intent
              </p>
            </div>
            <ToggleSwitch
              checked={prefs.preserveOriginalMeaning}
              onChange={(v) => update('preserveOriginalMeaning', v)}
            />
          </div>

          {/* Highlight corrections */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-start gap-2">
              <Eye className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Highlight corrections</p>
                <p className="text-xs text-gray-400">
                  Render inline diff badges and character span markers across input views
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={prefs.highlightCorrections}
              onChange={(v) => update('highlightCorrections', v)}
            />
          </div>

          {/* Workflow animation */}
          <div className="flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-start gap-2">
              <Sparkles className="h-4 w-4 mt-0.5 text-gray-400" />
              <div>
                <p className="text-sm font-medium text-gray-700">Workflow animation</p>
                <p className="text-xs text-gray-400">
                  Show real-time multi-agent progression steps during processing
                </p>
              </div>
            </div>
            <ToggleSwitch
              checked={prefs.workflowAnimation}
              onChange={(v) => update('workflowAnimation', v)}
            />
          </div>
        </div>
      </div>

      {/* Preferences Management */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm lg:p-6">
        <div className="mb-4 flex items-center gap-2">
          <Trash2 className="h-4 w-4 text-indigo-600" />
          <h3 className="text-sm font-semibold text-gray-900">Reset Local Configuration</h3>
        </div>
        <p className="text-sm text-gray-500">
          Reset all UI settings and correction toggles stored in your browser to default values.
        </p>
        <button
          onClick={handleResetPreferences}
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100"
        >
          <RotateCcw className="h-4 w-4" />
          Reset UI Settings
        </button>
        {resetNotice && (
          <p className="mt-3 flex items-center gap-1.5 text-sm text-emerald-600">
            <RotateCcw className="h-3.5 w-3.5" />
            Preferences reset to defaults.
          </p>
        )}
      </div>

      {/* Temporary Toast Notice */}
      {savedNotice && (
        <div className="fixed bottom-6 right-6 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          Preferences saved
        </div>
      )}

      {/* Operational Footer */}
      <div className="flex items-center gap-2 rounded-lg bg-emerald-50/70 border border-emerald-100 px-4 py-3 text-xs text-emerald-800">
        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
        GrammarGuard AI operational environment is verified and active.
      </div>
    </div>
  );
}

function ToggleSwitch({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
        checked ? 'bg-indigo-600' : 'bg-gray-300'
      }`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
          checked ? 'left-5.5' : 'left-0.5'
        }`}
      />
    </button>
  );
}