'use client';

import { useState, useEffect } from 'react';
import TerminalDemo from './components/TerminalDemo';

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="font-sans min-h-screen p-8 flex items-center justify-center">
        <div className="text-lg">Loading VS Code Terminal Module...</div>
      </div>
    );
  }

  return (
    <div className="font-sans min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold mb-4">VS Code Terminal Module</h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Extracted and reimplemented terminal functionality from VS Code
        </p>
      </header>

      <main className="space-y-8">
        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Terminal Functionality Demo</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            This demonstrates the extracted terminal module functionality including:
          </p>
          <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 mb-6 space-y-1">
            <li>Terminal configuration management</li>
            <li>Terminal instance creation and management</li>
            <li>Command processing and categorization</li>
            <li>Event system for terminal communication</li>
            <li>Cross-platform shell detection</li>
          </ul>
          
          <TerminalDemo />
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Module Structure</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h3 className="font-semibold mb-2">Core Files</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li><code>types.ts</code> - Core terminal interfaces and types</li>
                <li><code>commands.ts</code> - Terminal command definitions</li>
                <li><code>configuration.ts</code> - Configuration service</li>
                <li><code>events.ts</code> - Event system</li>
                <li><code>terminalService.ts</code> - Terminal management</li>
              </ul>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 rounded p-4">
              <h3 className="font-semibold mb-2">Key Features</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>✅ Platform-specific shell detection</li>
                <li>✅ Terminal profile management</li>
                <li>✅ Command categorization</li>
                <li>✅ Event-driven architecture</li>
                <li>✅ Configurable terminal settings</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Source</h2>
          <p className="text-gray-600 dark:text-gray-400">
            This functionality was extracted from the VS Code terminal module located at:
          </p>
          <code className="block bg-gray-50 dark:bg-gray-700 rounded p-3 mt-2 text-sm">
            src/vs/workbench/contrib/terminal/
          </code>
          <p className="text-sm text-gray-500 mt-2">
            Original module contains ~27,000 lines of code across multiple files including
            terminal instances, services, and UI components.
          </p>
        </section>
      </main>
    </div>
  );
}
