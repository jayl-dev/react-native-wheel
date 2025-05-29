import React from 'react';
import {StyleSheet, View} from 'react-native';
import Svg from 'react-native-svg';
import Matter from 'matter-js';
import AnimatedSector from './AnimatedSector';

export interface Sector {
    label: string;
    color: string;
}

export interface WheelProps {
    body: Matter.Body;
    radius: number;
    sectors: Sector[];
}

const Wheel: React.FC<WheelProps> = ({body, radius, sectors}) => {
    const numberOfSectors = sectors.length;
    const arcSize = (2 * Math.PI) / numberOfSectors;

    let adjusted = (-Math.PI / 2 - body.angle) % (2 * Math.PI);
    if (adjusted < 0) adjusted += 2 * Math.PI;
    const winningIndex = Math.floor(adjusted / arcSize);

    // Calculate the longest label
    const longestLabel = sectors.reduce(
        (longest, sector) =>
            sector.label.length > longest.length ? sector.label : longest,
        '',
    );

    return (
        <View
            style={[
                styles.wheelContainer,
                {
                    width: radius * 2,
                    height: radius * 2,
                    borderRadius: radius,
                    transform: [{rotate: `${body.angle}rad`}],
                },
            ]}
        >
            <View
                style={[
                    styles.wheelBorder,
                    {
                        borderRadius: radius,
                        borderWidth: Math.max(2, radius * 0.05),
                    }
                ]}
            />
            <Svg width={radius * 2} height={radius * 2}>
                {sectors.map((sector, index) => {
                    const startAngle = index * arcSize;
                    const endAngle = startAngle + arcSize;
                    const x1 = radius + radius * Math.cos(startAngle);
                    const y1 = radius + radius * Math.sin(startAngle);
                    const x2 = radius + radius * Math.cos(endAngle);
                    const y2 = radius + radius * Math.sin(endAngle);
                    const largeArcFlag = arcSize > Math.PI ? 1 : 0;
                    const d = `M ${radius} ${radius} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;

                    const midAngle = startAngle + arcSize / 2;
                    const labelRadius = radius * 0.55;
                    const labelX = radius + labelRadius * Math.cos(midAngle);
                    const labelY = radius + labelRadius * Math.sin(midAngle);
                    const isWinner = winningIndex === index;

                    return (
                        <AnimatedSector
                            key={`sector-${index}`}
                            d={d}
                            sector={sector}
                            labelX={labelX}
                            labelY={labelY}
                            midAngle={midAngle}
                            isWinner={isWinner}
                            longestLabel={longestLabel}
                        />
                    );
                })}
            </Svg>
        </View>
    );
};

const styles = StyleSheet.create({
    wheelContainer: {
        position: 'absolute',
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    wheelBorder: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        borderColor: 'rgba(255, 255, 255, 0.5)',
        zIndex: 1,
    },
});

export default Wheel;