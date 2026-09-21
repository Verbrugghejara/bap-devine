import { GameObjects, Scene } from "phaser";
import { EventBus } from "../EventBus";
import { SFEER_LABELS } from "../utils/sfeerLabels";
import { getRotaryClient } from "../utils/rotaryClientSingleton";

const VICTORY_SWIPE_DURATION = 1400;
const AUTO_NAVIGATE_DELAY = 60000;

export class GameVictory extends Scene {
    title!: GameObjects.Text;
    description!: GameObjects.Text;
    againButton!: GameObjects.Container;
    againText!: GameObjects.Text;

    private hasSwipedIn: boolean = false;
    private autoNavigateTimeout: ReturnType<typeof setTimeout> | null = null;
    private rotary: any = null;
    private wasButtonPressed: boolean = false;
    private isNavigating: boolean = false;

    constructor() {
        super("GameVictory");
    }

    create() {
        this.isNavigating = false;
        this.wasButtonPressed = false;

        // ---------------------------------------------------------
        // DAILY BEST TIME CLEANUP
        // ---------------------------------------------------------

        if (typeof window !== "undefined" && window.localStorage) {
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");

            const todayKey = `bestTime_${yyyy}-${mm}-${dd}`;

            const keysToRemove: string[] = [];

            for (let i = 0; i < window.localStorage.length; i++) {
                const key = window.localStorage.key(i);

                if (
                    key &&
                    key.startsWith("bestTime_") &&
                    key !== todayKey
                ) {
                    keysToRemove.push(key);
                }
            }

            for (const key of keysToRemove) {
                window.localStorage.removeItem(key);
            }
        }

        this.rotary = getRotaryClient();

        // ---------------------------------------------------------
        // AUTO NAVIGATION TIMER
        // ---------------------------------------------------------

        this.startAutoNavigateTimer();

        // ---------------------------------------------------------
        // VICTORY CONTAINER
        // ---------------------------------------------------------

        const victoryContainer = this.add.container(
            0,
            -this.scale.height
        );

        victoryContainer.setDepth(9999);

        if (this.hasSwipedIn) {
            victoryContainer.y = 0;
        }

        // ---------------------------------------------------------
        // BACKGROUND
        // ---------------------------------------------------------

        const bgVictory = this.add
            .image(
                this.scale.width / 2,
                this.scale.height / 2,
                "bg-gamevictory"
            )
            .setOrigin(0.5, 0.5)
            .setDisplaySize(this.scale.width, this.scale.height)
            .setDepth(1);

        victoryContainer.add(bgVictory);

        // ---------------------------------------------------------
        // ALIENS
        // ---------------------------------------------------------

        const aliensVictoryImg = this.add
            .image(
                this.scale.width / 2,
                this.scale.height,
                "aliens-gamevictory"
            )
            .setOrigin(0.5, 1)
            .setDepth(5)
            .setScale(1);

        victoryContainer.add(aliensVictoryImg);

        // ---------------------------------------------------------
        // VICTORY VIDEO
        // ---------------------------------------------------------

        const aliensVictoryVideo = this.add
            .video(
                this.scale.width / 2,
                this.scale.height,
                "win-animation"
            )
            .setOrigin(0.5, 1)
            .setDepth(8)
            .setScale(1);

        aliensVictoryVideo.setLoop(true);
        aliensVictoryVideo.setMute(true);
        aliensVictoryVideo.play(true);

        victoryContainer.add(aliensVictoryVideo);

        // ---------------------------------------------------------
        // TITLE
        // ---------------------------------------------------------

        const titleContainer = this.add.container(
            this.scale.width / 2,
            this.scale.height / 4 - 250
        );

        titleContainer.setAlpha(0);
        titleContainer.setDepth(10);

        const titleBg = this.add.graphics();

        titleBg.fillStyle(
            Number(
                "0x" +
                SFEER_LABELS[4].colors.d
                    .toString(16)
                    .padStart(6, "0")
            ),
            1
        );

        titleBg.fillRoundedRect(
            -520 / 2,
            -160 / 2,
            520,
            160,
            16
        );

        titleBg.setDepth(9);

        this.title = this.add
            .text(
                0,
                0,
                "GOED ZO!",
                {
                    fontFamily: "Bungee",
                    fontSize: 80,
                    color: "#fff",
                }
            )
            .setOrigin(0.5)
            .setDepth(10);

        titleContainer.add([titleBg, this.title]);
        victoryContainer.add(titleContainer);

        // ---------------------------------------------------------
        // GAME DURATION
        // ---------------------------------------------------------

        let durationMs = 0;

        if (typeof window !== 'undefined') {
            const storedDuration = (window as any).gameDurationMs;

            if (typeof storedDuration === 'number') {
                durationMs = Math.max(0, storedDuration);
            }
        }

        // ---------------------------------------------------------
        // BEST TIME
        // ---------------------------------------------------------

        let bestTimeMs: number | null = null;
        let bestTimeDate: number | null = null;
        let isNewHighscore = false;

        let todayKey = "";

        if (
            typeof window !== "undefined" &&
            window.localStorage
        ) {
            const today = new Date();

            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, "0");
            const dd = String(today.getDate()).padStart(2, "0");

            todayKey = `bestTime_${yyyy}-${mm}-${dd}`;

            const stored =
                window.localStorage.getItem(todayKey);

            if (stored) {
                try {
                    const parsed = JSON.parse(stored);

                    if (typeof parsed.time === "number") {
                        bestTimeMs = parsed.time;
                    }

                    if (typeof parsed.date === "number") {
                        bestTimeDate = parsed.date;
                    }
                } catch {
                    // Ongeldige localStorage-data negeren.
                    bestTimeMs = null;
                    bestTimeDate = null;
                }
            }

            // -----------------------------------------------------
            // NEW HIGHSCORE
            // -----------------------------------------------------

            if (
                bestTimeMs === null ||
                durationMs < bestTimeMs
            ) {
                isNewHighscore = true;

                bestTimeMs = durationMs;
                bestTimeDate = Date.now();

                window.localStorage.setItem(
                    todayKey,
                    JSON.stringify({
                        time: bestTimeMs,
                        date: bestTimeDate,
                    })
                );
            }
        }

