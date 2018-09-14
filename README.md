# Hygen for VSCode

This extension bundles [Hygen](http://www.hygen.io/) into VSCode and offers seamless code generator functionality right into your editor.

## Usage

Main usage is through command pallete (Shift+Cmd+P) and search for 'Hygen'.

It's recommended to set a shortcut (but none is set by default).

You can also right click on a folder in the explorer and run the generator in that location. Default is the workspace root.

## Settings

There are 2 settings that drive more interactive features. These include:

- `hygen.showFileSelector (false)` : If selected will show a file selector when running command to allow you to dynamically choose files from the directory
- `hygen.showOptionSelector (true)` : If selected will show a option selector when there is an `options.json` file in the directory

## Provided Variables

The following variables will be provided for use inside templates.

- `templateFiles` : A `|` separated list of files that will be generated. This can be used inside a template to generate special code if another file is also being generated
- `{option}` : Any option that was selected which is driven by a `options.json` file in the same directory (see below for example)

## Example `options.json`

```[json]
[
  {
    "label": "Stateless",
    "description": "isStateless",
    "picked": true
  }
]
```

The above file will provide the template with a `isStateless` option that will be either `'true'` or `'false'` depending on if it was selected



For more information see the [Hygen website](http://www.hygen.io/).
