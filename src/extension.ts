'use strict'

import * as fs from 'fs'
import * as cp from 'child_process'
import * as vscode from 'vscode'
import * as L from 'lodash'
import prompter from './prompter'

const { resolve, runner, availableActions } = require('hygen')
const Logger = require('hygen/lib/logger')
const path = require('path')

export function activate(_context: vscode.ExtensionContext): void {
  console.log('Hygen Extension: loaded')
  let disposable = vscode.commands.registerCommand(
    'extension.hygen',
    async (params) => {
      let workspaceRoot = vscode.workspace.rootPath
      if (!workspaceRoot) {
        vscode.window.showErrorMessage(
          "Hygen doesn't have a workspace to analyze for generators. Please open a folder."
        )
        return
      }
      const cwd = workspaceRoot
      const generationPath = (params ? params.path : cwd)
      console.log(`Starting generation in: ${generationPath}`)

      const { templates } = await resolve({
        templates: path.join(cwd, 'templates'),
        cwd
      })

      let actions = []
      try {
        actions = await availableActions(templates)
      } catch (ex) {
        vscode.window.showErrorMessage(
          "There's no generators in this workspace. Did you run 'hygen init self' ?"
        )
        return
      }

      const options = L.flatMap(actions, (acts, gen) =>
        acts.map(act => ({
          label: `${gen} ${act}`,
          detail: gen,
          description: act
        }))
      )

      const chosen = await vscode.window.showQuickPick(options, {
        /**/
      })
      if (chosen) {

        const res = await vscode.window.showInputBox({
          value: `--name=mycomponent --path=${generationPath}`,
          valueSelection: [7, 18]
        })
        if (res) {
          const log = msg => {}

          const templateFiles = fs.readdirSync(path.join(templates, chosen.detail, chosen.description))

          const fileSelectionOptions = templateFiles
            .filter(file => file.endsWith('.ejs.t'))
            .map(
              file => (
                  {
                    label: `${file.replace('.ejs.t', '')}`,
                    description: file,
                    picked: true
                  }
                )
            )

          if(fileSelectionOptions && fileSelectionOptions.length) {
            const fileList = await vscode.window.showQuickPick(fileSelectionOptions, { canPickMany: true })

            if (fileList && fileList.length) {
              let finalOptionList = []
              const optionFile = templateFiles.find(file => file.endsWith('options.json'))
 
              if(optionFile && fs.existsSync(path.join(templates, chosen.detail, chosen.description, optionFile))) {
                try {
                  // @ts-ignore
                  const options = JSON.parse(fs.readFileSync(path.join(templates, chosen.detail, chosen.description, optionFile)))
                  const extendedOptions = await vscode.window.showQuickPick(options, { canPickMany: true })

                  // @ts-ignore
                  finalOptionList = options.map(option => `--${option.description}=${extendedOptions.find(i => i.description == i.description) ? 'true': 'false'}`).join(' ')
                } catch (err) {
                  vscode.window.showInformationMessage('Error loading options.json')
                }
              }

              const hygenOpts = {
                templates: path.join(cwd, '_templates'),
                cwd,
                logger: new Logger(log),
                debug: false,
                createPrompter: () => prompter
              }
              const files = fileList.map(item => item.description).join("|")
              const results = await runner(
                `${chosen.label}:${files} ${res} ${finalOptionList}`.trim().split(' '),
                hygenOpts
              )
              if (results.success) {
                vscode.window.showInformationMessage(
                  L.map(
                    results.actions,
                    action => `Hygen: ${action.status} ${action.subject}`
                  ).join('\n')
                )
              }
            }
          }
        }
      }
    }
  )

  _context.subscriptions.push(disposable)
}

export function deactivate(): void {}

let _channel: vscode.OutputChannel
function getOutputChannel(): vscode.OutputChannel {
  if (!_channel) {
    _channel = vscode.window.createOutputChannel('Hygen')
  }
  return _channel
}
