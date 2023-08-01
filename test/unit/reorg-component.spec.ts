import { IPgComponent } from "@well-known-components/pg-component"
import { HttpError } from "../../src/logic/http/response"
import { createReOrgComponent } from "../../src/logic/reorg/component"
import { createTestPgComponent } from "../components"
import { IReOrgComponent } from "../../src/logic/reorg/types"

let dbQueryMock: jest.Mock
let dbClientQueryMock: jest.Mock
let dbClientReleaseMock: jest.Mock
let pg: IPgComponent
let reOrgComponent: IReOrgComponent

describe("ReOrg Component", () => {
  beforeEach(() => {
    dbClientQueryMock = jest.fn()
    dbClientReleaseMock = jest.fn().mockResolvedValue(undefined)
    pg = createTestPgComponent({
      query: dbQueryMock,
      getPool: jest.fn().mockReturnValue({
        connect: () => ({
          query: dbClientQueryMock,
          release: dbClientReleaseMock,
        }),
      }),
    })
    reOrgComponent = createReOrgComponent({ database: pg })
  })

  describe("and the query returns the table names and handles the deleting correctly", () => {
    beforeEach(() => {
      dbClientQueryMock.mockResolvedValue({ rows: [{ table_name: "myTable" }] })
    })
    it("should successfully handle reorganization", async () => {
      const blockNumber = 12345
      const schema = "mySchema"
      const result = await reOrgComponent.handleReOrg({ blockNumber, schema })
      await expect(result).toBeUndefined()

      expect(dbClientQueryMock).toHaveBeenCalledTimes(4) // 1 for the BEGIN, 1 to get table names, 1 for the DELETE, 1 for the COMMIT
      expect(dbClientReleaseMock).toHaveBeenCalled()
    })
  })

  describe("and the query returns the table names but fails to delete", () => {
    beforeEach(() => {
      dbClientQueryMock.mockRejectedValueOnce(new Error("Database error"))
    })
    it("should throw an HttpError when an exception occurs", async () => {
      const blockNumber = 12345
      const schema = "mySchema"

      const reOrgComponent = await createReOrgComponent({ database: pg })

      await expect(reOrgComponent.handleReOrg({ blockNumber, schema })).rejects.toThrow(HttpError)
      expect(dbClientQueryMock).toHaveBeenCalledTimes(2) // 1 for the BEGIN, 1 for the ROLLBACK
      expect(dbClientReleaseMock).toHaveBeenCalled()
    })
  })
})
