var YayFonSdk = require('../src/index.js');
let connection;
window.login = function () {
  let uaConfig = {
    userData: {
      username: document.getElementById('username').value,
      password: document.getElementById('password').value
    },
    callback: (call) => {
      reactionOnCall(call);
    },
  };

  connection = new YayFonSdk(uaConfig);
  document.getElementById('number').style.display = 'inline';
  document.getElementById('call').style.display = 'inline';
  document.getElementById('decline').style.display = 'inline';
  document.getElementById('logout').style.display = 'inline';
  document.getElementById('login').style.display = 'none';
  document.getElementById('password').style.display = 'none';
  document.getElementById('username').style.display = 'none';
};
window.reactionOnCall = function (call) {
  const isIncoming = call.isIncomingCall();
  document.getElementById('call').style.display = 'none';
  if (isIncoming) {
    document.getElementById('answer').style.display = 'inline';
    call.onEnd(() => {
      console.log('end');
      setViewForEnd();
    });
    call.onFail((e) => {
      console.log('onFail', e);
      setViewForEnd();
    });
    call.onProgress(() => {
      console.log('onProgress');
    });
  }

  if (!isIncoming) {
    call.onEnd(() => {
      console.log('end');
      setViewForEnd();
    });
    call.onFail((e) => {
      console.log('onFail', e);
      setViewForEnd();
    });
    call.onTrackAdded(()=> {
      console.log('onTrackAdded');
    }, document.getElementById('remoteAudio'));
    call.onAccept(() => {
      console.log('onAnswer');
      document.getElementById('blindTransfer').style.display = 'inline';
      document.getElementById('attendedTransfer').style.display = 'inline';
      document.getElementById('hold').style.display = 'inline';
    }, document.getElementById('remoteAudio'));
  }
};

window.call = function (number) {
  connection.call(number);
};

window.decline = function () {
  connection.endCall();
};

window.answer = function () {
  connection.getCallInfo(connection.getAgentCallId()).answer();
  document.getElementById('hold').style.display = 'inline';
  document.getElementById('answer').style.display = 'none';
};

window.blindTransfer = function (number) {
  connection.getCallInfo(connection.getAgentCallId()).blindTransfer(number);
};

window.attendedTransfer = function (number) {
  connection.attendedTransfer(connection.getCallInfo(connection.getAgentCallId()), number);
  document.getElementById('confirmTransfer').style.display = 'inline';
};

window.confirmTransfer = function () {
  connection.confirmTransfer();
};

window.hold = function () {
  connection.getCallInfo(connection.getAgentCallId()).hold();
  document.getElementById('hold').style.display = 'none';
  document.getElementById('unhold').style.display = 'inline';
  document.getElementById('remoteAudio').pause();
};

window.unhold = function () {
  connection.getCallInfo(connection.getAgentCallId()).unhold();
  document.getElementById('hold').style.display = 'inline';
  document.getElementById('unhold').style.display = 'none';
};

window.logout = function () {
  connection.logout();
  document.getElementById('call').style.display = 'none';
  document.getElementById('answer').style.display = 'none';
  document.getElementById('blindTransfer').style.display = 'none';
  document.getElementById('attendedTransfer').style.display = 'none';
  document.getElementById('confirmTransfer').style.display = 'none';
  document.getElementById('hold').style.display = 'none';
  document.getElementById('unhold').style.display = 'none';
  document.getElementById('logout').style.display = 'none';
  document.getElementById('number').style.display = 'none';
  document.getElementById('decline').style.display = 'none';
  document.getElementById('username').style.display = 'inline';
  document.getElementById('password').style.display = 'inline';
  document.getElementById('login').style.display = 'inline';
};

function setViewForEnd() {
  document.getElementById('call').style.display = 'inline';
  document.getElementById('answer').style.display = 'none';
  document.getElementById('blindTransfer').style.display = 'none';
  document.getElementById('attendedTransfer').style.display = 'none';
  document.getElementById('confirmTransfer').style.display = 'none';
  document.getElementById('hold').style.display = 'none';
  document.getElementById('unhold').style.display = 'none';
}
