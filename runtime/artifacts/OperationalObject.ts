import { Impact } from "../types/Impact";
import { Severity } from "../types/Severity";
import { Urgency } from "../types/Urgency";

export interface OperationalObject {
  artifact: "OperationalObject";
  version: string;
  problemStatement: string;
  domain: string;
  category: string;
  process: string;
  severity: Severity;
  urgency: Urgency;
  impact: Impact;
  suspectedDomains: string[];
  requiredInformation: string[];
  confidence: number;
}
