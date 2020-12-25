
var elatex_edit = false;
var dom_init_loading_done = false;
const kELatexStyle = `
[contenteditable]:focus {
    outline: 0px solid transparent;
 }
 :host {
     position: relative;
     display: inline-block;
 }
 
 :host .tooltiptext {
     width: 100%;
     min-width: 300px;
     visibility: hidden;
     background-color: lightyellow;
     border-style: solid;
     border-color: lightcoral;
     /* color: #fff;*/
     text-align: left;
     padding: 5px 5px 5px 5px;
     border-radius: 6px;
     position: absolute;
     z-index: 1;
     bottom: 100%;
     left: 0%;
     margin-left: 0px;
 }
 
 :host(:hover) .tooltiptext {
     visibility: visible;
 }`
class ELatex extends HTMLElement {
    constructor() {
        super();
        this.result = document.createElement('span');
        this.input = document.createElement('input');
        this.editor = document.createElement('span');
    }
    connectedCallback() {
        var shadow = this.attachShadow({
            mode: 'open'
        });

        this.result.innerText = 'math expressions';
        this.result.setAttribute('contenteditable', 'false');

        this.input.type = 'checkbox';
        this.input.checked = this.hasAttribute('displaymode');

        this.editor.setAttribute('contenteditable', 'true');

        var wrapper = document.createElement('span');
        wrapper.setAttribute('class', 'tooltiptext');
        wrapper.appendChild(this.editor);
        wrapper.appendChild(this.input);

        var link = document.createElement('link');
        link.setAttribute('rel', 'stylesheet');
        link.setAttribute('href', 'https://cdn.jsdelivr.net/npm/katex@0.11.1/dist/katex.min.css');
        link.setAttribute('integrity', 'sha384-zB1R0rpPzHqg7Kpt0Aljp8JPLqbXI3bhnPWROx27a9N0Ll6ZP/+DiW/UqRcLbRjq');
        link.setAttribute('crossorigin', 'anonymous');
        shadow.appendChild(link);
        var style = document.createElement('style');
        style.textContent = kELatexStyle;
        shadow.appendChild(style);
        shadow.appendChild(this.result);
        if (elatex_edit) {
            shadow.appendChild(wrapper);
            var obj = this;
            this.input.addEventListener('click', function() {
                obj.updateByEditor();
            }, false);
            this.editor.addEventListener('input', function() {
                obj.updateByEditor();
            }, false);
        }

        if (dom_init_loading_done) {
            this.initME();
        }
    }

    updateByEditor() {
        this.updateME(this.editor.innerText);
    }

    initME() {
        this.editor.innerText = this.firstChild.textContent;
        this.updateME(this.firstChild.textContent);
    }

    updateME(text) {
        // Update data attribute
        if (typeof katex == 'undefined') {
            return;
        }
        this.firstChild.textContent = text;
        if (this.input.checked) {
            this.setAttribute('displaymode', '');
        } else {
            this.removeAttribute('displaymode');
        }
        if (text == '') {
            if (this.editor.innerText == '') {
                this.editor.innerText = ' '; // If empty, very hard to get input focus.
            }
            console.log('No latex string. Set default.');
            this.result.innerText = 'math expressions';
        } else {
            try {
                katex.render(text, this.result, {
                    throwOnError: true,
                    displayMode: this.hasAttribute('displaymode'),
                    strict: false
                });
            } catch (error) {
                this.result.innerHTML = '<span style="color:red;">' + text + '</span>';
            }
        }
    }
};
customElements.define('e-latex', ELatex);