let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') {
    return null
  }

  if (!audioContext) {
    audioContext = new AudioContext()
  }

  return audioContext
}

export async function prepareAudio() {
  const context = getAudioContext()

  if (context && context.state === 'suspended') {
    await context.resume()
  }
}

export function playCompletionSound() {
  const context = getAudioContext()

  if (!context || context.state === 'closed') {
    return
  }

  if (context.state === 'suspended') {
    void context.resume()
  }

  const startTime = context.currentTime + 0.02
  const notes = [880, 880, 1174.66]

  notes.forEach((frequency, index) => {
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    const noteStart = startTime + index * 0.22
    const duration = 0.18

    oscillator.type = 'sine'
    oscillator.frequency.value = frequency

    gain.gain.setValueAtTime(0.0001, noteStart)
    gain.gain.exponentialRampToValueAtTime(0.2, noteStart + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + duration)

    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start(noteStart)
    oscillator.stop(noteStart + duration + 0.03)
  })
}
