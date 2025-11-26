function angleDiff(a: number, b: number): number {
    let diff = a - b;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
}

import { getRotaryClient, closeRotaryClient } from '../utils/rotaryClientSingleton';
import { SFEER_LABELS } from '../utils/sfeerLabels';

import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene {
        private inactivityTimeout: any = null;
    huidigeSfeerIndex: number = 0;

    sfeerRects: Phaser.GameObjects.Rectangle[] = [];
    private sfeerBaseY: number[] = [];
    sfeerHoogtes: number[] = [];

    ballon: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody | null = null;
    ballonHealth: number = 3;
    ballonInvulnerable: boolean = false;

    birds: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody[] = [];
    birdDead: boolean = false;
    birdSpawnTimer: Phaser.Time.TimerEvent | null = null;

    rotary: any = null;
    cursors: Phaser.Types.Input.Keyboard.CursorKeys | null = null;

    private sfeerOffsetY: number = 0;

    constructor() {
        super('Game');
    }

    checkOverlap(a: any, b: any): boolean {
        if (!a || !b) return false;

        let ab = (a.getBounds) ? a.getBounds() : a.body.getBounds();
        let bb = (b.getBounds) ? b.getBounds() : b.body.getBounds();

        const marginA = 20;
        const marginB = 20;

        ab = new Phaser.Geom.Rectangle(
            ab.x + marginA,
            ab.y + marginA,
            ab.width - 2 * marginA,
            ab.height - 2 * marginA
        );

        bb = new Phaser.Geom.Rectangle(
            bb.x + marginB,
            bb.y + marginB,
            bb.width - 2 * marginB,
            bb.height - 2 * marginB
        );

        return Phaser.Geom.Intersects.RectangleToRectangle(ab, bb);
    }

    damageBallon() {
        this.ballonHealth--;
        this.ballonInvulnerable = true;

        EventBus.emit('update-health', this.ballonHealth);

        if (this.ballon) {
            this.tweens.add({
                targets: this.ballon,
                alpha: 0.3,
                yoyo: true,
                repeat: 5,
                duration: 80,
                onComplete: () => {
                    if (this.ballon) this.ballon.alpha = 1;
                    this.ballonInvulnerable = false;
                }
            });
        }

        if (this.ballonHealth <= 0) {
            EventBus.emit('gameover-ui', this.huidigeSfeerIndex);
            this.time.delayedCall(1000, () => {
                this.scene.pause();
            });
        }
    }

    create() {
            // Inactiviteitstimer starten
            // this.resetInactivityTimeout();
        this.ballonHealth = 3;
        this.rotary = getRotaryClient();
        if (this.physics && this.physics.world) {
            this.physics.world.setBounds(0, 0, this.scale.width, this.scale.height);
        }

        this.sfeerHoogtes = [
            // this.scale.height * 1.5,  // Troposfeer
            // this.scale.height * 2.5,        // Stratosfeer
            // this.scale.height * 2,  // Mesosfeer
            // this.scale.height * 5,    // Thermosfeer
            // this.scale.height * 10     // Exosfeer
            this.scale.height * 1.5 ,  // Troposfeer
            this.scale.height * 1.5 ,        // Stratosfeer
            this.scale.height * 1.5,  // Mesosfeer
            this.scale.height * 1.5,    // Thermosfeer
            this.scale.height * 1.5      // Exosfeer
        ];

        this.sfeerRects = [];
        this.sfeerBaseY = [];
        let worldY = this.scale.height - this.sfeerHoogtes[0] / 2;
        for (let i = 0; i < this.sfeerHoogtes.length; i++) {
            const hoogte = this.sfeerHoogtes[i];
            const kleur = SFEER_LABELS[i].colors.a;
            let kleurInt: number = 0xffffff;
            if (typeof kleur === 'number') {
                kleurInt = kleur;
            } else {
                kleurInt = 0xffffff;
            }
            const baseCenterY = worldY;
            this.sfeerBaseY.push(baseCenterY);
            const rect = this.add.rectangle(
                this.scale.width / 2,
                baseCenterY,
                this.scale.width,
                hoogte,
                kleurInt
            ).setDepth(-100);
            rect.width = this.scale.width;
            rect.height = hoogte;
            this.sfeerRects.push(rect);
            if (i < this.sfeerHoogtes.length - 1) {
                worldY -= (hoogte / 2) + (this.sfeerHoogtes[i + 1] / 2);
            }
        }

        this.sfeerOffsetY = 0;

        try {
            this.ballon = this.physics.add.sprite(
                this.scale.width / 2,
                this.scale.height * 0.85,
                "ballon"
            ).setScale(0.5).setDepth(50) as any;
            (this.ballon.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            this.ballon.setCollideWorldBounds(true);
            if ((this.ballon as any).setScrollFactor) {
                (this.ballon as any).setScrollFactor(0, 0);
            }
        } catch (e) {
            console.error("[Game] Kan ballon niet aanmaken!", e);
        }

        this.birds = [];
        this.spawnBird();
        this.birdSpawnTimer = this.time.addEvent({
            delay: Phaser.Math.Between(2500, 4000), // minder vogels: hogere delay
            loop: true,
            callback: () => {
                this.spawnBird();
                // De delay is readonly, dus we kunnen deze niet aanpassen per callback
            }
        });

        this.cursors = this.input.keyboard?.createCursorKeys() || null;

        EventBus.emit('current-scene-ready', this);
        // Luister naar rotary events om inactiviteit te resetten
        // EventBus.on('rotary1-move', this.resetInactivityTimeout, this);
        // EventBus.on('rotary2-move', this.resetInactivityTimeout, this);
        }

        resetInactivityTimeout() {
            console.log("Resetting inactivity timeout");
            clearTimeout(this.inactivityTimeout);
            this.inactivityTimeout = setTimeout(() => {
                EventBus.emit('change-scene', 'MainMenu');
            }, 10000);
    }

    spawnBird() {
        if (!this.textures.exists('bird-walk')) {
            console.error("[Game] 'bird-walk' ontbreekt!");
            return;
        }
        try {
            const fromLeft = Math.random() < 0.5;
            const x = fromLeft ? -50 : this.scale.width + 50;
            const y = -40;
            const bird = this.physics.add.sprite(
                x,
                y,
                "bird-walk"
            ).setScale(fromLeft ? 4 : -4, 4).setDepth(50).setOrigin(0.5);
            (bird.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);
            bird.play("bird-walk");
            const speed = Phaser.Math.Between(4, 8); // hogere minimumsnelheid
            (bird as any).direction = fromLeft ? 1 : -1;
            (bird as any).speed = speed;
            this.birds.push(bird);
        } catch (e) {
            console.error("[Game] Vogel kan niet gemaakt worden!", e);
        }
    }

    update() {
        const scrollSpeed = 7;

        this.sfeerOffsetY += scrollSpeed; // Increase offset to move down

            for (let i = 0; i < this.sfeerRects.length; i++) {
                const baseY = this.sfeerBaseY[i];
                this.sfeerRects[i].y = baseY + this.sfeerOffsetY;
            }

        for (const bird of this.birds) {
            bird.y += scrollSpeed;
        }

        const centerScreenY = this.scale.height / 2;
        const centerWorldY = centerScreenY - this.sfeerOffsetY;

        let sfeerIndex = this.sfeerBaseY.length - 1; // default: laatste laag
        for (let i = 0; i < this.sfeerBaseY.length; i++) {
            const baseCenterY = this.sfeerBaseY[i];
            const hoogte = this.sfeerHoogtes[i];
            const top = baseCenterY - hoogte / 2;
            const bottom = baseCenterY + hoogte / 2;
            if (centerWorldY >= top && centerWorldY < bottom) {
                sfeerIndex = i;
                break;
            }
        }

        if (this.huidigeSfeerIndex !== sfeerIndex) {
            this.huidigeSfeerIndex = sfeerIndex;
            EventBus.emit('update-sfeer', SFEER_LABELS[sfeerIndex].naam);
        }

        EventBus.emit('update-sfeer-index', sfeerIndex);

        const totalHeight = this.sfeerHoogtes.reduce((a, b) => a + b, 0);
        const totalScrollable = totalHeight - this.scale.height;
        const safeTotal = Math.max(1, totalScrollable);
        const scrolled = Math.min(this.sfeerOffsetY, safeTotal);
        const progress = Math.min(Math.max(scrolled / safeTotal, 0), 1);

        EventBus.emit('update-sfeer-progress', progress);

        if (progress >= 1) {
            EventBus.emit('gamevictory-ui', this.huidigeSfeerIndex);
            this.scene.pause();
            return;
        }

        if (this.ballon) {
            if (this.rotary) {
                const angles = this.rotary.lastAngles;
                const prevs = this.rotary.prevAngles;
                const threshold = 2;

                // Tel hoeveel sensoren actief zijn
                const sensor1Active = angles[0] !== null && prevs[0] !== null && Math.abs(angleDiff(angles[0], prevs[0])) > threshold;
                const sensor2Active = angles[1] !== null && prevs[1] !== null && Math.abs(angleDiff(angles[1], prevs[1])) > threshold;
                const activeCount = (sensor1Active ? 1 : 0) + (sensor2Active ? 1 : 0);

                if (sensor1Active) {
                    EventBus.emit('rotary1-move');
                    // this.resetInactivityTimeout();
                    if (activeCount === 1) {
                        // Slechts één sensor actief: altijd naar links
                        this.ballon.x += 4;
                    } else {
                        // Beide sensoren actief: links/rechts afhankelijk van draairichting
                        const diff1 = angleDiff(angles[0], prevs[0]);
                        if (diff1 < -threshold) this.ballon.x -= 4;
                        if (diff1 > threshold) this.ballon.x += 4;
                    }
                }
                if (sensor2Active) {
                    EventBus.emit('rotary2-move');
                    // this.resetInactivityTimeout();
                    if (activeCount === 1) {
                        // Slechts één sensor actief: altijd naar links
                        this.ballon.x -= 4;
                    } else {
                        // Beide sensoren actief: links/rechts afhankelijk van draairichting
                        const diff2 = angleDiff(angles[1], prevs[1]);
                        if (diff2 < -threshold) this.ballon.x -= 4;
                        if (diff2 > threshold) this.ballon.x += 4;
                    }
                }
            }

            if (this.cursors) {
                if (this.cursors.left?.isDown) this.ballon.x -= 10;
                if (this.cursors.right?.isDown) this.ballon.x += 10;
            }

            // Ballon mag niet buiten het scherm komen (volledige breedte, nauwkeuriger met getBounds)
            const bounds = this.ballon.getBounds();
            if (bounds.left < 0) this.ballon.x += -bounds.left;
            if (bounds.right > this.scale.width) this.ballon.x -= (bounds.right - this.scale.width);
        }

        if (this.ballon) {
            for (let i = this.birds.length - 1; i >= 0; i--) {
                const bird = this.birds[i];
                if (!(bird as any).direction) (bird as any).direction = 1;
                const speed = (bird as any).speed || 5;
                bird.x += speed * (bird as any).direction;

                // Keer om bij de rand van het scherm (altijd zichtbaar)
                if ((bird as any).direction === 1 && bird.x >= this.scale.width - bird.displayWidth / 2) {
                    (bird as any).direction = -1;
                    bird.setScale(-4, 4);
                    bird.x = this.scale.width - bird.displayWidth / 2; // corrigeer positie
                }
                if ((bird as any).direction === -1 && bird.x <= bird.displayWidth / 2) {
                    (bird as any).direction = 1;
                    bird.setScale(4, 4);
                    bird.x = bird.displayWidth / 2; // corrigeer positie
                }

                if (!this.ballonInvulnerable && this.checkOverlap(bird, this.ballon)) {
                    this.damageBallon();
                    this.ballonInvulnerable = true;
                    this.time.delayedCall(1000, () => {
                        this.ballonInvulnerable = false;
                    });
                    const x = bird.x;
                    const y = bird.y;
                    const parent = bird.parentContainer;
                    bird.destroy();
                    const deadBird = this.physics.add.sprite(x, y, "bird-walk")
                        .setScale(4)
                        .setDepth(50)
                        .setOrigin(0.5);
                    if (parent) parent.add(deadBird);
                    deadBird.play("bird-death");
                    const body = deadBird.body as Phaser.Physics.Arcade.Body;
                    body.setAllowGravity(true);
                    body.setGravityY(800);
                    body.setVelocityY(Phaser.Math.Between(250, 400));
                    body.setVelocityX(Phaser.Math.Between(-50, 50));
                    body.setBounce(0.2);
                    this.time.addEvent({
                        delay: 100,
                        loop: true,
                        callback: () => {
                            if (deadBird && deadBird.y > this.scale.height + 100) {
                                this.tweens.add({
                                    targets: deadBird!,
                                    alpha: 0,
                                    duration: 400,
                                    onComplete: () => deadBird?.destroy(),
                                });
                            }
                        }
                    });
                    this.birds.splice(i, 1);
                }
            }
        }
    }
    
    shutdown() {
        clearTimeout(this.inactivityTimeout);
        // EventBus.off('rotary1-move', this.resetInactivityTimeout, this);
        // EventBus.off('rotary2-move', this.resetInactivityTimeout, this);
        closeRotaryClient();
    }
}