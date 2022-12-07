import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as showdown from 'showdown';

// Remember to rename these classes and interfaces!

export default class MarkdownToHTML extends Plugin {
	async onload() {

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'copy-as-html-command',
			name: 'Copy as HTML command',
			editorCallback: (editor: any) => this.markdownToHTML(editor)
		});

	}

	markdownToHTML(editor: Editor) {
		const converter = new showdown.Converter();
		converter.setFlavor('github');
		converter.setOption('ellipsis', false);
		const text = editor.getSelection();
		const noBrackets = text.replace(/\[\[(?:[^\]]+\|)?([^\]]+)\]\]/g, '$1');
		const html = converter.makeHtml(noBrackets).toString();
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

	onunload() {

	}
}
