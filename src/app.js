const ciscospark = require('ciscospark');

let spark;
let activeCall;

const SIP_REGEXP = new RegExp('^(?:\\w+\\.?)+@(?:\\w+\\.?)+com$');

function handleError(err, shouldThrow = true) {
  console.error(err);
  alert(err.stack);
  if (shouldThrow) {
    throw err;
  }
}

function isValidSip(sip) {
  return SIP_REGEXP.test(sip);
}

async function authorize() {
  if (!spark) {
    spark = ciscospark.init({
      config: {
        phone: {
          enableExperimentalGroupCallingSupport: true
        }
      },
      credentials: {
        access_token: document.getElementById('access-token').value
      }
    });
  }

  if (!spark.phone.registered) {
    try {
      await spark.phone.register();
      spark.config.logger.level = 'info';
      document.getElementById('connection-status').innerHTML = 'connected';
    } catch (e) {
      handleError(e);
    }
  }
}

function bindCallEvents(call) {

  call.on('error', (err) => {
    handleError(e, false);
  });

  call.once('localMediaStream:change', () => {
    document.getElementById('self-view').srcObject = call.localMediaStream;
  });

  call.on('remoteMediaStream:change', () => {
    if (call.remoteMediaStream) {
      document.getElementById('remote-view-video').srcObject = call.remoteMediaStream;
    }
  });

  call.on('inactive', () => {
    document.getElementById('self-view').srcObject = undefined;
    document.getElementById('remote-view-audio').srcObject = undefined;
    document.getElementById('remote-view-video').srcObject = undefined;
    document.getElementById('video-mute').removeEventListener('click', toggleCamera);
    document.getElementById('audio-mute').removeEventListener('click', toggleMicrophone);
    activeCall = undefined;
  });

  document.getElementById('hangup').addEventListener('click', () => {
    call.hangup();
    document.getElementById('video-mute').removeEventListener('click', toggleCamera);
    document.getElementById('audio-mute').removeEventListener('click', toggleMicrophone);
    activeCall = undefined;
  });
}

function toggleCamera() {
  if (activeCall) {
    try {
      activeCall.toggleSendingVideo();
    } catch (e) {
      handleError(e);
    }
  }
}

function toggleMicrophone() {
  if (activeCall) {
    try {
      activeCall.toggleSendingAudio();
    } catch (e) {
      handleError(e);
    }
  }
}

async function startMeeting(sip) {
  if (sip) {
    try {
      await authorize();
      const call = await spark.phone.dial(sip);
      activeCall = call;
      document.getElementById('toggle-video').addEventListener('click', toggleCamera);
      document.getElementById('toggle-audio').addEventListener('click', toggleMicrophone);
      bindCallEvents(activeCall);
    } catch (e) {
      handleError(e);
    }
  }
}

[ 'access-token', 'sip-address' ].forEach((id) => {
  const value = localStorage.getItem(id);
  const el = document.getElementById(id);
  el.value = value;
  el.addEventListener('change', (event) => {
    localStorage.setItem(id, event.target.value);
  });
});


document.getElementById('credentials').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    await authorize();
  } catch (e) {
    handleError(e);
  }
});

document.getElementById('meeting-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  try {
    const sip = document.getElementById('sip-address').value;
    if (!isValidSip(sip)) { throw new Error('Invalid SIP Address'); }
    await startMeeting(sip);
  } catch (e) {
    handleError(e);
  }

});
