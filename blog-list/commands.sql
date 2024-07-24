-- exercise13.1
    -- create the table blogs: 
    CREATE TABLE blogs (
        id SERIAL PRIMARY KEY,
        author text,
        url text NOT NULL,
        title text NOT NULL,
        likes INTEGER DEFAULT 0,
        date time
    );
    -- insert 2 blogs:
    INSERT INTO blogs (author, url, title, likes) VALUES ('Minh te', 'http://minhte.com', 'Life is simple', 0);
    INSERT INTO blogs (author, url, title, likes) VALUES ('Minh te', 'http://minhte.com', 'Food is life', 0);