'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  createTerminalService,
  TerminalCommandId,
  TerminalUtils,
  ProcessState,
  OperatingSystem,
  type ITerminalInstance
} from '../../terminal';

export default function TerminalDemo() {
  const [terminalService, setTerminalService] = useState<any>(null);
  const [configService, setConfigService] = useState<any>(null);
  const [terminals, setTerminals] = useState<ITerminalInstance[]>([]);
  const [activeTerminal, setActiveTerminal] = useState<ITerminalInstance | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [platform, setPlatform] = useState<OperatingSystem>(OperatingSystem.Linux);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize terminal service
    const { terminalService: service, configurationService: config } = createTerminalService();
    setTerminalService(service);
    setConfigService(config);
    setPlatform(config.getCurrentOS());

    // Listen for terminal events
    const disposables = [
      service.onDidCreateInstance((instance: ITerminalInstance) => {
        setTerminals(prev => [...prev, instance]);
        setActiveTerminal(instance);
        
        // Listen to terminal data
        instance.onDidProcessData((data: any) => {
          setOutput(prev => [...prev, `[Terminal ${instance.id}]: ${data.data}`]);
        });

        instance.onDidExit((exitCode: number | undefined) => {
          setOutput(prev => [...prev, `[Terminal ${instance.id}]: Process exited with code ${exitCode ?? 'unknown'}`]);
        });

        instance.onDidChangeTitle((title: string) => {
          setOutput(prev => [...prev, `[Terminal ${instance.id}]: Title changed to "${title}"`]);
        });
      }),

      service.onDidDisposeInstance((instance: ITerminalInstance) => {
        setTerminals(prev => prev.filter(t => t.id !== instance.id));
        if (activeTerminal?.id === instance.id) {
          setActiveTerminal(null);
        }
      }),

      service.onDidChangeActiveInstance((instance: ITerminalInstance | undefined) => {
        setActiveTerminal(instance || null);
      })
    ];

    return () => {
      disposables.forEach(d => d.dispose());
      service.dispose();
    };
  }, []);

  useEffect(() => {
    // Auto-scroll output
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  const createNewTerminal = () => {
    if (!terminalService) return;
    
    const terminal = terminalService.createTerminal({
      name: `Terminal ${terminals.length + 1}`,
      executable: configService?.getCurrentShell() || '/bin/bash'
    });
    
    setOutput(prev => [...prev, `Created new terminal: ${terminal.title} (ID: ${terminal.id})`]);
  };

  const sendCommand = () => {
    if (!activeTerminal || !input.trim()) return;
    
    const command = input.trim();
    setOutput(prev => [...prev, `> ${command}`]);
    
    // Check if it's a special command
    if (TerminalUtils.shouldSkipShell(command)) {
      setOutput(prev => [...prev, `Command "${command}" will be handled by terminal UI`]);
    } else {
      activeTerminal.sendText(command, true);
    }
    
    setInput('');
  };

  const killActiveTerminal = () => {
    if (!activeTerminal) return;
    setOutput(prev => [...prev, `Killing terminal ${activeTerminal.id}`]);
    activeTerminal.kill();
  };

  const clearOutput = () => {
    setOutput([]);
  };

  const executeCommand = (commandId: string) => {
    const group = TerminalUtils.getCommandGroup(commandId);
    setOutput(prev => [...prev, `Executing command: ${commandId} (Group: ${group || 'unknown'})`]);
    
    switch (commandId) {
      case TerminalCommandId.New:
        createNewTerminal();
        break;
      case TerminalCommandId.Kill:
        killActiveTerminal();
        break;
      case TerminalCommandId.Clear:
        clearOutput();
        break;
      case TerminalCommandId.Focus:
        if (activeTerminal) {
          activeTerminal.focus();
          setOutput(prev => [...prev, `Focused terminal ${activeTerminal.id}`]);
        }
        break;
      default:
        setOutput(prev => [...prev, `Command ${commandId} not implemented in demo`]);
    }
  };

  return (
    <div className="space-y-4">
      {/* Configuration Info */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div>
            <strong>Platform:</strong> {OperatingSystem[platform]}
          </div>
          <div>
            <strong>Current Shell:</strong> {configService?.getCurrentShell() || 'Unknown'}
          </div>
          <div>
            <strong>Active Terminals:</strong> {terminals.length}
          </div>
        </div>
      </div>

      {/* Terminal Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={createNewTerminal}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          disabled={!terminalService}
        >
          New Terminal
        </button>
        
        <button
          onClick={() => executeCommand(TerminalCommandId.Kill)}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          disabled={!activeTerminal}
        >
          Kill Active
        </button>
        
        <button
          onClick={() => executeCommand(TerminalCommandId.Clear)}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Clear Output
        </button>

        <button
          onClick={() => executeCommand(TerminalCommandId.Focus)}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          disabled={!activeTerminal}
        >
          Focus Active
        </button>
      </div>

      {/* Terminal List */}
      {terminals.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
          <h3 className="font-semibold mb-2">Terminal Instances</h3>
          <div className="space-y-2">
            {terminals.map(terminal => (
              <div
                key={terminal.id}
                className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                  activeTerminal?.id === terminal.id
                    ? 'bg-blue-100 dark:bg-blue-900'
                    : 'bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500'
                }`}
                onClick={() => {
                  terminalService?.setActiveInstance(terminal);
                }}
              >
                <div>
                  <div className="font-medium">{terminal.title}</div>
                  <div className="text-sm text-gray-500">
                    ID: {terminal.id} | State: {ProcessState[terminal.processState]}
                  </div>
                </div>
                {activeTerminal?.id === terminal.id && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-1 rounded">
                    Active
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Command Input */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendCommand()}
          placeholder="Enter a command..."
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-black dark:text-white"
          disabled={!activeTerminal}
        />
        <button
          onClick={sendCommand}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
          disabled={!activeTerminal || !input.trim()}
        >
          Send
        </button>
      </div>

      {/* Output */}
      <div className="bg-black text-green-400 font-mono text-sm rounded-lg p-4 h-64 overflow-y-auto">
        <div ref={outputRef}>
          {output.length === 0 ? (
            <div className="text-gray-500">Terminal output will appear here...</div>
          ) : (
            output.map((line, index) => (
              <div key={index} className="whitespace-pre-wrap">
                {line}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Command Examples */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
        <h3 className="font-semibold mb-2">Command Examples</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div>
            <strong>Shell Commands:</strong>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><code>echo "Hello World"</code></li>
              <li><code>ls -la</code></li>
              <li><code>pwd</code></li>
            </ul>
          </div>
          <div>
            <strong>VS Code Commands:</strong>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400">
              <li><code>{TerminalCommandId.Clear}</code></li>
              <li><code>{TerminalCommandId.SelectAll}</code></li>
              <li><code>{TerminalCommandId.CopySelection}</code></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}