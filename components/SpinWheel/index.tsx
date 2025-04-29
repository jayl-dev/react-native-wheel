import React, { useRef } from 'react';
import {
    View,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Text,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from 'react-native-gesture-handler';
import { GameEngine } from 'react-native-game-engine';
import Matter from 'matter-js';

import Wheel, { Sector } from '@/components/Wheel';
import {useSpinWheelLogic} from "@/components/SpinWheel/useWheelLogic";
import {useWheelGestures} from "@/components/SpinWheel/useWheelGesture";

interface SpinWheelProps {
    sectionData: Sector[];
    sectionColor?: string;
    wheelSize?: number;
    getWinner: (label: string, index: number) => void;
}

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

const SpinWheel: React.FC<SpinWheelProps> = ({
                                                 sectionData,
                                                 sectionColor = '#fff',
                                                 wheelSize = 150,
                                                 getWinner,
                                             }) => {
    const engine = useRef(Matter.Engine.create({ enableSleeping: false })).current;
    engine.world.gravity.y = 0;

    const wheel = useRef(
        Matter.Bodies.circle(WIDTH / 2, HEIGHT / 2, wheelSize, {
            frictionAir: 0.015,
            restitution: 0.4,
            friction: 0.1,
            frictionStatic: 0.5,
            density: 0.005,
        })
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
        wheel: { body: wheel, radius: wheelSize, sectors: sectionData, renderer: Wheel },
    };

    const Physics = (entities: any, { time }: { time: { delta: number } }) => {
        Matter.Engine.update(engine, time.delta);
        return entities;
    };

    const { spinWheel } = useSpinWheelLogic(wheel, sectionData, getWinner);
    const { onGestureEvent, onHandlerStateChange } = useWheelGestures(wheel);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <PanGestureHandler
                onGestureEvent={onGestureEvent}
                onHandlerStateChange={onHandlerStateChange}
            >
                <View style={[styles.container, { backgroundColor: sectionColor }]}>
                    <GameEngine
                        style={styles.gameContainer}
                        systems={[Physics]}
                        entities={entities}
                    />

                    <TouchableOpacity style={styles.button} onPress={spinWheel}>
                        <Text style={styles.buttonText}>Spin the Wheel!</Text>
                    </TouchableOpacity>

                    <View style={[styles.stopperContainer, { top: HEIGHT / 2 - wheelSize - 10 }]}>
                        <View style={styles.stopper} />
                    </View>
                </View>
            </PanGestureHandler>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    gameContainer: { flex: 1 },
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
