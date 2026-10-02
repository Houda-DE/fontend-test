import fs from 'node:fs'
import path from 'node:path'
import jsonServer from 'json-server'

const source = path.join(process.cwd(), 'db.json')
const target = '/tmp/db.json'
if (!fs.existsSync(target)) fs.copyFileSync(source, target)

const server = jsonServer.create()
server.use(jsonServer.defaults({ noCors: false }))
server.use('/api', jsonServer.router(target))

export default server