        // ---------------------------------------------------------
        // BEST TIME TEXT
        // ---------------------------------------------------------

        let bestTimeText = "SNELSTE TIJD:  --:--";

        if (bestTimeMs !== null) {
            const bestTotalSeconds =
                Math.floor(bestTimeMs / 1000);

            const bestMinutes =
                Math.floor(bestTotalSeconds / 60);

            const bestSeconds =
                bestTotalSeconds % 60;

            bestTimeText =
                `SNELSTE TIJD:  ` +
                `${bestMinutes
                    .toString()
                    .padStart(2, "0")}:` +
                `${bestSeconds
                    .toString()
                    .padStart(2, "0")}`;
        }

        this.description = this.add
            .text(
                this.scale.width / 2,
                this.scale.height / 4 - 40,
                bestTimeText,
                {
                    fontFamily: "Bungee",
                    fontSize: 48,
                    color: "#ffffff",
                    fontStyle: "bold",
                    align: "center",
                    wordWrap: {
                        width: 900,
                    },
                }
            )
            .setOrigin(0.5)
            .setDepth(11)
            .setAlpha(0);

        victoryContainer.add(this.description);

        // ---------------------------------------------------------
        // CURRENT TIME
        // ---------------------------------------------------------

        const totalSeconds =
            Math.floor(durationMs / 1000);

        const minutes =
            Math.floor(totalSeconds / 60);

        const seconds =
            totalSeconds % 60;

        // ---------------------------------------------------------
        // LEADERBOARD
        // ---------------------------------------------------------

        const leaderboardWidth = 750;
        const leaderboardHeight = 200;

        const leaderboardY =
            this.scale.height / 2 - 350;

        const leaderboardContainer =
            this.add.container(
                this.scale.width / 2,
                leaderboardY
            );

        leaderboardContainer.setAlpha(0);
        leaderboardContainer.setDepth(12);

        const leaderboardBg =
            this.add.graphics();

        leaderboardBg.fillStyle(
            0xffffff,
            1
        );

        leaderboardBg.fillRoundedRect(
            -leaderboardWidth / 2,
            -leaderboardHeight / 2,
            leaderboardWidth,
            leaderboardHeight,
            16
        );

        leaderboardContainer.add(
            leaderboardBg
        );

        const row1Y = 0;

        const iconStartX =
            -leaderboardWidth / 2 + 64;

        const nameX =
            iconStartX + 200;

        const timeXRight =
            leaderboardWidth / 2 - 64;

        // ---------------------------------------------------------
        // TROPHY
        // ---------------------------------------------------------

        const iconKey =
            isNewHighscore
                ? "winner"
                : "second";

        const trophyIcon1 =
            this.add
                .image(
                    iconStartX,
                    row1Y,
                    iconKey
                )
                .setOrigin(0.5)
                .setScale(0.8);

