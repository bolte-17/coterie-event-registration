# Result Type

It's a Result/Maybe/Option type.

Idea is to represent a result of an operation that might fail in a manner that doesn't throw exceptions around.

There are certainly other libraries that do the same concept- it's very much not new. This was mostly just a quick, no-dependency, as-needed implementation.

Result type is practically one of the archetypical monads, which isn't really necessary to understand here other than that's why the functions are called `map` and `bind`. We have a bit of trouble here in Typescript vs a more functional language, since juggling a Result pipeline along with async functions causes some headache. It could probably also use some more overloads like mapWith to make type inference a bit easier, since Typescript can't infer types from usage so it requires additional explicit type information for things like `map(foo => f(foo))(fooResult)`- the `foo` parameter of the anonymous function can't be determined even if the type of `fooResult` is known.

To be honest it'd probably be more useful, even within the whole plug-pipeline paradigm to just throw and catch appropriate Errors to handle error responses.

Alternatively, one can't help but notice that Promise looks extremely similar to Result, what with the whole "returns either the result or an error" thing. You're also pretty much already guaranteed to have to deal with Promises if you're doing _anything_ async, and it has some builtin language support already, so maybe it's better to just use Promises a bit creatively in order to do this sort of thing.
