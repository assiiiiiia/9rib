CREATE DATABASE goalgetter;

USE goalgetter;

CREATE TABLE tasks (
    id INT AUTO_INCREMENT PRIMARY KEY, -- Unique identifier for each task
    task_name VARCHAR(255) NOT NULL, -- Name of the task
    category ENUM(
        'etude',
        'travail',
        'maison',
        'personnel',
        'loisirs',
        'autre'
    ) -- Category of the task (to be populated from a select HTML element) 
    due_date DATE, -- Due date for the task
    due_time TIME, -- Due time for the task
    status ENUM(
        'pas commence',
        'en cours',
        'termine',
        'annule'
    ) DEFAULT 'pas commence', -- Status of the task with a default value
    priority ENUM(
        'moins important',
        'important',
        'urgent'
    ), -- Priority of the task
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, -- Timestamp for when the task was created
    completed_date DATETIME;
    user_id INT, -- Foreign key to link the task to a user
    FOREIGN KEY (user_id) REFERENCES users (id) -- Assuming you have a 'users' table with an 'id' field
);

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL ,
    surname VARCHAR(255) NOT NULL ,
    email VARCHAR(255) NOT NULL ,
    password VARCHAR(255) NOT NULL
);