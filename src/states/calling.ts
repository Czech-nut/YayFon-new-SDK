import {YayFonCall} from "../YayFonCall";

export class Calling {
  public decline: any;
  public answer: any;
  private call: YayFonCall;

  constructor(call: YayFonCall) {
    this.call = call;
    this.decline = this.call.endCall;
    this.answer = this.call.answer;
  }
}
