import React, {useEffect} from 'react';
import {G, Path, Text as SvgText} from 'react-native-svg';
import Animated, {interpolateColor, useAnimatedProps, useSharedValue, withTiming,} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedSvgText = Animated.createAnimatedComponent(SvgText);

/**
 * Helper function to lighten a hex color.
 * @param color - The base color as a hex string (e.g. "#FF5733")
 * @param percent - A fraction between 0 and 1 representing the amount to lighten.
 */
function lightenColor(color: string, percent: number): string {
    let hex = color.startsWith('#') ? color.slice(1) : color;
    if (hex.length === 3) {
        hex = hex.split('').map((c) => c + c).join('');
    }
    const num = parseInt(hex, 16);
    let r = (num >> 16) & 0xff;
    let g = (num >> 8) & 0xff;
    let b = num & 0xff;
    r = Math.floor(r + (255 - r) * percent);
    g = Math.floor(g + (255 - g) * percent);
    b = Math.floor(b + (255 - b) * percent);
    return (
        "#" +
        ((1 << 24) + (r << 16) + (g << 8) + b)
            .toString(16)
            .slice(1)
            .toUpperCase()
    );
}

interface AnimatedSectorProps {
    d: string;
    sector: { label: string; color: string };
    labelX: number;
    labelY: number;
    midAngle: number; // in radians, the midpoint angle of the sector
    isWinner: boolean;
    longestLabel: string;
    radius?: number;
}

const AnimatedSector: React.FC<AnimatedSectorProps> = ({
                                                           d,
                                                           sector,
                                                           labelX,
                                                           labelY,
                                                           midAngle,
                                                           isWinner,
                                                           longestLabel,
                                                           radius = 180,
                                                       }) => {
    const litProgress = useSharedValue(0);

    useEffect(() => {
        litProgress.value = withTiming(isWinner ? 1 : 0, { duration: 500 });
    }, [isWinner, litProgress]);

    const isValidColor = (color: string) => {
        'worklet';
        return typeof color === 'string' && /^#([0-9A-F]{6}|[0-9A-F]{3})$/i.test(color);
    };

    const baseColor = isValidColor(sector.color) ? sector.color : '#FFFFFF';
    const litColor = isValidColor(baseColor) ? lightenColor(baseColor, 0.3) : '#FFFFFF';

    const animatedProps = useAnimatedProps(() => ({
        fill:
            isValidColor(baseColor) && isValidColor(litColor)
                ? interpolateColor(litProgress.value, [0, 1], [baseColor, litColor])
                : '#FFFFFF',
    }));

    const animatedTextProps = useAnimatedProps(() => ({
        fill: interpolateColor(litProgress.value, [0, 1], ['#FFFFFFCC', '#ffffff']),
    }));

    // Calculate font size based on the wheel radius and label length
    const calculateFontSize = (label: string, wheelRadius: number) => {
        // Base reference: font size 28 at radius 180
        const scaleFactor = wheelRadius / 180;
        const baseFontSize = 28 * scaleFactor;

        // Adjust for label length
        if (label?.length <= 6) return baseFontSize;

        // Reduce font size for longer labels, proportional to wheel size
        const reductionPerChar = 2 * scaleFactor;
        return Math.max(baseFontSize - (label?.length - 6) * reductionPerChar, 10 * scaleFactor);
    };

    const fontSize = calculateFontSize(longestLabel, radius);

    return (
        <G>
            <AnimatedPath d={d} animatedProps={animatedProps} stroke="#ffffffaa" strokeWidth="1" />
            <AnimatedSvgText
                transform={`rotate(${(midAngle * 180) / Math.PI}, ${labelX}, ${labelY})`}
                x={labelX}
                y={labelY}
                fontSize={fontSize}
                fontWeight="1000"
                textAnchor="middle"
                alignmentBaseline="middle"
                animatedProps={animatedTextProps}
            >
                {sector.label}
            </AnimatedSvgText>
        </G>
    );
};

export default AnimatedSector;