/**
 * The services rethrow the raw axios error, and where the status lives depends
 * on how the request died: a server answer carries it on `response`, while a
 * transport failure has no response at all. Both screens that branch on the
 * status read it through here so they agree on what "no status" means.
 */
export function statusOf(error) {
  return error?.response?.status ?? error?.status ?? null
}
