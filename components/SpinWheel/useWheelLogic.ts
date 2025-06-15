import { useEffect, useRef } from 'react';
import Matter from 'matter-js';
import { Audio } from 'expo-av';
import { Sector } from '@/components/Wheel';
import { audioGenerator } from './AudioGenerator';

export function useSpinWheelLogic(
    wheel: Matter.Body,
    sectionData: Sector[],
    getWinner: (label: string, index: number) => void,
    enableSound: boolean = true,
    soundFrequency: number = 700
) {
    const spinSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundPlayedRef = useRef(false);
    const bouncingRef = useRef(false);
    const audioLoadedRef = useRef(false);
    const hasSpunRef = useRef(false);

    useEffect(() => {
        const loadAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    playsInSilentModeIOS: true,
                    staysActiveInBackground: false,
                });


                try {
                    const { sound: stopSound } = await Audio.Sound.createAsync(
                        require('@/assets/victory.wav'),
                        { shouldPlay: false }
                    );
                    stopSoundRef.current = stopSound;
                    audioLoadedRef.current = true;
                } catch (error) {
                    console.error('Failed to load victory sound:', error);
                }
            } catch (error) {
                console.error('Failed to set audio mode:', error);
            }
        };

        loadAudio();

        return () => {
            audioGenerator.stopSpinningTicks();
            
            if (spinSoundRef.current) {
                spinSoundRef.current.unloadAsync().catch(console.error);
            }
            if (stopSoundRef.current) {
                stopSoundRef.current.unloadAsync().catch(console.error);
            }
        };
    }, []);

    const playSpinSound = async () => {
        try {
            if (spinSoundRef.current) {
                const status = await spinSoundRef.current.getStatusAsync();
                if (status.isLoaded) {
                    await spinSoundRef.current.setPositionAsync(0);
                    await spinSoundRef.current.playAsync();
                }
            }
        } catch (error) {
            console.error('Error playing spin sound:', error);
        }
    };

    const playStopSound = async () => {
        try {
            if (!audioLoadedRef.current) {
                let attempts = 0;
                while (!audioLoadedRef.current && attempts < 20) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                if (!audioLoadedRef.current) {
                    return;
                }
            }
            
            if (stopSoundRef.current) {
                const status = await stopSoundRef.current.getStatusAsync();
                if (status.isLoaded) {
                    await stopSoundRef.current.setPositionAsync(0);
                    await stopSoundRef.current.playAsync();
                }
            }
        } catch (error) {
            console.error('Error playing stop sound:', error);
        }
    };

    const spinWheel = () => {
        hasSpunRef.current = true;
        Matter.Body.setStatic(wheel, false);
        const randomSpin = Math.random() * 10 + 5;
        Matter.Body.setAngularVelocity(wheel, randomSpin);
        
        if (enableSound) {
            audioGenerator.playSpinningTicks(50, wheel, soundFrequency);
        }
        
    };

    const bounceAndStop = () => {
        if (bouncingRef.current) return;
        bouncingRef.current = true;

        const totalDuration = 200;
        const start = Date.now();
        const initialAmplitude = 0.02;
        const frequency = 1.5;

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

                audioGenerator.stopSpinningTicks();

                setTimeout(() => {
                    if (enableSound) {
                        playStopSound();
                    }
                }, 100);

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
                !bouncingRef.current &&
                hasSpunRef.current
            ) {
                audioGenerator.stopSpinningTicks();
                bounceAndStop();
            }
            if (Math.abs(wheel.angularVelocity) >= 0.01) {
                stopSoundPlayedRef.current = false;
            }
        }, 100);
        
        return () => {
            clearInterval(interval);
            audioGenerator.stopSpinningTicks();
        };
    }, [wheel]);

    return {
        spinWheel,
        spinSoundRef,
        stopSoundRef,
    };
}