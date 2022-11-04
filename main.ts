import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import * as showdown from 'showdown';

// Remember to rename these classes and interfaces!

export default class MarkdownToHTML extends Plugin {
	async onload() {

		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'copy-as-html-command',
			name: 'Copy as HTML command',
			editorCallback: (editor: any) => this.convertMarkdown(editor, false)
		});

		this.addCommand({
			id: 'copy-as-text-command',
			name: 'Copy as text command',
			editorCallback: (editor: any) => this.convertMarkdown(editor, true)
		});

	}

	convertMarkdown(editor: Editor, convertToText: boolean) {
		const converter = new showdown.Converter();
		let text = editor.getSelection() ? editor.getSelection() : editor.getLine(editor.getCursor().line);
		let noBrackets = text.replace(/\[\[(?:[^\]]+\|)?([^\]]+)\]\]/g, '$1');
		const html = converter.makeHtml(noBrackets).toString();

		let convertedContent;
		if(convertToText) {
			const div = document.createElement("div");
    		div.innerHTML = html;
			convertedContent = div.textContent;
		} else {
			convertedContent = `<!-- directives:[] -->
			<div id="content">${html}</div>`;
		}

		//@ts-ignore
		const blob = new Blob([convertedContent], {
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
