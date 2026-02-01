function postStartupInstructions(siteDir, config) {
    console.log(
        "Generation of source code, configurations, toolchain and installation of packages successfully finished."
    );
    if (config.nginx) {
        console.log("To enable NGINX reverse proxy:");
        console.log(
            "1. Copy config file for desired envrionment to NGINX directory and enable it"
        );
        for (let env of ["development", "stage", "production"]) {
            console.log(
                `For '${env}' environment exec while in project directory:`
            );
            console.log(
                `$ sudo cp nginx/${env}.conf /etc/nginx/sites-available/${config.hostname[env]}.conf`
            );
            console.log(
                `$ sudo ln -s /etc/nginx/sites-available/${config.hostname[env]}.conf /etc/nginx/sites-enabled/${config.hostname[env]}.conf`
            );
        }
        console.log("2. Restart NGINX server");
        console.log("$ sudo systemctl restart nginx");
    }
    console.log(
        `To start server navigate to [project]/site directory (cd '${siteDir}') and run 'npm start'`
    );
}

export { postStartupInstructions };
