import { redirect } from "next/navigation";

/** Getting started moved to the front page; keep the old URL working. */
export default function DocsIndexPage() {
  redirect("/");
}
