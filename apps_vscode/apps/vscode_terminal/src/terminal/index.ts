/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * VS Code Terminal Module - Extracted Functionality
 * 
 * This module contains the core terminal functionality extracted from the VS Code terminal module
 * and reimplemented as a standalone library for use in the vscode_terminal application.
 * 
 * Key Components:
 * - Types and interfaces for terminal configuration and management
 * - Terminal command definitions and categorization
 * - Configuration service for managing terminal settings
 * - Event system for terminal communication
 * - Terminal service for creating and managing terminal instances
 */

// Export types and interfaces (excluding Event to avoid conflict)
export * from './types';

// Export terminal commands
export * from './commands';

// Export configuration service
export { TerminalConfigurationService } from './configuration';

// Export event system with specific exports to avoid conflicts
export type { IDisposable } from './events';
export { 
  DisposableStore, 
  Emitter, 
  bufferEvent,
  Event as EventNamespace 
} from './events';

// Export terminal service and instances
export * from './terminalService';

// Re-export commonly used types for convenience
export type {
    ITerminalConfiguration,
    ITerminalFont,
    ITerminalProfiles,
    ITerminalDimensions,
    IShellLaunchConfig,
    ITerminalEnvironment,
    IProcessDataEvent,
    ITerminalChildProcess,
    IEvent,
    FontWeight,
    ConfirmOnKill,
    ConfirmOnExit
} from './types';

export {
    OperatingSystem,
    TerminalLocation,
    ProcessState,
    TerminalConnectionState,
    TERMINAL_VIEW_ID,
    TERMINAL_CONFIG_SECTION,
    DEFAULT_LETTER_SPACING,
    DEFAULT_LINE_HEIGHT,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_BOLD_FONT_WEIGHT
} from './types';

export {
    TerminalCommandId,
    TERMINAL_CREATION_COMMANDS,
    DEFAULT_COMMANDS_TO_SKIP_SHELL,
    QUICK_LAUNCH_PROFILE_CHOICE,
    TerminalCommandGroups
} from './commands';

/**
 * Terminal module version
 */
export const TERMINAL_MODULE_VERSION = '1.0.0';

/**
 * Create a default terminal service instance with configuration
 */
export function createTerminalService(): {
    configurationService: import('./configuration').TerminalConfigurationService;
    terminalService: import('./terminalService').TerminalService;
} {
    const { TerminalConfigurationService } = require('./configuration');
    const configurationService = new TerminalConfigurationService();
    const { TerminalService } = require('./terminalService');
    const terminalService = new TerminalService(configurationService);
    
    return {
        configurationService,
        terminalService
    };
}

/**
 * Terminal module utilities
 */
export const TerminalUtils = {
    /**
     * Check if a command should skip shell processing
     */
    shouldSkipShell(commandId: string): boolean {
        const { DEFAULT_COMMANDS_TO_SKIP_SHELL } = require('./commands');
        return DEFAULT_COMMANDS_TO_SKIP_SHELL.includes(commandId);
    },

    /**
     * Get command group for a terminal command
     */
    getCommandGroup(commandId: string): string | undefined {
        const { TerminalCommandGroups } = require('./commands');
        for (const [groupName, commands] of Object.entries(TerminalCommandGroups)) {
            if ((commands as string[]).includes(commandId)) {
                return groupName;
            }
        }
        return undefined;
    },

    /**
     * Check if a command is a terminal creation command
     */
    isCreationCommand(commandId: string): boolean {
        const { TERMINAL_CREATION_COMMANDS } = require('./commands');
        return TERMINAL_CREATION_COMMANDS.includes(commandId);
    },

    /**
     * Parse terminal command arguments from a command string
     */
    parseCommandArgs(command: string): { executable: string; args: string[] } {
        const parts = command.trim().split(/\s+/);
        const executable = parts[0] || '';
        const args = parts.slice(1);
        return { executable, args };
    },

    /**
     * Format dimensions for display
     */
    formatDimensions(dimensions: import('./types').ITerminalDimensions): string {
        return `${dimensions.cols}×${dimensions.rows}`;
    }
};

/**
 * Default terminal configuration factory
 */
export function createDefaultTerminalConfiguration(): Partial<import('./types').ITerminalConfiguration> {
    const { TerminalConfigurationService } = require('./configuration');
    return new TerminalConfigurationService().getFullConfiguration();
}