        leaderboardContainer.add(
            trophyIcon1
        );

        // ---------------------------------------------------------
        // ALIEN ICON
        // ---------------------------------------------------------

        const alienIcon1 =
            this.add
                .image(
                    iconStartX + 140,
                    row1Y,
                    "alien"
                )
                .setOrigin(0.5)
                .setScale(0.5);

        leaderboardContainer.add(
            alienIcon1
        );

        // ---------------------------------------------------------
        // PLAYER NAME
        // ---------------------------------------------------------

        const sfeerColor =
            "#" +
            SFEER_LABELS[4].colors.d
                .toString(16)
                .padStart(6, "0")
                .toUpperCase();

        const name1 =
            this.add
                .text(
                    nameX,
                    row1Y,
                    "JIJ",
                    {
                        fontFamily: "Bungee",
                        fontSize: 60,
                        color: sfeerColor,
                    }
                )
                .setOrigin(0, 0.5);

        leaderboardContainer.add(name1);

        // ---------------------------------------------------------
        // PLAYER TIME
        // ---------------------------------------------------------

        const time1 =
            this.add
                .text(
                    timeXRight,
                    row1Y,
                    `${minutes
                        .toString()
                        .padStart(2, "0")}:` +
                    `${seconds
                        .toString()
                        .padStart(2, "0")}`,
                    {
                        fontFamily: "Bungee",
                        fontSize: 60,
                        color: sfeerColor,
                    }
                )
                .setOrigin(1, 0.5);

        leaderboardContainer.add(time1);

        victoryContainer.add(
            leaderboardContainer
        );

        // ---------------------------------------------------------
        // SWIPE-IN
        // ---------------------------------------------------------

        this.tweens.add({
            targets: victoryContainer,
            y: 0,
            duration: VICTORY_SWIPE_DURATION,
            ease: "Cubic.easeOut",

            onStart: () => {
                if (!this.hasSwipedIn) {
                    this.hasSwipedIn = true;
                    EventBus.emit(
                        "victory-swipe-in"
                    );
                }
            },

            onComplete: () => {
                victoryContainer.y = 0;

                this.scene.stop("Game");

                this.time.delayedCall(500, () => {
                    this.tweens.add({
                        targets: aliensVictoryVideo,
                        scale: 1.25,
                        duration: 800,
                        ease: "Cubic.Out",

                        onComplete: () => {
                            const popDuration = 500;
                            const popDelay = 150;

                            this.sound.play(
                                "game-victory",
                                {
                                    volume: 0.1,
                                }
                            );

                            // TITLE
                            this.tweens.add({
                                targets: titleContainer,
                                alpha: 1,
                                scale: {
                                    from: 0.8,
                                    to: 1,
                                },
                                duration: popDuration,
                                ease: "Back.easeOut",
                            });

                            // DESCRIPTION
                            this.time.delayedCall(
                                popDelay,
                                () => {
                                    this.tweens.add({
                                        targets:
                                            this.description,
                                        alpha: 1,
                                        scale: {
                                            from: 0.8,
                                            to: 1,
                                        },
                                        duration:
                                            popDuration,
                                        ease:
                                            "Back.easeOut",
                                    });
                                }
                            );

                            // LEADERBOARD
                            this.time.delayedCall(
                                popDelay * 2,
                                () => {
                                    this.tweens.add({
                                        targets:
                                            leaderboardContainer,
                                        alpha: 1,
                                        scale: {
                                            from: 0.7,
                                            to: 1,
                                        },
                                        duration:
                                            popDuration,
                                        ease:
                                            "Back.easeOut",
                                    });
                                }
                            );

                            // BUTTON
                            this.time.delayedCall(
                                popDelay * 3,
                                () => {
                                    this.tweens.add({
                                        targets: [
                                            this.againButton,
                                            this.againText,
                                        ],
                                        alpha: 1,
                                        scale: {
                                            from: 0.8,
                                            to: 1,
                                        },
                                        duration:
                                            popDuration,
                                        ease:
                                            "Back.easeOut",
                                    });
                                }
                            );
                        },
                    });
                });
            },
        });

        // ---------------------------------------------------------
        // AGAIN BUTTON
        // ---------------------------------------------------------

        const paddingX = 24;
        const paddingY = 16;

        const startText =
            this.add
                .text(
                    0,
                    0,
                    "Opnieuw",
                    {
                        fontFamily: "Bungee",
                        fontSize: "64px",
                        color: "#ffffff",
                    }
                )
                .setOrigin(0.5, 0.5)
                .setDepth(50);

