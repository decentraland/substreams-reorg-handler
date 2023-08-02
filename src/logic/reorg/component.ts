import SQL from "sql-template-strings"
import { AppComponents, StatusCode } from "../../types"
import { HttpError } from "../http/response"
import { IReOrgComponent, ReOrgOptions } from "./types"

export function createReOrgComponent(components: Pick<AppComponents, "database">): IReOrgComponent {
  const { database } = components

  async function handleReOrg(options: ReOrgOptions) {
    const { blockNumber, schema } = options
    console.log(`Handling ReOrg with blockNumber: ${blockNumber} and schema: ${schema}`)
    const pool = database.getPool()
    const client = await pool.connect()
    try {
      await client.query("BEGIN")

      const tableQuery = SQL`
        SELECT table_name
            FROM information_schema.columns
            WHERE table_schema = ${schema} AND column_name = 'block_number';`

      const response = await client.query(tableQuery)
      const rows = response.rows

      for (const row of rows) {
        const { table_name } = row

        const deleteQuery = SQL`
          DELETE FROM `
          .append(schema)
          .append(SQL`.`.append(table_name).append(SQL` WHERE block_number::numeric > ${blockNumber};`))

        await client.query(deleteQuery)
      }

      await client.query("COMMIT")

      return Promise.resolve()
    } catch (e) {
      console.error(e)
      await client.query("ROLLBACK")
      throw new HttpError("Couldn't handle the ReOrg correctly", StatusCode.BAD_REQUEST)
    } finally {
      client.release()
    }
  }

  return {
    handleReOrg,
  }
}
