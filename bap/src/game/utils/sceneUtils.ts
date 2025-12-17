import { Scene } from 'phaser';

/**
 * Returns a scaled width based on the scene's scale and a factor (e.g. 0.8 for 80%).
 */
export function getScaledWidth(scene: Scene, factor: number): number {
    return scene.scale.width * factor;
}

/**
 * Returns a scaled height based on the scene's scale and a factor (e.g. 0.8 for 80%).
 */
export function getScaledHeight(scene: Scene, factor: number): number {
    return scene.scale.height * factor;
}
