import { loadPosts } from "../../lib/posts";
import { ogImage } from "../../lib/og";

export async function getStaticPaths() {
  const { LIVE } = await loadPosts();
  return [
    ...LIVE.map((post) => ({ params: { id: post.id }, props: { post } })),
    { params: { id: "default" }, props: { post: null } },
  ];
}

export async function GET({ props }: any) {
  return new Response(await ogImage(props.post), { headers: { "Content-Type": "image/png" } });
}
