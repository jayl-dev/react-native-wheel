import SpinWheel from "@/components/SpinWheel";
import {Sector} from "@/components/Wheel";
import {
    View
} from 'react-native';

function generateTestPrizes(count: number = 6): Sector[] {
    const colors = [
        '#e41a1c', '#377eb8', '#4daf4a', '#984ea3',
        '#ff7f00', '#ffff33', '#a65628', '#f781bf', '#999999'
    ];
    return Array.from({ length: count }, (_, i) => ({
        label: `Prize ${String.fromCharCode(65 + i)}`,
        color: colors[i % colors.length],
    }));
}

const App = () => {
    const handleWinner = (label: string, index: number) => {
        console.log(`Winner is ${label} at index ${index}`);
    };

    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#7FC9FF" }}>
        <SpinWheel
            sectionData={generateTestPrizes(8)}
            wheelSize={200}
            getWinner={handleWinner}
        />
        </View>
    );
};

export default App;