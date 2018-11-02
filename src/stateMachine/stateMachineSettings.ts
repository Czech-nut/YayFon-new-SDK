export class StateMachineSettings {
  public readonly settings = {
    init: "waiting",
    transitions: [
      {name: "answer", from: "calling", to: "talking"},
      {name: "decline", from: ["talking", "calling", "talkingAttendedTransfer"], to: "waiting"},
      {name: "blindTransfer", from: "talking", to: "waiting"},
      {name: "attendedTransfer", from: "talking", to: "callingAttendedTransfer"},
      {name: "acceptedAttendedTransfer", from: "callingAttendedTransfer", to: "talkingAttendedTransfer"},
      {name: "confirmTransfer", from: "talkingAttendedTransfer", to: "waiting"},
      {name: "declineAttendedTransfer", from: "talkingAttendedTransfer", to: "talking"},
      {name: "call", from: "waiting", to: "calling"},
      {name: "onFail", from: ["talking", "calling"], to: "waiting"},
      {name: "onFailAttendedTransfer", from: ["talkingAttendedTransfer", "callingAttendedTransfer"], to: "talking"},
      {name: "onEnd", from: ["talking", "calling"], to: "waiting"},
      {name: "onEndAttendedTransfer", from: ["talkingAttendedTransfer", "callingAttendedTransfer"], to: "talking"},
      {name: "onAccept", from: "calling", to: "talking"},
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
