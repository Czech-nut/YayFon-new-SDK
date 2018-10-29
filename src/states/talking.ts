import {YayFonCall} from "../YayFonCall";

export class Talking {
  public call: YayFonCall;
  public decline = this.call.endCall;
  public mute = this.call.mute;
  public unmute = this.call.unmute;
  public hold = this.call.hold;
  public unhold = this.call.unhold;
  public blindTransfer = this.call.blindTransfer;

  constructor(call: YayFonCall) {
    this.call = call;
  }
}
