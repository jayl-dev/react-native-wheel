import React, {useRef} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import {
    PanGestureHandler,
} from 'react-native-gesture-handler';
import {GameEngine} from 'react-native-game-engine';
import Matter from 'matter-js';

import Wheel, {Sector} from '@/components/Wheel';
import {useSpinWheelLogic} from '@/components/SpinWheel/useWheelLogic';
import {useWheelGestures} from '@/components/SpinWheel/useWheelGesture';

interface SpinWheelProps {
    sectionData: Sector[];
    sectionColor?: string;
    wheelSize?: number;
    getWinner: (label: string, index: number) => void;
    onSpinStart?: () => void;
}

const SpinWheel: React.FC<SpinWheelProps> = ({
                                                 sectionData,
                                                 wheelSize = 150,
                                                 getWinner,
                                                 onSpinStart,
                                             }) => {
    const engine = useRef(Matter.Engine.create({enableSleeping: false})).current;
    engine.world.gravity.y = 0;

    const center = {x: wheelSize, y: wheelSize};

    const wheel = useRef(
        Matter.Bodies.circle(center.x, center.y, wheelSize, {
            frictionAir: 0.015,
            restitution: 0.4,
            friction: 0.1,
            frictionStatic: 0.5,
            density: 0.005,
        })
    ).current;

    const pivot = Matter.Constraint.create({
        pointA: center,
        bodyB: wheel,
        pointB: {x: 0, y: 0},
        stiffness: 0.8,
        length: 0,
    });
    Matter.World.add(engine.world, [wheel, pivot]);

    const entities = {
        physics: {engine, world: engine.world},
        wheel: {body: wheel, radius: wheelSize, sectors: sectionData, renderer: Wheel},
    };

    const Physics = (entities: any, {time}: { time: { delta: number } }) => {
        Matter.Engine.update(engine, time.delta);
        return entities;
    };

    const {spinWheel} = useSpinWheelLogic(wheel, sectionData, getWinner);

    const handleSpin = () => {
        onSpinStart && onSpinStart();
        spinWheel();
    };
    const {onGestureEvent, onHandlerStateChange} = useWheelGestures(wheel, handleSpin);

    const gameContainerSize = wheelSize * 2;

    return (
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <View style={[styles.container]}>
                <View style={styles.centerContent}>
                    <View style={{
                        width: gameContainerSize,
                        height: gameContainerSize,
                        justifyContent: 'center',
                        alignItems: 'center',
                        position: 'relative',
                    }}>
                        <GameEngine
                            style={{
                                width: gameContainerSize,
                                height: gameContainerSize,
                                backgroundColor: 'transparent',
                                position: 'absolute',
                                left: 0,
                                top: 0,
                            }}
                            systems={[Physics]}
                            entities={entities}
                        />
                        <View style={[
                            styles.stopper,
                            {
                                position: 'absolute',
                                top: -20,
                                left: gameContainerSize / 2 - 15,
                                zIndex: 10,
                            }
                        ]}/>
                    </View>
                    <TouchableOpacity style={styles.button}
                                      onPress={handleSpin}>
                        <Text style={styles.buttonText}>Spin the Wheel!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </PanGestureHandler>
    );
};

const styles = StyleSheet.create({
    container: {flex: 1},
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    button: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#2ecc71',
        padding: 20,
        borderRadius: 10,
    },
    buttonText: {color: '#fff', fontWeight: 'bold'},
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