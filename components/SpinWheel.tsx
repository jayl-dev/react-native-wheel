import React, { useRef, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
} from 'react-native';
import { GameEngine } from 'react-native-game-engine';
import {
    GestureHandlerRootView,
    PanGestureHandler,
    State,
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';
import Matter from 'matter-js';
import { Audio } from 'expo-av';
import Wheel, { Sector } from '@/components/Wheel';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

interface SpinWheelProps {
    sectionData: Sector[];
    sectionColor?: string;
    wheelSize?: number;
    getWinner: (label: string, index: number) => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({
                                                 sectionData,
                                                 sectionColor = '#ccc',
                                                 wheelSize = 300,
                                                 getWinner,
                                             }) => {
    const wheelRadius = wheelSize / 2;

    const gameEngine = useRef<GameEngine | null>(null);
    const spinSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundRef = useRef<Audio.Sound | null>(null);
    const stopSoundPlayedRef = useRef(false);

    const initialGestureAngle = useRef<number | null>(null);
    const initialWheelAngle = useRef<number | null>(null);
    const lastAngle = useRef<number | null>(null);
    const lastTimestamp = useRef<number | null>(null);
    const computedAngularVelocity = useRef(0);

    const engine = useRef(Matter.Engine.create({ enableSleeping: false })).current;
    engine.world.gravity.y = 0;

    const wheel = useRef(
        Matter.Bodies.circle(WIDTH / 2, HEIGHT / 2, wheelRadius, {
            frictionAir: 0.015,
            restitution: 0.4,
            friction: 0.1,
            frictionStatic: 0.5,
            density: 0.005,
        }),
    ).current;

    const pivot = Matter.Constraint.create({
        pointA: { x: WIDTH / 2, y: HEIGHT / 2 },
        bodyB: wheel,
        pointB: { x: 0, y: 0 },
        stiffness: 0.8,
        length: 0,
    });

    Matter.World.add(engine.world, [wheel, pivot]);

    const entities = {
        physics: { engine, world: engine.world },
        wheel: { body: wheel, radius: wheelRadius, sectors: sectionData, renderer: Wheel },
    };

    const Physics = (entities: any, { time }: { time: { delta: number } }) => {
        Matter.Engine.update(entities.physics.engine, time.delta);
        return entities;
    };

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

    const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
        const { x, y } = event.nativeEvent;
        const timestamp = Date.now();
        const cx = WIDTH / 2;
        const cy = HEIGHT / 2;
        const dx = x - cx;
        const dy = y - cy;
        const currentAngle = Math.atan2(dy, dx);

        if (initialGestureAngle.current === null) {
            initialGestureAngle.current = currentAngle;
            initialWheelAngle.current = wheel.angle;
            lastAngle.current = currentAngle;
            lastTimestamp.current = timestamp;
        } else {
            const angleDiff = currentAngle - initialGestureAngle.current;
            const targetAngle = (initialWheelAngle.current ?? 0) + angleDiff;
            Matter.Body.setAngle(wheel, targetAngle);

            const dt = (timestamp - (lastTimestamp.current ?? 0)) / 1000;
            if (dt > 0) {
                computedAngularVelocity.current = (currentAngle - (lastAngle.current ?? 0)) / dt;
            }
            lastAngle.current = currentAngle;
            lastTimestamp.current = timestamp;
        }
    };

    const onHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
        if (event.nativeEvent.state === State.BEGAN) {
            Matter.Body.setStatic(wheel, true);
        } else if (event.nativeEvent.oldState === State.ACTIVE) {
            Matter.Body.setStatic(wheel, false);
            Matter.Body.setAngularVelocity(wheel, computedAngularVelocity.current);
            initialGestureAngle.current = null;
            initialWheelAngle.current = null;
            lastAngle.current = null;
            lastTimestamp.current = null;
            computedAngularVelocity.current = 0;
        }
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (Math.abs(wheel.angularVelocity) < 0.01 && !stopSoundPlayedRef.current) {
                stopSoundPlayedRef.current = true;
                playStopSound();

                // Compute sector index based on final angle
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

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <View style={styles.container}>
                    <GameEngine
                        ref={gameEngine}
                        style={styles.gameContainer}
                        systems={[Physics]}
                        entities={entities}
                    />

                    <TouchableOpacity style={styles.button} onPress={spinWheel}>
                        <Text style={styles.buttonText}>Spin the Wheel!</Text>
                    </TouchableOpacity>

                    <View style={[styles.stopperContainer, { top: HEIGHT / 2 - wheelRadius - 10 }]}>
                        <View style={styles.stopper} />
                    </View>
                </View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#fff' },
    gameContainer: { flex: 1, backgroundColor: '#fff' },
    button: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#2ecc71',
        padding: 20,
        borderRadius: 10,
    },
    buttonText: { color: '#fff', fontWeight: 'bold' },
    stopperContainer: {
        position: 'absolute',
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    stopper: {
        width: 0,
        height: 0,
        borderLeftWidth: 15,
        borderRightWidth: 15,
        borderTopWidth: 20,
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderTopColor: '#000',
    },
});

export default SpinWheel;
