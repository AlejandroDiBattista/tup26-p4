#!/usr/bin/env node
"use strict";

require("@babel/register").default({
    extensions: [".js"],
    ignore: [/node_modules/],
    presets: [
        [require.resolve("@babel/preset-react"), { runtime: "classic" }]
    ]
});

require("./agenda-ink.js");
