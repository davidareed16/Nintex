import { html, LitElement } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { PluginContract } from '@nintex/form-plugin-contract';

@customElement('lilly-google-analytics')
export class LillyGoogleAnalytics extends LitElement {

  @property()
  gtmId!: string;

  public static getMetaConfig(): Promise<PluginContract> {
    return import('./google-analytics.config').then(x => x.config);
  }

  firstUpdated() {
    let head = document.getElementsByTagName('head')[0];
    let gaDiv = document.createElement('script');
    gaDiv.innerHTML = `
    (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','${this.gtmId}');
    `;
    head.prepend(gaDiv);
  }

  render() {

    return html``;
  }
}
v
