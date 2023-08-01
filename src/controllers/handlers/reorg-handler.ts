import { IHttpServerComponent } from "@well-known-components/interfaces"
import { Params } from "../../logic/http/params"
import { asJSON } from "../../logic/http/response"
import { AppComponents, AuthenticatedContext, StatusCode } from "../../types"

export function createReorgHandler(
  components: Pick<AppComponents, "reorg" | "config">
): IHttpServerComponent.IRequestHandler<AuthenticatedContext<"/reorg">> {
  const { reorg } = components

  return async (context) => {
    const params = new Params(context.url.searchParams)
    const blockNumber = params.getNumber("last_valid_block")
    const schema = params.getString("schema")

    const headers = context.request.headers

    if (!blockNumber || !schema) {
      return {
        status: StatusCode.BAD_REQUEST,
        body: "Missing parameters",
      }
    }

    return asJSON(async () => {
      return await reorg.handleReOrg({
        blockNumber,
        schema,
      })
    })
  }
}
