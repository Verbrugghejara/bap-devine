# Installatie Setup

## Fysieke setup

1. Open het juten deurtje aan de achterkant van de installatie, onder de knop.
2. Haal de **twee draden** (elk verbonden met een Arduino) eruit.
3. Steek beide draden in de **dongle** (als dit nog niet is gedaan).
4. Sluit de dongle aan op je **laptop of Mac mini**.

## Digitale setup

1. Unzip de opgeleverde code (dubbelklik op het `.zip`-bestand).
2. Open de uitgepakte map in **VS Code**:

   * Klik linksboven op `File` → `Open Folder...`
   * Selecteer de map met de opgeleverde code
3. Open een terminalvenster in VS Code:

   * Klik op `Terminal` → `New Terminal`
4. Kopieer en voer het volgende commando uit in de terminal:

   ```bash
   bash ./setup.sh
   ```

   Hiermee worden alle benodigde packages **geïnstalleerd**.
5. Controleer nu op welke poorten de Arduino’s zijn aangesloten door dit commando uit te voeren:

   ```bash
   ls /dev/cu.*
   ```

   * **macOS**: de poort ziet er bijvoorbeeld zo uit: `/dev/cu.usbmodem14101`
   * **Windows**: de poort ziet er bijvoorbeeld zo uit: `COM3`
6. Open het bestand `./sensors/serial_ws_bridge.js` en pas indien nodig de poorten aan:

   * Steek **één Arduino tegelijk** in om te controleren welke poort bij welke Arduino hoort.
   * De **blauwe Arduino = PORT1**
   * De **rode Arduino = PORT2**
7. Zodra de juiste poorten zijn ingesteld, kun je het spel starten met het volgende commando:

   ```bash
   bash ./start.sh
   ```

De installatie is nu klaar voor gebruik.
