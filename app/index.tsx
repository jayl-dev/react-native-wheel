import SpinWheel from "@/components/SpinWheel";
import { Sector } from "@/components/Wheel";
import { View } from 'react-native';

function generateTestPrizes(count: number = 6): Sector[] {
    const colors = [
        '#ee5b51', '#f26a4f', '#f67a4d', '#fa894b', '#fd9849', // Red to Orange
        '#ffa847', '#ffb845', '#ffc843', '#ffd841', '#ffe83f', // Orange to Yellow
        '#f6f53d', '#e4f33b', '#d2f139', '#c0ef37', '#aeee35', // Yellow to Green
        '#9cec33', '#8aea31', '#78e82f', '#66e62d', '#54e42b', // Green
        '#42d6a3', '#30c8d6', '#1ebaf9', '#0caeff', '#0098ff', // Blue
        '#0078e6', '#0058cc', '#0038b3', '#001899', '#000080', // Indigo
        '#4b0082', '#6a008a', '#8b00ff', '#a300ff', '#c000ff', // Violet
    ];
    const step = Math.floor(colors.length / count);
    return Array.from({ length: count }, (_, i) => {
        const colorIndex = (i * step) % colors.length;
        return {
            label: `Prize ${String.fromCharCode(65 + i)}`,
            color: colors[colorIndex],
        };
    });
}

const App = () => {
    const handleWinner = (label: string, index: number) => {
        console.log(`Winner is ${label} at index ${index}`);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#7FC9FF" }}>
            {/* add victory.wav to assets folder if you want a sound to play on victory/winner */}
            <SpinWheel
                sectionData={generateTestPrizes(8)}
                wheelSize={180}
                getWinner={handleWinner}
                enableSound={true}
                soundFrequency={500} //lower frequency = more physical sound -- higher frequency = more electronic sound
            />
        </View>
    );
};

export default App;