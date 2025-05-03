var portalConfig = {
    
    // Bandera para definir el ambiente
    ENV: 'development',

    // Configuraciones por ambiente
    development: {
        serverUrl: "http://localhost:8005/api/",
        socketsUrl: "http://localhost:8880/"
    },
    production: {
        serverUrl: "https://admintorre.com:8002/api/",
        socketsUrl: "https://admintorre.com:8880/"
    }
    
};