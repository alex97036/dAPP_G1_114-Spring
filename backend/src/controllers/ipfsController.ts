import { create } from '@web3-storage/w3up-client'
import { filesFromPaths } from 'files-from-path'
import { pool } from '../utils/db.js'
import dotenv from "dotenv"
import fs from "fs";
import path from 'path'
import { fileURLToPath } from 'url'
import { Report } from '../types/report.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const docsPath = path.resolve(__dirname, '../../docs')

if (!fs.existsSync(docsPath)) {
  fs.mkdirSync(docsPath, { recursive: true })
}

dotenv.config()

const EMAIL = process.env.EMAIL
const W3SPACE_DID = process.env.W3SPACE_DID

if (!EMAIL || !W3SPACE_DID) {
  throw new Error(".env 缺少 EMAIL 或 W3SPACE_DID")
}

export async function saveToDocs(id: number, info: string) {
    try {
        const filePath = path.join(docsPath, `${id}.txt`); 
        fs.writeFileSync(filePath, info, 'utf8');
        console.log(`Report saved to ${filePath}`)
    } catch (error) {
        console.error('Error uploading file:', error)
    }
}

export async function uploadFile(id: number): Promise<any> {
  const client = await create()
  await client.login(EMAIL as `${string}@${string}`)
  await client.setCurrentSpace(W3SPACE_DID as `did:${string}:${string}`)
  const filePath = path.join(docsPath, `${id}.txt`);
  const files = await filesFromPaths([filePath]); 

  const cid = await client.uploadDirectory(files)
  console.log(`IPFS URL: https://${cid}.ipfs.w3s.link`)
  return cid; 
}

export async function toSol() {
    console.log('todo'); 
}


export async function saveToDB(cid: string) {
    try {
        await pool.query('INSERT INTO report_list (cid) VALUES ($1)', [cid])
        console.log('✅ CID saved to database:', cid)
    } catch (error) {
        console.error('❌ Error saving CID to database:', error)
    }
}

export async function getAllCIDs() {
    try {
        const result = await pool.query<Report>('SELECT * FROM report_list')
        return result.rows.map((row: Report) => row.cid)
    } catch (error) {
        console.error('Error fetching CIDs from database:', error)
        throw error
    }
}


