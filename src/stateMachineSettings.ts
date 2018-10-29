export class StateMachineSettings {
  public readonly settings = {
    init: "waiting",
    transitions: [
      {name: "answer", from: "calling", to: "talking"},
      {name: "decline", from: "talking", to: "waiting"},
      {name: "hold", from: "talking", to: "onHold"},
      {name: "unhold", from: "onHold", to: "talking"},
      {name: "mute", from: "talking", to: "onMute"},
      {name: "unmute", from: "onMute", to: "talking"},
      {name: "blindTransfer", from: "talking", to: "waiting"},
      {name: "attendedTransfer", from: "talking", to: "attendedCall"},
      {name: "confirmTransfer", from: "attendedCall", to: "waiting"},
      {name: "declineTransfer", from: "attendedCall", to: "waiting"},
    ],
    methods: {
      onEnd() {
        console.log("its onEnd");
      },
      onRejected() {
        console.log("its onRejected");
      },
      onCancel() {
        console.log("its onCancel");
      },
      onReinvite() {
        console.log("its onReinvite");
      },
      onReferRequested() {
        console.log("its onReferRequested");
      },
      onReplaced() {
        console.log("its onReplaced");
      },
      onDTMF() {
        console.log("its onDTMF");
      },
      onDirectionChanged() {
        console.log("its onDirectionChanged");
      },
      onTrackAdded() {
        console.log("its onTrackAdded");
      },
      onBye() {
        console.log("its onBye");
      },
      onProgress() {
        console.log("its onProgress");
      },
      onFail() {
        console.log("its onFail");
      },
      onAnswer() {
        console.log("its onAnswer");
      },
    },
  };
}
