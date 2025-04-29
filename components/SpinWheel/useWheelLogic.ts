import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { Audio } from 'expo-av';
import { Sector } from '@/components/Wheel';

export function useSpinWheelLogic(wheel: Matter.Body, sectionData: Sector[], getWinner: (label: string, index: number) => void) {
    const spinSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundPlayedRef = useRef(false);

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

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.abs(wheel.angularVelocity) < 0.01 && !stopSoundPlayedRef.current) {
                stopSoundPlayedRef.current = true;
                playStopSound();

                const normalizedAngle = (wheel.angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
                const sectorAngle = (2 * Math.PI) / sectionData.length;
                const index = Math.floor(((2 * Math.PI - normalizedAngle + sectorAngle / 2) % (2 * Math.PI)) / sectorAngle);
                const winner = sectionData[index];
                getWinner(winner.label, index);
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
