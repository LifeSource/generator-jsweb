var generators  = require("yeoman-generator"),
    _ = require("lodash"),
    util = require('util'),
    path = require('path'),
    yosay = require('yosay'),
    chalk = require('chalk'),
    mkdirp = require("mkdirp"),
    config = require("../../config")();

module.exports = generators.Base.extend({

    constructor: function () {

        generators.Base.apply(this, arguments);

        var options = {
            au: { desc: "Uses the Aurelia development setup.", type: String},
            ng: { desc: "Uses the Angular development setup.", type: String}
        };

        this.argument('appName', { type: String, required: false });
        this.appName = _.camelCase(this.appName);

        this.option("aurelia", options.au);
        this.option("angular", options.ng);
    },

    initializing: function () {
        this.log(yosay("Welcome to web app generator!"));
    },

    _frameworkOptionIsSpecified: function() {
        return (this.options.angular || this.options.aurelia || this.framework === "angular" || this.framework === "aurelia");
    },

    prompting: function () {

        if (this.appName) { return; }

        var done = this.async();

        var prompts = [
            {
                type: "input", name: "appName",
                message: "Please enter your app name: ",
                default: this.config.get("appName") || path.basename(process.cwd())
            }
        ];

        if (!this._frameworkOptionIsSpecified()) {
            prompts.push(
                {
                    type: "list",
                    name: "framework",
                    message: "Which client side framework would you like to use?:",
                    choices: [
                        { name: "none", value: "none" },
                        { name: "aurelia", value: "aurelia" },
                        { name: "angular", value: "angular" }
                    ]
                }
            );
        }

        this.prompt(prompts, function (answers) {
            this.config.set("appName", answers.appName);
            this.config.save();
            if (!this._frameworkOptionIsSpecified()) {
                this.framework = answers.framework;
            }
            done();
        }.bind(this));
    },

    configuring: function () {

    },

    default: function () {

    },

    writing: {

        settings: function () {
            this.directory("settings", "./");
        },

        packageJson: function () {
            this.fs.copyTpl(
                this.templatePath("json/_package.json"),
                this.destinationPath("./package.json"),
                { appName: this.config.get("appName") }
            );
        },

        bowerJson: function() {
            var bowerJson = {
                name: this.config.get("appName"),
                license: "MIT",
                dependencies: {}
            };

            if (this.options.angular || this.framework === "angular") {
                bowerJson.dependencies["angular"] = "~1.4.8";
                bowerJson.dependencies["angular-resource"] = "~1.4.8";
                bowerJson.dependencies["angular-bootstrap"] = "~0.13.4";
                bowerJson.dependencies["angular-ui-router"] = "~0.2.15";
                this.fs.writeJSON("bower.json", bowerJson);
                this.copy("bower/.bowerrc", ".bowerrc");
            }

        },

        server: function () {
            this.directory("server", "src/server");
        },

        scripts: function () {

            if (this.options.aurelia || this.framework === "aurelia") {
                this.directory("frameworks/aurelia", "src/client");
            }

            if (this.options.angular || this.framework === "angular") {
                this.directory("frameworks/angular", "src/client");
            }

            this.copy("js/_config.js", "./config.js");
            this.copy("js/_gulpfile.js", "./gulpfile.js");
        },

        staticAssets: function () {
            this.directory("css", "src/client/css");
            this.directory("styles", "src/client/styles");
            this.directory("images", "src/client/images");
            this.directory("fonts", "src/client/fonts");
        }
    },


    install: function () {
        if (this._frameworkOptionIsSpecified()) {
            this.installDependencies();
        }
    },

    end: function () {
        this.log(chalk.green.bold("\n----->>> Mission Accomplished! <<<-----\n"));
        this.log(chalk.yellow("\nYou may need to run 'npm install' if this was not done as and 'gulp wiredep' before you can serve the application."));
    }

});
