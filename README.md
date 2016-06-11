## The Language Nobody Could Come Up With A Good Name For
*Pronounced "Tul-un-qweh-wag-nuf", call it Tulun for short.*

[![Build Status](https://travis-ci.org/liam4/tlnccuwagnf.svg?branch=master)](https://travis-ci.org/liam4/tlnccuwagnf) [![Join the chat at https://gitter.im/liam4/tlnccupwagf](https://badges.gitter.im/liam4/tlnccupwagf.svg)](https://gitter.im/liam4/nearley-test?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is just another programming language we're making for fun. It's mildly based on [another project @liam4 made, PLT](https://github.com/liam4/programming-language-thing), and JavaScript.

It's one of those silly interpret-on-the-go programming languages that **doesn't compile to bytecode**. This means it's probably **much less efficient** than, like, any other programming language.

It's a **functional programming language** (i.e. functions are first class).

It doesn't make sense. Please ignore the fact that it doesn't make sense? Also, hide, far, far away from the source code. It might lash out and hurt somebody's brain.

## Installation / Usage
```sh
# installation
npm install -g tlnccuwagnf

# usage, see
tulun help
```

## Syntax Highlighting
**Atom**: Install the [language-tulun](https://atom.io/packages/language-tulun) package.

**Other Editors**: Tulun has a similar syntax to JavaScript, so just use your editor's JS highlighting instead.

## [Documentation](https://github.com/liam4/tlnccuwagnf/wiki/)

## Examples

### Hello world
```python
print("Hello, world!");
```

### Comments
```python
# python-style #
#: multiline :#
print("Hi!");
```

### Variables
```python
my_var => 42;
print(my_var);
```

### Functions
```python
my_fn => fn(x) {
  return(+(x, 3));
};

print(my_fn(4));
```

### Conditionals
```python
if(true, fn() {
  print("Called for true");
}, fn() {
  print("Called for false");
});
```

## [Syntax](https://github.com/liam4/tlnccuwagnf/wiki/Syntax)

There are basically no control structures. In one command (each separated by semicolons) you can do the following:

* Assign or change a variable. (`variable_name => value`, `variable_name -> new_value`)
* Evaluate an expression.
  * [Call a function](wiki/Syntax#builtins) (`function(arg1, arg2, arg3)`)
  * Get a variable (`variable_name`)
  * Do something related to object properties
  * Evaluate a special token, like a string, number or function

But.. where are things like `if`? Well, `if` is a function. So you'll want to evaluate a call a function expression:

```python
if(true_or_false, call_for_true[, call_for_false]);
```

Here's an example of a program using all the things we showed above. Please excuse Liam's terrible ASCII labelling.

```python
# Variable assign.                              #
#  v--- Variable identifier                     #
#  |    vvvv--- A boolean literal.              #
   x => true;

#  vv-- Get a variable using identifier "if",   #
#  ||  this is built-in so all programs will    #
#  ||  automatically have "if" as a variable.   #
#  || v--- Get a variable using identifier "x", #
#  || |    which we assigned earlier.           #
#  || |  v--- A function literal.               #
   if(x, {

#    vvvvv--- Get a variable using identifier   #
#    |||||    "print", which is also built-in.  #
#    ||||| vvvvvvvv--- A string literal.        #
     print("Hello!");

   });
```

## Should I use it?

No. Its syntax is pretty similar to JavaScript, so why aren't you using JavaScript?

On the other hand, if you're just looking at it as a fun project we made as an experiment, go ahead and use it. I have nothing against you using it - I'd enjoy it if you used it! - but it's not a very good programming language, so don't expect something amazing.

## Can I have a specification?

No. [Cool languages have specifications.](http://www.ecma-international.org/publications/standards/Ecma-262.htm) But we're not sure making a specification for this simple(?) experimental project is either worth it or our style.
