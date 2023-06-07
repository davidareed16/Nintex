import {css, html, LitElement, styleMap, until} from 'https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js';

export class EmbeddedAssureSign extends LitElement {
    // Define scoped styles right with your component, in plain CSS
    static styles = css`
      :host {
        height: 100%;
        width: 100%;
        display: block;
      }

      .frame {
        display: inline-block;
        height: 100%;
        width: 100%;
        background-color: transparent;
        border: none;
      }
    `;
    
    static properties = {
        src: { type: String },
        content: { type : String },
        envelopeName: { type: String },
        height: { type: String },
        signerName: { type: String },
        signerEmail: { type: String },
        signerPhone: { type: String },
        assureSignApiUsername: { type: String },
        assureSignApiKey: { type: String },
        assureSignTemplateId: { type: String }
    }
    
    static getMetaConfig() {
        // plugin contract information
        return {
            controlName: 'Embedded-AssureSign',
            fallbackDisableSubmit: false,
            description: 'IFrame component which can render AssureSign envelope',
            iconUrl: "pen",
            groupName: 'signature',
            version: '1.3',
            properties: {
                height: {
                    type: 'string',
                    title: 'Height',
                    description: 'Height of the component',
                },
                envelopeName: {
                    type: 'string',
                    title: 'Envelope Name'
                },
                signerEmail: {
                    type: 'string',
                    title: 'Signer Email'
                },
                signerName: {
                    type: 'string',
                    title: 'Signer Name'
                },
                signerPhone: {
                    type: 'string',
                    title: 'Signer Phone Number'
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
        };
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
                'Content-Type': 'application/json'
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
                                "name": "Envelope Name",
                                "value": this.envelopeName
                            },
                            {
                                "name": "Language",
                                "value": "en-US"
                            },
                            {
                                "name": "Patient Name",
                                "value": this.signerName
                                },
                            {
                                "name": "Patient Email",
                                "value": this.signerEmail
                            }
                        ]
                    }
                ]
            }
        }
        
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
        
        let styles = {height: this.height};
        return html`
            <iframe
            class="frame"
            style=${styleMap(styles)}
            allow="geolocation *; microphone; camera"
            src=${jsonSigningLinks.result.signingLinks[0].url}
            ></iframe>`;
    }
    
    constructor() {
        super();
        this.envelopeName = 'Envelope Name',
        this.height = '900px'
    }

    async connectedCallback() {
        super.connectedCallback();
        this.content = this.load();
    }

    // Render the UI as a function of component state
    render() {
        return html`${until(this.content, html`<span>Loading...</span>`)}`
    }
}

// registering the web component.
const elementName = 'embedded-assuresign';
customElements.define(elementName, EmbeddedAssureSign);
