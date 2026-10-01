import React, { useEffect, useState } from 'react';
import { apiClient } from '../api/client';
import { SystemSetting } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Settings, Save, CheckCircle2 } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSetting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get('/settings');
        if (res.data.success) {
          setSettings(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
  };

  const handleSave = async (key: string, value: string) => {
    setIsSaving(true);
    try {
      const res = await apiClient.put(`/settings/${key}`, { value });
      if (res.data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 2000);
      }
    } catch (err) {
      console.error('Save setting error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center text-neutral-500 text-xs font-semibold">
        Loading system configuration settings...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-neutral-900 tracking-tight flex items-center gap-2">
          <Settings className="w-6 h-6 text-amber-500" />
          Global System Settings
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Configure default hourly training tariffs, token expiry durations, and corporate parameters
        </p>
      </div>

      {savedSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-bold">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          System setting updated successfully!
        </div>
      )}

      <Card className="divide-y divide-neutral-100 p-0 overflow-hidden">
        {settings.map((setting) => (
          <div key={setting.key} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1 max-w-md">
              <span className="font-mono text-xs font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                {setting.key}
              </span>
              <p className="text-xs text-neutral-500">{setting.description}</p>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="text"
                value={setting.value}
                onChange={(e) => handleChange(setting.key, e.target.value)}
                className="bg-white border border-neutral-300 rounded-xl px-3.5 py-2 text-xs text-neutral-900 font-mono focus:outline-none focus:border-amber-500 w-48 font-semibold"
              />
              <Button
                variant="primary"
                size="sm"
                isLoading={isSaving}
                onClick={() => handleSave(setting.key, setting.value)}
                leftIcon={<Save className="w-3.5 h-3.5" />}
              >
                Save
              </Button>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
};