        const circleSize = 44;
        const iconMargin = 12;

        const btnContentWidth =
            circleSize +
            iconMargin +
            startText.width;

        const btnWidth =
            btnContentWidth +
            2 * paddingX;

        const btnHeight =
            startText.height +
            2 * paddingY;

        const shadowOffsetY = 8;

        const shadow =
            this.add.graphics();

        shadow.fillStyle(
            0xb68302,
            1
        );

        shadow.fillRoundedRect(
            -btnWidth / 2,
            -btnHeight / 2 +
            shadowOffsetY,
            btnWidth,
            btnHeight,
            16
        );

        const bg =
            this.add.graphics();

        bg.fillStyle(
            0xffb703
        );

        bg.fillRoundedRect(
            -btnWidth / 2,
            -btnHeight / 2,
            btnWidth,
            btnHeight,
            16
        );

        // ---------------------------------------------------------
        // BUTTON SHINE
        // ---------------------------------------------------------

        const shineTopLeft =
            this.add.graphics();

        shineTopLeft.fillStyle(
            0xffffff,
            0.4
        );

        shineTopLeft.fillRoundedRect(
            -btnWidth / 2 + 55,
            -btnHeight / 2 - 90,
            16.844,
            5.877,
            3
        );

        shineTopLeft.rotation =
            -33.256 * (Math.PI / 180);

        const shineTopLeft2 =
            this.add.graphics();

        shineTopLeft2.fillStyle(
            0xffffff,
            0.4
        );

        shineTopLeft2.fillRoundedRect(
            -btnWidth / 2 + 55,
            -btnHeight / 2 - 80,
            9,
            6,
            3
        );

        shineTopLeft2.rotation =
            -33.256 * (Math.PI / 180);

        const shineBottomRight =
            this.add.graphics();

        shineBottomRight.fillStyle(
            0xffffff,
            0.4
        );

        shineBottomRight.fillRoundedRect(
            btnWidth / 2 - 65,
            btnHeight / 2 + 85,
            9,
            6,
            3
        );

        shineBottomRight.rotation =
            -33.256 * (Math.PI / 180);

        // ---------------------------------------------------------
        // BUTTON CIRCLE
        // ---------------------------------------------------------

        const circleRadius =
            circleSize / 3;

        const contentWidth =
            circleRadius * 2 +
            iconMargin +
            startText.width;

        const contentStartX =
            -contentWidth / 2;

        const circleY = 0;

        const circleX =
            contentStartX +
            circleRadius;

        const textX =
            circleX +
            circleRadius +
            iconMargin +
            startText.width / 2;

        const circle =
            this.add.graphics();

        circle.lineStyle(
            6,
            0xffffff,
            1
        );

        circle.strokeCircle(
            circleX,
            circleY,
            circleRadius
        );

        startText.setX(textX);
        startText.setY(0);

        const buttonY =
            this.scale.height / 2 - 150;

        this.againButton =
            this.add.container(
                this.scale.width / 2,
                buttonY + 100,
                [
                    shadow,
                    bg,
                    shineTopLeft,
                    shineTopLeft2,
                    shineBottomRight,
                    circle,
                    startText,
                ]
            );

        this.againButton.setSize(
            btnWidth,
            btnHeight
        );

        this.againButton.setDepth(1100);

        this.againButton.setInteractive({
            useHandCursor: true,
        });

        this.againButton.setAlpha(0);

        victoryContainer.add(
            this.againButton
        );

        // ---------------------------------------------------------
        // BUTTON SUBTEXT
        // ---------------------------------------------------------

        this.againText =
            this.add
                .text(
                    this.scale.width / 2,
                    buttonY,
                    "Opnieuw proberen?",
                    {
                        fontFamily: "Nunito",
                        fontSize: 40,
                        color: "#FFFFFF",
                        fontStyle: "500",
                    }
                )
                .setOrigin(0.5)
                .setDepth(50)
                .setAlpha(0);

        victoryContainer.add(
            this.againText
        );

        // ---------------------------------------------------------
        // POINTER
        // ---------------------------------------------------------

        this.againButton.on(
            "pointerdown",
            this.triggerButton,
            this
        );

        // ---------------------------------------------------------
        // KEYBOARD
        // ---------------------------------------------------------

