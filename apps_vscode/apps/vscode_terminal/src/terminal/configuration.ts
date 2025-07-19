/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import { 
    ITerminalConfiguration, 
    ITerminalFont,
    ITerminalProfiles,
    OperatingSystem,
    FontWeight,
    DEFAULT_LETTER_SPACING,
    DEFAULT_LINE_HEIGHT,
    DEFAULT_FONT_WEIGHT,
    DEFAULT_BOLD_FONT_WEIGHT,
    TERMINAL_CONFIG_SECTION
} from './types';

/**
 * Terminal configuration service that manages terminal settings
 * Extracted and simplified from VS Code's terminal configuration functionality
 */
export class TerminalConfigurationService {
    private _configuration: Partial<ITerminalConfiguration> = {};

    constructor() {
        this.initializeDefaultConfiguration();
    }

    /**
     * Initialize default configuration values
     */
    private initializeDefaultConfiguration(): void {
        this._configuration = {
            shell: {
                linux: this.getDefaultShell(OperatingSystem.Linux),
                osx: this.getDefaultShell(OperatingSystem.Macintosh),
                windows: this.getDefaultShell(OperatingSystem.Windows)
            },
            shellArgs: {
                linux: [],
                osx: [],
                windows: []
            },
            profiles: this.getDefaultProfiles(),
            defaultProfile: {
                linux: null,
                osx: null,
                windows: null
            },
            altClickMovesCursor: true,
            macOptionIsMeta: false,
            macOptionClickForcesSelection: false,
            gpuAcceleration: 'auto',
            rightClickBehavior: 'copyPaste',
            middleClickBehavior: 'paste',
            cursorBlinking: false,
            cursorStyle: 'block',
            cursorStyleInactive: 'outline',
            cursorWidth: 1,
            drawBoldTextInBrightColors: true,
            fastScrollSensitivity: 5,
            fontFamily: this.getDefaultFontFamily(),
            fontWeight: DEFAULT_FONT_WEIGHT as FontWeight,
            fontWeightBold: DEFAULT_BOLD_FONT_WEIGHT as FontWeight,
            minimumContrastRatio: 4.5,
            mouseWheelScrollSensitivity: 1,
            tabStopWidth: 8,
            sendKeybindingsToShell: false,
            fontSize: 14,
            letterSpacing: DEFAULT_LETTER_SPACING,
            lineHeight: DEFAULT_LINE_HEIGHT,
            detectLocale: 'auto',
            scrollback: 1000,
            commandsToSkipShell: [],
            allowChords: true,
            allowMnemonics: true,
            cwd: '',
            confirmOnExit: 'never',
            confirmOnKill: 'editor',
            enableBell: false,
            env: {
                linux: {},
                osx: {},
                windows: {}
            },
            environmentChangesIndicator: 'off',
            environmentChangesRelaunch: false,
            showExitAlert: true,
            splitCwd: 'inherited',
            windowsEnableConpty: true,
            wordSeparators: ' ()[]{}\'"',
            enableFileLinks: 'on',
            allowedLinkSchemes: ['http', 'https'],
            unicodeVersion: '11',
            enablePersistentSessions: true,
            bellDuration: 1000,
            defaultLocation: 'panel',
            customGlyphs: true,
            persistentSessionReviveProcess: 'onExit',
            ignoreProcessNames: [],
            shellIntegration: {
                enabled: true,
                decorationsEnabled: 'both'
            },
            enableImages: false,
            smoothScrolling: false,
            ignoreBracketedPasteMode: false,
            rescaleOverlappingGlyphs: false,
            hideOnLastClosed: false
        };
    }

    /**
     * Get the configuration value for a specific key
     */
    getConfiguration<K extends keyof ITerminalConfiguration>(key: K): ITerminalConfiguration[K] | undefined {
        return this._configuration[key];
    }

    /**
     * Update a configuration value
     */
    updateConfiguration<K extends keyof ITerminalConfiguration>(key: K, value: ITerminalConfiguration[K]): void {
        this._configuration[key] = value;
    }

    /**
     * Get the complete configuration object
     */
    getFullConfiguration(): Partial<ITerminalConfiguration> {
        return { ...this._configuration };
    }

