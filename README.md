# react native spinning wheel component

a simple react-natvie component that I created to be used for another project. 

see it in action in a demo app
https://spin.expo.app/


## Usage

To use, get everything from the components folder and add it to your screen

```javascript
const App = () => {
    const handleWinner = (label: string, index: number) => {
        console.log(`Winner is ${label} at index ${index}`);
    };

    return (
        {/* add victory.wav to assets folder if you want a sound to play on victory/winner */}
        <SpinWheel
            sectionData={[
                { label: 'YES', color: '#FF0000' },
                { label: 'NO', color: '#00FF00' },
            ]}
            wheelSize={300}
            getWinner={handleWinner}
            enableSound={true}
            soundFrequency={500} //lower frequency = more physical sound -- higher frequency = more electronic sound
        />
    );
};
```
web interactive demo
https://localspinner.expo.app/


## Screenshots

![1](/../master/screenshots/1.png?raw=true "Yes/No")

![demo](/../master/screenshots/demo.gif?raw=true "Demo")


## License

[GPL 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
