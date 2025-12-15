import { Scene } from 'phaser';
import { getRotaryClient } from '../utils/rotaryClientSingleton';


export class StoryTelling extends Scene {
    private skipFill: Phaser.GameObjects.Graphics | null = null;
    private skipCircleRadius: number = 20;
    private animTargets: Phaser.GameObjects.GameObject[] = [];
    private skipButton: Phaser.GameObjects.Container | null = null;
    private skipButtonVisible: boolean = false;
    private rotary: any = null;
    private wasButtonPressed: boolean = false;
    private skipHoldStart: number | null = null;
    private skipHoldProgress: number = 0;
    private skipButtonTween: Phaser.Tweens.Tween | null = null;
    private skipButtonIsDown: boolean = false;
    private isTransitioning: boolean = false;
    private videoIsPlaying: boolean = false;

    constructor() {
        super('StoryTelling');
    }

    create() {
        // Reset skip button state
        this.skipHoldStart = null;
        this.skipHoldProgress = 0;
        this.skipButtonIsDown = false;
        this.isTransitioning = false;
        this.videoIsPlaying = false;

        this.rotary = getRotaryClient();
        this.createSkipButton();
        const video = this.add.video(this.scale.width / 2, this.scale.height / 2, 'storytelling-animation')
            .setOrigin(0.5)
            .setDepth(1000);

        console.log('Video object:', video);

        video.on('play', () => {
            console.log('Video started playing!');
            this.videoIsPlaying = true;
        });

        // When video completes, go to next scene
        video.on('complete', () => {
            if (!this.isTransitioning) {
                console.log('Video completed - going to TutorialBlue');
                this.isTransitioning = true;
                this.scene.start('TutorialBlue');
            }
        });

        video.setMute(true);
        video.play(false);
    }
    private createSkipButton() {
        const buttonWidth = 500;
        const buttonHeight = 100;
        const skipShadowOffsetY = 8;
        const buttonX = this.scale.width - buttonWidth / 2 - 54;
        const buttonY = this.scale.height / 2 + 850;
        const circleRadius = 20;
        const gap = 32;
        const skipTextPadding = 12;
        
        // Shadow
        const skipShadow = this.add.graphics();
        skipShadow.fillStyle(0xB68302, 1);
        skipShadow.fillRoundedRect(
            -buttonWidth / 2,
            -buttonHeight / 2 + skipShadowOffsetY,
            buttonWidth,
            buttonHeight,
            16
        );
        skipShadow.setDepth(1999);
        
        // Background
        const skipBg = this.add.graphics();
        skipBg.fillStyle(0xFFB703, 1);
        skipBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 16);
        skipBg.setDepth(2000);

        // Shining effects
        const shineTopLeft = this.add.graphics();
        shineTopLeft.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft.fillRoundedRect(-buttonWidth / 2 +70, -buttonHeight / 2 -105, 16.844, 5.877, 3);
        shineTopLeft.rotation = -33.256 * (Math.PI / 180);
        const shineTopLeft2 = this.add.graphics();
        shineTopLeft2.fillStyle(0xFFFFFF, 0.4);
        shineTopLeft2.fillRoundedRect(-buttonWidth / 2 +70, -buttonHeight / 2 -95, 9, 6, 3);
        shineTopLeft2.rotation = -33.256 * (Math.PI / 180);
        
        const shineBottomRight = this.add.graphics();
        shineBottomRight.fillStyle(0xFFFFFF, 0.4);
        shineBottomRight.fillRoundedRect(buttonWidth / 2 -80, buttonHeight / 2 + 100, 9, 6, 3);
        shineBottomRight.rotation = -33.256 * (Math.PI / 180);

        
        // Text
        const skipText = this.add.text(0, 0, 'OVERSLAAN', {
            fontFamily: 'Bungee',
            fontSize: 50,
            color: '#ffffff',
        }).setOrigin(0, 0.5).setDepth(2001);
        
        // Circle outline
        const skipCircle = this.add.graphics();
        skipCircle.lineStyle(8, 0xffffff, 1);
        skipCircle.strokeCircle(0, 0, circleRadius);
        skipCircle.setDepth(2002);
        
        // Circle fill
        const skipFill = this.add.graphics();
        skipFill.setDepth(2003);
        
