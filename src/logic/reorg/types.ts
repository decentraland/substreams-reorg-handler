export type ReOrgOptions = {
  schema: string
  blockNumber: number
}

export interface IReOrgComponent {
  handleReOrg(options: ReOrgOptions): Promise<void>
}
