import { withMiddlewareAuthRequired } from "@auth0/nextjs-auth0/edge";

export default withMiddlewareAuthRequired();

export const config = {
  // Protect dashboard and agent pages; leave landing + auth routes public
  matcher: ["/dashboard/:path*", "/agents/:path*"],
};
