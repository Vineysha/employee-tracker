const mysql = require('mysql2');
const inquirer = require('inquirer');

// Create connection to MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'vineysha0930',
  database: 'employees_db'
});

// Connect to the database
connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to the MySQL server.');
  startApp();
});
// Function to start the application
function startApp() {
    inquirer
      .prompt({
        name: 'action',
        type: 'list',
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          'Add a department',
          'Add a role',
          'Add an employee',
          'Update an employee role',
          'Exit'
        ]
      })
      .then((answer) => {
        switch (answer.action) {
          case 'View all departments':
            viewDepartments();
            break;
          case 'View all roles':
            viewRoles();
            break;
          case 'View all employees':
            viewEmployees();
            break;
          case 'Add a department':
            addDepartment();
            break;
          case 'Add a role':
            addRole();
            break;
          case 'Add an employee':
            addEmployee();
            break;
          case 'Update an employee role':
            updateEmployeeRole();
            break;
          case 'Exit':
            connection.end();
            break;
        }
      });
  }
  
  // View all departments
  function viewDepartments() {
    // Execute SQL query to select all departments
    connection.query('SELECT * FROM department', (err, res) => {
      if (err) throw err;
      console.table(res);
      startApp(); // Go back to the main menu
    });
  }
  
  // View all roles
  function viewRoles() {
    // Execute SQL query to select all roles with department information
    connection.query('SELECT role.title, role.id, department.name AS department, role.salary FROM role INNER JOIN department ON role.department_id = department.id', (err, res) => {
      if (err) throw err;
      console.table(res);
      startApp(); // Go back to the main menu
    });
  }
  
  // View all employees
  function viewEmployees() {
    // Execute SQL query to select all employees with role and department information
    connection.query('SELECT employee.id, employee.first_name, employee.last_name, role.title AS job_title, department.name AS department, role.salary, CONCAT(manager.first_name, " ", manager.last_name) AS manager FROM employee INNER JOIN role ON employee.role_id = role.id INNER JOIN department ON role.department_id = department.id LEFT JOIN employee AS manager ON employee.manager_id = manager.id', (err, res) => {
      if (err) throw err;
      console.table(res);
      startApp(); // Go back to the main menu
    });
  }
  
  // Add a department
  function addDepartment() {
    inquirer
      .prompt({
        name: 'name',
        type: 'input',
        message: 'Enter the name of the department:'
      })
      .then((answer) => {
        // Execute SQL query to insert a new department
        connection.query('INSERT INTO department SET ?', { name: answer.name }, (err, res) => {
          if (err) throw err;
          console.log('Department added successfully!');
          startApp(); // Go back to the main menu
        });
      });
  }

  // Add a role
  function addRole() {
    // Fetch list of departments from the database
    connection.query('SELECT id, name FROM department', (err, departments) => {
      if (err) throw err;
  
      // Extract department names and IDs for use in prompt
      const departmentChoices = departments.map(department => ({
        name: department.name,
        value: department.id
      }));
  
      // Prompt the user to select a department from the list
      inquirer
        .prompt([
          {
            name: 'title',
            type: 'input',
            message: 'Enter the title of the role:'
          },
          {
            name: 'salary',
            type: 'input',
            message: 'Enter the salary for the role:'
          },
          {
            name: 'department_id',
            type: 'list',
            message: 'What department does the role belong to?',
            choices: departmentChoices
          }
        ])
        .then((answers) => {
          // Execute SQL query to insert a new role with the provided values
          connection.query(
            'INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)',
            [answers.title, answers.salary, answers.department_id],
            (err, res) => {
              if (err) throw err;
              console.log('Role added successfully!');
              startApp(); // Go back to the main menu
            }
          );
        });
    });
  }

// Add an employee

  function addEmployee() {
    // Fetch list of roles from the database
    connection.query('SELECT id, title FROM role', (err, roles) => {
      if (err) throw err;
  
      // Extract role titles and IDs for use in prompt
      const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
      }));
  
      // Fetch list of employees from the database
      connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, employees) => {
        if (err) throw err;
  
        // Extract employee names and IDs for use in prompt
        const employeeChoices = employees.map(employee => ({
          name: employee.full_name,
          value: employee.id
        }));
  
        // Prompt the user to enter employee details
        inquirer
          .prompt([
            {
              name: 'first_name',
              type: 'input',
              message: 'Enter the first name of the employee:'
            },
            {
              name: 'last_name',
              type: 'input',
              message: 'Enter the last name of the employee:'
            },
            {
              name: 'role_id',
              type: 'list',
              message: 'Select the role for the employee:',
              choices: roleChoices
            },
            {
              name: 'manager_id',
              type: 'list',
              message: 'Select the manager for the employee:',
              choices: employeeChoices.concat({ name: 'None', value: null }) // Allow selecting "None" for manager
            }
          ])
          .then((answers) => {
            // Execute SQL query to insert a new employee with the provided values
            connection.query(
              'INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)',
              [answers.first_name, answers.last_name, answers.role_id, answers.manager_id],
              (err, res) => {
                if (err) throw err;
                console.log('Employee added successfully!');
                startApp(); // Go back to the main menu
              }
            );
          });
      });
    });
  }


// Function to update an employee role
function updateEmployeeRole() {
  // Fetch list of employees from the database
  connection.query('SELECT id, CONCAT(first_name, " ", last_name) AS full_name FROM employee', (err, employees) => {
    if (err) throw err;

    // Extract employee names and IDs for use in prompt
    const employeeChoices = employees.map(employee => ({
      name: employee.full_name,
      value: employee.id
    }));

    // Fetch list of roles from the database
    connection.query('SELECT id, title FROM role', (err, roles) => {
      if (err) throw err;

      // Extract role titles and IDs for use in prompt
      const roleChoices = roles.map(role => ({
        name: role.title,
        value: role.id
      }));

      // Prompt the user to select an employee and a new role
      inquirer
        .prompt([
          {
            name: 'employee_id',
            type: 'list',
            message: 'Select the employee you want to update:',
            choices: employeeChoices
          },
          {
            name: 'new_role_id',
            type: 'list',
            message: 'Select the new role for the employee:',
            choices: roleChoices
          }
        ])
        .then((answers) => {
          // Execute SQL query to update the employee's role
          connection.query(
            'UPDATE employee SET role_id = ? WHERE id = ?',
            [answers.new_role_id, answers.employee_id],
            (err, res) => {
              if (err) throw err;
              console.log('Employee role updated successfully!');
              startApp(); // Go back to the main menu
            }
          );
        });
    });
  });
}