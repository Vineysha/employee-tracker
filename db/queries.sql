-- Active: 1710292881115@@127.0.0.1@3306@employees_db
SELECT * FROM department;

SELECT role.title, role.id, department.name AS department, role.salary 
FROM role
INNER JOIN department ON role.department_id = department.id;

SELECT employee.id, employee.first_name, employee.last_name, 
       role.title AS job_title, department.name AS department, 
       role.salary, CONCAT(manager.first_name, ' ', manager.last_name) AS manager
FROM employee
INNER JOIN role ON employee.role_id = role.id
INNER JOIN department ON role.department_id = department.id
LEFT JOIN employee AS manager ON employee.manager_id = manager.id;