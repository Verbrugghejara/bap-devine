import { GameObjects, Scene } from "phaser";
const VICTORY_SWIPE_DURATION = 1400;
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";


export class GameVictory extends Scene {
    title: GameObjects.Text;
    description: GameObjects.Text;
    againButton: GameObjects.Container;
    againText: GameObjects.Text;
    private hasSwipedIn: boolean = false;
    private autoNavigateTimeout: ReturnType<typeof setTimeout> | null = null;
    private timeoutStarted: boolean = false;
    private rotary: any = null;
    private wasButtonPressed: boolean = false;

    constructor() {
        super('GameVictory');
    }

    create() {
                                // Verwijder snelste tijd van vorige dagen uit localStorage
                                if (typeof window !== 'undefined' && window.localStorage) {
                                    const today = new Date();
                                    const yyyy = today.getFullYear();
                                    const mm = String(today.getMonth() + 1).padStart(2, '0');
                                    const dd = String(today.getDate()).padStart(2, '0');
                                    const todayKey = `bestTime_${yyyy}-${mm}-${dd}`;
                                    // Verzamel alle keys die met bestTime_ beginnen en niet van vandaag zijn
                                    const keysToRemove = [];
                                    for (let i = 0; i < window.localStorage.length; i++) {
                                        const key = window.localStorage.key(i);
                                        if (key && key.startsWith('bestTime_') && key !== todayKey) {
                                            keysToRemove.push(key);
                                        }
                                    }
                                    for (const key of keysToRemove) {
                                        window.localStorage.removeItem(key);
                                    }
                                }
                        
                this.rotary = getRotaryClient();
                console.log('GameVictory create() called, timeoutStarted:', this.timeoutStarted);
                // Only set timeout once
                if (!this.timeoutStarted) {
                    this.timeoutStarted = true;
                    console.log('Setting up 30s timeout for first time');
                    
                    this.autoNavigateTimeout = setTimeout(() => {
                        console.log('30 seconds passed! Navigating to MainMenu now...');
                        if (this.autoNavigateTimeout) {
                            clearTimeout(this.autoNavigateTimeout);
                            this.autoNavigateTimeout = null;
                        }
                        this.timeoutStarted = false;
                        console.log('Stopping GameVictory and starting MainMenu');
                        this.sound.stopAll();
                        // Stop en destroy alle troposfeer sounds expliciet
                        const soundManagerAny = this.sound as any;
                        let spaceSounds: any[] = [];
                        if (this.sound.get && this.sound.get('space')) {
                            spaceSounds.push(this.sound.get('space'));
                        }
                        if (Array.isArray(soundManagerAny.sounds)) {
                            spaceSounds = spaceSounds.concat(
                                soundManagerAny.sounds.filter((s: any) => s && s.key === 'space')
                            );
                        }
                        spaceSounds = [...new Set(spaceSounds)];
                        for (const s of spaceSounds) {
                            if (s && s.stop) s.stop();
                            if (s && s.destroy) s.destroy();
                        }
                        this.scene.stop('Game');
                        this.scene.stop('GameVictory');
                        this.scene.start('MainMenu');
                    }, 60000);
                }
        
        const victoryContainer = this.add.container(0, -this.scale.height);
        victoryContainer.setDepth(9999);
        if (this.hasSwipedIn) {
            victoryContainer.y = 0;
        }
        
        const bgVictory = this.add.image(this.scale.width / 2, this.scale.height / 2, 'bg-gamevictory')
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(1);
        victoryContainer.add(bgVictory);
        
        const aliensVictoryImg = this.add.image(this.scale.width / 2, this.scale.height, 'aliens-gamevictory')
            .setOrigin(0.5, 1)
            .setDepth(5)
            .setScale(1);
        victoryContainer.add(aliensVictoryImg);
        // Aliens victory video als overlay (Phaser video object)
        const aliensVictoryVideo = this.add.video(this.scale.width / 2, this.scale.height, 'win-animation')
            .setOrigin(0.5, 1)
            .setDepth(8)
            .setScale(1);
        aliensVictoryVideo.setLoop(true);
        aliensVictoryVideo.setMute(true);
        aliensVictoryVideo.play(true);
        victoryContainer.add(aliensVictoryVideo);
        
        // Title container
        const titleContainer = this.add.container(this.scale.width / 2, this.scale.height / 4 - 250);
        titleContainer.setAlpha(0);
        titleContainer.setDepth(10);
        
        const titleBg = this.add.graphics();
        titleBg.fillStyle(Number('0x' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0')), 1);
        titleBg.fillRoundedRect(
            -520 / 2,
            -160 / 2,
            520,
            160,
            16
        );
        titleBg.setDepth(9);
        
        this.title = this.add.text(
            0,
            0,
            'GOED ZO!',
            {
                fontFamily: 'Bungee',
                fontSize: 80,
                color: '#fff',
            }
        )
            .setOrigin(0.5)
            .setDepth(10);
        
        titleContainer.add([titleBg, this.title]);
        victoryContainer.add(titleContainer);

        // --- SNELSTE TIJD LOGICA ---
        let durationMs = 0;
        if (typeof window !== 'undefined' && (window as any).gameDurationMs) {
            durationMs = (window as any).gameDurationMs;
            // Trek totale pauzetijd af als die beschikbaar is
            if ((window as any).totalPausedDuration) {
                durationMs -= (window as any).totalPausedDuration;
            }
        }
        let bestTimeMs = null;
        let bestTimeDate = null;
        let todayKey = '';
        if (typeof window !== 'undefined' && window.localStorage) {
            // Gebruik yyyy-mm-dd als key
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');
            todayKey = `bestTime_${yyyy}-${mm}-${dd}`;
            const stored = window.localStorage.getItem(todayKey);
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    bestTimeMs = parsed.time;
                    bestTimeDate = parsed.date;
                } catch {}
            }
            // Als er nog geen tijd is, of deze tijd is sneller, sla op
            if (bestTimeMs === null || durationMs < bestTimeMs) {
                bestTimeMs = durationMs;
                bestTimeDate = Date.now();
                window.localStorage.setItem(todayKey, JSON.stringify({ time: bestTimeMs, date: bestTimeDate }));
            }
        }

        // Toon snelste tijd in description
        let bestMinutes = 0;
        let bestSeconds = 0;
        let bestTimeText = 'SNELSTE TIJD:  --:--';
        if (bestTimeMs !== null) {
            const bestTotalSeconds = Math.floor(bestTimeMs / 1000);
            bestMinutes = Math.floor(bestTotalSeconds / 60);
            bestSeconds = bestTotalSeconds % 60;
            bestTimeText = `SNELSTE TIJD:  ${bestMinutes.toString().padStart(2, '0')}:${bestSeconds.toString().padStart(2, '0')}`;
        }
        this.description = this.add.text(
            this.scale.width / 2,
            this.scale.height / 4 - 40,
            bestTimeText,
            {
                fontFamily: 'Bungee',
                fontSize: 48,
                color: '#ffffff',
                fontStyle: 'bold',
                align: 'center',
                wordWrap: { width: 900 }
            }
        )
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0);
        victoryContainer.add(this.description);

