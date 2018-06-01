import * as vscode from 'vscode'
import * as L from 'lodash'
const confirm = async (opts): Promise<boolean> => {
  const val = await vscode.window.showInputBox({
    prompt: opts.message,
    value: 'no'
  })
  if (val && val[0].toLowerCase() == 'y') {
    return true
  }
  return false
}
const input = async (opts): Promise<string> => {
  const val = await vscode.window.showInputBox({
    prompt: opts.message
  })
  return val
}
const list = async (opts): Promise<string> => {
  const chosen: any = await vscode.window.showQuickPick(
    opts.choices.map(choice => ({ label: choice })),
    {
      /**/
    }
  )
  if (chosen) {
    return chosen.label
  }
  return
}

const handlers = {
  confirm,
  input,
  list
}

class Prompter {
  async prompt(singleOrMany) {
    const prompts: Array<any> = L.castArray(singleOrMany)
    const answers = {}
    for (const p of prompts) {
      const opts: any = p
      const handler = handlers[opts.type]
      if (handler) {
        answers[opts.name] = await handler(opts)
      }
    }
    return answers
  }
}

export default new Prompter()
