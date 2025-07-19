/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { 
    IShellLaunchConfig, 
    ITerminalDimensions, 
    ProcessState, 
    TerminalConnectionState,
    TerminalLocation,
    IProcessDataEvent,
    ITerminalChildProcess,
    IEvent
} from './types';
import { TerminalConfigurationService } from './configuration';
import { Emitter, Event, IDisposable, DisposableStore } from './events';

/**
 * Terminal instance interface - represents a single terminal
 */
export interface ITerminalInstance extends IDisposable {
    readonly id: number;
    readonly title: string;
    readonly processState: ProcessState;
    readonly shellLaunchConfig: IShellLaunchConfig;
    readonly dimensions: ITerminalDimensions | undefined;

    readonly onDidChangeTitle: IEvent<string>;
    readonly onDidChangeDimensions: IEvent<ITerminalDimensions>;
    readonly onDidProcessData: IEvent<IProcessDataEvent>;
    readonly onDidExit: IEvent<number | undefined>;

    focus(): void;
    sendText(text: string, shouldExecute?: boolean): void;
    setDimensions(dimensions: ITerminalDimensions): void;
    kill(): void;
    revive(): void;
}

/**
 * Basic terminal instance implementation
 */
export class TerminalInstance implements ITerminalInstance {
    private static _nextId = 1;
    
    readonly id: number;
    private _title: string;
    private _processState: ProcessState = ProcessState.Uninitialized;
    private _dimensions: ITerminalDimensions | undefined;
    private _process: ITerminalChildProcess | undefined;
    
    private readonly _onDidChangeTitle = new Emitter<string>();
    readonly onDidChangeTitle = this._onDidChangeTitle.event;
    
    private readonly _onDidChangeDimensions = new Emitter<ITerminalDimensions>();
    readonly onDidChangeDimensions = this._onDidChangeDimensions.event;
    
    private readonly _onDidProcessData = new Emitter<IProcessDataEvent>();
    readonly onDidProcessData = this._onDidProcessData.event;
    
    private readonly _onDidExit = new Emitter<number | undefined>();
    readonly onDidExit = this._onDidExit.event;

    private readonly _disposables = new DisposableStore();

    constructor(
        public readonly shellLaunchConfig: IShellLaunchConfig,
        dimensions?: ITerminalDimensions
    ) {
        this.id = TerminalInstance._nextId++;
        this._title = shellLaunchConfig.name || `Terminal ${this.id}`;
        this._dimensions = dimensions;
        
        this.initialize();
    }

    get title(): string {
        return this._title;
    }

    get processState(): ProcessState {
        return this._processState;
    }

    get dimensions(): ITerminalDimensions | undefined {
        return this._dimensions;
    }

    private async initialize(): Promise<void> {
        this._processState = ProcessState.Launching;
        
        try {
            // Create a mock process for demonstration
            this._process = this.createMockProcess();
            
            // Set up process event handlers
            this._disposables.add(this._process.onProcessData(data => {
                const event: IProcessDataEvent = typeof data === 'string' 
                    ? { data, sync: false } 
                    : data;
                this._onDidProcessData.fire(event);
            }));

            this._disposables.add(this._process.onProcessExit(exitCode => {
                this._processState = ProcessState.KilledByProcess;
                this._onDidExit.fire(exitCode);
            }));

            this._processState = ProcessState.Running;
        } catch (error) {
            this._processState = ProcessState.KilledDuringLaunch;
            console.error('Failed to initialize terminal process:', error);
        }
    }

    private createMockProcess(): ITerminalChildProcess {
        const onDataEmitter = new Emitter<IProcessDataEvent | string>();
        const onExitEmitter = new Emitter<number | undefined>();

        return {
            id: this.id,
            shouldPersist: false,
            onProcessData: onDataEmitter.event,
            onProcessExit: onExitEmitter.event
        };
    }

    focus(): void {
        // In a real implementation, this would focus the terminal UI element
        console.log(`Focusing terminal ${this.id}`);
    }

    sendText(text: string, shouldExecute: boolean = false): void {
        if (this._processState !== ProcessState.Running) {
            console.warn('Cannot send text to terminal that is not running');
            return;
        }

        const finalText = shouldExecute ? text + '\r' : text;
        
        // In a real implementation, this would send to the actual process
        console.log(`Sending text to terminal ${this.id}:`, finalText);
        
        // Echo the text back for demonstration
        this._onDidProcessData.fire({ data: finalText, sync: false });
    }

    setDimensions(dimensions: ITerminalDimensions): void {
        if (this._dimensions?.cols === dimensions.cols && 
            this._dimensions?.rows === dimensions.rows) {
            return;
        }

        this._dimensions = dimensions;
        this._onDidChangeDimensions.fire(dimensions);
        
        // In a real implementation, this would resize the actual process
        console.log(`Resizing terminal ${this.id} to ${dimensions.cols}x${dimensions.rows}`);
    }

