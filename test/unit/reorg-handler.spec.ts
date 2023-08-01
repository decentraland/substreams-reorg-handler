import { handleReOrg } from "../../src/controllers/handlers/reorg-handler"
import { AppComponents, StatusCode } from "../../src/types"
import { createTestReOrgComponent } from "../components"

let components: Pick<AppComponents, "reorg">

describe("Reorg Handler", () => {
  const mockReorg = {
    handleReOrg: jest.fn(),
  }

  beforeEach(() => {
    jest.resetAllMocks()
    components = {
      reorg: createTestReOrgComponent({ handleReOrg: mockReorg.handleReOrg }),
    }
  })

  it("should successfully handle reorganization with valid parameters", async () => {
    const blockNumber = 12345
    const schema = "mySchema"

    mockReorg.handleReOrg.mockResolvedValue({ success: true })
    const response = await handleReOrg({
      url: new URL(`http://localhost/reorg?last_valid_block=${blockNumber}&schema=${schema}`),
      components,
    })

    expect(response).toEqual({ status: StatusCode.OK, body: { ok: true } })
    expect(mockReorg.handleReOrg).toHaveBeenCalledWith({ blockNumber, schema })
  })

  it("should return BAD_REQUEST for missing blockNumber", async () => {
    const schema = "mySchema"
    const response = await handleReOrg({
      url: new URL(`http://localhost/reorg?&schema=${schema}`),
      components,
    })

    expect(response).toEqual({ status: StatusCode.BAD_REQUEST, body: { ok: false, message: "Missing parameters" } })
    expect(mockReorg.handleReOrg).not.toHaveBeenCalled()
  })

  it("should return BAD_REQUEST for missing schema", async () => {
    const blockNumber = 12345
    const response = await handleReOrg({
      url: new URL(`http://localhost/reorg?&block_number=${blockNumber}`),
      components,
    })

    expect(response).toEqual({ status: StatusCode.BAD_REQUEST, body: { ok: false, message: "Missing parameters" } })
    expect(mockReorg.handleReOrg).not.toHaveBeenCalled()
  })
})
