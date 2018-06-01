const { runner } = require('hygen/src')
const Logger = require('hygen/lib/logger')
const path = require('path')

async function main() {
  const hygenOpts = {
    templates: path.join(__dirname, '_templates'),
    cwd: __dirname,
    logger: new Logger(console.log.bind(console)),
    debug: false
  }
  const { stdout, stderr } = await runner([], hygenOpts)
  console.log('', { res })
}
main()
