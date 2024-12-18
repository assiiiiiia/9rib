import express from 'express';
import db from './db.js';

const router = express.Router();

// Ensure all paths include `/api`
const apiBasePath = '/api';

// Middleware to prefix all routes with `/api`
router.use(apiBasePath, (req, res, next) => {
  next();
});


//isAuthenticated
const isAuthenticated = (req, res, next) => {
  if (req.session && req.session.userId) {
    return next(); // Proceed to the next middleware or route handler
  } else {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

// Get the number of tasks due today
router.get('/tasks/today', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT COUNT(*) AS taskCount
    FROM tasks
    WHERE user_id = ? AND DATE(CONCAT(due_date, ' ', IFNULL(due_time, '00:00:00'))) = CURDATE() 
    AND (status = 'pas commencé' OR status = 'en cours')
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching daily task count:', err);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération du nombre de tâches.' });
    }
    
    res.json({ taskCount: results[0].taskCount });
  });
});

// Get all the tasks of today for the logged-in user
router.get('/tasks', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT * 
    FROM tasks
    WHERE user_id = ? AND DATE(due_date) = CURDATE()  
      AND (status = 'pas commence' OR status = 'en cours')
    ORDER BY FIELD(priority, 'urgent', 'important', 'moins important')
  `;

  db.query(query, [userId], (err, results) => {
  
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Server Error');
    }
    res.json(results); // Retourner les tâches de l'utilisateur connecté
  });
});

// API endpoint to fetch tasks grouped by status
router.get('/tasks-by-status', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

  const query = `
    SELECT * 
    FROM tasks
    WHERE user_id = ?
    ORDER BY FIELD(status, 'pas commence', 'en cours', 'termine')`;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tâches :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    const groupedTasks = {
      "pas commence": [],
      "en cours": [],
      "termine": [],
    };

    results.forEach((task) => {
      if (groupedTasks[task.status]) {
        groupedTasks[task.status].push(task);
      }
    });

    res.json(groupedTasks);
  });
});

// Add a task
router.post('/tasks-add', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session
  const { task_name, category, due_date, due_time, priority, status} = req.body;

  console.log('Route /tasks-add appelée avec les données :', req.body);
  console.log('Session User ID:', userId); // Afficher l'ID de l'utilisateur pour le débogage

  // Validation de la priorité
  const validPriorities = ['moins important', 'important', 'urgent'];
  if (!validPriorities.includes(priority)) {
    return res.status(400).json({ message: "Priorité invalide." });
  }

  // Validation de la date d'échéance
  const currentDate = new Date(); // Date actuelle
  const currentDateOnly = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  let dueDateObj;
  if (due_date) {
    dueDateObj = new Date(due_date); // Convertir la date d'échéance
    const dueDateOnly = new Date(dueDateObj.getFullYear(), dueDateObj.getMonth(), dueDateObj.getDate());

    if (dueDateOnly < currentDateOnly) {
      return res.status(400).json({ message: "La date d'échéance ne peut pas être dans le passé." });
    }
  }

  // Requête SQL pour insérer la tâche
  const query = `INSERT INTO tasks (task_name, category, due_date, due_time, priority, user_id, status) VALUES (?, ?, ?, ?, ?, ?, ?)`;
  const values = [
    task_name || null,   // Nom de la tâche
    category || null,    // Catégorie
    due_date || null,    // Date d'échéance
    due_time || null,    // Heure d'échéance
    priority || null,     // Priorité
  
    userId,               // ID de l'utilisateur connecté
    status || 'pas commence'
  ];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Erreur lors de l'insertion de la tâche :", err);
      return res.status(500).json({ message: "Erreur lors de l'insertion de la tâche." });
    }

    res.status(201).json({ message: "Tâche insérée avec succès !", taskId: result.insertId });
  });
});


// Route pour modifier les informations d'une tâche pour l'utilisateur connecté
router.put('/tasks/:id', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session
  const taskId = req.params.id;
  const { task_name, category, due_date, due_time, priority, status } = req.body;

  if (!taskId) {
    return res.status(400).json({ message: 'Task ID is required.' });
  }

  // On vérifie si la tâche appartient à l'utilisateur connecté
  const taskOwnershipQuery = `SELECT * FROM tasks WHERE id = ? AND user_id = ?`;
  db.query(taskOwnershipQuery, [taskId, userId], (err, result) => {
    if (err) {
      console.error('Error checking task ownership:', err);
      return res.status(500).json({ message: 'Internal error while checking task ownership.' });
    }

    if (result.length === 0) {
      return res.status(403).json({ message: 'You are not authorized to update this task.' });
    }

    const existingTask = result[0]; // Get the existing task data
    const updates = [];
    const values = [];

    // If no values are provided for task_name, use the existing one
    if (task_name) {
    updates.push('task_name = ?');
    values.push(task_name);
  }
  if (category) {
    updates.push('category = ?');
    values.push(category);
  }

  // Only update the due_date if it's provided (avoid overwriting the date)
  if (due_date) {
    updates.push('due_date = ?');
    values.push(due_date);
  }
  if (due_time) {
    updates.push('due_time = ?');
    values.push(due_time);
  }
  if (priority) {
    updates.push('priority = ?');
    values.push(priority);
  }
  if (status === "termine") {
    updates.push("status = ?");
    values.push(status);
    updates.push("completed_date = NOW()");
  } else {
    // If status isn't being updated to "termine", don't change the completed_date
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }
  }

  if (updates.length === 0) {
    return res.status(400).json({ message: 'No data to update.' });
  }

  const updateQuery = `
    UPDATE tasks 
    SET ${updates.join(', ')} ,completed_date = NOW()
    WHERE id = ?;
  `;
  values.push(taskId);

  db.query(updateQuery, values, (err, result) => {
    if (err) {
      console.error('Error updating task:', err);
      return res.status(500).json({ message: 'Internal error while updating task.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task updated successfully!' });
    });
  });
});

// Endpoint to update the status of a task to 'termine' for the logged-in user
router.put('/tasks/complete/:id', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Get the logged-in user's ID from the session
  const taskId = req.params.id;

  // First, check if the task belongs to the logged-in user
  const taskOwnershipQuery = `SELECT * FROM tasks WHERE id = ? AND user_id = ?`;
  db.query(taskOwnershipQuery, [taskId, userId], (err, result) => {
    if (err) {
      console.error('Error checking task ownership:', err);
      return res.status(500).send('Internal error while checking task ownership.');
    }

    if (result.length === 0) {
      return res.status(403).send('You are not authorized to update this task.');
    }

    // If the task belongs to the user, proceed to update the status
    const query = 'UPDATE tasks SET status = "termine", completed_date = NOW() WHERE id = ?';
    
    db.query(query, [taskId], (err, results) => {
      if (err) {
        console.error('Error updating task status:', err);
        res.status(500).send('Error updating task status');
      } else if (results.affectedRows === 0) {
        res.status(404).send('Task not found');
      } else {
        res.json({ message: 'Task marked as complete', taskId });
      }
    });
  });
});
// API endpoint to fetch completed tasks grouped by completed_date
router.get('/history', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

  const query = `
    SELECT * 
    FROM tasks
    WHERE user_id = ? AND status = "termine"
    ORDER BY completed_date DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Erreur lors de la récupération des tâches :", err);
      return res.status(500).json({ error: "Erreur serveur" });
    }

    // Group tasks by completed_date
    const groupedTasks = results.reduce((groups, task) => {
      const completedDate = task.completed_date;

      // Handle invalid or missing completed_date gracefully
      let date = 'Date inconnue'; // Default value for invalid dates
      if (completedDate && typeof completedDate === 'string') {
        // If it's a string, extract the date part
        date = completedDate.split("T")[0]; 
      } else if (completedDate instanceof Date) {
        // If it's a Date object, format it
        date = completedDate.toISOString().split("T")[0];
      }

      // Group tasks by date
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(task);
      return groups;
    }, {});

    res.json(groupedTasks); // Send grouped tasks to the frontend
  });
});


