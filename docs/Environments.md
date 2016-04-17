# Environments

Environments are used to dynamically create, modify, and do various other things with variables.

You can get started with environments by getting the current environment the interpreter is using. Just use the `environment` keyword to do so:

```
env => environment
```

`env` now stores the interpreter's environment -- basically it's a container for all the variables within the (implicitly) given scope.

You can access the value of the variable "foo" like so:

```
env.foo
```

And you can set it to 42 like so:

```
env.foo > 42;
```

Setting a variable using the environment will dynamically create it within the scope:

```
print(foo); # 42 #
```

Using this method of setting a variable is equivalent to assigning a variable: `env.var > val` is the same as `var => val`.

You can also make a variable with `variable_make`:

```
variable_make(env, 'foo', 42);
```

## Raw variables

You can access the raw variable objects using `variable_raw`:

```
foo_var => variable_raw(env, 'foo'); # <Variable> #
```

Variables can be changed with `variable_change`:

```
variable_change(foo_var, 'new foo value');
```

The value of a variable can be gotten with `variable_value`:

```
print(variable_value(foo_var)); # new foo value #
```

You can't get a non-existant variable:

```
variable_raw(env, 'fake_variable') # error #
```

You can use `variable_exists` to check if a variable exists within a given environment:

```
variable_exists(env, 'fake_variable') # false #
variable_exists(env, 'foo') # true #
```