        const totalSeconds = Math.floor(durationMs / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        
        const leaderboardWidth = 750;
        const leaderboardHeight = 200;
        const leaderboardY = this.scale.height / 2 - 350;
        
        // Create container for entire leaderboard
        // --- SNELSTE TIJD LOGICA ---
        // (declaraties en berekeningen hierboven, hergebruik variabelen)
        const leaderboardContainer = this.add.container(this.scale.width / 2, leaderboardY);
        leaderboardContainer.setAlpha(0);
        leaderboardContainer.setDepth(12);
        
                    // ...existing code...
        const leaderboardBg = this.add.graphics();
        leaderboardBg.fillStyle(0xffffff, 1);
        leaderboardBg.fillRoundedRect(
            -leaderboardWidth / 2,
            -leaderboardHeight / 2,
            leaderboardWidth,
            leaderboardHeight,
            16
        );
        leaderboardContainer.add(leaderboardBg);
        
        // Row 1 - JIJ
        const row1Y = 0;
        const iconStartX = -leaderboardWidth / 2 + 64;
        const nameX = iconStartX + 200;
        const timeXRight = leaderboardWidth / 2 - 64;
        
        // Trophy icon of second icon afhankelijk van highscore
        let isNewHighscore = false;
        if (bestTimeMs === durationMs || bestTimeMs === null) {
            isNewHighscore = true;
        }
        const iconKey = isNewHighscore ? 'winner' : 'second';
        const trophyIcon1 = this.add.image(iconStartX, row1Y, iconKey)
            .setOrigin(0.5)
            .setScale(0.8);
        leaderboardContainer.add(trophyIcon1);
        
        // Alien icon for JIJ
        const alienIcon1 = this.add.image(iconStartX + 140, row1Y, 'alien')
            .setOrigin(0.5)
            .setScale(0.5);
        leaderboardContainer.add(alienIcon1);
        
        // Name JIJ
        const name1 = this.add.text(nameX, row1Y, 'JIJ', {
            fontFamily: 'Bungee',
            fontSize: 60,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(0, 0.5);
        leaderboardContainer.add(name1);
        
        // Time 1:23
        const time1 = this.add.text(timeXRight, row1Y, `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`, {
            fontFamily: 'Bungee',
            fontSize: 60,
                color: '#' + SFEER_LABELS[4].colors.d.toString(16).padStart(6, '0').toUpperCase(),
        }).setOrigin(1, 0.5);
        leaderboardContainer.add(time1);
        
        victoryContainer.add(leaderboardContainer);

        // (verwijderd: dubbele declaratie aliensVictoryImg)
        
        this.tweens.add({
            targets: victoryContainer,
            y: 0,
            duration: VICTORY_SWIPE_DURATION,
            ease: 'Cubic.easeOut',
            onStart: () => {
                if (!this.hasSwipedIn) {
                    this.hasSwipedIn = true;
                    EventBus.emit('victory-swipe-in');
                }
            },
            onComplete: () => {
                victoryContainer.y = 0;
                this.scene.stop('Game');

                // Na 1 seconde, fade-in aliensVictoryImg en scale groter
                this.time.delayedCall(500, () => {
                    this.tweens.add({
                        targets: aliensVictoryVideo,
                        // alpha: 1,
                        scale: 1.25,
                        duration: 800,
                        ease: 'Cubic.Out',
                        onComplete: () => {
                            // Pop in elements one by one
                            const popDuration = 500;
                            const popDelay = 150;
                            this.sound.play('game-victory', { volume: 0.1 });

                            // Title
                            this.tweens.add({
                                targets: titleContainer,
                                alpha: 1,
                                scale: { from: 0.8, to: 1 },
                                duration: popDuration,
                                ease: 'Back.easeOut'
                            });

                            // Description
                            this.time.delayedCall(popDelay, () => {
                                this.tweens.add({
                                    targets: this.description,
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });

                            // Leaderboard
                            this.time.delayedCall(popDelay * 2, () => {
                                this.tweens.add({
                                    targets: leaderboardContainer,
                                    alpha: 1,
                                    scale: { from: 0.7, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });

                            // Button
                            this.time.delayedCall(popDelay * 3, () => {
                                this.tweens.add({
                                    targets: [this.againButton, this.againText],
                                    alpha: 1,
                                    scale: { from: 0.8, to: 1 },
                                    duration: popDuration,
                                    ease: 'Back.easeOut'
                                });
                            });
                        }
                    });
                });
            }
        });

        const paddingX = 24;
        const paddingY = 16;
        const startText = this.add.text(0, 0, 'Opnieuw', {
            fontFamily: 'Bungee',
            fontSize: '64px',
            color: '#ffffff',
        }).setOrigin(0.5, 0.5).setDepth(50);

        const circleSize = 44;
        const iconMargin = 12;

        const btnContentWidth = circleSize + iconMargin + startText.width;
        const btnWidth = btnContentWidth + 2 * paddingX;
        const btnHeight = startText.height + 2 * paddingY;


        const shadowOffsetY = 8;
        const shadow = this.add.graphics();
        shadow.fillStyle(0xB68302, 1);
        shadow.fillRoundedRect(
            -btnWidth / 2,
            -btnHeight / 2 + shadowOffsetY,
            btnWidth,
            btnHeight,
            16
        );

        const bg = this.add.graphics();
        bg.fillStyle(0xFFB703);
        bg.fillRoundedRect(-btnWidth / 2, -btnHeight / 2, btnWidth, btnHeight, 16);

        // Shining effects
        const shineTopLeft = this.add.graphics();
        shineTopLeft.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft.fillRoundedRect(-btnWidth / 2 +55, -btnHeight / 2 -90, 16.844, 5.877, 3);
        shineTopLeft.rotation = -33.256 * (Math.PI / 180);
        const shineTopLeft2 = this.add.graphics();
        shineTopLeft2.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft2.fillRoundedRect(-btnWidth / 2 +55, -btnHeight / 2 -80, 9, 6, 3);
        shineTopLeft2.rotation = -33.256 * (Math.PI / 180);
        
        const shineBottomRight = this.add.graphics();
        shineBottomRight.fillStyle(0xFFFFFF, 0.4);
        shineBottomRight.fillRoundedRect(btnWidth / 2 -65, btnHeight / 2 + 85, 9, 6, 3);
        shineBottomRight.rotation = -33.256 * (Math.PI / 180);

        
        const circleRadius = circleSize / 3;
        const contentWidth = circleRadius * 2 + iconMargin + startText.width;
        const contentStartX = -contentWidth / 2;
        const circleY = 0;
        const circleX = contentStartX + circleRadius;
        const textX = circleX + circleRadius + iconMargin + startText.width / 2;
        const circle = this.add.graphics();
        circle.lineStyle(6, 0xffffff, 1);
        circle.strokeCircle(circleX, circleY, circleRadius);
        startText.setX(textX);
        startText.setY(0);

        // Button en tekst positie onderaan victoryContainer
        const buttonY = this.scale.height / 2 - 150;
        this.againButton = this.add.container(this.scale.width / 2, buttonY +100, [
            shadow,
            bg,
            shineTopLeft,
            shineTopLeft2,
            shineBottomRight,
            circle,
            startText
        ]);
        this.againButton.setSize(btnWidth, btnHeight);
        this.againButton.setDepth(1100);
        this.againButton.setInteractive({ useHandCursor: true });
        this.againButton.setAlpha(0);
        victoryContainer.add(this.againButton);

        this.againText = this.add.text(
            this.scale.width / 2,
            buttonY,
            'Opnieuw proberen?',
            {
                fontFamily: 'Nunito',
                fontSize: 40,
                color: '#FFFFFF',
                fontStyle: '500'
            }
        )
            .setOrigin(0.5)
            .setDepth(50)
            .setAlpha(0);
        victoryContainer.add(this.againText);

        const triggerButton = () => {
            // Clear the auto-navigate timeout
            if (this.autoNavigateTimeout) {
                clearTimeout(this.autoNavigateTimeout);
                this.autoNavigateTimeout = null;
            }
            this.timeoutStarted = false;

            // Reset alleen de gameDurationMs en totalPausedDuration zodat tijd niet blijft staan
            if (typeof window !== 'undefined') {
                (window as any).gameDurationMs = undefined;
                (window as any).totalPausedDuration = undefined;
            }

            const bg = this.againButton.list[1];
            const shineTopLeft = this.againButton.list[2];
            const shineTopLeft2 = this.againButton.list[3];
            const shineBottomRight = this.againButton.list[4];
            const circle = this.againButton.list[5];
            const startText = this.againButton.list[6];
            this.tweens.add({
                targets: [bg, circle, shineTopLeft, shineTopLeft2, shineBottomRight, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    this.sound.stopAll();
                    if (typeof window !== 'undefined') {
                        (window as any).sfeerProgress = 0;
                    }
                    const soundManagerAny = this.sound as any;
                    let spaceSounds: any[] = [];
                    if (this.sound.get && this.sound.get('space')) {
                        spaceSounds.push(this.sound.get('space'));
                    }
                    if (Array.isArray(soundManagerAny.sounds)) {
                        spaceSounds = spaceSounds.concat(
                            soundManagerAny.sounds.filter((s: any) => s && s.key === 'space')
                        );
                    }
                    spaceSounds = [...new Set(spaceSounds)];
                    for (const s of spaceSounds) {
                        if (s && s.stop) s.stop();
                        if (s && s.destroy) s.destroy();
                    }
                    EventBus.emit('reset-game-ui');
                    EventBus.emit('update-health', 3);
                    EventBus.emit('show-gameui');
                    this.scene.stop('GameVictory');
                    this.scene.start('Game');
                    this.sound.play('button-click');
                }
            });
        };
        this.againButton.on('pointerdown', () => {
            triggerButton();
        });
        // Keyboard event: triggerButton bij enter of spatie
        this.input.keyboard?.on('keydown', (event: KeyboardEvent) => {
            if (event.code === 'Enter' || event.code === 'Space') {
                triggerButton();
            }
        });
    }

    update() {
        // Check hardware button press
        const buttonPressed = this.rotary?.buttonPressed || false;
        
        if (buttonPressed && !this.wasButtonPressed) {
            // Clear the auto-navigate timeout
            if (this.autoNavigateTimeout) {
                clearTimeout(this.autoNavigateTimeout);
                this.autoNavigateTimeout = null;
            }
            this.timeoutStarted = false;

            // Zelfde animatie en logica als pointerdown
            const bg = this.againButton.list[1];
            const shineTopLeft = this.againButton.list[2];
            const shineTopLeft2 = this.againButton.list[3];
            const shineBottomRight = this.againButton.list[4];
            const circle = this.againButton.list[5];
            const startText = this.againButton.list[6];
            this.tweens.add({
                targets: [bg, circle, shineTopLeft, shineTopLeft2, shineBottomRight, startText],
                y: 8,
                duration: 80,
                yoyo: true,
                onComplete: () => {
                    this.sound.stopAll();
                    if (typeof window !== 'undefined') {
                        (window as any).sfeerProgress = 0;
                    }
                    const soundManagerAny = this.sound as any;
                    let spaceSounds: any[] = [];
                    if (this.sound.get && this.sound.get('space')) {
                        spaceSounds.push(this.sound.get('space'));
                    }
                    if (Array.isArray(soundManagerAny.sounds)) {
                        spaceSounds = spaceSounds.concat(
                            soundManagerAny.sounds.filter((s: any) => s && s.key === 'space')
                        );
                    }
                    // Uniek maken
                    spaceSounds = [...new Set(spaceSounds)];
                    for (const s of spaceSounds) {
                        if (s && s.stop) s.stop();
                        if (s && s.destroy) s.destroy();
                    }
                    EventBus.emit('reset-game-ui');
                    EventBus.emit('update-health', 3);
                    EventBus.emit('show-gameui');
                    this.scene.stop('GameVictory');
                    this.scene.start('Game');
                    this.sound.play('button-click');
                }
            });
        }
        
        this.wasButtonPressed = buttonPressed;
    }

    shutdown() {
        console.log('GameVictory shutdown() called');
        if (this.autoNavigateTimeout) {
            clearTimeout(this.autoNavigateTimeout);
            this.autoNavigateTimeout = null;
        }
        this.timeoutStarted = false;
    }
}