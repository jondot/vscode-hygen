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
    async () => {
      let workspaceRoot = vscode.workspace.rootPath
      if (!workspaceRoot) {
        vscode.window.showErrorMessage(
          "Hygen doesn't have a workspace to analyze for generators. Please open a folder."
        )
        return
      }
      const cwd = workspaceRoot

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
          value: '--name=mycomponent',
          valueSelection: [7, -1]
        })
        if (res) {
          const log = msg => {}
          const hygenOpts = {
            templates: path.join(cwd, '_templates'),
            cwd,
            logger: new Logger(log),
            debug: false,
            createPrompter: () => prompter
          }
          const results = await runner(
            `${chosen.label} ${res}`.split(' '),
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
