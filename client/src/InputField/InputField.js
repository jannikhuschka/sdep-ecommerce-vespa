import './InputField.css';

function InputField({id, name, placeholder = "Enter ", type = "text"}) {
    return (
        <div className="input-container">
            {/* <label for={id}>{name.value}</label> */}
            <p>{name}</p>
            <input id={id} name={id} type={type} placeholder={placeholder + name} ></input>
        </div>
    );
}

export default InputField;