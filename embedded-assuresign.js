import {html, LitElement} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class EmbeddedAssureSign extends LitElement {
   
    static properties = {
        src: { type: String },
        content: { type : String },
        signerName: { type: String },
        signerEmail: { type: String },
        assureSignApiUsername: { type: String },
        assureSignApiKey: { type: String },
        assureSignTemplateId: { type: String },
        assureSignUserContextId: { type: String }
    }
    
    static getMetaConfig() {
        // plugin contract information
        return {
            controlName: 'Embedded-AssureSign',
            fallbackDisableSubmit: false,
            description: 'Assuresign Signing link URL provider which can render AssureSign envelope',
            iconUrl: "pen",
            groupName: 'signature',
            version: '1.3',
            properties: {
                signerEmail: {
                    type: 'string',
                    title: 'Signer Email'
                },
                signerName: {
                    type: 'string',
                    title: 'Signer Name'
                },
                assureSignApiUsername: {
                    type: 'string',
                    title: 'AssureSign API Username'
                },
                assureSignApiKey: {
                    type: 'string',
                    title: 'AssureSign API Password'

                },
                assureSignApiUserEmail: {
                    type: 'string',
                    title: 'AssureSign API User Email'
                },
                assureSignTemplateId: {
                    type: 'string',
                    title: 'AssureSign template Id'
                },
                assureSignUserContextId: {
                    type: 'string',
                    title: 'Assuresign UserContext ID'
                }
            },
            standardProperties: {
                readOnly: true,
                description: true,
            }
        }
    }
    
    async load() {
        const apiUserBody = {
            "request": {
              "apiUsername": this.assureSignApiUsername,
              "key": this.assureSignApiKey,
              "contextUsername": this.assureSignApiUserEmail,
              "sessionLengthInMinutes": 60
            }
        };

        const response = await fetch('https://account.assuresign.net/api/v3.7/authentication/apiUser', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(apiUserBody)
        });
        
        const jsonResponse = await response.json();

        const token = jsonResponse.result.token;

        const submitBody = {
            "request": {
                "placeholders": [],
                "templates": [
                    {
                        "templateID": this.assureSignTemplateId,
                        "values": [
                            {
                                "name": "Signer Name",
                                "value": this.signerName
                                },
                            {
                                "name": "Signer Email",
                                "value": this.signerEmail
                            }
                        ]
                    }
                ]
            }
        };
        
        const submit = await fetch('https://sb.assuresign.net/api/documentnow/v3.7/submit',
        {
            method: 'POST',
            headers: {
                'Authorization': 'Bearer ' + token,
                'Content-Type': 'application/json',
                'X-AS-UserContext': this.assureSignUserContextId
            },
            body: JSON.stringify(submitBody)
        });

        const jsonSubmit = await submit.json();

        const envelopeId = jsonSubmit.result.envelopeID;
        sessionStorage.setItem('envelopeId', envelopeId);
        const signingLinks = await fetch('https://sb.assuresign.net/api/documentnow/v3.7/envelope/'+ envelopeId +'/signingLinks',
            {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': 'application/json'
                }
            }
        );

        const jsonSigningLinks = await signingLinks.json();
        
        sessionStorage.setItem('redirectUrl', jsonSigningLinks.result.signingLinks[0].url);
        return jsonSigningLinks.result.signingLinks[0].url;
    }

    updateFieldValue(selector, updatedValue) {
        document.querySelector(selector).value = updatedValue;
        document.querySelector(selector).focus();
        document.querySelector(selector).blur();
    }
    
    constructor() {
        super();
    }

    // async connectedCallback() {
    //     super.connectedCallback();
    //     this.content = this.load();
    // }

    updateOnRedirectLabel() {
        if(sessionStorage.getItem('redirectUrl')) {
            this.updateFieldValue(".lilly-hidden-correlation input", sessionStorage.getItem('envelopeId'));
            this.updateFieldValue(".lilly-hidden-signerurl input", sessionStorage.getItem('redirectUrl'));
        }
    }

    // Render the UI as a function of component state
    render() {
        let this2 = this;
        let supportSelectionTimer = setInterval(function () {
            let isSupportSelected = false;
            let inputList = document.querySelectorAll('.lilly-multiple-choice input');
            inputList.forEach(function (item) {
                if (item.checked) {
                    isSupportSelected = true;
                }
            });
            if(isSupportSelected == true) {
                this2.load();
                clearInterval(supportSelectionTimer);
            }
        }, 10);
        let timer = setInterval(function () {
            if(document.querySelector('.redirect-label').offsetParent != null) {
                this2.updateOnRedirectLabel();
                clearInterval(timer);
            }
        }, 10);
        return html``;
    }
}

// registering the web component.
const elementName = 'embedded-assuresign';
customElements.define(elementName, EmbeddedAssureSign);
