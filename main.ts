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
			let text = editor.getSelection();
			let noBrackets = text.replace(/\[|\]/g, '');
			const html = converter.makeHtml(noBrackets);
			var blob = new Blob([html], {type:"text/html"});
			//@ts-ignore
			var data = [new ClipboardItem({[blob.type]: blob})];
			//@ts-ignore
			navigator.permissions.query({ name: "clipboard-write" }).then((result) => {
				if (result.state == "granted" || result.state == "prompt") {
					navigator.clipboard.write(data).then(function() {
					/* success */
					}, function(e) {
					console.log(e, "fail")
					})
				}
				})

		}

		onunload() {
	
		}
	}
