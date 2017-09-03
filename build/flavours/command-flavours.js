"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const yaml = require("js-yaml");
const fs_1 = require("fs");
const result = yaml.safeLoad(fs_1.readFileSync("strings/commands.yaml").toString());