        this.input.keyboard?.on(
            "keydown",
            this.handleKeyDown,
            this
        );
    }

    // =============================================================
    // AUTO NAVIGATION
    // =============================================================

    private startAutoNavigateTimer() {
        this.clearAutoNavigateTimer();

        this.autoNavigateTimeout =
            setTimeout(() => {
                this.autoNavigateTimeout = null;

                if (this.isNavigating) {
                    return;
                }

                this.isNavigating = true;

                this.sound.stopAll();

                this.destroySpaceSounds();

                this.scene.stop("Game");
                this.scene.stop("GameVictory");
                this.scene.start("MainMenu");
            }, AUTO_NAVIGATE_DELAY);
    }

    private clearAutoNavigateTimer() {
        if (this.autoNavigateTimeout) {
            clearTimeout(
                this.autoNavigateTimeout
            );

            this.autoNavigateTimeout = null;
        }
    }

    // =============================================================
    // BUTTON INPUT
    // =============================================================

    private handleKeyDown(event: KeyboardEvent) {
        if (
            event.code === "Enter" ||
            event.code === "Space"
        ) {
            this.triggerButton();
        }
    }

    private triggerButton = () => {
        // Voorkom dubbele navigatie vanuit
        // pointer + keyboard + rotary.
        if (this.isNavigating) {
            return;
        }

        this.isNavigating = true;

        // Stop automatische navigatie.
        this.clearAutoNavigateTimer();

        // Reset game timer data.
        if (typeof window !== "undefined") {
            (window as any).gameDurationMs =
                undefined;

            (window as any).totalPausedDuration =
                undefined;
        }

        // ---------------------------------------------------------
        // BUTTON PRESS ANIMATION
        // ---------------------------------------------------------

        const bg =
            this.againButton.list[1];

        const shineTopLeft =
            this.againButton.list[2];

        const shineTopLeft2 =
            this.againButton.list[3];

        const shineBottomRight =
            this.againButton.list[4];

        const circle =
            this.againButton.list[5];

        const startText =
            this.againButton.list[6];

        this.tweens.add({
            targets: [
                bg,
                circle,
                shineTopLeft,
                shineTopLeft2,
                shineBottomRight,
                startText,
            ],

            y: 8,
            duration: 80,
            yoyo: true,

            onComplete: () => {
                this.sound.stopAll();

                if (typeof window !== "undefined") {
                    (window as any).sfeerProgress = 0;
                }

                this.destroySpaceSounds();

                EventBus.emit(
                    "reset-game-ui"
                );

                EventBus.emit(
                    "update-health",
                    3
                );

                EventBus.emit(
                    "show-gameui"
                );

                this.scene.stop(
                    "GameVictory"
                );

                this.scene.start("Game");

                this.sound.play(
                    "button-click"
                );
            },
        });
    };

    // =============================================================
    // SPACE SOUND CLEANUP
    // =============================================================

    private destroySpaceSounds() {
        const soundManagerAny =
            this.sound as any;

        let spaceSounds: any[] = [];

        if (
            this.sound.get &&
            this.sound.get("space")
        ) {
            spaceSounds.push(
                this.sound.get("space")
            );
        }

        if (
            Array.isArray(
                soundManagerAny.sounds
            )
        ) {
            spaceSounds =
                spaceSounds.concat(
                    soundManagerAny.sounds.filter(
                        (s: any) =>
                            s &&
                            s.key === "space"
                    )
                );
        }

        spaceSounds = [
            ...new Set(spaceSounds),
        ];

        for (const sound of spaceSounds) {
            if (
                sound &&
                sound.stop
            ) {
                sound.stop();
            }

            if (
                sound &&
                sound.destroy
            ) {
                sound.destroy();
            }
        }
    }

    // =============================================================
    // UPDATE
    // =============================================================

    update() {
        const buttonPressed =
            this.rotary?.buttonPressed ||
            false;

        // Alleen reageren op false -> true.
        if (
            buttonPressed &&
            !this.wasButtonPressed &&
            !this.isNavigating
        ) {
            this.triggerButton();
        }

        this.wasButtonPressed =
            buttonPressed;
    }

    // =============================================================
    // SHUTDOWN
    // =============================================================

    shutdown() {
        // Timeout opruimen.
        this.clearAutoNavigateTimer();

        // Keyboard listener opruimen.
        this.input.keyboard?.off(
            "keydown",
            this.handleKeyDown,
            this
        );

        // Pointer listener opruimen.
        if (this.againButton) {
            this.againButton.off(
                "pointerdown",
                this.triggerButton,
                this
            );
        }

        this.wasButtonPressed = false;
        this.isNavigating = false;
    }
}