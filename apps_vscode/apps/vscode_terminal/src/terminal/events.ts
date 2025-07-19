/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

/**
 * Simple event system extracted and simplified from VS Code's event infrastructure
 */

export interface IDisposable {
    dispose(): void;
}

export class DisposableStore implements IDisposable {
    private readonly _disposables = new Set<IDisposable>();
    private _isDisposed = false;

    dispose(): void {
        if (this._isDisposed) {
            return;
        }

        this._isDisposed = true;
        this._disposables.forEach(d => d.dispose());
        this._disposables.clear();
    }

    add<T extends IDisposable>(disposable: T): T {
        if (this._isDisposed) {
            disposable.dispose();
        } else {
            this._disposables.add(disposable);
        }
        return disposable;
    }

    get isDisposed(): boolean {
        return this._isDisposed;
    }
}

export interface Event<T> {
    (listener: (e: T) => any): IDisposable;
}

interface IEventListener<T> {
    (e: T): void;
}

export class Emitter<T> implements IDisposable {
    private _listeners = new Set<IEventListener<T>>();
    private _disposed = false;

    get event(): Event<T> {
        return (listener: IEventListener<T>) => {
            if (this._disposed) {
                return { dispose: () => {} };
            }

            this._listeners.add(listener);
            return {
                dispose: () => {
                    this._listeners.delete(listener);
                }
            };
        };
    }

    fire(event: T): void {
        if (this._disposed) {
            return;
        }

        for (const listener of this._listeners) {
            try {
                listener(event);
            } catch (error) {
                console.error('Event listener threw error:', error);
            }
        }
    }

    dispose(): void {
        if (this._disposed) {
            return;
        }

        this._disposed = true;
        this._listeners.clear();
    }

    get hasListeners(): boolean {
        return this._listeners.size > 0;
    }
}

/**
 * Creates a shallow clone of an event that can be disposed independently
 */
export function bufferEvent<T>(event: Event<T>): Event<T> {
    const buffer: T[] = [];
    let disposed = false;
    let emitter: Emitter<T> | undefined;

    const disposable = event(e => {
        if (disposed) {
            return;
        }
        
        if (emitter) {
            emitter.fire(e);
        } else {
            buffer.push(e);
        }
    });

    return (listener: (e: T) => any) => {
        if (disposed) {
            return { dispose: () => {} };
        }

        if (!emitter) {
            emitter = new Emitter<T>();
            
            // Fire buffered events
            for (const e of buffer) {
                emitter.fire(e);
            }
            buffer.length = 0;
        }

        const subscription = emitter.event(listener);
        
        return {
            dispose: () => {
                subscription.dispose();
                if (emitter && !emitter.hasListeners) {
                    emitter.dispose();
                    emitter = undefined;
                    disposed = true;
                    disposable.dispose();
                }
            }
        };
    };
}

/**
 * Event utilities
 */
export namespace Event {
    export const None: Event<any> = () => ({ dispose: () => {} });

    export function map<I, O>(event: Event<I>, map: (i: I) => O): Event<O> {
        return (listener: (e: O) => any) => event(i => listener(map(i)));
    }

    export function filter<T>(event: Event<T>, filter: (e: T) => boolean): Event<T> {
        return (listener: (e: T) => any) => event(e => filter(e) && listener(e));
    }

    export function once<T>(event: Event<T>): Event<T> {
        return (listener: (e: T) => any) => {
            let disposed = false;
            const result = event(e => {
                if (!disposed) {
                    disposed = true;
                    result.dispose();
                    listener(e);
                }
            });
            return result;
        };
    }

    export function debounce<T>(event: Event<T>, delay: number): Event<T> {
        return (listener: (e: T) => any) => {
            let timeout: NodeJS.Timeout | undefined;
            return event(e => {
                if (timeout) {
                    clearTimeout(timeout);
                }
                timeout = setTimeout(() => listener(e), delay);
            });
        };
    }
}