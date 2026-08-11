import {
  RuntimeExecutionTrace,
  RuntimeTelemetryError,
  RuntimeTelemetryEvent,
  RuntimeTelemetryModuleTiming,
} from "../artifacts/AdaptiveInvestigationState";

const nowIso = (): string => new Date().toISOString();

const createId = (): string => {
  if (typeof globalThis.crypto !== "undefined" && "randomUUID" in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `atlaz-runtime-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
};

type ModuleTimer = {
  module: string;
  startedAt: string;
  startedMs: number;
};

export type RuntimeExecutionContext = {
  sessionId: string;
  runtimeId: string;
  requestId: string;
  retryCount: number;
};

export default class RuntimeExecutionTelemetry {
  private readonly startedAt = nowIso();
  private readonly startedMs = Date.now();
  private readonly moduleTimings: RuntimeTelemetryModuleTiming[] = [];
  private readonly events: RuntimeTelemetryEvent[] = [];
  private readonly errors: RuntimeTelemetryError[] = [];
  private readonly activeModules = new Map<string, ModuleTimer>();
  private result: RuntimeExecutionTrace["result"] = "success";
  private interruptionReason: string | undefined;

  constructor(private readonly context: RuntimeExecutionContext) {}

  public markModuleStart(module: string): void {
    this.activeModules.set(module, {
      module,
      startedAt: nowIso(),
      startedMs: Date.now(),
    });
  }

  public markModuleEnd(module: string): void {
    const timer = this.activeModules.get(module);
    if (!timer) {
      return;
    }

    this.activeModules.delete(module);
    const endedAt = nowIso();
    this.moduleTimings.push({
      module,
      startedAt: timer.startedAt,
      endedAt,
      durationMs: Date.now() - timer.startedMs,
    });
  }

  public addEvent(name: string, details: string): void {
    this.events.push({
      timestamp: nowIso(),
      name,
      details,
    });
  }

  public addError(module: string, message: string): void {
    this.errors.push({
      timestamp: nowIso(),
      module,
      message,
    });
    this.result = "error";
  }

  public markInterrupted(reason: string): void {
    this.result = "interrupted";
    this.interruptionReason = reason;
  }

  public markSuccess(): void {
    if (this.result !== "error" && this.result !== "interrupted") {
      this.result = "success";
    }
  }

  public finalize(): RuntimeExecutionTrace {
    // Force-close any unfinished modules to keep telemetry reconstructible.
    for (const timer of this.activeModules.values()) {
      this.moduleTimings.push({
        module: timer.module,
        startedAt: timer.startedAt,
        endedAt: nowIso(),
        durationMs: Date.now() - timer.startedMs,
      });
    }
    this.activeModules.clear();

    return {
      id: createId(),
      sessionId: this.context.sessionId,
      runtimeId: this.context.runtimeId,
      requestId: this.context.requestId,
      retryCount: this.context.retryCount,
      result: this.result,
      interruptionReason: this.interruptionReason,
      startedAt: this.startedAt,
      endedAt: nowIso(),
      totalDurationMs: Date.now() - this.startedMs,
      moduleTimings: this.moduleTimings,
      events: this.events,
      errors: this.errors,
    };
  }
}
