import './InputField.css';

function InputField({id, name}) {
    const placeholder = name;
    return (
        <div class="input-container">
            {/* <label for={id}>{name.value}</label> */}
            <p>{name}</p>
            <input name={id} type="text" placeholder={"Enter your " + placeholder}></input>
        </div>
    );
}

export default InputField;