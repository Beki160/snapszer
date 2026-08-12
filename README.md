# Snapszer

Mobil snapszer-alkalmazás kezdő változata: **játék a gép ellen**, 20 lapos magyar kártyával.

## Technológia

**Expo SDK 54 + React Native + TypeScript** — ez illik a bolti **Expo Go** apphoz:
- egy kódbázis Androidra és iPhone-ra
- azonnali kipróbálás a telefonon Expo Go-val (QR-kód)
- később App Store / Play Store build is lehetséges

## Mit tud most?

- Kezdőképernyő: egyetlen gomb — **Játék a gép ellen**
- 20 lapos magyar pakli (nincs 7, 8, 9), **valódi magyar kártyaképek**
- 5–5 lap osztása, adu felfordítva, talon lefordítva
- Első játszmában te kezdesz, utána felváltva
- Ütés után húzás a pakliból (győztes először; user esetén meg kell nyomni a paklit)
- Az utolsó adulapot az kapja, akinek már nem jut lap a talonból
- Pontszám az ütésekből; a végén **Nyertél** / **Vesztettél** + Új játék

Még nincs: 20/40 bemondás, 66 bejelentés, ügyes AI — ezek jönnek később.

## Telepítés

Előfeltétel: [Node.js](https://nodejs.org/) (LTS).

```bash
cd C:\repos\github\snapszer
npm install
```

## Kipróbálás a telefonodon

1. Telepítsd az **Expo Go** appot (Play Store / App Store).
2. Indítsd a projektet:

```bash
npm start
```

3. Olvasd be a QR-kódot az Expo Go-val (Android: Expo Go, iPhone: Kamera / Expo Go).
4. Ugyanazon a Wi‑Fi hálózaton legyen a telefon és a számítógép.

Böngészőben (gyors ellenőrzéshez):

```bash
npm run web
```

## Automatikus tesztek

Az elvárásaidra írt tesztek:

```bash
npm test
```

Folyamatos mód fejlesztés közben:

```bash
npm run test:watch
```

A tesztek ellenőrzik többek között:
- 20 lapos pakli (nincs 7/8/9)
- 5–5 lap + adu + talon
- első játszmában a user kezd, utána váltakozás
- user kijátszik → gép következik
- gép lapja megjelenik az ütésben

## Projektstruktúra

```
src/game/          ← játékszabályok (tesztelhető, UI nélkül)
src/components/    ← magyar kártya megjelenítés
src/screens/       ← menü és játékasztal
__tests__/         ← automatikus tesztek
App.tsx            ← app belépési pont
```

## Következő lépések (ötletek)

1. Pontszám és „66!” bejelentés
2. Húsz / negyven bemondás
3. Talon becsukása, aducsere
4. Okosabb gép
5. Valódi magyar kártya fotók / grafikák
