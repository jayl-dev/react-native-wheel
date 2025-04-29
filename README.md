# react native spinning wheel component

a simple react-natvie component that I created to be used for another project. 

web interactive demo
https://localspinner.expo.app/

## Usage

To use, get everything from the components folder and add it to your screen

```javascript
const App = () => {
    const handleWinner = (label: string, index: number) => {
        console.log(`Winner is ${label} at index ${index}`);
    };

    return (
        <SpinWheel
            sectionData={[
                { label: 'YES', color: '#FF0000' },
                { label: 'NO', color: '#00FF00' },
            ]}
            wheelSize={300}
            getWinner={handleWinner}
        />
    );
};
```


## Screenshots

![1](/../master/screenshots/1.png?raw=true "Yes/No")

![demo](/../master/screenshots/demo.gif?raw=true "Demo")


## License

[GPL 2](https://www.gnu.org/licenses/old-licenses/gpl-2.0.html)