    setTitle(title: string): void {
        if (this._title === title) {
            return;
        }

        this._title = title;
        this._onDidChangeTitle.fire(title);
    }

    kill(): void {
        if (this._processState === ProcessState.KilledByUser || 
            this._processState === ProcessState.KilledByProcess) {
            return;
        }

        this._processState = ProcessState.KilledByUser;
        console.log(`Killing terminal ${this.id}`);
        
        // Simulate process exit
        setTimeout(() => {
            this._onDidExit.fire(0);
        }, 100);
    }

    revive(): void {
        if (this._processState === ProcessState.Running) {
            return;
        }

        console.log(`Reviving terminal ${this.id}`);
        this.initialize();
    }

    dispose(): void {
        this.kill();
        this._disposables.dispose();
        this._onDidChangeTitle.dispose();
        this._onDidChangeDimensions.dispose();
        this._onDidProcessData.dispose();
        this._onDidExit.dispose();
    }
}

/**
 * Terminal service interface
 */
export interface ITerminalService {
    readonly connectionState: TerminalConnectionState;
    readonly instances: ReadonlyArray<ITerminalInstance>;
    
    readonly onDidCreateInstance: IEvent<ITerminalInstance>;
    readonly onDidDisposeInstance: IEvent<ITerminalInstance>;
    readonly onDidChangeActiveInstance: IEvent<ITerminalInstance | undefined>;

    createTerminal(launchConfig?: IShellLaunchConfig, location?: TerminalLocation): ITerminalInstance;
    getActiveInstance(): ITerminalInstance | undefined;
    setActiveInstance(instance: ITerminalInstance): void;
    killActiveInstance(): void;
    killAllInstances(): void;
}

/**
 * Terminal service implementation
 */
export class TerminalService implements ITerminalService, IDisposable {
    private _connectionState: TerminalConnectionState = TerminalConnectionState.Connected;
    private _instances: ITerminalInstance[] = [];
    private _activeInstance: ITerminalInstance | undefined;

    private readonly _onDidCreateInstance = new Emitter<ITerminalInstance>();
    readonly onDidCreateInstance = this._onDidCreateInstance.event;

    private readonly _onDidDisposeInstance = new Emitter<ITerminalInstance>();
    readonly onDidDisposeInstance = this._onDidDisposeInstance.event;

    private readonly _onDidChangeActiveInstance = new Emitter<ITerminalInstance | undefined>();
    readonly onDidChangeActiveInstance = this._onDidChangeActiveInstance.event;

    private readonly _disposables = new DisposableStore();

    constructor(
        private readonly configurationService: TerminalConfigurationService
    ) {}

    get connectionState(): TerminalConnectionState {
        return this._connectionState;
    }

    get instances(): ReadonlyArray<ITerminalInstance> {
        return [...this._instances];
    }

    createTerminal(launchConfig?: IShellLaunchConfig, location?: TerminalLocation): ITerminalInstance {
        const shell = this.configurationService.getCurrentShell();
        const shellArgs = this.configurationService.getCurrentShellArgs();
        const env = this.configurationService.getCurrentEnv();

        const finalLaunchConfig: IShellLaunchConfig = {
            executable: shell || undefined,
            args: shellArgs,
            env,
            ...launchConfig
        };

        const instance = new TerminalInstance(finalLaunchConfig);
        
        this._instances.push(instance);
        this.setActiveInstance(instance);

        // Listen for instance disposal
        this._disposables.add(instance.onDidExit(() => {
            this.removeInstance(instance);
        }));

        this._onDidCreateInstance.fire(instance);
        
        console.log(`Created terminal ${instance.id} at location ${location || 'default'}`);
        return instance;
    }

    getActiveInstance(): ITerminalInstance | undefined {
        return this._activeInstance;
    }

    setActiveInstance(instance: ITerminalInstance): void {
        if (this._activeInstance === instance) {
            return;
        }

        this._activeInstance = instance;
        this._onDidChangeActiveInstance.fire(instance);
    }

    killActiveInstance(): void {
        if (this._activeInstance) {
            this._activeInstance.kill();
        }
    }

    killAllInstances(): void {
        for (const instance of this._instances) {
            instance.kill();
        }
    }

    private removeInstance(instance: ITerminalInstance): void {
        const index = this._instances.indexOf(instance);
        if (index === -1) {
            return;
        }

        this._instances.splice(index, 1);
        
        if (this._activeInstance === instance) {
            this._activeInstance = this._instances.length > 0 ? this._instances[0] : undefined;
            this._onDidChangeActiveInstance.fire(this._activeInstance);
        }

        this._onDidDisposeInstance.fire(instance);
        instance.dispose();
    }

    dispose(): void {
        this.killAllInstances();
        this._disposables.dispose();
        this._onDidCreateInstance.dispose();
        this._onDidDisposeInstance.dispose();
        this._onDidChangeActiveInstance.dispose();
    }
}