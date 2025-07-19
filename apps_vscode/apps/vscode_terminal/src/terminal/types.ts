/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Core terminal types and interfaces extracted from VS Code terminal module
 * This file contains the essential types needed for terminal functionality
 */

export type FontWeight = 'normal' | 'bold' | number;
export type ConfirmOnKill = 'never' | 'always' | 'editor' | 'panel';
export type ConfirmOnExit = 'never' | 'always' | 'hasChildProcesses';

/**
 * Operating system types
 */
export enum OperatingSystem {
    Windows = 1,
    Macintosh = 2,
    Linux = 3
}

/**
 * Terminal location constants
 */
export enum TerminalLocation {
    Panel = 1,
    Editor = 2
}

export type TerminalLocationString = 'panel' | 'editor';

/**
 * Process state enumeration
 */
export enum ProcessState {
    // The process has not been initialized yet.
    Uninitialized = 1,
    // The process is currently launching
    Launching = 2,
    // The process is running normally.
    Running = 3,
    // The process was killed during launch
    KilledDuringLaunch = 4,
    // The process was killed by the user
    KilledByUser = 5,
    // The process was killed by itself
    KilledByProcess = 6
}

/**
 * Terminal connection state
 */
export enum TerminalConnectionState {
    Connecting = 1,
    Connected = 2
}

/**
 * Terminal configuration interface
 */
export interface ITerminalConfiguration {
    shell: {
        linux: string | null;
        osx: string | null;
        windows: string | null;
    };
    shellArgs: {
        linux: string[];
        osx: string[];
        windows: string[];
    };
    profiles: ITerminalProfiles;
    defaultProfile: {
        linux: string | null;
        osx: string | null;
        windows: string | null;
    };
    altClickMovesCursor: boolean;
    macOptionIsMeta: boolean;
    macOptionClickForcesSelection: boolean;
    gpuAcceleration: 'auto' | 'on' | 'off';
    rightClickBehavior: 'default' | 'copyPaste' | 'paste' | 'selectWord' | 'nothing';
    middleClickBehavior: 'default' | 'paste';
    cursorBlinking: boolean;
    cursorStyle: 'block' | 'underline' | 'line';
    cursorStyleInactive: 'outline' | 'block' | 'underline' | 'line' | 'none';
    cursorWidth: number;
    drawBoldTextInBrightColors: boolean;
    fastScrollSensitivity: number;
    fontFamily: string;
    fontWeight: FontWeight;
    fontWeightBold: FontWeight;
    minimumContrastRatio: number;
    mouseWheelScrollSensitivity: number;
    tabStopWidth: number;
    sendKeybindingsToShell: boolean;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    detectLocale: 'auto' | 'off' | 'on';
    scrollback: number;
    commandsToSkipShell: string[];
    allowChords: boolean;
    allowMnemonics: boolean;
    cwd: string;
    confirmOnExit: ConfirmOnExit;
    confirmOnKill: ConfirmOnKill;
    enableBell: boolean;
    env: {
        linux: { [key: string]: string };
        osx: { [key: string]: string };
        windows: { [key: string]: string };
    };
    environmentChangesIndicator: 'off' | 'on' | 'warnonly';
    environmentChangesRelaunch: boolean;
    showExitAlert: boolean;
    splitCwd: 'workspaceRoot' | 'initial' | 'inherited';
    windowsEnableConpty: boolean;
    wordSeparators: string;
    enableFileLinks: 'off' | 'on' | 'notRemote';
    allowedLinkSchemes: string[];
    unicodeVersion: '6' | '11';
    enablePersistentSessions: boolean;
    bellDuration: number;
    defaultLocation: TerminalLocationString;
    customGlyphs: boolean;
    persistentSessionReviveProcess: 'onExit' | 'onExitAndWindowClose' | 'never';
    ignoreProcessNames: string[];
    shellIntegration?: {
        enabled: boolean;
        decorationsEnabled: 'both' | 'gutter' | 'overviewRuler' | 'never';
    };
    enableImages: boolean;
    smoothScrolling: boolean;
    ignoreBracketedPasteMode: boolean;
    rescaleOverlappingGlyphs: boolean;
    hideOnLastClosed: boolean;
}

/**
 * Terminal profile object interface
 */
export interface ITerminalProfileObject {
    path?: string;
    args?: string[] | string;
    env?: { [key: string]: string | null };
    icon?: string;
    color?: string;
    overrideName?: boolean;
}

/**
 * Terminal profiles interface
 */
export interface ITerminalProfiles {
    linux: { [key: string]: ITerminalProfileObject };
    osx: { [key: string]: ITerminalProfileObject };
    windows: { [key: string]: ITerminalProfileObject };
}

/**
 * Terminal font interface
 */
export interface ITerminalFont {
    fontFamily: string;
    fontSize: number;
    letterSpacing: number;
    lineHeight: number;
    charWidth?: number;
    charHeight?: number;
}

/**
 * Terminal environment interface
 */
export interface ITerminalEnvironment {
    [key: string]: string | null;
}

/**
 * Dimensions interface
 */
export interface ITerminalDimensions {
    cols: number;
    rows: number;
}

/**
 * Shell launch configuration
 */
export interface IShellLaunchConfig {
    name?: string;
    executable?: string;
    args?: string[] | string;
    cwd?: string | URI;
    env?: ITerminalEnvironment;
    icon?: string;
    color?: string;
    hideFromUser?: boolean;
    isFeatureTerminal?: boolean;
    customPtyImplementation?: (terminalId: number, cols: number, rows: number) => ITerminalChildProcess;
}

/**
 * Basic URI interface
 */
export interface URI {
    scheme: string;
    authority: string;
    path: string;
    query: string;
    fragment: string;
    toString(): string;
}

/**
 * Event interface for terminal communication
 */
export interface IEvent<T> {
    (listener: (e: T) => any): { dispose(): void };
}

/**
 * Process data event
 */
export interface IProcessDataEvent {
    data: string;
    sync?: boolean;
}

/**
 * Basic terminal child process interface
 */
export interface ITerminalChildProcess {
    readonly id: number;
    readonly shouldPersist: boolean;
    readonly onProcessData: IEvent<IProcessDataEvent | string>;
    readonly onProcessExit: IEvent<number | undefined>;
}

/**
 * Terminal constants
 */
export const TERMINAL_VIEW_ID = 'terminal';
export const TERMINAL_CONFIG_SECTION = 'terminal.integrated';
export const DEFAULT_LETTER_SPACING = 0;
export const MINIMUM_LETTER_SPACING = -5;
export const DEFAULT_LINE_HEIGHT = 1;
export const MINIMUM_FONT_WEIGHT = 1;
export const MAXIMUM_FONT_WEIGHT = 1000;
export const DEFAULT_FONT_WEIGHT = 'normal';
export const DEFAULT_BOLD_FONT_WEIGHT = 'bold';