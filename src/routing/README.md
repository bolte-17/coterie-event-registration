# Routing

This application experiments with a slightly unconventional approach to managing the HTTP Request and Response objects. It's highly inspired by the [Plug](https://hexdocs.pm/plug/readme.html) library for [Elixir](https://elixir-lang.org/) and reuses some of the terminology.

The overall concept is to treat the full request/response in a very functional manner, isolating mutations and side-effect-causing functions like `ServerResponse.write` from as much of the application as possible. This allows for easier testing of individual units of the pipeline, as individual endpoints have no dependency on the actual req/res objects and are relatively pure functions.

## Conn Object

[Conn](conn.ts) represents a composition of the relevant properties of the HTTP request and a staging ground for the data to be written to the response. 

While not enforced, the conn is treated as immutable, so changes are usually made via the spread operator like `{...previousConn, changedProperty: newValue}`. Treating objects as immutale as much as possible allows any given function to be relatively sure that the conn it receives won't be modified out from underneath it, even if it passes it along to other functions in the pipeline.

You can see an example where this is useful in the [`ensureAuth`](../auth.ts) function- it modifies the `path` value of the conn so subroutes don't have to repeat the prefix to properly match.

## Plugs
Given a conn, we then define a Plug as basically any function that takes a Conn and returns a (possibly) new Conn.

The very fun result is that Plugs are _extremely_ composable.

Given plugs `P1` and `P2`, the composition of the two `conn => P1(P2(conn))` is itself a Plug. We can also make a variety of useful higher-order functions to create Plugs- for example, the `route` (and simple aliases `get` and `post`) functions in [routing.ts](routing.ts) that, given a route and a child plug, delegates to the child plug if the provided route matches the requested URL and simply returns the conn otherwise, effectively a no-op.

The plug pipeline is also a useful structure for cross-cutting concerns like authentication- we can define a plug to protect a certain route prefix or other group of child plugs and validate that the request matches expectations.

Finally, as each plug is itself a pretty simple, pure function, we don't have to do much mocking to test most of them. While a mocking library could certainly have been useful (especially for the DB), we were able to relatively easily write unit tests for individual endpoints or middleware without pulling that dependency in.

## Router

We compose all our endpoints (which are Plugs) and middleware (also Plugs) into a pipeline of plugs in [router.ts](router.ts). The composed router is also itself a plug, which we can then test against to check that our routing and middleware all work nicely together. It also results in a pretty nicely readable file representing an overall sitemap.
