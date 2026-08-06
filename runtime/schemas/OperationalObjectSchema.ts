import { OperationalObject } from "../artifacts/OperationalObject";
import { Impact } from "../types/Impact";
import { Severity } from "../types/Severity";
import { Urgency } from "../types/Urgency";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isStringArray = (value: unknown): value is string[] => {
	return Array.isArray(value) && value.every((item) => typeof item === "string");
};

const isSeverity = (value: unknown): value is Severity => {
	return typeof value === "string" && Object.values(Severity).includes(value as Severity);
};

const isUrgency = (value: unknown): value is Urgency => {
	return typeof value === "string" && Object.values(Urgency).includes(value as Urgency);
};

const isImpact = (value: unknown): value is Impact => {
	return typeof value === "string" && Object.values(Impact).includes(value as Impact);
};

export const OperationalObjectSchema = {
	parse(value: unknown): OperationalObject {
		if (!isPlainObject(value)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (value.artifact !== "OperationalObject") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.version !== "string") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.problemStatement !== "string") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.domain !== "string") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.category !== "string") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.process !== "string") {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (!isSeverity(value.severity)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (!isUrgency(value.urgency)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (!isImpact(value.impact)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (!isStringArray(value.suspectedDomains)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (!isStringArray(value.requiredInformation)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		if (typeof value.confidence !== "number" || Number.isNaN(value.confidence)) {
			throw new Error("Invalid OperationalObject returned by LLM");
		}

		return {
			artifact: value.artifact,
			version: value.version,
			problemStatement: value.problemStatement,
			domain: value.domain,
			category: value.category,
			process: value.process,
			severity: value.severity,
			urgency: value.urgency,
			impact: value.impact,
			suspectedDomains: value.suspectedDomains,
			requiredInformation: value.requiredInformation,
			confidence: value.confidence,
		};
	},
} as const;