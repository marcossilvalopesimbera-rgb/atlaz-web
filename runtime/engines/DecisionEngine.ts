import { DecisionPackage } from "../artifacts/DecisionPackage";

export default class DecisionEngine {
  constructor() {}

  public decide(): DecisionPackage {
    throw new Error("TODO: implement DecisionEngine.decide");
  }
}