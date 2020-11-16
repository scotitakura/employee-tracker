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
  function main() {
      return con.promise().query(
          'SELECT \
              e.id, e.first_name, e.last_name, r.title, \
              d.name AS department, r.salary, \
              CONCAT(m.first_name, " ", m.last_name) AS manager \
          FROM employee e \
          LEFT JOIN employee m ON m.id = e.manager_id \
          LEFT JOIN role r ON r.id = e.role_id \
          LEFT JOIN department d ON d.id = r.department_id;'
      )
      .then(([rows, fields]) => console.table('\nAll Employees', rows))
      .then(() => prompt())
  }
  
  function prompt() {
      inquirer.prompt([{
          type: 'list',
          name: 'obj',
          message: 'What would you like to do?',
          choices: [
              {
                  name: 'Add Department',
                  value: Department
              },
              {
                  name: 'Add Role',
                  value: Role
              },
              {
                  name: 'Add Employee',
                  value: Employee
              },
              {
                  name: "I'm done",
                  value: null
              }
          ]
      }]).then(response => {
          if (response.obj != null) {
              response.obj.add(con)
                  .then(() => main())
          } else {
              con.end()
          }
      })
  }
  