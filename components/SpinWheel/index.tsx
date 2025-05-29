import React, {useRef} from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
} from 'react-native';
import {
    GestureHandlerRootView,
    PanGestureHandler,
} from 'react-native-gesture-handler';

import {GameEngine} from 'react-native-game-engine';
import Matter from 'matter-js';
import Svg, { Path, Defs, Filter, FeGaussianBlur, FeOffset, FeMerge, FeMergeNode } from 'react-native-svg';

import Wheel, {Sector} from '@/components/Wheel';
import {useSpinWheelLogic} from '@/components/SpinWheel/useWheelLogic';
import {useWheelGestures} from '@/components/SpinWheel/useWheelGesture';

interface SpinWheelProps {
    sectionData: Sector[];
    sectionColor?: string;
    wheelSize?: number;
    getWinner: (label: string, index: number) => void;
    onSpinStart?: () => void;
    key?: string;
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

    const stopperSize = Math.max(20, wheelSize * 0.15);

    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
        <PanGestureHandler
            onGestureEvent={onGestureEvent}
            onHandlerStateChange={onHandlerStateChange}
        >
            <View style={styles.container}>
                <View style={styles.centerContent}>
                    <View
                        style={[
                            styles.wheelWrapper,
                            {
                                width: gameContainerSize,
                                height: gameContainerSize,
                                borderRadius: gameContainerSize / 2,
                            },
                        ]}
                    >
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
                        <Stopper size={stopperSize} color="#ff4757" />
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.button,
                            {
                                // Scale button size with wheel size
                                paddingVertical: Math.max(15, wheelSize * 0.08),
                                paddingHorizontal: Math.max(20, wheelSize * 0.1),
                                borderRadius: Math.max(10, wheelSize * 0.05),
                            }
                        ]}
                        onPress={handleSpin}
                    >
                        <Text style={[
                            styles.buttonText,
                            {fontSize: Math.max(16, wheelSize * 0.09)}
                        ]}>Spin the Wheel!</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </PanGestureHandler>
        </GestureHandlerRootView>
    );
};

const Stopper = ({ size = 24, color = '#ff4757' }) => {
    const trianglePath = `M 0 0 L ${size} 0 L ${size / 2} ${size} Z`;

    return (
        <Svg
            width={size}
            height={size}
            style={{
                position: 'absolute',
                top: -(size * 0.6),
                left: '50%',
                marginLeft: -(size / 2),
                zIndex: 10,
            }}
        >
            <Defs>
                <Filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                    <FeOffset result="offOut" in="SourceAlpha" dx="0" dy="2" />
                    <FeGaussianBlur result="blurOut" in="offOut" stdDeviation="2" />
                    <FeMerge>
                        <FeMergeNode in="blurOut" />
                        <FeMergeNode in="SourceGraphic" />
                    </FeMerge>
                </Filter>
            </Defs>
            <Path
                d={trianglePath}
                fill={color}
                filter="url(#shadow)"
            />
        </Svg>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wheelWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 8, // For Android shadow
    },
    button: {
        position: 'absolute',
        bottom: 50,
        alignSelf: 'center',
        backgroundColor: '#2ecc71',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold'
    },
});

export default SpinWheel;