// Endpoint to get deleted tasks=> trashh
router.get('/deleted', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

  const query = 'SELECT * FROM tasks WHERE user_id = ? AND status = "annule"';
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
    return res.json(results);
  });
});

// Delete task endpoint
router.delete('/tasks/:id', (req, res) => {
  const taskId = req.params.id;

  if (!taskId) {
    return res.status(400).json({ message: 'Task ID is required.' });
  }

  const deleteQuery = 'DELETE FROM tasks WHERE id = ?';
  
  db.query(deleteQuery, [taskId], (err, result) => {
    if (err) {
      console.error('Error deleting task:', err);
      return res.status(500).json({ message: 'Internal error while deleting task.' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    res.json({ message: 'Task deleted successfully!' });
  });
});

// PUT endpoint to restore a task by changing its status
router.put("/restore/:id", (req, res) => {
  const taskId = req.params.id;

  // Only update the status to "pas commence"
  const query = "UPDATE tasks SET status = ? WHERE id = ?";
  const newStatus = "pas commence";

  db.query(query, [newStatus, taskId], (err, results) => {
    if (err) {
      console.error("Error restoring task:", err);
      return res.status(500).send("Error restoring task.");
    }

    if (results.affectedRows === 0) {
      return res.status(404).send("Task not found.");
    }

    res.send({ message: "Task restored successfully.", taskId, status: newStatus });
  });
});


// Endpoint to update task status to 'annule'
router.put('/tasks/cancel/:id', (req, res) => {
  const taskId = req.params.id;

  // Update the task status in the database
  const query = 'UPDATE tasks SET status = ? WHERE id = ?';
  db.query(query, ['annule', taskId], (error, results) => {
    if (error) {
      console.error('Error updating task status:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }

    // If no rows are affected, the task might not exist
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: 'Task not found' });
    }

    res.status(200).json({ message: 'Task status updated to "annule"' });
  });
});



// Endpoint to get tasks organized by category
router.get('/tasks-by-category', isAuthenticated, (req, res) => {
    const userId = req.session.userId; // Retrieve the logged-in user's ID from the session

    const query = `
        SELECT * 
        FROM tasks
        WHERE user_id = ?
        AND (status = 'pas commence' OR status = 'en cours')
        ORDER BY FIELD(category, 'etude', 'travail', 'maison', 'personnel', 'loisirs', 'autre')`;

    db.query(query, [userId], (err, results) => {
        if (err) {
            console.error("Erreur lors de la récupération des tâches :", err);
            return res.status(500).json({ error: "Erreur serveur" });
        }

        const groupedTasks = {
            etude: [],
            travail: [],
            maison: [],
            personnel: [],
            loisirs: [],
            autre: [],
        };

        results.forEach((task) => {
            if (groupedTasks[task.category]) {
                groupedTasks[task.category].push(task);
            }
        });

        res.json(groupedTasks);
    });
});


//route pour les stat
router.get('/statistiques', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT status, COUNT(*) AS count,
           ROUND((COUNT(*) * 100) / (SELECT COUNT(*) FROM tasks WHERE user_id = ?), 2) AS percentage
    FROM tasks
    WHERE user_id = ?
    GROUP BY status
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching statistics:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results);
  });
});
// Route pour les statistiques des tâches d'aujourd'hui
router.get('/statistiques/today', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT status, COUNT(*) AS count,
           ROUND((COUNT(*) * 100) / (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND DATE(due_date) = CURDATE()), 2) AS percentage
    FROM tasks
    WHERE user_id = ? AND DATE(due_date) = CURDATE()
    GROUP BY status
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching statistics:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results);
  });
});


