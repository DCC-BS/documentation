---
outline: deep
editLink: true
skillName: dcc-audio-recorder
skillDescription: "DCC-BS Nuxt module @dcc-bs/audio-recorder.bs.js for browser audio recording that survives a reload: AudioRecorder, AudioVisualizer and AudioSessionExplorer components, the useAudioRecording and useAudioSessions composables, chunked MP3 storage in IndexedDB, pausing and resuming (also after a reload or a closed app), recovery of abandoned recordings, and recording a caller-supplied stream (getStream) such as a meeting (microphone mixed with screen audio). Use when adding recording to a Nuxt app or debugging lost or incomplete recordings."
---
# Audio Recorder

> **📦 Repository**: [github.com/DCC-BS/audio-recorder.bs.js](https://github.com/DCC-BS/audio-recorder.bs.js) · **npm**: [@dcc-bs/audio-recorder.bs.js](https://www.npmjs.com/package/@dcc-bs/audio-recorder.bs.js)

A Nuxt module for recording audio in the browser. While a recording runs, it is
encoded to MP3 and written to IndexedDB chunk by chunk, so a reload, a closed tab
or a crash loses at most the last chunk. The rest shows up as an *abandoned
recording* the user can recover. Since 2.3.0 a recording can also be paused: the
pause is stored, so it can be continued after a reload, a closed tab or the
system killing the app. [Transcribo](/apps/transcribo.md) uses it for
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

Each session has a status: `recording` (running, or cut off by a crash or a
closed tab), `paused`, or `stopped` (a delivered recording kept as a backup).
A session that is never stopped stays in IndexedDB. `useAudioSessions` lists such
sessions as `abandonedRecording`, and `<AudioSessionExplorer>` lets the user
continue, download or process them.

| Situation | What is kept |
|---|---|
| Stop | Everything, delivered as one MP3 |
| Pause | Everything: the samples since the last chunk are stored, the session becomes `paused` and can be continued later |
| Navigating away inside the app (component unmounts) | Everything: the samples since the last chunk are stored and the session is left `paused` |
| Reload, closing the tab or window, crash | Everything up to the last stored chunk; the seconds since then are lost. A recording that was paused before loses nothing |

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
    isPaused,
    isProcessing,
    isBusy,
    recordingTime,
    error,
    startRecording,
    pauseRecording,
    resumeRecording,
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
| `isPaused` | Paused (since 2.3.0); everything recorded so far is stored once `isSavingPause` is false |
| `isSavingPause` | A pause is still being stored |
| `isProcessing` | Stopped; the last chunk is encoded and all chunks are joined |
| `isBusy` | Starting, recording, finishing or storing a pause: audio would be lost if the page went away now. A stored pause is not busy |
| `isActive` | The recorder holds a session: starting, recording, paused or finishing (since 2.3.0) |

`recordingTime` counts recorded seconds only; pauses do not count.

Disable your start button while `isActive` is true. Calls to
`startRecording()` in that phase are ignored. `<AudioRecorder>` exposes the same
states through its template ref.

## Stopping

Since 2.2.1, `stopRecording()` can be called in any state:

| State when called | Result |
|---|---|
| Recording | Stops, delivers the MP3 to `onRecordingStopped` |
| Starting (e.g. permission prompt open) | Cancels the start; devices granted afterwards are released, nothing is reported |
| Already stopping | Joins the stop in progress; the recording is delivered once |
| No recording | Does nothing |

So you can stop unconditionally, for example when a dialog with the recorder
closes. A stop requested from inside `onRecordingStarted` is honoured too.

## Pausing and resuming

Since 2.3.0, `<AudioRecorder>` shows a pause button (hide it with
`:allow-pause="false"`) and emits `recording-paused` and `recording-resumed`.
With the composable, call `pauseRecording()` and `resumeRecording()`;
`stopRecording()` finishes a paused recording like a running one.

A pause encodes and stores everything recorded so far, then marks the session
`paused`. Once `isSavingPause` is false, nothing is lost even if the app is
closed or killed. If part of the audio could not be stored, `pauseSaveFailed` is
set and the session stays `recording`, so it is not mistaken for a complete
pause. Pausing needs the default IndexedDB storage to survive a reload: with
`disableDefaultStore` it only stops capturing.

What happens to the devices while paused is set with `pauseMode`:

| Mode | Devices while paused | Resume | Used by `auto` (default) |
|---|---|---|---|
| `release` | Closed; the browser's recording indicator goes off | Opens the devices again, which may show a permission prompt | Desktop and Android browsers |
| `keep` | Kept open, the audio is dropped | Instant, without a prompt, as long as the devices still work | iOS (WebKit repeats permission prompts) and every `getStream` recording (asking for a screen share again always shows the picker) |

On iOS a phone call or Siri takes the microphone away. The recorder then pauses
by itself instead of recording silence (`autoPauseOnInterruption`, on by default
on iOS), and `wasInterrupted` tells the UI why it paused.

### Continuing a stored recording

`resumeSession(sessionId)`, or `<AudioRecorder :resume-session-id="id">`,
continues a stored session: one paused earlier, or one cut off by a crash or a
closed tab. New audio is appended and `recordingTime` continues from the stored
duration. Tag sessions with `sessionSource` (e.g. `"microphone"` or
`"meeting"`) to know which recorder should continue them.

The library allows several stored sessions; whether a new recording may start
while one is paused is up to the app. Transcribo allows one paused recording
and asks to continue or transcribe it first. Get the paused one from
`useAudioSessions().pausedRecording` or `getPausedRecording()`.

::: tip Several tabs
Which page records a session is tracked with the Web Locks API: other tabs
neither list, continue nor delete it while it is recorded. Without Web Locks
(insecure contexts, very old browsers) there is no such coordination.
:::

Paused sessions are subject to the same cleanup as abandoned ones
(`deleteOldSessionsDaysInterval`, `maxSessionsToKeep`). Raise those limits if
paused recordings should be kept longer.

::: warning Safari and the Home Screen app on iOS
A web app added to the Home Screen gets its own storage, separate from Safari.
Recordings paused in Safari cannot be continued in the installed app. Safari may
also clear the storage of sites that are not used for a while, which an
installed app is not subject to. Recommend the installed app for recordings
that are paused for longer.
:::

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
close; put the explanation next to the recorder. A stored pause loses nothing,
so `isBusy` is false while paused and no warning is needed:

```ts
// isBusy from useAudioRecording (or the <AudioRecorder> ref) also covers the
// permission prompt, so a start cannot be lost either
const { isBusy, isProcessing, pauseRecording, pauseSaveFailed } =
    useAudioRecording({ /* ... */ });

// reload and close: the browser's own confirmation
useEventListener("beforeunload", (event: BeforeUnloadEvent) => {
    if (isBusy.value) {
        event.preventDefault();
        event.returnValue = "";
    }
});

// navigation inside the app: pause first, which stores everything; ask only
// if that failed
onBeforeRouteLeave(async () => {
    // a recording being joined for upload would end up abandoned instead
    if (isProcessing.value) return confirmLeave();
    await pauseRecording(); // also joins a pause still being stored
    return pauseSaveFailed.value ? confirmLeave() : true;
});
```

`useEventListener` without a target is safe during server-side rendering.
While `isBusy` is true, also keep dialogs or drawers that hold the recorder from
being dismissed: unmounting the recorder ends the recording.
Transcribo's
[`useRecordingLeaveGuard`](https://github.com/DCC-BS/transcribo-frontend/blob/main/app/composables/useRecordingLeaveGuard.ts)
shows the full version, including the dialog.

## Recovering abandoned recordings

```ts
const { isReady, loadFailed, abandonedRecording, pausedRecording, refresh } =
    useAudioSessions({
        deleteOldSessionsDaysInterval: 30,
        maxSessionsToKeep: 10,
    });
```

`isReady` turns true after the first successful read. If a read fails,
`loadFailed` is set and `refresh()` retries; do not start a new recording before
the list is known, or a paused one may be missed.

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

A custom action can be limited to some sessions with `visible` (for example a
*Continue* action only for sessions that are not `stopped`), and set
`needsAudio: false` to skip joining the MP3. The explorer emits `deleted` when a
session is deleted, so the app can refresh its own list.

Another tab may continue a session while this one exports it. To hand a stored
recording on safely, export it with `exportSession(id)`, which returns the MP3
and its chunk count, and pass that count to `markAsStopped(id, chunkCount)` or
`deleteAbandonedRecording(id, chunkCount)`. They refuse with `SessionChanged`
instead of dropping audio the export did not include. The `deleteSession`
passed to custom actions does this check on its own.

Sessions older than `deleteOldSessionsDaysInterval` days, and all but the newest
`maxSessionsToKeep`, are deleted when the component calling `useAudioSessions`
mounts. Sessions recorded in another tab right now are skipped.

## Reference

Every prop, option, event and exposed property is listed in the
[repository README](https://github.com/DCC-BS/audio-recorder.bs.js#readme).