    /**
     * Get terminal font configuration
     */
    getFont(): ITerminalFont {
        return {
            fontFamily: this._configuration.fontFamily || this.getDefaultFontFamily(),
            fontSize: this._configuration.fontSize || 14,
            letterSpacing: this._configuration.letterSpacing || DEFAULT_LETTER_SPACING,
            lineHeight: this._configuration.lineHeight || DEFAULT_LINE_HEIGHT
        };
    }

    /**
     * Get default shell for the specified operating system
     */
    private getDefaultShell(os: OperatingSystem): string | null {
        switch (os) {
            case OperatingSystem.Windows:
                return 'powershell.exe';
            case OperatingSystem.Macintosh:
                return '/bin/zsh';
            case OperatingSystem.Linux:
                return '/bin/bash';
            default:
                return null;
        }
    }

    /**
     * Get default font family based on platform
     */
    private getDefaultFontFamily(): string {
        if (typeof navigator !== 'undefined') {
            const platform = navigator.platform.toLowerCase();
            if (platform.includes('mac')) {
                return 'SF Mono, Monaco, Inconsolata, "Fira Code", "Fira Mono", "Droid Sans Mono", Consolas, "Liberation Mono", Menlo, "Courier New", monospace';
            } else if (platform.includes('win')) {
                return 'Consolas, "Courier New", monospace';
            }
        }
        return '"Droid Sans Mono", "monospace", monospace';
    }

    /**
     * Get default terminal profiles for all platforms
     */
    private getDefaultProfiles(): ITerminalProfiles {
        return {
            windows: {
                'PowerShell': {
                    path: 'powershell.exe',
                    icon: 'terminal-powershell'
                },
                'Command Prompt': {
                    path: 'cmd.exe',
                    icon: 'terminal-cmd'
                },
                'Git Bash': {
                    path: 'C:\\Program Files\\Git\\bin\\bash.exe',
                    icon: 'terminal-bash'
                }
            },
            osx: {
                'bash': {
                    path: '/bin/bash',
                    icon: 'terminal-bash'
                },
                'zsh': {
                    path: '/bin/zsh',
                    icon: 'terminal-bash'
                },
                'fish': {
                    path: '/usr/local/bin/fish',
                    icon: 'terminal-bash'
                }
            },
            linux: {
                'bash': {
                    path: '/bin/bash',
                    icon: 'terminal-bash'
                },
                'zsh': {
                    path: '/bin/zsh',
                    icon: 'terminal-bash'
                },
                'fish': {
                    path: '/usr/bin/fish',
                    icon: 'terminal-bash'
                }
            }
        };
    }

    /**
     * Get the current operating system
     */
    getCurrentOS(): OperatingSystem {
        if (typeof navigator !== 'undefined') {
            const platform = navigator.platform.toLowerCase();
            if (platform.includes('mac')) {
                return OperatingSystem.Macintosh;
            } else if (platform.includes('win')) {
                return OperatingSystem.Windows;
            }
        }
        return OperatingSystem.Linux;
    }

    /**
     * Get shell for the current operating system
     */
    getCurrentShell(): string | null {
        const os = this.getCurrentOS();
        switch (os) {
            case OperatingSystem.Windows:
                return this._configuration.shell?.windows || this.getDefaultShell(os);
            case OperatingSystem.Macintosh:
                return this._configuration.shell?.osx || this.getDefaultShell(os);
            case OperatingSystem.Linux:
                return this._configuration.shell?.linux || this.getDefaultShell(os);
            default:
                return null;
        }
    }

    /**
     * Get shell arguments for the current operating system
     */
    getCurrentShellArgs(): string[] {
        const os = this.getCurrentOS();
        switch (os) {
            case OperatingSystem.Windows:
                return this._configuration.shellArgs?.windows || [];
            case OperatingSystem.Macintosh:
                return this._configuration.shellArgs?.osx || [];
            case OperatingSystem.Linux:
                return this._configuration.shellArgs?.linux || [];
            default:
                return [];
        }
    }

    /**
     * Get environment variables for the current operating system
     */
    getCurrentEnv(): { [key: string]: string } {
        const os = this.getCurrentOS();
        switch (os) {
            case OperatingSystem.Windows:
                return this._configuration.env?.windows || {};
            case OperatingSystem.Macintosh:
                return this._configuration.env?.osx || {};
            case OperatingSystem.Linux:
                return this._configuration.env?.linux || {};
            default:
                return {};
        }
    }

    /**
     * Reset configuration to defaults
     */
    resetToDefaults(): void {
        this.initializeDefaultConfiguration();
    }
}