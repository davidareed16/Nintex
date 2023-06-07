import { html, LitElement, css } from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';
const PLUGIN_NAME = 'smarty-address-control'

export default class AddressAutoComplete extends LitElement {

    static styles = css`
        .form-control:focus {
            border-color: #006BD6;
            box-shadow: 0 0 0 0;
        }
        .list-group:first-child {
            border-radius: 0px 0px 0.25rem 0.25rem;
        }
        .list-group-item:first-child {
            border-top: 0px;
        }
        .input-style {
            border-radius: 10px !important;
            border-color: #a0a8ad !important;
            margin-top: 5px;
            height: 45px;
            color: black;
        }
        .label-style {
            font-family: "Lato", "Helvetica", "Arial", sans-serif;
            font-size: 14px;
            min-height: 14px;
        }
        .list-group-style {
            z-index: 1;
            position: absolute;
        }
    `;
    
    static properties = {
        apiKey: { type: String },
        addresses: { type: Array },
        value: { type: String },
        labelName: {type: String },
        pageName: {type: String },
        minChar: {type: Number}
    };

    static get properties() {
        return {
            inputValue: { 
                type: String,
                attribute: false
            }
        }
    }

    static getMetaConfig() {
        return {
            controlName: 'SmartyAddressControl',
            fallbackDisableSubmit: false,
            description: 'Smarty Streets US Address Autocomplete, Pro Edition Search Component',
            groupName: 'Lilly Plugins',
            version: '1.0',
            properties: {
                apiKey: {
                    type: 'string',
                    title: 'Smarty Embedded API Key',
                },
                labelName: {
                    type: 'string',
                    title: 'Address Field Label Name',
                },
                pageName: {
                    type: 'string',
                    title: 'Page Name'
                },
                minChar: {
                    type: 'number',
                    title: 'Min Char to enter'
                },
                value: {
                    type: 'string',
                    title: 'Address',
                    isValueField: true,
                },
            },
            standardProperties: {
                fieldLabel: false,
                description: true,
                defaultValue: false,
                readOnly: false,
                visibility: true,
                required: true,
            },
            events: ["ntx-value-change"],
        };
    }

    render() {
        const inputStyle = this.addresses.length > 0 ? 'border-radius: 0.25rem 0.25rem 0px 0px;' : '';
        return  html`
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
            <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
            <label class="nx-form-label nx-break-word nx-theme-label-1"><span class="nx-title label-style">${this.labelName}</span></label>
            <div class="input-group input-group-sm nx-zinc-control-input" id="input-container" style="line-height: 1rem;">            
                <input type="text" class="form-control nx-theme-input-1 input-style" value="${this.inputValue}" @keyup=${this.updateInputValue} aria-label="address" id="address" style="font-size: 14px; padding: 7px 12px 7px 12px; ${inputStyle}" maxlength="34" autocomplete="off"/>
            </div>
            <div>
                <ul class="list-group list-group-style">
                    ${this.addresses.map((address, index) => html`<li class="list-group-item list-group-item-action" aria-label="${JSON.stringify(address)}" id="${index}" @click="${this.handleClick}" style="padding: 0.25rem 0.5rem; font-size: .875rem;">${address.street_line} ${address.secondary} ${address.city}, ${address.state} ${address.zipcode}</li>`)}
                </ul>
            </div>
        `;
    }

    handleInput(event) {
        this.minChar = (this.minChar != null && this.minChar ? +this.minChar : 4);
        if (this.inputValue && this.inputValue.length >= this.minChar) {
            this.getSmartyStreets();
        } else {
            this.addresses = [];
        }
    }

    handleClick(event) {
        const addressObject = event.target.ariaLabel;
        let inputElement = this.renderRoot.querySelector('#address');
        inputElement.value = event.target.innerText;
        this.addresses = [];
        let addObj = JSON.parse(addressObject);
        this.value = addressObject;
        const args = {
            bubbles: true,
            cancelable: false,
            composed: true,
            detail: addObj.street_line,
        };
        
        inputElement.value = addObj.street_line;
        this.updateFieldValue(`.${this.pageName}-user-city input`, addObj.city);
        this.updateFieldValue(`.${this.pageName}-user-state input`, addObj.state);
        this.updateFieldValue(`.${this.pageName}-user-zip input`, addObj.zipcode);
        const nintexEvent = new CustomEvent('ntx-value-change', args);
        this.dispatchEvent(nintexEvent);
    }

    async getSmartyStreets() {
        const response = await fetch('https://us-autocomplete-pro.api.smartystreets.com/lookup?search=' + this.inputValue + '&key=' + this.apiKey, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const result = await response.json();
        this.addresses = result.suggestions;
        if(this.addresses.length == 0) {
            const args = {
                bubbles: true,
                cancelable: false,
                composed: true,
                detail: this.inputValue,
            };

            const nintexEvent = new CustomEvent('ntx-value-change', args);
            this.dispatchEvent(nintexEvent);
        }
    }

    updateInputValue(event) {
        this.inputValue = event.srcElement.value;
    }

    updateFieldValue(selector, updatedValue) {
        document.querySelector(selector).value = updatedValue;
        document.querySelector(selector).focus();
        document.querySelector(selector).blur();
    }

    constructor() {
        super();
        this.addresses = [];
        this.addEventListener('input', this.handleInput);
    }
}

const elementName = PLUGIN_NAME;
customElements.define(elementName, AddressAutoComplete);
