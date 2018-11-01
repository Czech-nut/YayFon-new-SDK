import {StateMachineSettings} from "./stateMachineSettings";
// TODO: try to import as typescript module from TS version of library
// import { StateMachine } from "@taoqf/javascript-state-machine";
const StateMachineConstructor = require("javascript-state-machine");

export class StateMachine {
  public stateMachine: any;
  private readonly stateMachineSettings: StateMachineSettings = new StateMachineSettings();

  constructor() {
    this.stateMachine = new StateMachineConstructor(this.stateMachineSettings.settings);
  }

  /**
   * Changes state in state machine(from 'calling' to 'talking')
   * @public
   */
  public answer() {
    this.stateMachine.answer();
  }

  /**
   * Changes state in state machine(from 'calling' or 'talking' to 'waiting')
   * @public
   */
  public decline() {
    this.stateMachine.decline();
  }

  /**
   * Changes state in state machine(from 'talking' to 'waiting')
   * @public
   */
  public blindTransfer() {
    this.stateMachine.blindTransfer();
  }

  /**
   * Changes state in state machine(from 'waiting' to 'calling')
   * @public
   */
  public call() {
    this.stateMachine.call();
  }

  /**
   * Changes state in state machine(from 'calling' or 'talking' to 'waiting')
   * @public
   */
  public onEnd() {
    this.stateMachine.onEnd();
  }

  /**
   * Changes state in state machine(from 'calling' or 'talking' to 'waiting')
   * @public
   */
  public onFail() {
    this.stateMachine.onFail();
  }

  /**
   * Changes state in state machine(from 'calling' to 'talking')
   * @public
   */
  public onAccept() {
    this.stateMachine.onAccept();
  }

  /**
   * Returns current state of state machine
   * @public
   * @returns {string} current state
   */
  public getState(): string {
    return this.stateMachine.state;
  }
}
