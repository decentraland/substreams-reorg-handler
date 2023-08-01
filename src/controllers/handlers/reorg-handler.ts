import { Params } from "../../logic/http/params"
import { HandlerContextWithPath, StatusCode } from "../../types"

export async function handleReOrg(
  context: Pick<HandlerContextWithPath<"reorg", "/v1/reorg-handler">, "components" | "url">
) {
  const {
    components: { reorg },
    url,
  } = context
  const params = new Params(url.searchParams)
  const blockNumber = params.getNumber("last_valid_block")
  const schema = params.getString("schema")

  if (!blockNumber || !schema) {
    return {
      status: StatusCode.BAD_REQUEST,
      body: {
        ok: false,
        message: "Missing parameters",
      },
    }
  }

  await reorg.handleReOrg({
    blockNumber,
    schema,
  })

  return {
    status: StatusCode.OK,
    body: {
      ok: true,
    },
  }
}
