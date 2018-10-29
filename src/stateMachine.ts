// import { StateMachine } from "@taoqf/javascript-state-machine"; TODO: try to import as typescript module
import {StateMachineSettings} from "./stateMachineSettings";

const StateMachineConstructor = require("javascript-state-machine");

export class StateMachine {

  public stateMachine: any;
  private readonly stateMachineSettings: StateMachineSettings = new StateMachineSettings();

  constructor() {
    this.stateMachine = new StateMachineConstructor(this.stateMachineSettings.settings);
  }

  public answer() {
    this.stateMachine.answer();
  }
  public decline() {
    this.stateMachine.decline();
  }
  public end() {
    this.stateMachine.end();
  }
  public hold() {
    this.stateMachine.hold();
  }
  public unhold() {
    this.stateMachine.unhold();
  }
  public blindTransfer() {
    this.stateMachine.blindTransfer();
  }
  public mute() {
    this.stateMachine.mute();
  }
  public unmute() {
    this.stateMachine.unmute();
  }

  public getState(): string {
    return this.stateMachine.state;
}
}