        // Position elements
        const skipTotalWidth = circleRadius * 2 + gap + skipText.width + skipTextPadding * 2;
        skipCircle.x = -skipTotalWidth / 2 + circleRadius + skipTextPadding;
        skipCircle.y = 0;
        skipFill.x = skipCircle.x;
        skipFill.y = 0;
        skipText.x = skipCircle.x + circleRadius + gap;
        skipText.y = 0;
        
        // Container
        const skipButton = this.add.container(buttonX, buttonY, [skipShadow, skipBg, skipCircle, skipFill,
            shineTopLeft,
            shineTopLeft2,
            shineBottomRight, skipText]);
        skipButton.setSize(buttonWidth, buttonHeight);
        skipButton.setDepth(2000);
        skipButton.setInteractive({ useHandCursor: true });
        skipButton.setAlpha(0); // Start onzichtbaar
        skipButton.setScale(0.7);

        // Store references
        this.skipFill = skipFill;
        this.skipCircleRadius = circleRadius;
        this.animTargets = [skipBg, skipCircle, skipFill, skipText, shineTopLeft, shineTopLeft2, shineBottomRight];
        this.skipButton = skipButton;
        this.skipButtonVisible = false;

        // Click handler
        skipButton.on('pointerdown', () => {
            console.log('Skip button clicked!');
            this.scene.start('TutorialBlue');
        });
    }
    
    update() {
        this.updateSkipButton();
        this.handleButtonInput();
    }
    
    private updateSkipButton() {
        if (!this.skipFill) return;
        
        this.skipFill.clear();
        if (this.skipHoldProgress > 0) {
            this.skipFill.beginPath();
            this.skipFill.arc(
                0, 0, 
                this.skipCircleRadius - 2, 
                -Math.PI / 2, 
                -Math.PI / 2 + 2 * Math.PI * this.skipHoldProgress, 
                false
            );
            this.skipFill.lineTo(0, 0);
            this.skipFill.closePath();
            this.skipFill.fillStyle(0xffffff, 1);
            this.skipFill.fillPath();
        }
    }
    
    private handleButtonInput() {
        const buttonPressed = this.rotary?.buttonPressed || false;

        // Button pressed: pop in skip button (alleen als video speelt)
        if (this.videoIsPlaying && buttonPressed && !this.wasButtonPressed && !this.skipButtonIsDown && !this.isTransitioning) {
            this.skipButtonIsDown = true;
            if (this.skipHoldStart === null) {
                this.skipHoldStart = Date.now();
            }
            if (this.skipButton && !this.skipButtonVisible) {
                this.skipButtonVisible = true;
                this.skipButton.setAlpha(1);
                this.skipButton.setScale(0.7);
                this.tweens.add({
                    targets: this.skipButton,
                    scale: 1,
                    duration: 220,
                    ease: 'Back.easeOut'
                });
            }
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 8,
                duration: 80,
                yoyo: false
            });
        }

        // Button released: pop out skip button
        if (this.videoIsPlaying && !buttonPressed && this.wasButtonPressed && !this.isTransitioning) {
            this.skipButtonIsDown = false;
            this.skipHoldStart = null;
            this.skipHoldProgress = 0;
            if (this.skipButton && this.skipButtonVisible) {
                this.skipButtonVisible = false;
                this.tweens.add({
                    targets: this.skipButton,
                    scale: 0.7,
                    duration: 180,
                    ease: 'Back.easeIn',
                    onComplete: () => {
                        if (this.skipButton) this.skipButton.setAlpha(0);
                    }
                });
            }
            if (this.skipButtonTween) this.skipButtonTween.stop();
            this.skipButtonTween = this.tweens.add({
                targets: this.animTargets,
                y: 0,
                duration: 80,
                yoyo: false
            });
        }

        this.wasButtonPressed = buttonPressed;

        // Check hold progress
        if (this.videoIsPlaying && this.skipHoldStart !== null && !this.isTransitioning) {
            const elapsed = Date.now() - this.skipHoldStart;
            this.skipHoldProgress = Math.min(1, elapsed / 2800);

            if (this.skipHoldProgress >= 1) {
                this.isTransitioning = true;
                this.skipHoldStart = null;
                this.skipButtonIsDown = false;
                if (this.skipButtonTween) this.skipButtonTween.stop();
                this.sound.play('button-click');
                this.scene.start('TutorialBlue');
            }
        } else if (!this.isTransitioning) {
            this.skipHoldProgress = 0;
        }
    }
}