# Shapes

A free shape puzzle for young kids that works offline. Drag the pieces into the grey outline and tap a piece to turn it. When the outline is full, it turns into a picture.

Made for ages 5 and up. There is no timer and no way to lose: a piece that doesn't fit just goes back. Undo takes back the last move, and Start over puts every piece back in the tray.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-shapes/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- About 150 levels: 32 pictures, each cut into pieces a few different ways
- Four levels of difficulty:
  - **Very easy**: three or four small pieces that only need moving
  - **Easy**: four or five pieces that need turning
  - **Medium**: five to seven pieces
  - **Hard**: six to eight pieces, most of four squares
- Drag a piece and it snaps into place where it fits; a light shadow shows where it will land
- Tap a piece to turn it, in the tray or on the board
- A finished outline shows its picture in colour
- The next level is never the one just played
- A count of levels solved at each difficulty
- Picks up where you left off after a reload
- Keeps the screen on while you play
- In English and Croatian, following the phone's language unless you pick one
- Light and dark mode
- No ads, accounts or tracking

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # game and translation tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.

The pictures are drawn as text in `src/lib/pictures.ts`, one letter a square for its colour. `npm run levels` cuts each one into pieces a few ways, keeps the easier cuts, and writes them to `src/levels/`. The tests check that every level is cut from its picture and can be solved.
