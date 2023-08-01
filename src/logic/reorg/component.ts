import SQL from "sql-template-strings"
import { AppComponents } from "../../types"
import { HttpError } from "../http/response"
import { IReOrgComponent, ReOrgOptions } from "./types"

export async function createReOrgComponent(components: Pick<AppComponents, "database">): Promise<IReOrgComponent> {
  const { database } = components

  async function handleReOrg(options: ReOrgOptions) {
    const { blockNumber, schema } = options
    const client = await database.getPool().connect()
    try {
      await client.query("BEGIN")

      const tableQuery = SQL`
        SELECT table_name
            FROM information_schema.columns
            WHERE table_schema = ${schema} AND column_name = 'block_number';`

      const { rows } = await client.query(tableQuery)

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
      throw new HttpError("Couldn't fetch the catalog with the filters provided", 400)
    } finally {
      client.release()
    }
  }

  return {
    handleReOrg,
  }
}
