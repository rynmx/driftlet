'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface UserSettings {
  name: string | null;
  bio: string | null;
  extended_bio: string | null;
  profile_picture_url: string | null;
  header_text: string | null;
  header_icon_link: string | null;
  connections: Record<string, string>;
  show_attribution: boolean;
}

const SettingsPage = () => {
  const router = useRouter();
  const { status } = useSession({
    required: true,
    onUnauthenticated() {
      router.push('/login');
    },
  });

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [connectionsStr, setConnectionsStr] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    document.title = 'settings';
  }, []);

  useEffect(() => {
    const fetchSettings = async () => {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
        setConnectionsStr(JSON.stringify(data.connections || {}, null, 2));
      } else {
        setError('failed to fetch settings.');
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    setSuccessMessage('');

    let parsedConnections;
    try {
      parsedConnections = JSON.parse(connectionsStr);
    } catch {
      setError('connections field contains invalid json.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...settings, connections: parsedConnections }),
      });

      if (response.ok) {
        setSuccessMessage('settings updated successfully!');
      } else {
        const data = await response.json();
        setError(data.error || 'an unknown error occurred.');
      }
    } catch (err) {
      console.error('update failed:', err);
      setError('failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!settings) return;
    const { name, checked } = e.target;
    setSettings({ ...settings, [name]: checked });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!settings) return;
    const { name, value } = e.target;
    setSettings({ ...settings, [name]: value });
  };

  if (status === 'loading' || !settings) {
    return <main className="flex min-h-screen flex-col items-center justify-center"><p>loading...</p></main>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8 sm:p-24">
      <div className="w-full max-w-2xl">
        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left text-black dark:text-white">settings</h1>
        <form onSubmit={handleUpdate} className="flex flex-col gap-8">
          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">profile</legend>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">name</label>
              <input id="name" type="text" name="name" value={settings.name || ''} onChange={handleInputChange} placeholder="your name" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full" />
            </div>
            <div>
              <label htmlFor="profile_picture_url" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">profile picture url</label>
              <input id="profile_picture_url" type="text" name="profile_picture_url" value={settings.profile_picture_url || ''} onChange={handleInputChange} placeholder="profile picture url" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full" />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">bio</label>
              <textarea id="bio" name="bio" value={settings.bio || ''} onChange={handleInputChange} placeholder="short bio (one-liner)" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full" />
            </div>
            <div>
              <label htmlFor="extended_bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">extended bio</label>
              <textarea id="extended_bio" name="extended_bio" value={settings.extended_bio || ''} onChange={handleInputChange} placeholder="extended bio (markdown supported)" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[200px] w-full" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">connections (json)</label>
              <textarea value={connectionsStr} onChange={(e) => setConnectionsStr(e.target.value)} placeholder='{
  "github": "https://github.com/username",
  "twitter": "https://twitter.com/username"
}' className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[150px] w-full font-mono text-sm" />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">site</legend>
            <div>
              <label htmlFor="header_text" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">header text</label>
              <input id="header_text" type="text" name="header_text" value={settings.header_text || ''} onChange={handleInputChange} placeholder="header text (replaces 'driftlet')" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full" />
            </div>
            <div>
              <label htmlFor="header_icon_link" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">header icon url</label>
              <input id="header_icon_link" type="text" name="header_icon_link" value={settings.header_icon_link || ''} onChange={handleInputChange} placeholder="header icon url" className="p-2 bg-transparent border border-black dark:border-gray-700 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white w-full" />
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-4 border border-black dark:border-gray-700 p-4">
            <legend className="text-lg font-semibold px-2 text-black dark:text-white">meta</legend>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="show_attribution"
                name="show_attribution"
                checked={settings.show_attribution}
                onChange={handleCheckboxChange}
                className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="show_attribution" className="text-sm text-black dark:text-white">show footer attribution</label>
            </div>
          </fieldset>

          <button type="submit" disabled={isSubmitting} className="p-2 font-bold bg-black text-white dark:bg-white dark:text-black hover:opacity-80 transition-opacity disabled:opacity-50">
            {isSubmitting ? 'saving...' : 'save settings'}
          </button>
          {error && <p className="text-sm text-center text-red-500 mt-4">{error}</p>}
          {successMessage && <p className="text-sm text-center text-green-500 mt-4">{successMessage}</p>}
        </form>
      </div>
    </main>
  );
};

export default SettingsPage;
