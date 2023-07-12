# maccha
Pattern matching for js


## About name

[maccha](https://en.wikipedia.org/wiki/Matcha) - fine powder tea. As in case of tea, you could make the pattern fine powder for matching. Also "maccha" (matcha) sounds similarly with "matching" 

## Short description
Matchable value could be:
- primitive or wrapper object of primitive
- array (`[1,2,3]` or `new Array(1,2,3)`)
- struct (`{a:1, b:2, c:"3"}`)
- instance of user class
- composition entity of last three cases

`match` takes matchable value and returns a function which takes a sequence of `ca$e`'s.

Each of `ca$e` takes the pattern as first argument and rest sequence of arguments are `guards` (additional predicates of matchable value). `ca$e` returns a function which takes a callback function - it be execute if matching would be successful. `ca$e` matching execute one by one up to down.

`el$e` - just default action if none of `ca$e`'s will be successful. If `el$e` is absent and there is no any successful matching it throws Error.

`ANY` is just a constant a-la wildcart.

`TAIL` is another constant. It uses for tail of array for pattern.

## Example

```js
match({x:1,y: {z: 2}})(
    ca$e({x:1, y:2, z: ANY}, (obj => obj.z > 10))(obj => "struct with x, y, z and z is more than 10"),
    ca$e([1, 2, TAIL])(arr => "1,2,.... and something else"),
    ca$e({x:1, y: {z: 2}})(obj => "It's very complex object"),
    el$e(any => `It something different`)
)

// "It's very complex object"
```