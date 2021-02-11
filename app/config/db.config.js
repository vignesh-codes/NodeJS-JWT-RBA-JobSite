module.exports = {
    HOST: "localhost",
    USER: "root",
    PASSWORD: "root",
    DB: "myapi",
    dialect: "mysql",
    // Defining DB connection timeout criteria
    pool: { 
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  };
