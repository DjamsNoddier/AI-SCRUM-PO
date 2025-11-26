class RecorderProcessor extends AudioWorkletProcessor {
  process(inputs) {
    const input = inputs[0];
    if (!input || input.length === 0) {
      return true;
    }

    // On prend le canal 0 (mono)
    const channelData = input[0];

    // On envoie une copie au main thread
    this.port.postMessage(channelData.slice(0));

    return true; // continue de tourner
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
