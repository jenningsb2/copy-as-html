import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as showdown from 'showdown';

interface MarkdownToHTMLSettings {
    removeBrackets: boolean;
    removeEmphasis: boolean;
    removeTags: boolean;
    removeComments: boolean;
    simpleLineBreaks: boolean;
  }
  

  const DEFAULT_SETTINGS: MarkdownToHTMLSettings = {
    removeBrackets: true,
    removeEmphasis: false,
    removeTags: false,
    removeComments: false,
    simpleLineBreaks: false,
  };

export default class MarkdownToHTML extends Plugin {
    settings: MarkdownToHTMLSettings;

    async onload() {
        await this.loadSettings();
        this.addCommand({
            id: 'copy-as-html-command',
            name: 'Copy as HTML command',
            editorCallback: (editor: any) => this.markdownToHTML(editor)
        });
        this.addSettingTab(new MarkdownToHTMLSettingTab(this.app, this));
    }

    markdownToHTML(editor: Editor) {
        const converter = new showdown.Converter();
        converter.setFlavor('github');
        converter.setOption('ellipsis', false);
        let text = editor.getSelection();
        text = text.replace(/==/g, ''); //removing highlighted text emphasis (showdown doesn't handle it)
        text = text.replace(/\^\w+/g, ''); //removing block reference ids
        if (this.settings.removeBrackets) {
            text = text.replace(/\[\[(.*?)\]\]/g, '$1');
          }
          
        if (this.settings.removeEmphasis) {
            text = text.replace(/[*~]+(\w+)[*~]+/g, '$1');
          }
          
        if (this.settings.removeTags) {
            text = text.replace(/#\w+/g, '');
          }

        if (this.settings.removeComments) {
            text = text.replace(/%%.+%%/g, '');
          }

        if (this.settings.simpleLineBreaks) {
          // Allows "semantic line breaks" when writing one sentence per line in Markdown
          converter.setOption('simpleLineBreaks', false);
        }          
        const html = converter.makeHtml(text).toString();
        const withDivWrapper = `<!-- directives:[] -->
            <div id="content">${html}</div>`;

		//@ts-ignore
		const blob = new Blob([withDivWrapper], {
			//@ts-ignore
			type: ["text/plain", "text/html"]
		})
		const data = [new ClipboardItem({
			//@ts-ignore
			["text/plain"]: blob,
			//@ts-ignore
			["text/html"]: blob
		})];
		//@ts-ignore
		navigator.clipboard.write(data);
			
			  
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    onunload() {
        // ...
    }
}

class MarkdownToHTMLSettingTab extends PluginSettingTab {
    plugin: MarkdownToHTML;
  
    constructor(app: App, plugin: MarkdownToHTML) {
      super(app, plugin);
      this.plugin = plugin;
    }
  
    display(): void {
      let { containerEl } = this;
      containerEl.empty();
  
      new Setting(containerEl)
        .setName("Remove Wikilink brackets")
        .setDesc("If enabled, removes wikilink brackets from copied text.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.removeBrackets)
          .onChange(async (value) => {
            this.plugin.settings.removeBrackets = value;
            await this.plugin.saveSettings();
          }));
  
      new Setting(containerEl)
        .setName("Remove text emphasis")
        .setDesc("If enabled, removes text styling such as bold, italics, and highlights.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.removeEmphasis)
          .onChange(async (value) => {
            this.plugin.settings.removeEmphasis = value;
            await this.plugin.saveSettings();
          }));
  
      new Setting(containerEl)
        .setName("Remove hashtags")
        .setDesc("If enabled, removes text immediately after a hashtag.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.removeTags)
          .onChange(async (value) => {
            this.plugin.settings.removeTags = value;
            await this.plugin.saveSettings();
          }));

        new Setting(containerEl)
        .setName("Remove comments")
        .setDesc("If enabled, removes commented text.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.removeComments)
          .onChange(async (value) => {
            this.plugin.settings.removeComments = value;
            await this.plugin.saveSettings();
          }));

        new Setting(containerEl)
        .setName("Remove line breaks")
        .setDesc("If enabled, prevents <br> tags in copied output.")
        .addToggle(toggle => toggle
          .setValue(this.plugin.settings.simpleLineBreaks)
          .onChange(async (value) => {
            this.plugin.settings.simpleLineBreaks = value;
            await this.plugin.saveSettings();
          }));
    }
  }
  
