# Google Translate Popup Tool

A small electron based app which loads Google Translate page and provides global shortcut enabled popup to quickly open
Google Translate for A to B or B to A languages. Made for macOS primarily but can be adapted to other platforms easily.

# Default Shortcuts

| Shortcut | Description |
|---|---|
| CTRL + CMD + Y | Open window for A to B |
| CTRL + CMD + T | Open window for B to A |
| CTRL + SHIFT + CMD + Y | Open window for A to B and paste clipboard as input |
| CTRL + SHIFT + CMD + T | Open window for B to A and paste clipboard as input |
| CMD + ENTER | Copy Translation and hide window |
| ALT + ENTER | Copy Literal Translation and hide window |
| ESC | Hide window |


# Configuration

Config options can be found at top of `main.js` file:

```js
const options = {
    aLang: 'en',
    bLang: 'ja',
    defaultState: B_TO_A,
    openAtoB: 'ctrl+cmd+y',
    openBtoA: 'ctrl+cmd+t',
    openAndPasteAtoB: 'ctrl+shift+cmd+y',
    openAndPasteBtoA: 'ctrl+shift+cmd+t',
    width: 1200,
    height: 600,
    resetAfter: 60 * 3,
};
```

