window.AudioContext = window.AudioContext || window.webkitAudioContext;

let ctx = new AudioContext();
const oscillators = {};

function midiToFrequency(number) {
  const a = 440;
  return (a / 32) * 2 ** ((number - 9) / 12);
}

if (navigator.requestMIDIAccess) {
  navigator.requestMIDIAccess().then(onMIDISuccess, onMIDIFailure);
}

function onMIDISuccess(midiAccess) {
  const inputs = midiAccess.inputs;
  inputs.forEach((input) => {
    input.addEventListener("midimessage", handleInput);
  });
}

function handleInput(input) {
  const command = input.data[0];
  const note = input.data[1];
  const velocity = input.data[2];

  switch (command) {
    case 144: // Note On
      if (velocity > 0) {
        if (!oscillators[note]) {
          NoteOn(note, velocity);
        } // If the oscillator doesn't exist, create a new one
      } else {
        noteOff(note);
      }
      break;
    case 128: // Note Off
      noteOff(note);
      break;
  }
}

function NoteOn(note, velocity) {
  const osc = ctx.createOscillator();
  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.33;

  osc.type = "sawtooth";
  osc.frequency.value = midiToFrequency(note);

  osc.connect(oscGain);
  oscGain.connect(ctx.destination);

  oscillators[note] = osc; // Store the oscillator
  osc.start();
}

function noteOff(note) {
  const osc = oscillators[note];
  if (osc) {
    osc.stop();
    osc.disconnect();
    delete oscillators[note]; // Remove the oscillator from the dictionary
  }
}

function onMIDIFailure() {
  console.log("Could not access your MIDI devices.");
}
