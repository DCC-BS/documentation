---
outline: deep
editLink: true
skillName: dcc-audio-recorder
skillDescription: "DCC-BS Nuxt module @dcc-bs/audio-recorder.bs.js for browser audio recording that survives a reload: AudioRecorder, AudioVisualizer and AudioSessionExplorer components, the useAudioRecording and useAudioSessions composables, chunked MP3 storage in IndexedDB, recovery of abandoned recordings, and recording a caller-supplied stream (getStream) such as a meeting (microphone mixed with screen audio). Use when adding recording to a Nuxt app or debugging lost or incomplete recordings."
---
# Audio Recorder

> **📦 Repository**: [github.com/DCC-BS/audio-recorder.bs.js](https://github.com/DCC-BS/audio-recorder.bs.js) · **npm**: [@dcc-bs/audio-recorder.bs.js](https://www.npmjs.com/package/@dcc-bs/audio-recorder.bs.js)

A Nuxt module for recording audio in the browser. While a recording runs, it is
encoded to MP3 and written to IndexedDB chunk by chunk, so a reload, a closed tab
or a crash loses at most the last chunk. The rest shows up as an *abandoned
recording* the user can recover. [Transcribo](/apps/transcribo.md) uses it for
microphone and meeting recordings.

## Setup

```sh
bun add @dcc-bs/audio-recorder.bs.js
```

```ts
// nuxt.config.ts
export default defineNuxtConfig({
    modules: ["@dcc-bs/audio-recorder.bs.js"],
    vite: {
        resolve: {
            alias: { dexie: "dexie/dist/dexie.mjs" },
        },
    },
});
```

```css
/* main CSS file */
@import "@dcc-bs/audio-recorder.bs.js";
```

Components and composables are auto-imported. All components are client-only
(`.client.vue`), because recording needs browser APIs.

## How a recording is stored

1. An AudioWorklet captures PCM samples from the stream.
2. Every `storeToDbInterval` seconds the buffered samples are encoded to an MP3
   chunk with FFmpeg (WebAssembly) and stored in IndexedDB (`AudioRecorderDB`)
   under the recording's session.
3. On stop, the remaining samples become the last chunk. All chunks are joined
   into one MP3, handed to `onRecordingStopped`, and the session is deleted.

A session that is never stopped stays in IndexedDB. `useAudioSessions` lists such
sessions as `abandonedRecording`, and `<AudioSessionExplorer>` lets the user
download or process them.

| Situation | What is kept |
|---|---|
| Stop | Everything, delivered as one MP3 |
| Navigating away inside the app (component unmounts) | Everything: the samples since the last chunk are stored as a final chunk; the session stays as abandoned |
| Reload, closing the tab or window, crash | Everything up to the last stored chunk; the seconds since then are lost |

Choose `storeToDbInterval` as the amount of audio you can afford to lose on a
reload. The `<AudioRecorder>` component stores every 5 seconds;
`useAudioRecording` defaults to 30.

## Microphone recording

The component handles start, stop, timer, level meter, errors and playback:

```vue
<template>
    <AudioRecorder
        :store-to-db-interval="5"
        @recording-stopped="(blob) => upload(blob)"
    />
</template>
```

For your own UI, use the composable:

```ts
const {
    isStarting,
    isRecording,
    isProcessing,
    recordingTime,
    error,
    startRecording,
    stopRecording,
} = useAudioRecording({
    storeToDbInterval: 10,
    onRecordingStopped: (blob, url) => upload(blob),
    onError: (message) => console.warn(message),
});
```

| State | Meaning |
|---|---|
| `isStarting` | Between `startRecording()` and the first sample: device check, permission prompt, `getStream`, session creation |
| `isRecording` | Samples are being recorded |
| `isProcessing` | Stopped; the last chunk is encoded and all chunks are joined |

Disable your start button while `isStarting` or `isProcessing` is true. Calls to
`startRecording()` in those phases are ignored.

## Recording a meeting or another stream

Since 2.2.0, `getStream` lets you record any `MediaStream` instead of the
microphone, with the same chunked storage and recovery. It is called on every
start. The recorder never stops the tracks of a stream it was given: releasing
the devices is up to you.

Browsers only hand out screen audio together with a video track, so request
video and mix only the audio:

```ts
let context: AudioContext | undefined;
let sources: MediaStream[] = [];

const { startRecording, stopRecording } = useAudioRecording({
    storeToDbInterval: 10,
    getStream: async () => {
        // screen picker first: cancelling it should not leave the mic on
        const screen = await navigator.mediaDevices.getDisplayMedia({
            audio: true,
            video: true,
        });
        const mic = await navigator.mediaDevices.getUserMedia({ audio: true });
        sources = [screen, mic];

        context = new AudioContext();
        const mix = context.createMediaStreamDestination();
        for (const source of sources) {
            context.createMediaStreamSource(source).connect(mix);
        }
        return mix.stream;
    },
    onRecordingStopped: (blob) => {
        release();
        upload(blob);
    },
});

function release(): void {
    for (const track of sources.flatMap((s) => s.getTracks())) {
        track.stop();
    }
    void context?.close();
}
```

::: warning Screen audio support
Only Chromium browsers (Chrome, Edge) on Windows and ChromeOS share the sound of
other applications like Teams. On macOS and Linux they share the audio of a
browser tab only, and Firefox and Safari share no screen audio at all. Check
`getAudioTracks().length` on the screen stream and tell the user when it is 0.
:::

Also stop the recording when the user ends the share from the browser's own bar
(`ended` event on the screen's video track). Transcribo's
[`useMeetingRecorder`](https://github.com/DCC-BS/transcribo-frontend/blob/main/app/composables/useMeetingRecorder.ts)
is a complete example.

When `getStream` throws, for example because the user cancelled the screen
picker, its message ends up in `error` and `onError`. It is not reported as a
microphone problem.

## Errors on stop

`stopRecording()` rejects, and sets `error` and calls `onError`, when:

- encoding or storing a chunk failed during the recording: the delivered MP3
  would have a gap, so nothing is delivered and the stored chunks stay as an
  abandoned recording;
- nothing was recorded (stopped before the first sample arrived): the empty
  session is deleted.

The devices are released and `isProcessing` is reset in every case, so a new
recording can start right away. `<AudioRecorder>` shows the error itself.

## Warning before leaving the page

A reload or a closed tab ends the recording and loses the last chunk, so ask
before letting the user go. Browsers show their own fixed text for reload and
close; put the explanation next to the recorder:

```ts
const isBusy = computed(() => isRecording.value || isProcessing.value);

// reload and close: the browser's own confirmation
useEventListener("beforeunload", (event: BeforeUnloadEvent) => {
    if (isBusy.value) {
        event.preventDefault();
        event.returnValue = "";
    }
});

// navigation inside the app: your own dialog
onBeforeRouteLeave(() => (isBusy.value ? confirmLeave() : true));
```

`useEventListener` without a target is safe during server-side rendering.
Transcribo's
[`useRecordingLeaveGuard`](https://github.com/DCC-BS/transcribo-frontend/blob/main/app/composables/useRecordingLeaveGuard.ts)
shows the full version, including the dialog.

## Recovering abandoned recordings

```ts
const { isReady, abandonedRecording } = useAudioSessions({
    deleteOldSessionsDaysInterval: 30,
    maxSessionsToKeep: 10,
});
```

```vue
<AudioSessionExplorer
    v-if="isReady && abandonedRecording?.length"
    :custom-actions="[
        {
            label: 'Transcribe',
            icon: 'i-lucide-play',
            handler: async (id, mp3Blob, deleteSession) => {
                await upload(mp3Blob);
                await deleteSession();
            },
        },
    ]"
/>
```

Sessions older than `deleteOldSessionsDaysInterval` days, and all but the newest
`maxSessionsToKeep`, are deleted when the component calling `useAudioSessions`
mounts.

## Reference

Every prop, option, event and exposed property is listed in the
[repository README](https://github.com/DCC-BS/audio-recorder.bs.js#readme).
