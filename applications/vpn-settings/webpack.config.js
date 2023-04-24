const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

const getConfig = require('@proton/pack/webpack.config');

const getRewrite = (file) => {
    const extRegex = /\.js(on)?/;

    const replacePathname = file
        // Special case, drop .login from the filename
        .replace('.login', '')
        // Drop json from the path
        .replace(extRegex, '')
        // We replace . with / to pretend mail.signup -> /mail/signup
        .replace('.', '\\/');

    const filename = file
        // Special case, drop .login from the filename
        .replace('.login', '')
        // Output should be an .html file
        .replace(extRegex, '.html');

    return { filename, rewrite: { from: new RegExp(`^\/${replacePathname}$`), to: `/${filename}` } };
};

module.exports = (...env) => {
    const config = getConfig(...env);
    const htmlIndex = config.plugins.findIndex((plugin) => {
        return plugin instanceof HtmlWebpackPlugin;
    });
    const htmlPlugin = config.plugins[htmlIndex];

    const rewrites = [];
    config.devServer.historyApiFallback.rewrites = rewrites;

    const originalTemplateParameters = htmlPlugin.userOptions.templateParameters;

    // We keep the order because the other plugins have an impact
    // Replace the old html webpackplugin with this
    config.plugins.splice(
        htmlIndex,
        1,
        new HtmlWebpackPlugin({
            filename: 'index.html',
            template: path.resolve('./src/app.ejs'),
            templateParameters: {
                ...originalTemplateParameters,
                appTitle: originalTemplateParameters.appName,
            },
            scriptLoading: 'defer',
            inject: 'body',
        })
    );

    const pages = fs.readdirSync('./src/pages');

    // Reverse the pages so that /mail/signup is before /mail
    pages.reverse();

    const getTemplateParameters = (parameters) => {
        let url = originalTemplateParameters.url;
        if (parameters.pathname) {
            url = `${url.replace(/\/$/, '')}${parameters.pathname}`;
        }
        return { ...originalTemplateParameters, ...parameters, url };
    };

    pages.forEach((file) => {
        const parameters = require(`./src/pages/${file}`);

        const { filename, rewrite } = getRewrite(file);
        rewrites.push(rewrite);

        config.plugins.splice(
            htmlIndex,
            0,
            new HtmlWebpackPlugin({
                filename,
                template: path.resolve('./src/app.ejs'),
                templateParameters: getTemplateParameters(parameters),
                scriptLoading: 'defer',
                inject: 'body',
            })
        );
    });

    return config;
};