// Route to fetch weekly completed tasks
router.get('/statistiques/weekly-completed', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT
      YEAR(completed_date) AS year,
      WEEK(completed_date, 1) AS week_number, -- Get the ISO week number
      DAYNAME(completed_date) AS day_of_week,
      COUNT(*) AS completed_tasks
    FROM
      tasks
    WHERE
      status = 'termine' -- Filter by 'completed' status
      AND user_id = ? -- Filter by the logged-in user
      AND completed_date >= CURDATE() - INTERVAL 7 DAY -- Last week
    GROUP BY
      YEAR(completed_date), 
      WEEK(completed_date, 1), 
      DAYNAME(completed_date)
    ORDER BY
      YEAR(completed_date),
      WEEK(completed_date, 1),
      FIELD(DAYNAME(completed_date), 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday');
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching weekly completed tasks:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results); // Return the results for completed tasks
  });
});
// Route pour récupérer le nombre de tâches par catégorie
router.get('/statistiques/categories', isAuthenticated, (req, res) => {
  const userId = req.session.userId;

  const query = `
    SELECT categories.category AS category, COUNT(tasks.id) AS task_count
    FROM (
      SELECT 'travail' AS category
      UNION ALL SELECT 'etude'
      UNION ALL SELECT 'maison'
      UNION ALL SELECT 'personnel'
      UNION ALL SELECT 'loisirs'
      UNION ALL SELECT 'autre'
    ) AS categories
    LEFT JOIN tasks ON categories.category = tasks.category AND tasks.user_id = ?
    GROUP BY categories.category;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des tâches par catégorie:', err);
      return res.status(500).json({ message: 'Erreur serveur' });
    }

    // Capitaliser la première lettre de chaque catégorie avant d'envoyer la réponse
    const formattedResults = results.map(entry => ({
      category: entry.category.charAt(0).toUpperCase() + entry.category.slice(1),
      task_count: entry.task_count,
    }));

    res.json(formattedResults);
  });
});
// Get total number of tasks for the logged-in user
router.get('/tasks/count', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT COUNT(*) AS total_taches 
    FROM tasks
    WHERE user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching task count:', err);
      return res.status(500).send('Server Error');
    }
    res.json({ total_taches: results[0].total_taches }); // Retourner le nombre total de tâches
  });
});

// Get the percentage of completed tasks for the logged-in user today
router.get('/tasks/completed-percentage', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  // Requête pour compter le nombre total de tâches et le nombre de tâches terminées aujourd'hui
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND DATE(due_date) = CURDATE())  AS total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND DATE(due_date) = CURDATE() AND status = 'termine') AS completed_tasks
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching completed tasks percentage:', err);
      return res.status(500).send('Server Error');
    }

    const totalTasks = results[0].total_tasks;
    const completedTasks = results[0].completed_tasks;

    // Calculer le pourcentage
    const percentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    // Retourner le pourcentage
    res.json({ completed_percentage: `${percentage}%` });
  });
});
// Get the percentage of completed tasks for the logged-in user (all tasks)
router.get('/tasks/completed-percentage-total', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  // Requête SQL pour compter le nombre total de tâches et le nombre de tâches terminées
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM tasks WHERE user_id = ?) AS total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'termine') AS completed_tasks
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching completed tasks percentage:', err);
      return res.status(500).send('Server Error');
    }

    const totalTasks = results[0].total_tasks;
    const completedTasks = results[0].completed_tasks;

    // Calculer le pourcentage
    const percentage = totalTasks > 0 ? ((completedTasks / totalTasks) * 100).toFixed(2) : 0;

    // Retourner le pourcentage
    res.json({ completed_percentage: `${percentage}%` });
  });
});

// Get the percentage of canceled tasks for the logged-in user (all tasks)
router.get('/tasks/canceled-percentage-total', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  // Requête SQL pour compter le nombre total de tâches et le nombre de tâches annulées
  const query = `
    SELECT 
      (SELECT COUNT(*) FROM tasks WHERE user_id = ?) AS total_tasks,
      (SELECT COUNT(*) FROM tasks WHERE user_id = ? AND status = 'annule') AS canceled_tasks
  `;

  db.query(query, [userId, userId], (err, results) => {
    if (err) {
      console.error('Error fetching canceled tasks percentage:', err);
      return res.status(500).send('Server Error');
    }

    const totalTasks = results[0].total_tasks;
    const canceledTasks = results[0].canceled_tasks;

    // Calculer le pourcentage
    const percentage = totalTasks > 0 ? ((canceledTasks / totalTasks) * 100).toFixed(2) : 0;

    // Retourner le pourcentage
    res.json({ canceled_percentage: `${percentage}%` });
  });
});

// Route pour afficher le nombre total de tâches avec statuts 'pas commence' et 'en cours' pour aujourd'hui et les jours à venir
router.get('/tasks/upcoming-total', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT COUNT(*) AS total_taches
    FROM tasks
    WHERE user_id = ?
      AND status IN ('en cours', 'pas commence') 
      AND due_date >= CURDATE(); 
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des tâches à venir :', err);
      return res.status(500).send('Erreur du serveur');
    }

    const totalTaches = results[0].total_taches || 0;

    res.json({ total_taches: totalTaches });
  });
});
;

// Route pour calculer le ratio des tâches urgentes aujourd'hui
router.get('/tasks/urgent-ratio', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT 
      COUNT(CASE WHEN priority = 'urgent' THEN 1 END) AS urgent_tasks, 
      COUNT(*) AS total_tasks
    FROM tasks
    WHERE user_id = ? AND DATE(due_date) = CURDATE();
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching urgent tasks ratio:', err);
      return res.status(500).send('Server Error');
    }

    const urgentTasks = results[0].urgent_tasks;
    const totalTasks = results[0].total_tasks;

    // Calculer le ratio
    const ratio = totalTasks > 0 ? `${urgentTasks}/${totalTasks}` : '0/0';

    // Retourner le résultat
    res.json({ urgent_ratio: ratio });
  });
});


// Route pour calculer le délai moyen d'achèvement des tâches (en minutes, heures ou jours)
router.get('/tasks/average-completion-time', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session

  const query = `
    SELECT 
      AVG(TIMESTAMPDIFF(MINUTE, created_at, completed_date)) AS delai_moyen_minutes
    FROM tasks
    WHERE user_id = ? AND completed_date IS NOT NULL;
  `;

  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Erreur lors du calcul du délai moyen :', err);
      return res.status(500).send('Erreur du serveur');
    }

    let delaiMoyenMinutes = results[0].delai_moyen_minutes;

    let formattedResult;
    if (delaiMoyenMinutes === null) {
      formattedResult = "0";
    } else if (delaiMoyenMinutes < 60) {
      // Moins d'une heure → en minutes
      formattedResult = `${Math.round(delaiMoyenMinutes)} Min`;
    } else if (delaiMoyenMinutes >= 1440) {
      // Plus de 24 heures (1440 minutes) → en jours
      const jours = Math.floor(delaiMoyenMinutes / 1440);
      formattedResult = `${jours} J`;
    } else {
      // Entre 1 heure et 24 heures → en heures
      const heures = Math.floor(delaiMoyenMinutes / 60);
      formattedResult = `${heures} H`;
    }

    res.json({ delai_moyen: formattedResult });
  });
});
router.get('/statistiques/tasks-by-priority', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  const { year, week } = req.query; // Récupérer l'année et la semaine des paramètres

  const query = `
    SELECT 
      YEAR(tasks.due_date) AS year, 
      WEEK(tasks.due_date, 1) AS week_number,
      days.day_of_week,
      priorities.priority, 
      IFNULL(COUNT(tasks.id), 0) AS task_count
    FROM 
      (SELECT 'Monday' AS day_of_week UNION 
       SELECT 'Tuesday' UNION
       SELECT 'Wednesday' UNION
       SELECT 'Thursday' UNION
       SELECT 'Friday' UNION
       SELECT 'Saturday' UNION
       SELECT 'Sunday') days
    CROSS JOIN 
      (SELECT 'urgent' AS priority UNION 
       SELECT 'important' UNION
       SELECT 'moins important') priorities
    LEFT JOIN tasks 
      ON DAYNAME(tasks.due_date) = days.day_of_week 
      AND tasks.priority = priorities.priority
      AND tasks.user_id = ? 
      AND YEAR(tasks.due_date) = ? 
      AND WEEK(tasks.due_date, 1) = ? -- Filtrer par la semaine et l'année
    GROUP BY year, week_number, days.day_of_week, priorities.priority
    ORDER BY year DESC, week_number DESC, 
             FIELD(days.day_of_week, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'),
             FIELD(priorities.priority, 'urgent', 'important', 'moins important');
  `;

  db.query(query, [userId, year, week], (err, results) => {
    if (err) {
      console.error('Error fetching task priority statistics:', err);
      return res.status(500).json({ message: 'Server error' });
    }

    res.json(results); // Retourner les résultats filtrés par semaine et année
  });
});


// Endpoint pour récupérer les tâches pour une date sélectionnée
router.get('/tasks/:selectedDate', isAuthenticated, (req, res) => {
  const userId = req.session.userId; // Récupérer l'ID de l'utilisateur depuis la session
  const selectedDate = req.params.selectedDate; // Date sélectionnée en format 'YYYY-MM-DD'

  const query = `
    SELECT * 
    FROM tasks
    WHERE user_id = ? AND DATE(due_date) = ?  
    ORDER BY FIELD(priority, 'urgent', 'important', 'moins important')
  `;

  db.query(query, [userId, selectedDate], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).send('Server Error');
    }
    res.json(results); // Retourner les tâches pour la date sélectionnée
  });
});
// Endpoint to get tasks due in one hour or less
router.get('/tasks-due-soon', isAuthenticated, (req, res) => {
  const userId = req.session.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non authentifié.' });
  }

  const query = `
    SELECT *
    FROM tasks
    WHERE user_id = ?
      AND due_date = CURDATE()
      AND due_time BETWEEN CURTIME() AND ADDTIME(CURTIME(), '01:00:00') -- Due within the next hour
      AND (status = 'pas commencé' OR status = 'en cours');
  `;
  
  db.query(query, [userId], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération des tâches.' });
    }
    
    const hasNotifications = results.length > 0;
    
    res.status(200).json({
      hasNotifications,
      tasks: results
    });
  });
});

// search
router.get('/search-tasks', isAuthenticated, (req, res) => {
  console.log('Search tasks endpoint hit');
  const userId = req.session.userId;
  console.log('User ID:', userId);

  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non authentifié.' });
  }

  const searchQuery = req.query.q;
  console.log('Search Query:', searchQuery);

  if (!searchQuery) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const query = `
    SELECT *
    FROM tasks
    WHERE user_id = ?
      AND (task_name LIKE ? OR category LIKE ? OR priority LIKE ?)
    ORDER BY created_at DESC
  `;

  db.query(
    query, 
    [userId, `%${searchQuery}%`, `%${searchQuery}%`, `%${searchQuery}%`], 
    (err, results) => {
      if (err) {
        console.error('Error searching tasks:', err);
        return res.status(500).json({ message: 'Erreur serveur lors de la recherche des tâches.' });
      }

      const hasTasks = results.length > 0;
      console.log('Tasks found:', results);

      res.status(200).json({
        hasTasks,
        tasks: results
      });
    }
  );
});

// Endpoint to get tasks for the calendar view
router.get('/tasks-for-calendar/:date', isAuthenticated, (req, res) => {
  console.log('Get tasks for calendar endpoint hit');
  const userId = req.session.userId;
  const selectedDate = req.params.date;

  if (!userId) {
    return res.status(401).json({ message: 'Utilisateur non authentifié.' });
  }

  // Ensure selectedDate is in 'YYYY-MM-DD' format
  const query = `
    SELECT id, task_name, category, priority, status, due_time, DATE_FORMAT(due_date, '%Y-%m-%d') AS due_date
    FROM tasks
    WHERE user_id = ? AND due_date = ?
  `;

  db.query(query, [userId, selectedDate], (err, results) => {
    if (err) {
      console.error('Error fetching tasks:', err);
      return res.status(500).json({ message: 'Erreur serveur lors de la récupération des tâches.' });
    }

    console.log('Tasks found:', results);

    // Format tasks for calendar
    const formattedTasks = results.map(task => {
      const dueTime = task.due_time || '00:00:00';
      const startDateTime = `${task.due_date}`;

      return {
        task_name: task.task_name,
        due_date: startDateTime,
        due_time: task.due_time,
        category: task.category,
        priority: task.priority,
        status: task.status,
      };
    });

    // Send the formatted tasks as response
    res.status(200).json(formattedTasks);
  });
});

export default router;
