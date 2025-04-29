import SpinWheel from "@/components/SpinWheel";
import {Sector} from "@/components/Wheel";


function generateTestPrizes(count: number = 6): Sector[] {
    const colors = [
        '#FF0000', '#00FF00', '#0000FF',
        '#FFFF00', '#FF00FF', '#00FFFF',
        '#FFA500', '#800080', '#008000', '#000000'
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
        <SpinWheel
            sectionData={generateTestPrizes(8)}
            wheelSize={300}
            getWinner={handleWinner}
        />
    );
};

export default App;