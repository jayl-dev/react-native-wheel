import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { Audio } from 'expo-av';
import { Sector } from '@/components/Wheel';

export function useSpinWheelLogic(
    wheel: Matter.Body,
    sectionData: Sector[],
    getWinner: (label: string, index: number) => void
) {
    const spinSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundPlayedRef = useRef(false);
    const bouncingRef = useRef(false);

    const playSpinSound = async () => {
        if (spinSoundRef.current) {
            await spinSoundRef.current.setPositionAsync(0);
            spinSoundRef.current.playAsync();
        }
    };

    const playStopSound = async () => {
        if (stopSoundRef.current) {
            await stopSoundRef.current.setPositionAsync(0);
            stopSoundRef.current.playAsync();
        }
    };

    const spinWheel = () => {
        Matter.Body.setStatic(wheel, false);
        const randomSpin = Math.random() * 10 + 5;
        Matter.Body.setAngularVelocity(wheel, randomSpin);
        playSpinSound();
    };

    // decaying sine wave
    const bounceAndStop = () => {
        if (bouncingRef.current) return;
        bouncingRef.current = true;

        const totalDuration = 350;
        const start = Date.now();
        const initialAmplitude = 0.02;
        const frequency = 1.5; // oscillations

        function animate() {
            const elapsed = Date.now() - start;
            const t = Math.min(elapsed / totalDuration, 1);

            const amplitude = initialAmplitude * (1 - t);
            const angle = Math.sin(t * Math.PI * frequency) * amplitude;

            Matter.Body.setAngularVelocity(wheel, angle);

            if (t < 1) {
                requestAnimationFrame(animate);
            } else {
                Matter.Body.setAngularVelocity(wheel, 0);
                Matter.Body.setStatic(wheel, true);

                stopSoundPlayedRef.current = true;
                bouncingRef.current = false;
                playStopSound();

                requestAnimationFrame(() => {
                    const arcSize = (2 * Math.PI) / sectionData.length;
                    let adjusted = (-Math.PI / 2 - wheel.angle) % (2 * Math.PI);
                    if (adjusted < 0) adjusted += 2 * Math.PI;
                    const winningIndex = Math.floor(adjusted / arcSize);
                    const winner = sectionData[winningIndex];
                    getWinner(winner.label, winningIndex);
                });
            }
        }

        animate();
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (
                Math.abs(wheel.angularVelocity) < 0.01 &&
                !stopSoundPlayedRef.current &&
                !bouncingRef.current
            ) {
                bounceAndStop();
            }
            if (Math.abs(wheel.angularVelocity) >= 0.01) {
                stopSoundPlayedRef.current = false;
            }
        }, 100);
        return () => clearInterval(interval);
    }, [wheel]);

    return {
        spinWheel,
        spinSoundRef,
        stopSoundRef,
    };
}