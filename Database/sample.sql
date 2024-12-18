INSERT INTO
    users (email, password)
VALUES (
        'testuser@example.com',
        'password123'
    );

INSERT INTO
    tasks (
        user_id,
        title,
        due_date,
        category,
        status
    )
VALUES (
        1,
        'Complete Vue.js tutorial',
        '2024-12-17',
        'etude',
        'en cours'
    );