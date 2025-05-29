import { useRef } from 'react';
import { Dimensions } from 'react-native';
import Matter from 'matter-js';
import {
    PanGestureHandlerGestureEvent,
    PanGestureHandlerStateChangeEvent,
    State,
} from 'react-native-gesture-handler';

const { width: WIDTH, height: HEIGHT } = Dimensions.get('window');

export function useWheelGestures(wheel: Matter.Body, handleSpin?: () => void) {
    const initialGestureAngle = useRef<number | null>(null);
    const initialWheelAngle = useRef<number | null>(null);
    const lastAngle = useRef<number | null>(null);
    const lastTimestamp = useRef<number | null>(null);
    const computedAngularVelocity = useRef(0);

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
            if (handleSpin) handleSpin();
            initialGestureAngle.current = null;
            initialWheelAngle.current = null;
            lastAngle.current = null;
            lastTimestamp.current = null;
            computedAngularVelocity.current = 0;
        }
    };

    return { onGestureEvent, onHandlerStateChange };
}
