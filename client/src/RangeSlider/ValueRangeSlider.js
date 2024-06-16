import RangeSlider from 'react-range-slider-input';
import 'react-range-slider-input/dist/style.css';
import './ValueRangeSlider.css';

function ValueRangeSlider({ array, setArrayFunction, globalArray, name, unit = "" }) {
    return (
        <div className="double-slider">
            {array[0] != array[1] ? <p>{name}: {array[0]}{unit} to {array[1]}{unit}</p> : <p>{name}: Exactly {array[0]}{unit}</p>}
            <RangeSlider min={globalArray[0]} max={globalArray[1]} value={array} onInput={setArrayFunction} />
        </div>
    );
}

export default ValueRangeSlider;