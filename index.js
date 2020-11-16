const inquirer = require('inquirer')
const mysql = require('mysql2')

const Department = require('./lib/Department.js')
const Role = require('./lib/Role.js')
const Employee = require('./lib/Employee.js')

const con = mysql.createConnection({
  host: 'localhost', 
  user: 'root',
  database: 'team'
});

con.promise()
  .query('DROP TABLE IF EXISTS employee, role, department;')
  .then(() => console.log('All tables dropped.'))
  .catch((err) => {
      console.error('Could not drop tables: ' + err.sqlMessage)
  })

  .then(() => Department.createTable(con))
  .then(() => Role.createTable(con))
  .then(() => Employee.createTable(con))

  .then(() => Department.seedTable(con))
  .then(() => Role.seedTable(con))
  .then(() => Employee.seedTable(con))

  .then(() => main())

  .catch(console.error)