<h1>YayFon-js-SDK</h1>
YayFon-js-SDK is a JavaScript library that helps developers make applications for different calls.

YayFin-js-SDK features:
- Audio/video calls
- Blind and attended transfers
- Easy to use
- Works with SIP.JS
- Uses State Machine

Here is the npm command to download our package:

    $ npm i @yayfon/yayfon-js-sdk



<h1>Usage</h1>

You can find example in our project in "example" folder.

To start you should write next npm commands:

    $ npm i
    $ npm run build 


<h1>API</h1>

<h2>YayFonSdk</h2>
Class for init connection, make calls, attended transfer and confirm transfer

<h4>getCallInfo</h4>
Returns info about current call

<h4>getAgentCallId()</h4>
Returns current call id

<h4>getAttendedAgentCallId()</h4>
Returns id of call with second agent after attended transfer

<h4>call(phoneNumber)</h4>
Makes an outgoing multimedia call

phoneNumber - destination of the call

<h4>endCall()</h4>
Declines all calls and cleans object with all information about calls

<h4>attendedTransfer(agent, phoneNumber)</h4>
The current call is put on hold and another call is initiated to confirm whether the end destination
actually wants to take the call or not

agent - object with info about current call (YayFonCall)
phoneNumber - destination of the call

<h4>endAttendedCall()</h4>
Declines only the person to whom the transfer was made

<h4>confirmTransfer()</h4>
Connects two agents after attended transfer and terminates current call

<h4>onRegister(callback)</h4>
Fired for successful registration

callback - function that runs, when event fired

<h4>onRegistrationFailed(callback)</h4>
Fired for registration failure

callback - function that runs, when event fired

<h4>onUnregistered(callback)</h4>
Fired for unregistration

callback - function that runs, when event fired

<h4>logout()</h4>
Disconnects from the WebSocket server after gracefully unregistering and terminates any active sessions

<h2>YayFonCall</h2>
Class to manage calls

<h4>getSession()</h4>
Returns info about current session

<h4>getSessionId()</h4>
Returns id of current session

<h4>answer()</h4>
Answer the incoming session. Available only for incoming call

<h4>endCall()</h4>
Terminates current call

<h4>blindTransfer(phoneNumber)</h4>
Transfers the caller to another agent without speaking to the new agent first

phoneNumber - destination of the call

<h4>hold()</h4>
Puts the call on hold

<h4>unhold()</h4>
Resumes the call from hold

<h4>mute(true)</h4>
Mutes the local audio and/or video

<h4>unmute()</h4>
Unmutes the local audio and/or video

<h4>isIncomingCall()</h4>
Determines if the call is incoming

<h4>onAccept(callback)</h4>
Fired each time a successful final (200-299) response is received

callback - function that runs, when event fired

<h4>onProgress(callback)</h4>
Fired each time a provisional response is received

callback - function that runs, when event fired

<h4>onEnd(callback)</h4>
Fired when an established call ends

callback - function that runs, when event fired

<h4>onFail(callback)</h4>
Fired when the request fails, whether due to an unsuccessful final response or due to timeout, transport, or other

callback - function that runs, when event fired
